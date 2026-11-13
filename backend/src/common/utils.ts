import { Transform } from 'class-transformer';
import { PaginationQueryDto, Paginated } from './dto/pagination.dto';

export function skipTake(q: PaginationQueryDto) {
  return { skip: (q.page - 1) * q.pageSize, take: q.pageSize };
}

export function paginated<T>(items: T[], page: number, total: number): Paginated<T> {
  return { items, page, total };
}

/** Điều kiện tìm kiếm không phân biệt hoa thường trên nhiều cột. */
export function searchOr(search: string | undefined, fields: string[]) {
  const s = search?.trim();
  if (!s) return {};
  return { OR: fields.map((f) => ({ [f]: { contains: s, mode: 'insensitive' } })) };
}

/** Chuyển query "true"/"false" thành boolean. */
export const ToBoolean = () =>
  Transform(({ value }) => (value === 'true' ? true : value === 'false' ? false : value));

export const OK_MESSAGE = { message: 'Operation completed' };

/** Bỏ các cột nội bộ (createdAt/updatedAt/deletedAt) khỏi bản ghi danh mục. */
export function omitMeta<T extends { createdAt?: Date; updatedAt?: Date; deletedAt?: Date | null }>(row: T) {
  const { createdAt, updatedAt, deletedAt, ...rest } = row;
  return rest;
}
