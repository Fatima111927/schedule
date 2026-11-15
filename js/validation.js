import { TYPES, WEEKS } from "./model.js";

function weeksOverlap(a, b) {
  return a === "every" || b === "every" || a === b;
}

export function isValidLessonData(o) {
  if (!o || typeof o !== "object") return false;
  return Number.isInteger(o.day) && o.day >= 1 && o.day <= 6 &&
    Number.isInteger(o.pair) && o.pair >= 1 && o.pair <= 6 &&
    ["subject", "teacher", "room"].every(k => typeof o[k] === "string" && o[k].trim() !== "") &&
    Object.keys(TYPES).includes(o.type) &&
    Object.keys(WEEKS).includes(o.week);
}

export function validateLesson(lesson, allLessons) {
  const errors = [];

  if (!lesson.subject) errors.push("Введите название предмета");
  else if (lesson.subject.length < 2 || lesson.subject.length > 60) {
    errors.push("Название предмета должно содержать от 2 до 60 символов");
  }
  if (!lesson.teacher) errors.push("Введите преподавателя");
  if (!lesson.room) errors.push("Введите аудиторию");

  if (!Number.isInteger(lesson.day) || lesson.day < 1 || lesson.day > 6) {
    errors.push("День должен быть от понедельника до субботы");
  }
  if (!Number.isInteger(lesson.pair) || lesson.pair < 1 || lesson.pair > 6) {
    errors.push("Номер пары должен быть от 1 до 6");
  }
  if (errors.length > 0) return errors;

  const sameTime = allLessons.filter(other =>
    other.id !== lesson.id &&
    other.day === lesson.day &&
    other.pair === lesson.pair &&
    weeksOverlap(other.week, lesson.week)
  );

  sameTime.forEach(other => {
    if (other.room.toLowerCase() === lesson.room.toLowerCase()) {
      errors.push("Конфликт: аудитория " + lesson.room + " уже занята занятием «" + other.subject + "»");
    }
    if (other.teacher.toLowerCase() === lesson.teacher.toLowerCase()) {
      errors.push("Конфликт: преподаватель " + lesson.teacher + " уже ведёт занятие «" + other.subject + "»");
    }
  });

  return errors;
}