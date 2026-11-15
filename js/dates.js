import { BELLS } from "./model.js";

export const SEMESTER_START = new Date(2026, 8, 14); // понедельник первой недели
export const FIRST_WEEK = "white";

const toMinutes = (time) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

export function getWeekNumber(date = new Date()) {
  const days = Math.floor((date - SEMESTER_START) / 86400000);
  return Math.floor(days / 7) + 1;
}

export function getWeekType(date = new Date()) {
  const odd = Math.abs(getWeekNumber(date)) % 2 === 1;
  if (odd) return FIRST_WEEK;
  return FIRST_WEEK === "white" ? "black" : "white";
}

export function getCurrentPair(date = new Date()) {
  const now = date.getHours() * 60 + date.getMinutes();
  const bell = BELLS.find(b => now >= toMinutes(b.start) && now <= toMinutes(b.end));
  return bell ? bell.pair : null;
}

// Номер дня недели 1-6 (понедельник-суббота), для воскресенья null
export function getDayNumber(date = new Date()) {
  const d = date.getDay();
  return d === 0 ? null : d;
}