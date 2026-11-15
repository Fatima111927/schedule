import { DAYS, TYPES, WEEKS, BELLS, Lesson } from "./model.js";
import { getDayNumber, getCurrentPair } from "./dates.js";

const $ = (id) => document.getElementById(id);

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function fillOptions(select, entries) {
  select.replaceChildren(...entries.map(([value, label]) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    return option;
  }));
}

export function initUI() {
  fillOptions($("lessonDay"), DAYS.map((d, i) => [i + 1, d]));
  fillOptions($("lessonPair"), BELLS.map(b => [b.pair, b.pair + " пара (" + b.start + "–" + b.end + ")"]));
  fillOptions($("lessonType"), Object.entries(TYPES));
  fillOptions($("lessonWeek"), Object.entries(WEEKS));
  fillOptions($("typeFilter"), [["", "Все типы"], ...Object.entries(TYPES)]);
}

export function updateTeachers(lessons) {
  const teachers = [...new Set(lessons.map(l => l.teacher))]
    .sort((a, b) => a.localeCompare(b, "ru"));
  const filter = $("teacherFilter");
  const selected = filter.value;

  fillOptions(filter, [["", "Все преподаватели"], ...teachers.map(t => [t, t])]);
  filter.value = teachers.includes(selected) ? selected : "";

  $("teachersList").replaceChildren(...teachers.map(t => {
    const option = document.createElement("option");
    option.value = t;
    return option;
  }));
}

function filterLessons(lessons, filters) {
  return lessons.filter(l =>
    (!filters.teacher || l.teacher === filters.teacher) &&
    (!filters.type || l.type === filters.type)
  );
}

function createCard(lesson, weekType) {
  const card = el("div", "lesson type-" + lesson.type);
  card.dataset.id = lesson.id;
  if (weekType !== "all" && !lesson.isOnWeek(weekType)) {
    card.classList.add("dim");
  }
  card.append(
    el("div", "subject", lesson.subject),
    el("div", "teacher", lesson.teacher),
    el("div", "room", "ауд. " + lesson.room),
    el("div", "kind", TYPES[lesson.type])
  );
  if (lesson.week !== "every") {
    card.append(el("span", "week-badge " + lesson.week, WEEKS[lesson.week]));
  }
  return card;
}

function renderTable(list, weekType, todayNum, currentPair) {
  const table = $("schedule");
  table.replaceChildren();

  const head = table.createTHead().insertRow();
  head.append(el("th", "", "Пара"));
  DAYS.forEach((name, i) => {
    const th = el("th", i + 1 === todayNum ? "today" : "", name);
    head.append(th);
  });

  const body = table.createTBody();
  BELLS.forEach(bell => {
    const row = body.insertRow();

    const th = document.createElement("th");
    th.append(el("div", "pair-num", bell.pair), el("div", "pair-time", bell.start + "–" + bell.end));
    row.append(th);

    DAYS.forEach((name, i) => {
      const day = i + 1;
      const td = document.createElement("td");
      td.dataset.day = day;
      td.dataset.pair = bell.pair;
      if (day === todayNum) td.classList.add("today");
      if (day === todayNum && bell.pair === currentPair) td.classList.add("now");

      list.filter(l => l.day === day && l.pair === bell.pair)
        .forEach(l => td.append(createCard(l, weekType)));
      row.append(td);
    });
  });
}

function renderList(list, weekType, todayNum, currentPair) {
  const container = $("scheduleList");
  container.replaceChildren();

  DAYS.forEach((name, i) => {
    const day = i + 1;
    const block = el("section", "day-block" + (day === todayNum ? " today" : ""));
    block.append(el("h3", "", name));

    const dayLessons = list.filter(l => l.day === day);
    if (dayLessons.length === 0) {
      block.append(el("p", "muted", "Занятий нет"));
    }

    BELLS.forEach(bell => {
      const pairLessons = dayLessons.filter(l => l.pair === bell.pair);
      if (pairLessons.length === 0) return;

      const row = el("div", "list-row");
      if (day === todayNum && bell.pair === currentPair) row.classList.add("now");
      row.append(el("div", "list-time", bell.pair + " пара " + bell.start + "–" + bell.end));

      const cards = el("div", "list-cards");
      pairLessons.forEach(l => cards.append(createCard(l, weekType)));
      row.append(cards);
      block.append(row);
    });

    container.append(block);
  });
}

export function renderSchedule(lessons, filters, now = new Date()) {
  const list = filterLessons(lessons, filters);
  const todayNum = getDayNumber(now);
  const currentPair = getCurrentPair(now);
  renderTable(list, filters.weekType, todayNum, currentPair);
  renderList(list, filters.weekType, todayNum, currentPair);
}

export function openDialog(lesson = null, preset = {}) {
  const editing = Boolean(lesson);
  const data = lesson || {
    id: "",
    day: preset.day || 1,
    pair: preset.pair || 1,
    subject: "",
    teacher: "",
    room: "",
    type: "lecture",
    week: "every"
  };

  $("dialogTitle").textContent = editing ? "Редактирование занятия" : "Новое занятие";
  $("lessonId").value = data.id;
  $("lessonDay").value = data.day;
  $("lessonPair").value = data.pair;
  $("lessonSubject").value = data.subject;
  $("lessonTeacher").value = data.teacher;
  $("lessonRoom").value = data.room;
  $("lessonType").value = data.type;
  $("lessonWeek").value = data.week;
  $("deleteBtn").hidden = !editing;
  $("lessonErrors").replaceChildren();

  $("lessonDialog").showModal();
}

export function closeDialog() {
  $("lessonDialog").close();
}

export function readForm() {
  return new Lesson({
    id: $("lessonId").value,
    day: Number($("lessonDay").value),
    pair: Number($("lessonPair").value),
    subject: $("lessonSubject").value.trim(),
    teacher: $("lessonTeacher").value.trim(),
    room: $("lessonRoom").value.trim(),
    type: $("lessonType").value,
    week: $("lessonWeek").value
  });
}

export function showErrors(errors) {
  const box = $("lessonErrors");
  box.replaceChildren();
  if (errors.length === 0) return;
  const ul = document.createElement("ul");
  errors.forEach(text => ul.append(el("li", "", text)));
  box.append(ul);
}