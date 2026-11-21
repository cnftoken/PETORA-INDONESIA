export type Permission = string;

export function hasPermission(
  userPermissions: Permission[],
  needed: Permission | Permission[]
): boolean {
  const required = Array.isArray(needed) ? needed : [needed];
  return required.every((p) => userPermissions.includes(p));
}

export function hasAnyPermission(
  userPermissions: Permission[],
  options: Permission[]
): boolean {
  return options.some((p) => userPermissions.includes(p));
}
