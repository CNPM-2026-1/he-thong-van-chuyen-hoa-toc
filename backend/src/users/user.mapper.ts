import { User } from '@prisma/client';

/** Ẩn passwordHash và các cột nội bộ, trả đúng shape User trong hợp đồng. */
export function toUserResponse(u: User) {
  return {
    id: u.id,
    fullName: u.fullName,
    email: u.email,
    phone: u.phone,
    role: u.role,
    status: u.status,
    createdAt: u.createdAt,
  };
}
