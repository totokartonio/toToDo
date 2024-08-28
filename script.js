'use strict';

let taskForm = document.getElementById('task-form');
let listOfTasks = document.getElementById('task-list');
let tasksList = [];

//Хендлер для добавления id
const createIncrementingIdGetter = () => {
  let id = 0;
  return function () {
    return String(++id);
  };
};

const getTaskId = createIncrementingIdGetter();

//Функция для отслеживания изменение состояние чекбоксов
const checkboxHandler = taskId => event => {
  let checkbox = event.currentTarget;

  tasksList = tasksList.map(task =>
    task.id === taskId ? { ...task, completed: checkbox.checked } : task,
  );
  console.log(tasksList);
};

//Функция для удаления задачи
const deleteTaskHandler = (taskId, taskElement) => () => {
  tasksList = tasksList.filter(task => task.id !== taskId);
  renderList();

  console.log(tasksList);
};

//Функция для обновления списка задач на странице
const renderList = () => {
  const fragment = document.createDocumentFragment();

  tasksList.forEach(task => {
    //Общий контейнер задачи
    const taskElement = document.createElement('div');
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

    fragment.append(taskElement);
  });

  listOfTasks.replaceChildren(fragment);
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
  renderList();

  //Отобразить список задач в консоли
  console.log(tasksList);
});
