import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

// Regression coverage for the mock-OTP auth flow: correct code succeeds and
// issues a token, wrong/expired/reused codes are rejected. Mocks Prisma so
// this runs without a database.
describe('AuthService', () => {
  let service: AuthService;
  let prisma: { otpCode: any; user: any };
  let jwt: { signAsync: jest.Mock };

  beforeEach(() => {
    prisma = {
      otpCode: {
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      user: {
        upsert: jest.fn(),
        findUniqueOrThrow: jest.fn(),
        update: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };
    jwt = { signAsync: jest.fn().mockResolvedValue('signed.jwt.token') };
    service = new AuthService(prisma as unknown as PrismaService, jwt as unknown as JwtService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('requestOtp persists a 4-digit code and returns it (mock provider)', async () => {
    const result = await service.requestOtp('+998901234567');

    expect(prisma.otpCode.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ phone: '+998901234567' }) }),
    );
    expect(result.devCode).toMatch(/^\d{4}$/);
    expect(result.expiresInSeconds).toBe(300);
  });

  it('verifyOtp issues a token and upserts the user on a valid code', async () => {
    prisma.otpCode.findFirst.mockResolvedValue({ id: 'otp-1', code: '1234' });
    prisma.user.upsert.mockResolvedValue({ id: 'user-1', phone: '+998901234567', role: 'PATIENT' });

    const result = await service.verifyOtp('+998901234567', '1234');

    expect(prisma.otpCode.update).toHaveBeenCalledWith({ where: { id: 'otp-1' }, data: { consumed: true } });
    expect(jwt.signAsync).toHaveBeenCalledWith({ sub: 'user-1', phone: '+998901234567', role: 'PATIENT' });
    expect(result).toEqual({ token: 'signed.jwt.token', user: { id: 'user-1', phone: '+998901234567', role: 'PATIENT' } });
  });

  it('verifyOtp rejects when no matching unconsumed, unexpired code exists', async () => {
    prisma.otpCode.findFirst.mockResolvedValue(null);

    await expect(service.verifyOtp('+998901234567', '0000')).rejects.toThrow(BadRequestException);
    expect(prisma.user.upsert).not.toHaveBeenCalled();
  });

  it('updateProfile updates the user name', async () => {
    prisma.user.update.mockResolvedValue({ id: 'user-1', name: 'Yangi Ism' });

    const result = await service.updateProfile('user-1', 'Yangi Ism');
    expect(prisma.user.update).toHaveBeenCalledWith({ where: { id: 'user-1' }, data: { name: 'Yangi Ism' } });
    expect(result).toEqual({ id: 'user-1', name: 'Yangi Ism' });
  });

  it('adminLogin rejects an unknown username', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    await expect(service.adminLogin('nobody', 'whatever')).rejects.toThrow(UnauthorizedException);
  });

  it('adminLogin rejects an account with no password set', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'user-1', username: 'admin', passwordHash: null });
    await expect(service.adminLogin('admin', 'whatever')).rejects.toThrow(UnauthorizedException);
  });

  it('adminLogin rejects a wrong password', async () => {
    const passwordHash = await bcrypt.hash('correct-password', 10);
    prisma.user.findUnique.mockResolvedValue({ id: 'user-1', username: 'admin', passwordHash });
    await expect(service.adminLogin('admin', 'wrong-password')).rejects.toThrow(UnauthorizedException);
  });

  it('adminLogin issues a token on a correct username+password', async () => {
    const passwordHash = await bcrypt.hash('correct-password', 10);
    prisma.user.findUnique.mockResolvedValue({ id: 'user-1', phone: '+998900000003', role: 'SUPER_ADMIN', username: 'admin', passwordHash });

    const result = await service.adminLogin('admin', 'correct-password');
    expect(jwt.signAsync).toHaveBeenCalledWith({ sub: 'user-1', phone: '+998900000003', role: 'SUPER_ADMIN' });
    expect(result.token).toBe('signed.jwt.token');
  });

  function mockFetch(status: number, body: unknown) {
    jest.spyOn(global, 'fetch').mockResolvedValue({ ok: status < 400, json: async () => body } as Response);
  }

  it('googleLogin rejects when Google rejects the access token', async () => {
    mockFetch(401, {});
    await expect(service.googleLogin('bad-token')).rejects.toThrow(UnauthorizedException);
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it('googleLogin rejects an account with an unverified email', async () => {
    mockFetch(200, { sub: 'g-1', email: 'a@b.com', email_verified: false, name: 'A B' });
    await expect(service.googleLogin('token')).rejects.toThrow(UnauthorizedException);
  });

  it('googleLogin creates a new PATIENT user when neither googleId nor email match', async () => {
    mockFetch(200, { sub: 'g-1', email: 'new@example.com', email_verified: true, name: 'New User' });
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({ id: 'user-1', phone: null, role: 'PATIENT' });

    const result = await service.googleLogin('token');
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: { googleId: 'g-1', email: 'new@example.com', name: 'New User', role: 'PATIENT' },
    });
    expect(jwt.signAsync).toHaveBeenCalledWith({ sub: 'user-1', phone: null, role: 'PATIENT' });
    expect(result.token).toBe('signed.jwt.token');
  });

  it('googleLogin links googleId to an existing phone-registered account matched by email', async () => {
    mockFetch(200, { sub: 'g-2', email: 'existing@example.com', email_verified: true, name: 'Existing' });
    prisma.user.findUnique
      .mockResolvedValueOnce(null) // no match by googleId
      .mockResolvedValueOnce({ id: 'user-2', email: 'existing@example.com', phone: '+998901234567' }); // match by email
    prisma.user.update.mockResolvedValue({ id: 'user-2', phone: '+998901234567', role: 'PATIENT' });

    await service.googleLogin('token');
    expect(prisma.user.update).toHaveBeenCalledWith({ where: { id: 'user-2' }, data: { googleId: 'g-2' } });
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it('googleLogin reuses the existing account when googleId already matches', async () => {
    mockFetch(200, { sub: 'g-3', email: 'known@example.com', email_verified: true, name: 'Known' });
    prisma.user.findUnique.mockResolvedValue({ id: 'user-3', phone: null, role: 'PATIENT' });

    await service.googleLogin('token');
    expect(prisma.user.create).not.toHaveBeenCalled();
    expect(prisma.user.update).not.toHaveBeenCalled();
    expect(jwt.signAsync).toHaveBeenCalledWith({ sub: 'user-3', phone: null, role: 'PATIENT' });
  });
});
