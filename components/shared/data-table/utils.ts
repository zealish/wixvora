export function getValue<T = unknown>(
  obj: Record<string, unknown>,
  path: string
): T | undefined {
  if (!path) return obj as T;
  const keys = path.split('.');
  let result: unknown = obj;
  for (const key of keys) {
    if (result === null || result === undefined) return undefined;
    result = (result as Record<string, unknown>)[key];
  }
  return result as T;
}

export function formatExportValue(value: unknown): string | number | boolean {
  if (value instanceof Date) {
    return value.toISOString().split('T')[0] || '';
  }
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'string' || typeof value === 'number') {
    return value;
  }
  return String(value);
}
