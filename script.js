let taskForm = document.getElementById('task-form');
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
  taskElement = document.createElement('div');
  taskElement.className = 'task';

  for (let key in task) {
    let keyElement = document.createElement('div');
    keyElement.className = `task-${key}`;
    keyElement.textContent = `${key}: ${task[key]}`; //Почему когда я добавлял task.key значения были undefined?
    taskElement.appendChild(keyElement);
  }

  document.getElementById('task-list').append(taskElement);
};

taskForm.addEventListener('submit', function (event) {
  //Отменить стандарное действие кнопки и избежать обновления страницы
  event.preventDefault();

  form = event.target;

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
