export function formatDateDMY(value: string | Date | null | undefined): string {
  if (!value) return '';

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return '';
    return `${pad(value.getDate())}/${pad(value.getMonth() + 1)}/${value.getFullYear()}`;
  }

  const normalized = String(value).trim();
  if (!normalized) return '';

  // Date-only strings from API (YYYY-MM-DD) are formatted manually to avoid timezone shifts.
  const isoDateOnly = normalized.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoDateOnly) {
    const [, yyyy, mm, dd] = isoDateOnly;
    return `${dd}/${mm}/${yyyy}`;
  }

  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) return normalized;

  return `${pad(parsed.getDate())}/${pad(parsed.getMonth() + 1)}/${parsed.getFullYear()}`;
}

function pad(value: number): string {
  return value < 10 ? `0${value}` : `${value}`;
}
