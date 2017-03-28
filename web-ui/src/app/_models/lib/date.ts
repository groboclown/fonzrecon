

const ISO_RE = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*))(?:Z|(\+|-)([\d|:]*))?$/;

export function strToDate(s: any): Date {
  if (!s || typeof(s) !== 'string') {
    return null;
  }
  const a = ISO_RE.exec(s);
  if (a) {
    try {
      return new Date(s);
    } catch (e) {
      return null;
    }
  }
  return null;
}
