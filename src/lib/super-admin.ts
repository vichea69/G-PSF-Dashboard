function normalizeRoleValue(value: unknown): string {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-');
}

export function isSuperAdminRole(value: unknown): boolean {
  if (!value) return false;

  if (typeof value === 'string' || typeof value === 'number') {
    const normalized = normalizeRoleValue(value);
    return normalized === 'super-admin' || normalized === 'superadmin';
  }

  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return [record.role, record.name, record.slug].some((item) =>
      isSuperAdminRole(item)
    );
  }

  return false;
}

export function readEntityId(value: unknown): string {
  return String(value ?? '').trim();
}
