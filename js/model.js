export const DAYS = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];

export const TYPES = {
  lecture: "Лекция",
  practice: "Практика",
  lab: "Лабораторная"
};

export const WEEKS = {
  every: "Каждая неделя",
  white: "Белая неделя",
  black: "Чёрная неделя"
};

// Расписание звонков, замените на расписание своего колледжа
export const BELLS = [
  { pair: 1, start: "08:00", end: "09:20" },
  { pair: 2, start: "09:30", end: "10:50" },
  { pair: 3, start: "11:10", end: "12:30" },
  { pair: 4, start: "12:40", end: "14:00" },
  { pair: 5, start: "14:10", end: "15:30" },
  { pair: 6, start: "15:40", end: "17:00" }
];

let counter = 0;

export class Lesson {
  constructor({ id, day, pair, subject, teacher, room, type, week }) {
    this.id = id || "l" + Date.now() + (counter++);
    this.day = day;
    this.pair = pair;
    this.subject = subject;
    this.teacher = teacher;
    this.room = room;
    this.type = type;
    this.week = week;
  }

  isOnWeek(weekType) {
    return this.week === "every" || this.week === weekType;
  }

  toJSON() {
    return {
      id: this.id,
      day: this.day,
      pair: this.pair,
      subject: this.subject,
      teacher: this.teacher,
      room: this.room,
      type: this.type,
      week: this.week
    };
  }

  static fromJSON(obj) {
    return new Lesson(obj);
  }
}