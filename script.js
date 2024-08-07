let taskForm = document.getElementById('task-form');
let tasksList = [];

const createIncrementingIdGetter = () => {
  let id = 0;
  return function () {
    return ++id;
  };
};

const getTaskId = createIncrementingIdGetter();

taskForm.addEventListener('submit', function (event) {
  //Отменить стандарное действие кнопки и избежать обновления страницы
  event.preventDefault();

  //Собрать введеные в форму данные
  const formData = new FormData(event.target);

  //Путем итерации записать данные в виде объекта с парами (ключ: значение,)
  const data = Object.fromEntries(formData.entries());

  //Добавить новую задачу в ссписок задач
  tasksList.push({
    id: getTaskId(),
    completed: false,
    ...data,
  });

  //Обнулить значение в графе ввода
  this.reset();

  //Отобразить список задач в консоли
  console.log(tasksList);
});
