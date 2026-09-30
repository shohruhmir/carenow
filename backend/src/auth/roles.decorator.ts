import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Array<'PATIENT' | 'CLINIC_ADMIN' | 'DOCTOR' | 'SUPER_ADMIN'>) => SetMetadata(ROLES_KEY, roles);
