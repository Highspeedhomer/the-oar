export function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function dateStrFromTs(ts) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function isWeekend() {
  const d = new Date().getDay();
  return d === 0 || d === 6;
}

export function getFastGoal(startTime, weekdayHours, weekendHours) {
  const defaultHours = isWeekend() ? weekendHours : weekdayHours;
  const expectedEndTime = new Date((startTime || Date.now()) + defaultHours * 3600000);
  const endDay = expectedEndTime.getDay();
  const endIsWeekend = endDay === 0 || endDay === 6;
  return endIsWeekend ? weekendHours : weekdayHours;
}

export function formatDuration(ms) {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function formatMeters(m) {
  return parseInt(m, 10).toLocaleString();
}

export function getLast7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });
}
