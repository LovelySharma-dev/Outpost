export const GRANTLY_TODAY = "2026-11-07";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function daysUntil(iso: string) {
  const due = Date.parse(`${iso}T00:00:00Z`);
  const today = Date.parse(`${GRANTLY_TODAY}T00:00:00Z`);
  return Math.round((due - today) / 86400000);
}

export function formatDate(iso: string, withYear = false) {
  const [year, month, day] = iso.split("-");
  const base = `${MONTHS[Number(month) - 1]} ${Number(day)}`;
  return withYear ? `${base}, ${year}` : base;
}
