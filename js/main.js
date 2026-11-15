import { WEEKS } from "./model.js";
import { getWeekNumber, getWeekType } from "./dates.js";
import { loadLessons, saveLessons, exportJSON, importJSON } from "./storage.js";
import { validateLesson } from "./validation.js";
import {
  initUI, updateTeachers, renderSchedule,
  openDialog, closeDialog, readForm, showErrors
} from "./ui.js";

const weekInfo = document.getElementById("weekInfo");
const teacherFilter = document.getElementById("teacherFilter");
const typeFilter = document.getElementById("typeFilter");
const weekFilter = document.getElementById("weekFilter");
const lessonForm = document.getElementById("lessonForm");
const importInput = document.getElementById("importInput");

let lessons = [];

function getFilters() {
  const week = weekFilter.value;
  return {
    teacher: teacherFilter.value,
    type: typeFilter.value,
    weekType: week === "current" ? getWeekType(new Date()) : week
  };
}

function renderHeader() {
  const now = new Date();
  const number = getWeekNumber(now);
  const date = now.toLocaleDateString("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });
  const weekText = number >= 1 ? "Учебная неделя № " + number : "До начала семестра";
  weekInfo.textContent = date + ". " + weekText + ", " + WEEKS[getWeekType(now)];
}

function refresh() {
  updateTeachers(lessons);
  renderSchedule(lessons, getFilters());
  renderHeader();
}

function onGridClick(event) {
  const card = event.target.closest(".lesson");
  if (card) {
    const lesson = lessons.find(l => l.id === card.dataset.id);
    if (lesson) openDialog(lesson);
    return;
  }
  const cell = event.target.closest("td[data-day]");
  if (cell) {
    openDialog(null, { day: Number(cell.dataset.day), pair: Number(cell.dataset.pair) });
  }
}

document.getElementById("schedule").addEventListener("click", onGridClick);
document.getElementById("scheduleList").addEventListener("click", onGridClick);

document.getElementById("addBtn").addEventListener("click", () => openDialog(null));
document.getElementById("cancelBtn").addEventListener("click", closeDialog);

lessonForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const lesson = readForm();
  const errors = validateLesson(lesson, lessons);
  if (errors.length > 0) {
    showErrors(errors);
    return;
  }

  const index = lessons.findIndex(l => l.id === lesson.id);
  if (index >= 0) {
    lessons[index] = lesson;
  } else {
    lessons.push(lesson);
  }
  saveLessons(lessons);
  closeDialog();
  refresh();
});

document.getElementById("deleteBtn").addEventListener("click", () => {
  const id = document.getElementById("lessonId").value;
  if (!id) return;
  if (confirm("Удалить это занятие?")) {
    lessons = lessons.filter(l => l.id !== id);
    saveLessons(lessons);
    closeDialog();
    refresh();
  }
});

[teacherFilter, typeFilter, weekFilter].forEach(select => {
  select.addEventListener("change", refresh);
});

document.getElementById("exportBtn").addEventListener("click", () => exportJSON(lessons));

document.getElementById("importBtn").addEventListener("click", () => importInput.click());

importInput.addEventListener("change", async () => {
  const file = importInput.files[0];
  if (!file) return;
  try {
    const imported = await importJSON(file);
    if (confirm("Заменить текущее расписание данными из файла? Занятий в файле: " + imported.length)) {
      lessons = imported;
      saveLessons(lessons);
      refresh();
    }
  } catch (error) {
    alert("Ошибка импорта: " + error.message);
  } finally {
    importInput.value = "";
  }
});

document.getElementById("printBtn").addEventListener("click", () => window.print());

initUI();
lessons = loadLessons();
refresh();
setInterval(refresh, 60 * 1000);