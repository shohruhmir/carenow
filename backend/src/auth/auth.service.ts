import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';

const OTP_TTL_MINUTES = 5;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  // Mock provider: generates a real code and persists it, but does not call
  // out to an SMS gateway. The code comes back in the response so the login
  // flow is testable end-to-end before a real provider (Eskiz.uz etc.) is
  // wired up — see backend epic issue #2, child "Auth" and "Out of scope".
  async requestOtp(phone: string) {
    const code = String(Math.floor(1000 + Math.random() * 9000));
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60_000);

    await this.prisma.otpCode.create({ data: { phone, code, expiresAt } });

    return {
      phone,
      expiresInSeconds: OTP_TTL_MINUTES * 60,
      // mock only — a real SMS provider would not echo the code back.
      devCode: code,
    };
  }

  async verifyOtp(phone: string, code: string) {
    const otp = await this.prisma.otpCode.findFirst({
      where: { phone, code, consumed: false, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });

    if (!otp) {
      throw new BadRequestException('Invalid or expired code');
    }

    await this.prisma.otpCode.update({ where: { id: otp.id }, data: { consumed: true } });

    const user = await this.prisma.user.upsert({
      where: { phone },
      update: {},
      create: { phone },
    });

    const token = await this.jwt.signAsync({ sub: user.id, phone: user.phone, role: user.role });

    return { token, user };
  }

  // Username+password login — only for accounts with a passwordHash set
  // (currently just the SUPER_ADMIN seed account). Everyone else uses
  // phone+OTP; this exists because a platform admin shouldn't need a real
  // phone/SMS provider just to reach the internal admin panel.
  async adminLogin(username: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { username } });
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const token = await this.jwt.signAsync({ sub: user.id, phone: user.phone, role: user.role });
    return { token, user };
  }

  // Frontend gets an OAuth2 access token from Google Identity Services
  // (popup token flow) and sends it here. We hand it straight back to
  // Google's own userinfo endpoint — only Google can turn a valid access
  // token into profile data, so a successful response is proof of identity
  // without needing a JWT-verification library on our side.
  async googleLogin(accessToken: string) {
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) {
      throw new UnauthorizedException('Invalid Google access token');
    }

    const profile = (await res.json()) as { sub: string; email?: string; email_verified?: boolean; name?: string };
    if (!profile.email || !profile.email_verified) {
      throw new UnauthorizedException('Google account has no verified email');
    }

    let user = await this.prisma.user.findUnique({ where: { googleId: profile.sub } });
    if (!user) {
      const byEmail = await this.prisma.user.findUnique({ where: { email: profile.email } });
      user = byEmail
        ? await this.prisma.user.update({ where: { id: byEmail.id }, data: { googleId: profile.sub } })
        : await this.prisma.user.create({
            data: { googleId: profile.sub, email: profile.email, name: profile.name ?? null, role: 'PATIENT' },
          });
    }

    const token = await this.jwt.signAsync({ sub: user.id, phone: user.phone, role: user.role });
    return { token, user };
  }

  async getUserById(id: string) {
    return this.prisma.user.findUniqueOrThrow({ where: { id } });
  }

  async updateProfile(id: string, name: string) {
    return this.prisma.user.update({ where: { id }, data: { name } });
  }
}
