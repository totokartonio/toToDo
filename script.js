let taskForm = document.getElementById('task-form');
let newTaskTitle = document.getElementById('new-task');
let tasksList = [];
let idNumber = 0;

taskForm.addEventListener('submit', function(event) {
    //Отменить стандарное действие кнопки и избежать обновления страницы
    event.preventDefault();
    
    //Добавить новую задачу в ссписок задач
    tasksList.push(
      {
      id: idNumber++,
      title: newTaskTitle.value,
      completed: false,
      }
    );
    
    //Обнулить значение в графе ввода
    newTaskTitle.value = '';

    //Отобразить список задач в консоли
    console.log(tasksList)
  }
);