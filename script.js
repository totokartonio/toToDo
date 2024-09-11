'use strict';
const nodes = {
  form: document.getElementById('task-form'),
  list: document.getElementById('task-list'),
  filter: document.getElementById('filter-content'),
  clearButton: document.getElementById('clear-completed'),
  counter: document.getElementById('counter'),
  utilities: document.getElementById('utilities'),
};

const STATUS_FILTER_OPTIONS = {
  all: 'all',
  completed: 'completed',
  active: 'active',
};

const store = {
  list: new Map(),
  filterStatus: STATUS_FILTER_OPTIONS.all,
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

  render(['counter']);
};

//Функция для удаления задачи
const deleteTaskHandler = taskId => () => {
  store.list.delete(taskId);
  render();

  console.log(store.list);
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

  //Наименование задачи
  const titleElement = document.createElement('p');
  titleElement.textContent = task.title;

  //Кнопка удаления
  const deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.classList.add('delete-button');

  //eventListener для удаления задачи
  deleteButton.addEventListener('click', deleteTaskHandler(task.id, taskElement));

  taskElement.append(checkbox, titleElement, deleteButton);

  return taskElement;
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

  //Добавить только задачи, удовлетворяющие фильтру
  Array.from(store.list.values())
    .filter(filterByStatus)
    .forEach(task => {
      //Добавить задачи в DOM
      const taskElement = renderTask(task);
      fragment.append(taskElement);
    });

  nodes.list.replaceChildren(fragment);
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

document.addEventListener('task:added', () => {
  //Проверить фильтр
  if (store.filterStatus === STATUS_FILTER_OPTIONS.all) return;

  //Сбросить фильтр
  filterReset();

  //Отобразить список на странице
  render();
});
