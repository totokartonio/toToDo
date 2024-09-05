'use strict';

let taskForm = document.getElementById('task-form');
let listOfTasks = document.getElementById('task-list');
let filterContent = document.getElementById('filter-content');
let clearCompletedButton = document.getElementById('clear-completed');
let counter = document.getElementById('counter');
let utilities = document.getElementById('utilities');
let tasksList = [];

const statusFilter = {
  all: 'all',
  completed: 'completed',
  active: 'active',
};

let filter = statusFilter.all;

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
  active: arr => {
    return arr.reduce((count, el) => {
      return !el.completed ? count + 1 : count;
    }, 0);
  },

  //Функция для подсчета выполненных задач
  completed: arr => {
    return arr.reduce((count, el) => {
      return el.completed ? count + 1 : count;
    }, 0);
  },
};

//Функция для обновления значений counter невыполненных задач
const renderCounter = () => {
  let activeTasksNumber = count.active(tasksList);

  counter.textContent = `${activeTasksNumber} ${activeTasksNumber === 1 ? 'item' : 'items'} left!`;
};

//Функция для отслеживания изменение состояние чекбоксов
const checkboxHandler = taskId => event => {
  let checkbox = event.currentTarget;

  tasksList = tasksList.map(task =>
    task.id === taskId ? { ...task, completed: checkbox.checked } : task,
  );
  console.log(tasksList);

  render(['counter']);
};

//Функция для удаления задачи
const deleteTaskHandler = taskId => () => {
  tasksList = tasksList.filter(task => task.id !== taskId);
  render();

  console.log(tasksList);
};

//Функция для создания задачи
const renderTask = task => {
  //Общий контейнер задачи
  let taskElement = document.createElement('div');
  taskElement.classList.add('task');
  taskElement.dataset.id = task.id;

  //Чек-бокс
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
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
  if (filter === statusFilter.all) {
    return true;
  }
  if (filter === statusFilter.completed && task.completed) {
    return true;
  }
  if (filter === statusFilter.active && !task.completed) {
    return true;
  }
  return false;
};

//Функция для обновления списка задач на странице
const renderList = () => {
  const fragment = document.createDocumentFragment();

  //Добавить только задачи, удовлетворяющие фильтру
  tasksList.filter(filterByStatus).forEach(task => {
    //Добавить задачи в DOM
    const taskElement = renderTask(task);
    fragment.append(taskElement);
  });

  listOfTasks.replaceChildren(fragment);
};

const renderListClass = () => {
  if (count.active(tasksList) > 0 || count.completed(tasksList) > 0) {
    utilities.classList.remove('hidden');
  } else {
    utilities.classList.add('hidden');
  }
};

//Мапа всех рендерящих функций
const renderFunctionsMap = {
  list: renderList,
  counter: renderCounter,
  class: renderListClass,
};

//Выбор функция рендера выбранной области
const render = (areas = ['list', 'counter', 'class']) => {
  areas.forEach(area => {
    const renderArea = renderFunctionsMap[area];
    renderArea();
  });
};

//Функция для очистки масссива по заданому фильтру
const clearCompleted = arr => {
  return arr.filter(task => !task.completed);
};

taskForm.addEventListener('submit', function (event) {
  //Отменить стандарное действие кнопки и избежать обновления страницы
  event.preventDefault();

  const form = event.target;

  //Собрать введеные в форму данные
  const formData = new FormData(form);

  //Путем итерации записать данные в виде объекта с парами (ключ: значение,)
  const data = Object.fromEntries(formData.entries());

  //Добавить новую задачу в массив задач
  let newTask = {
    id: getTaskId(),
    completed: false,
    ...data,
  };

  tasksList.push(newTask);

  //Обнулить значение в графе ввода
  form.reset();

  //Отобразить список на странице
  render();

  //Отобразить список задач в консоли
  console.log(tasksList);
});

//Отфильтровать задачи
filterContent.addEventListener('change', function (event) {
  filter = event.target.value;
  render(['list']);
});

//Очистить от выполненых задач
clearCompletedButton.addEventListener('click', () => {
  tasksList = clearCompleted(tasksList);
  render();
});
