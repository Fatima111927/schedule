import { Lesson } from "./model.js";
import { isValidLessonData } from "./validation.js";

const KEY = "groupSchedule";

const DEFAULT_LESSONS = [
  { id: "l1", day: 1, pair: 3, subject: "Архитектура ЭВМ", teacher: "Эсентаева Б.Э.", room: "305", type: "lecture", week: "every" },
  { id: "l2", day: 1, pair: 4, subject: "Веб-программирование", teacher: "Эрнистова А.Э.", room: "212", type: "lab", week: "every" },
  { id: "l3", day: 2, pair: 1, subject: "Математика", teacher: "Белова Е.И.", room: "214", type: "lecture", week: "black" },
  { id: "l4", day: 2, pair: 1, subject: "Физика", teacher: "Амнакулова Ш.А.", room: "210", type: "lecture", week: "white" },
  { id: "l5", day: 2, pair: 2, subject: "Базы данных", teacher: "Мурахмедович А.Т.", room: "118", type: "practice", week: "every" },
  { id: "l6", day: 3, pair: 2, subject: "Английский язык", teacher: "Училка", room: "301", type: "practice", week: "every" },
  { id: "l7", day: 3, pair: 3, subject: "Веб-программирование", teacher: "Эрнистова А.Э.", room: "212", type: "lecture", week: "every" },
  { id: "l8", day: 4, pair: 1, subject: "Операционные системы", teacher: "Жаксыбеков Д.М.", room: "305", type: "lab", week: "every" },
  { id: "l9", day: 4, pair: 2, subject: "Физическая культура", teacher: "Мамытов Б.Т.", room: "Спортзал", type: "practice", week: "every" },
  { id: "l10", day: 5, pair: 3, subject: "Базы данных", teacher: "Мурахмедович А.Т.", room: "118", type: "lecture", week: "every" },
  { id: "l11", day: 5, pair: 4, subject: "Математика", teacher: "Белова Е.И.", room: "214", type: "practice", week: "every" }
];

export function loadLessons() {
  const raw = localStorage.getItem(KEY);
  if (raw === null) {
    return DEFAULT_LESSONS.map(d => Lesson.fromJSON(d));
  }
  try {
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) throw new Error("not array");
    return data.filter(isValidLessonData).map(d => Lesson.fromJSON(d));
  } catch (error) {
    return DEFAULT_LESSONS.map(d => Lesson.fromJSON(d));
  }
}

export function saveLessons(lessons) {
  localStorage.setItem(KEY, JSON.stringify(lessons));
}

export function exportJSON(lessons) {
  const blob = new Blob([JSON.stringify(lessons, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "schedule.json";
  a.click();
  URL.revokeObjectURL(url);
}

export function importJSON(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("Не удалось прочитать файл"));

    reader.onload = () => {
      let data;
      try {
        data = JSON.parse(reader.result);
      } catch (error) {
        reject(new Error("Файл не является корректным JSON"));
        return;
      }

      if (!Array.isArray(data)) {
        reject(new Error("В файле должен быть массив занятий"));
        return;
      }

      const bad = data.findIndex(item => !isValidLessonData(item));
      if (bad !== -1) {
        reject(new Error("Неверная структура занятия номер " + (bad + 1)));
        return;
      }

      const lessons = data.map(d => Lesson.fromJSON(d));
      if (new Set(lessons.map(l => l.id)).size !== lessons.length) {
        reject(new Error("В файле есть занятия с одинаковым id"));
        return;
      }
      resolve(lessons);
    };

    reader.readAsText(file);
  });
}