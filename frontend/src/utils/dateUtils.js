/**
 * Formats a Date object to a YYYY-MM-DD ISO date string (local time, no UTC shift).
 */
export const toISODate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

/**
 * Parses a date value from the backend into a local Date object.
 * Handles both array format [y, m, d] and string "YYYY-MM-DD".
 */
export const parseDateLocal = (raw) => {
  if (!raw) return null;
  if (Array.isArray(raw)) return new Date(raw[0], raw[1] - 1, raw[2]);
  const [y, m, d] = String(raw).split("-").map(Number);
  return new Date(y, m - 1, d);
};

/**
 * Converts a date value to a YYYY-MM-DD string for use with HTML5 <input type="date">.
 * Handles both array format [y, m, d] and string "YYYY-MM-DD".
 */
export const toDateInputStr = (date) => {
  if (!date) return "";
  if (Array.isArray(date)) {
    const [y, m, d] = date;
    return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }
  return String(date);
};
