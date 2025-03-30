let button = document.getElementById("add");
let todoList = document.getElementById("todoList");
let input = document.getElementById("input");
let progressBar = document.getElementById("progress");
let dueDateInput = document.getElementById("dueDate");
let todos = [];

window.onload = () => {
    todos = JSON.parse(localStorage.getItem("todos")) || [];
    todos.forEach(todo => addTodo(todo.text, todo.completed, todo.dueDate, todo.notified));
    updateProgress();
    checkDueTasks();

    // Request notification permission
    if (Notification.permission !== "granted" && Notification.permission !== "denied") {
        Notification.requestPermission();
    }

    // Delay the first due check to avoid instant execution
    setInterval(checkDueTasks, 360000);
};

button.addEventListener("click", () => {
    if (input.value.trim() !== "") {
        let taskText = input.value.trim();
        let dueDate = dueDateInput.value;

        addTodo(taskText, false, dueDate, false);
        todos.push({ text: taskText, completed: false, dueDate: dueDate, notified: false });
        localStorage.setItem("todos", JSON.stringify(todos));
        input.value = "";
        dueDateInput.value = "";

        updateProgress();
        checkDueTasks();
    }
});

function addTodo(todoText, completed, dueDate, notified) {
    let taskContainer = document.createElement("div");
    taskContainer.className = "task-container";
    taskContainer.style.alignItems = "center";
    taskContainer.style.padding = "5px";


    let check = document.createElement("input");
    check.type = "checkbox";
    check.style.marginRight = "10px";
    check.style.transform = "scale(1.8)";
    check.checked = completed;
    if (completed) check.style.accentColor = "green";

    let dueDateElement = document.createElement("span");
    dueDateElement.className = "due-date";
    dueDateElement.innerText = `📅 Due: ${dueDate}`;
    dueDateElement.style.marginRight = "10px";
    
    let today = new Date().toISOString().split("T")[0];
    let storedDueDate = new Date(dueDate).toLocaleDateString("en-CA"); // Ensure correct format

    dueDateElement.style.color = storedDueDate === today ? "red" : "green";

    let task = document.createElement("h3");
    task.innerText = todoText;
    task.style.flex = "1";
    if (completed) task.style.textDecoration = "line-through";

    let editBtn = document.createElement("button");
    editBtn.innerText = "✏️";
    editBtn.style.cursor = "pointer";
    editBtn.addEventListener("click", () => {
        let newText = prompt("Edit your Task:", task.innerText);
        let newDate = prompt("Edit Due Date (YYYY-MM-DD):", dueDate);
        if (newText && newDate) {
            let index = todos.findIndex(t => t.text === todoText && t.dueDate === dueDate);
            if (index !== -1) {
                todos[index].text = newText.trim();
                todos[index].dueDate = newDate.trim();
                todos[index].notified = false; // Reset notification flag
                localStorage.setItem("todos", JSON.stringify(todos));
            }
            task.innerText = newText.trim();
            dueDateElement.innerText = `📅 Due: ${newDate}`;
        }
    });

    let deleteBtn = document.createElement("button");
    deleteBtn.innerText = "❌";
    deleteBtn.style.color = "red";
    deleteBtn.style.cursor = "pointer";
    deleteBtn.addEventListener("click", () => {
        taskContainer.remove();
        removeTask(todoText, dueDate);
    });

    check.addEventListener("change", () => {
        let index = todos.findIndex(t => t.text === todoText);
        if (index !== -1) {
            todos[index].completed = check.checked;
            localStorage.setItem("todos", JSON.stringify(todos));
        }

        if (check.checked) {
            document.getElementById("taskCompletedSound").play();
        }

        task.style.textDecoration = check.checked ? "line-through" : "none";
        check.style.accentColor = check.checked ? "green" : "";
        updateProgress();
    });
    taskContainer.style.display="flex";
    taskContainer.style.alignItems = "center";
    taskContainer.style.padding = "5px";
    taskContainer.appendChild(check);
    taskContainer.appendChild(task);
   
    taskContainer.appendChild(dueDateElement);
    taskContainer.appendChild(editBtn);
    taskContainer.appendChild(deleteBtn);
    todoList.appendChild(taskContainer);

    updateProgress();
}

function removeTask(taskText, dueDate) {
    todos = todos.filter(todo => !(todo.text === taskText && todo.dueDate === dueDate));
    localStorage.setItem("todos", JSON.stringify(todos));
    updateProgress();
}

function updateProgress() {
    let totalTasks = todos.length;
    let completedTasks = todos.filter(todo => todo.completed).length;
    let progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    progressBar.style.width = progress + "%";

    if (progress === 100) {
        progressBar.style.backgroundColor = "orange";
        document.getElementById("doneBanner").style.display = "block";
        startConfetti();
    } else {
        progressBar.style.backgroundColor = progress > 50 ? "yellow" : "bisque";
        document.getElementById("doneBanner").style.display = "none";
    }
}
function startConfetti() {
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
    });

    setTimeout(() => {}, 3000);
}
function showNotification(taskText) {
    if (Notification.permission === "granted") {
        new Notification("Task Due Today!", {
            body: `🔔 Reminder: "${taskText}" is due today!`,
            icon: "https://cdn-icons-png.flaticon.com/512/5610/5610944.png",
        });
    } else {
        console.warn("🚨 Notification permission not granted.");
    }
}

// Move `showNotification` above `checkDueTasks()`
function checkDueTasks() {
    console.log("🔍 Checking due tasks...");

    let today = new Date().toLocaleDateString("en-CA");

    todos.forEach((todo, index) => {
        let storedDueDate = new Date(todo.dueDate).toLocaleDateString("en-CA");

        console.log(`🔔 Task: ${todo.text}, Due: ${storedDueDate}, Completed: ${todo.completed}`);

        // Show notifications every minute for due tasks
        if (!todo.completed && storedDueDate === today) {
            showNotification(todo.text);
        }
    });
}



