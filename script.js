let taskForm = document.getElementById('task-form');
let listOfTasks = document.getElementById('task-list');
let tasksList = [];

//Хендлер для добавления id
const createIncrementingIdGetter = () => {
  let id = 0;
  return function () {
    return ++id;
  };
};

const getTaskId = createIncrementingIdGetter();

//Функция для добавления задачи на страницу
const renderTask = task => {
  const taskElement = document.createElement('div');
  taskElement.classList.add('task');
  taskElement.dataset.id = task.id;

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = task.completed;

  const titleElement = document.createElement('p');
  titleElement.textContent = task.title;

  taskElement.append(checkbox, titleElement);

  listOfTasks.append(taskElement);
};

taskForm.addEventListener('submit', function (event) {
  //Отменить стандарное действие кнопки и избежать обновления страницы
  event.preventDefault();

  const form = event.target;

  //Собрать введеные в форму данные
  const formData = new FormData(form);

  //Путем итерации записать данные в виде объекта с парами (ключ: значение,)
  const data = Object.fromEntries(formData.entries());

  //Добавить новую задачу в ссписок задач
  let newTask = {
    id: getTaskId(),
    completed: false,
    ...data,
  };

  tasksList.push(newTask);

  //Обнулить значение в графе ввода
  form.reset();

  //Отобразить задачу на странице
  renderTask(newTask);

  //Отобразить список задач в консоли
  console.log(tasksList);
});
