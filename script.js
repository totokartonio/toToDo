'use strict';
const nodes = {
  form: document.getElementById('task-form'),
  list: document.getElementById('task-list'),
  filter: document.getElementById('filter-content'),
  clearButton: document.getElementById('clear-completed'),
  counter: document.getElementById('counter'),
  utilities: document.getElementById('utilities'),
  themeSwitch: document.getElementById('theme-switch'),
};

const icons = {
  bin: `
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 800 960" width="24px" fill="currentColor">
      <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/>
    </svg>
  `,
  edit: `
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 800 960" width="24px" fill="currentColor">
      <path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/>
    </svg>
  `,
  confirmation: `
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 800 960" width="24px" fill="currentColor">
      <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/>
    </svg>
  `,
};

const colorScheme = window.matchMedia('(prefers-color-scheme: dark)');

const colorModes = {
  light: 'is-light',
  dark: 'is-dark',
};

const STATUS_FILTER_OPTIONS = {
  all: 'all',
  completed: 'completed',
  active: 'active',
};

const store = {
  list: new Map(),
  filterStatus: STATUS_FILTER_OPTIONS.all,
  editingTaskId: null,
};

//Хендлер для добавления id
const createIncrementingIdGetter = () => {
  let id = 0;
  return function () {
    return String(++id);
  };
};

const getTaskId = createIncrementingIdGetter();

//Функции счетчики
const countTasksByStatus = {
  //Функция для подсчета активных задач
  active: tasks => {
    return Array.from(tasks.values()).reduce((count, task) => {
      return !task.completed ? count + 1 : count;
    }, 0);
  },

  //Функция для подсчета выполненных задач
  completed: tasks => {
    return Array.from(tasks.values()).reduce((count, task) => {
      return task.completed ? count + 1 : count;
    }, 0);
  },
};

//Функция для обновления значений counter невыполненных задач
const renderCounter = () => {
  const activeTasksNumber = countTasksByStatus.active(store.list);

  nodes.counter.textContent = `${activeTasksNumber} ${
    activeTasksNumber === 1 ? 'item' : 'items'
  } left!`;
};

//Функция для отслеживания изменение состояние чекбоксов
const checkboxHandler = taskId => event => {
  let checkbox = event.currentTarget;

  let taskToUpdate = store.list.get(taskId);

  taskToUpdate.completed = checkbox.checked;

  console.log(store.list);

  render(['list', 'counter']);
};

//Функция для удаления задачи
const deleteTaskHandler = taskId => () => {
  store.list.delete(taskId);
  render();

  console.log(store.list);
};

//Функция для редактирования задачи
const editTaskHandler = taskId => () => {
  store.editingTaskId = taskId;
  render();
};

//Функция для сохранения отредактированной задачи
const confirmTaskHandler = inputElement => event => {
  event.preventDefault();

  const editedTask = store.list.get(store.editingTaskId);
  editedTask.title = inputElement.value;
  store.editingTaskId = null;
  render();
};

//Функция для создания задачи
const renderTask = task => {
  //Общий контейнер задачи
  const taskElement = document.createElement('div');
  taskElement.classList.add('task');
  taskElement.dataset.id = task.id;

  //Чек-бокс
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.name = 'task-checkbox';
  checkbox.checked = task.completed;
  checkbox.classList.add('checkbox');

  //eventListener для отслеживания состояния checkbox
  checkbox.addEventListener('change', checkboxHandler(task.id));

  //Кнопка удаления
  const deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.classList.add('delete-button');
  deleteButton.innerHTML = icons.bin;

  //eventListener для удаления задачи
  deleteButton.addEventListener('click', deleteTaskHandler(task.id, taskElement));

  let postRenderEffect = undefined;

  if (task.id === store.editingTaskId) {
    //Создать поле ввода редактирования задачи
    const inputElement = document.createElement('input');
    inputElement.type = 'text';
    inputElement.value = task.title;
    inputElement.classList.add('edit-input');
    inputElement.required = true;

    //Кнопка подтверждения редактирования
    const confirmButton = document.createElement('button');
    confirmButton.type = 'submit';
    confirmButton.innerHTML = icons.confirmation;
    confirmButton.classList.add('confirm-button');

    const inputForm = document.createElement('form');
    inputForm.classList.add('input-form');
    inputForm.append(checkbox, inputElement, confirmButton, deleteButton);

    //срабатывание eventListener для редактирования задачи при submit
    inputForm.addEventListener('submit', confirmTaskHandler(inputElement));

    taskElement.append(inputForm);

    postRenderEffect = () => {
      inputElement.focus();
    };
  } else {
    //Наименование задачи
    const titleElement = document.createElement('p');
    titleElement.textContent = task.title;

    //Кнопка редактирования
    const editButton = document.createElement('button');
    editButton.type = 'button';
    editButton.classList.add('edit-button');
    editButton.innerHTML = icons.edit;

    //eventListener для редактирования задачи
    editButton.addEventListener('click', editTaskHandler(task.id));

    taskElement.append(checkbox, titleElement, editButton, deleteButton);
  }

  return { taskElement, postRenderEffect };
};

//Функция сопоставления фильтра и задачи
const filterByStatus = task => {
  if (store.filterStatus === STATUS_FILTER_OPTIONS.all) {
    return true;
  }
  if (store.filterStatus === STATUS_FILTER_OPTIONS.completed && task.completed) {
    return true;
  }
  if (store.filterStatus === STATUS_FILTER_OPTIONS.active && !task.completed) {
    return true;
  }
  return false;
};

//Функция для обновления списка задач на странице
const renderList = () => {
  const fragment = document.createDocumentFragment();
  const postRenderEffects = [];

  //Добавить только задачи, удовлетворяющие фильтру
  Array.from(store.list.values())
    .filter(filterByStatus)
    .forEach(task => {
      //Добавить задачи в DOM
      const { taskElement, postRenderEffect } = renderTask(task);
      fragment.append(taskElement);
      if (postRenderEffect) {
        postRenderEffects.push(postRenderEffect);
      }
    });

  nodes.list.replaceChildren(fragment);
  postRenderEffects.forEach(effect => effect());
};

const renderUtilities = () => {
  nodes.utilities.classList.toggle('hidden', store.list.size === 0);
};

const renderStatusFilter = () => {
  nodes.filter.value = store.filterStatus;
};

//Мапа всех рендерящих функций
const renderFunctionsMap = {
  list: renderList,
  counter: renderCounter,
  utilities: renderUtilities,
  statusFilter: renderStatusFilter,
};

//Выбор функция рендера выбранной области
const render = (areas = ['list', 'counter', 'utilities', 'statusFilter']) => {
  areas.forEach(area => {
    const renderArea = renderFunctionsMap[area];
    renderArea();
  });
};

//Функция для очистки масссива по заданому фильтру
const clearCompleted = tasks => {
  Array.from(tasks.values())
    .filter(task => task.completed)
    .forEach(task => tasks.delete(task.id));
};

//Функция для сброса фильтра на значение 'All'
const filterReset = () => {
  store.filterStatus = STATUS_FILTER_OPTIONS.all;
};

nodes.form.addEventListener('submit', function (event) {
  //Отменить стандарное действие кнопки и избежать обновления страницы
  event.preventDefault();

  const form = event.target;

  //Собрать введеные в форму данные
  const formData = new FormData(form);

  //Путем итерации записать данные в виде объекта с парами (ключ: значение,)
  const data = Object.fromEntries(formData.entries());

  const taskId = getTaskId();

  //Добавить новую задачу в массив задач
  let newTask = {
    id: taskId,
    completed: false,
    ...data,
  };

  store.list.set(taskId, newTask);

  //Обнулить значение в графе ввода
  form.reset();

  render();

  //Отобразить список задач в консоли
  console.log(store.list);

  //Активировать событие добавления задачи
  document.dispatchEvent(new Event('task:added'));
});

//Отфильтровать задачи
nodes.filter.addEventListener('change', function (event) {
  store.filterStatus = event.target.value;
  render(['list']);
});

//Очистить от выполненых задач
nodes.clearButton.addEventListener('click', () => {
  clearCompleted(store.list);
  render();
});

colorScheme.addEventListener('change', () => {
  document.body.setAttribute('class', '');
});

//Смена темы
nodes.themeSwitch.addEventListener('click', () => {
  colorScheme.matches
    ? document.body.classList.toggle(colorModes.light)
    : document.body.classList.toggle(colorModes.dark);
});

document.addEventListener('task:added', () => {
  //Проверить фильтр
  if (store.filterStatus === STATUS_FILTER_OPTIONS.all) return;

  //Сбросить фильтр
  filterReset();

  //Отобразить список на странице
  render();
});
