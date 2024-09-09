'use strict';
const NODES = {
  form: document.getElementById('task-form'),
  list: document.getElementById('task-list'),
  filter: document.getElementById('filter-content'),
  clearButton: document.getElementById('clear-completed'),
  counter: document.getElementById('counter'),
  utilities: document.getElementById('utilities'),
};

const STORE = {
  list: new Map(),
  filter: {
    all: 'all',
    completed: 'completed',
    active: 'active',
  },
};

let selectedFilter = STORE.filter.all;

//Хендлер для добавления id
const createIncrementingIdGetter = () => {
  let id = 0;
  return function () {
    return String(++id);
  };
};

const getTaskId = createIncrementingIdGetter();

//Функции счетчики
const count = {
  //Функция для подсчета активных задач
  active: map => {
    return Array.from(map.values()).reduce((count, task) => {
      return !task.completed ? count + 1 : count;
    }, 0);
  },

  //Функция для подсчета выполненных задач
  completed: map => {
    return Array.from(map.values()).reduce((count, task) => {
      return task.completed ? count + 1 : count;
    }, 0);
  },
};

//Функция для обновления значений counter невыполненных задач
const renderCounter = () => {
  let activeTasksNumber = count.active(STORE.list);

  NODES.counter.textContent = `${activeTasksNumber} ${
    activeTasksNumber === 1 ? 'item' : 'items'
  } left!`;
};

//Функция для отслеживания изменение состояние чекбоксов
const checkboxHandler = taskId => event => {
  let checkbox = event.currentTarget;

  let taskToUpdate = STORE.list.get(taskId);

  taskToUpdate.completed = checkbox.checked;

  console.log(STORE.list);

  render(['counter']);
};

//Функция для удаления задачи
const deleteTaskHandler = taskId => () => {
  STORE.list.delete(taskId);
  render();

  console.log(STORE.list);
};

//Функция для создания задачи
const renderTask = (taskID, task) => {
  //Общий контейнер задачи
  let taskElement = document.createElement('div');
  taskElement.classList.add('task');
  taskElement.dataset.id = taskID;

  //Чек-бокс
  let checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.name = 'task-checkbox';
  checkbox.checked = task.completed;
  checkbox.classList.add('checkbox');

  //eventListener для отслеживания состояния checkbox
  checkbox.addEventListener('change', checkboxHandler(taskID));

  //Наименование задачи
  let titleElement = document.createElement('p');
  titleElement.textContent = task.title;

  //Кнопка удаления
  let deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.classList.add('delete-button');

  //eventListener для удаления задачи
  deleteButton.addEventListener('click', deleteTaskHandler(taskID, taskElement));

  taskElement.append(checkbox, titleElement, deleteButton);

  return taskElement;
};

//Функция сопоставления фильтра и задачи
const filterByStatus = task => {
  if (selectedFilter === STORE.filter.all) {
    return true;
  }
  if (selectedFilter === STORE.filter.completed && task.completed) {
    return true;
  }
  if (selectedFilter === STORE.filter.active && !task.completed) {
    return true;
  }
  return false;
};

//Функция для обновления списка задач на странице
const renderList = () => {
  let fragment = document.createDocumentFragment();

  //Добавить только задачи, удовлетворяющие фильтру
  Array.from(STORE.list.entries())
    .filter(([, task]) => filterByStatus(task)) // Apply filter function
    .forEach(([id, task]) => {
      //Добавить задачи в DOM
      let taskElement = renderTask(id, task);
      fragment.append(taskElement);
    });

  NODES.list.replaceChildren(fragment);
};

const renderUtilities = () => {
  NODES.utilities.classList.toggle('hidden', STORE.list.size === 0);
};

//Мапа всех рендерящих функций
const renderFunctionsMap = {
  list: renderList,
  counter: renderCounter,
  utilities: renderUtilities,
};

//Выбор функция рендера выбранной области
const render = (areas = ['list', 'counter', 'utilities']) => {
  areas.forEach(area => {
    const renderArea = renderFunctionsMap[area];
    renderArea();
  });
};

//Функция для очистки масссива по заданому фильтру
const clearCompleted = map => {
  let idsToDelete = Array.from(map.entries())
    .filter(([, task]) => task.completed)
    .map(([id]) => id);

  // Delete tasks from map
  idsToDelete.forEach(id => map.delete(id));

  return map;
};

NODES.form.addEventListener('submit', function (event) {
  //Отменить стандарное действие кнопки и избежать обновления страницы
  event.preventDefault();

  const FORM = event.target;

  //Собрать введеные в форму данные
  const FORM_DATA = new FormData(FORM);

  //Путем итерации записать данные в виде объекта с парами (ключ: значение,)
  const DATA = Object.fromEntries(FORM_DATA.entries());

  //Добавить новую задачу в массив задач
  let newTask = {
    completed: false,
    ...DATA,
  };

  STORE.list.set(getTaskId(), newTask);

  //Обнулить значение в графе ввода
  FORM.reset();

  //Отобразить список на странице
  render();

  //Отобразить список задач в консоли
  console.log(STORE.list);
});

//Отфильтровать задачи
NODES.filter.addEventListener('change', function (event) {
  selectedFilter = event.target.value;
  render(['list']);
});

//Очистить от выполненых задач
NODES.clearButton.addEventListener('click', () => {
  STORE.list = clearCompleted(STORE.list);
  render();
});
