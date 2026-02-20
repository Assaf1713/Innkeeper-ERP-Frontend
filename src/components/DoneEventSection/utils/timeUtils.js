export function timeToMinutes(hhmm) {
  if (!hhmm || typeof hhmm !== "string") return 0;
  const [h, m] = hhmm.split(":").map((x) => Number(x));
  if (!Number.isFinite(h) || !Number.isFinite(m)) return 0;
  return h * 60 + m;
}

export function diffMinutes(start, end) {
  const s = timeToMinutes(start);
  const e = timeToMinutes(end);
  // handle overnight shifts
  return e >= s ? e - s : e + (24 * 60 - s);
  


}

export function formatHoursFromMinutes(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}:${String(m).padStart(2, "0")}`;
}
