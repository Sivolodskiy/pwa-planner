// ---------------------------- Глобальные данные ----------------------------
let tasks = [];         // { id, text, category, deadline (ISO), status: 'new'/'progress'/'done', rating, dateCreated, notified }
let userId = localStorage.getItem('userId') || 'user_' + Date.now();
let currentView = 'today'; // 'today' или 'archive'
let currentRatingTaskId = null;

// Профиль
let userProfile = {
    name: '',
    gender: 'male',
    avatar: '😎',
    goal: '',
    totalCompleted: 0,
    level: 1
};

// Уровни (5 штук)
const levels = [
    { name: '⭐ Новичок', min: 0 },
    { name: '📌 Организатор', min: 100 },
    { name: '🏅 Мастер планов', min: 200 },
    { name: '⏱️ Эксперт пунктуальности', min: 300 },
    { name: '🏆 Легенда продуктивности', min: 400 }
];

// ---------------------------- Инициализация ----------------------------
document.addEventListener('DOMContentLoaded', () => {
    loadUserProfile();
    loadTasks();
    setupEventListeners();
    requestNotificationPermission();
    startReminderChecker();
    startDeadlineChecker();
    renderTasks();
    applyTealDesign(); // дополнительные декоративные линии
});

// ---------------------------- Работа с задачами ----------------------------
function loadTasks() {
    const saved = localStorage.getItem('pwa_advanced_tasks');
    if (saved) {
        tasks = JSON.parse(saved);
        // Привести старые задачи к новому формату
        tasks = tasks.map(t => ({
            ...t,
            status: t.status || 'new',
            dateCreated: t.dateCreated || new Date().toISOString().split('T')[0],
            rating: t.rating || null
        }));
    } else {
        tasks = [];
    }
    updateStats();
}

function saveTasks() {
    localStorage.setItem('pwa_advanced_tasks', JSON.stringify(tasks));
    updateStats();
    updateProfileStats();
}

function addTask() {
    const text = document.getElementById('taskInput').value.trim();
    if (!text) return;
    const category = document.getElementById('categorySelect').value;
    const deadline = document.getElementById('deadlineInput').value; // datetime-local
    const todayStr = new Date().toISOString().split('T')[0];
    const newTask = {
        id: Date.now(),
        text,
        category,
        deadline: deadline || null,
        status: 'new',          // new, progress, done
        rating: null,
        dateCreated: todayStr,
        notified: false,
        notifiedHour: false
    };
    tasks.push(newTask);
    saveTasks();
    renderTasks();
    document.getElementById('taskInput').value = '';
    document.getElementById('deadlineInput').value = '';
}

function updateTaskStatus(id, newStatus) {
    const task = tasks.find(t => t.id == id);
    if (task) {
        task.status = newStatus;
        if (newStatus === 'done') {
            task.completedDate = new Date().toISOString();
            // Показать окно оценки
            currentRatingTaskId = id;
            document.getElementById('ratingModal').style.display = 'flex';
        }
        saveTasks();
        renderTasks();
    }
}

function deleteTask(id) {
    tasks = tasks.filter(t => t.id != id);
    saveTasks();
    renderTasks();
}

// Оценка задачи после выполнения
function submitRating(difficulty) {
    if (!currentRatingTaskId) return;
    const task = tasks.find(t => t.id == currentRatingTaskId);
    if (task) {
        task.rating = difficulty; // 1-3
        task.status = 'done';
        // Добавляем в профиль выполненные
        userProfile.totalCompleted += 1;
        saveUserProfile();
        updateLevel();
        saveTasks();
        renderTasks();
        // Показываем мотивационное сообщение
        let msg = '';
        if (difficulty == 1) msg = '🎉 Вы большой молодец! Продолжайте в том же духе!';
        else if (difficulty == 2) msg = '😊 Хорошая работа! Немного усилий — и вы достигнете целей!';
        else msg = '💪 Было сложно, но вы справились! Каждая трудность делает вас сильнее.';
        document.getElementById('motivatio
Date.now - Domain For Sale | Ready-to-use Business Name | NextBrand
Date.now - Domain For Sale | Ready-to-use Business Name | NextBrand
www.nextbrand.com


nMessage').innerText = msg;
        setTimeout(() => {
            document.getElementById('ratingModal').style.display = 'none';
            currentRatingTaskId = null;
        }, 2000);
    }
}

// ---------------------------- Отображение (сегодня / архив) ----------------------------
function renderTasks() {
    const todayStr = new Date().toISOString().split('T')[0];
    let filteredTasks;
    if (currentView === 'today') {
        filteredTasks = tasks.filter(t => t.dateCreated === todayStr);
    } else {
        filteredTasks = tasks.filter(t => t.dateCreated !== todayStr);
    }
    const container = document.getElementById('taskList');
    if (filteredTasks.length === 0) {
        container.innerHTML = '<div class="empty">✨ Нет задач в этом разделе</div>';
        return;
    }
    container.innerHTML = '';
    filteredTasks.forEach(task => {
        const taskDiv = document.createElement('div');
        taskDiv.className = 'task-item';
        if (task.status === 'done') taskDiv.style.opacity = '0.7';
        // Чекбокс под статус
        const statusSelect = document.createElement('select');
        statusSelect.className = 'status-select';
        statusSelect.innerHTML = `
            <option value="new" ${task.status === 'new' ? 'selected' : ''}>⚪ Не начато</option>
            <option value="progress" ${task.status === 'progress' ? 'selected' : ''}>🔄 В процессе</option>
            <option value="done" ${task.status === 'done' ? 'selected' : ''}>✅ Выполнено</option>
        `;
        statusSelect.addEventListener('change', (e) => updateTaskStatus(task.id, e.target.value));
        
        const infoDiv = document.createElement('div');
        infoDiv.className = 'task-info';
        infoDiv.innerHTML = `
            <span class="task-text">${task.text}</span>
            <div class="task-meta">
                <span class="category-badge">${getCategoryIcon(task.category)}</span>
                ${task.deadline ? `<span class="deadline-badge">📅 ${new Date(task.deadline).toLocaleString()}</span>` : ''}
                ${task.rating ? `<span>Оценка: ${'😊😐😟'.charAt(task.rating-1)}</span>` : ''}
            </div>
        `;
        const delBtn = document.createElement('button');
        delBtn.innerText = '🗑';
        delBtn.className = 'delete-btn';
        delBtn.onclick = () => deleteTask(task.id);
        taskDiv.appendChild(statusSelect);
        taskDiv.appendChild(infoDiv);
        taskDiv.appendChild(delBtn);
        container.appendChild(taskDiv);
    });
}

function getCategoryIcon(cat) {
    if (cat === 'work') return '💼 Работа';
    if (cat === 'personal') return '🏠 Личное';
    return '📚 Учёба';
}

// ---------------------------- Уведомления (дедлайн за час + умные) ----------------------------
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

function checkDeadlines() {
    const now = new Date();
    tasks.forEach(task => {
        if (!task.deadline || task.status === 'done') return;
        const deadlineTime = new Date(task.deadline);
        const diffHours = (deadlineTime - now) / (1000 * 60 * 60);
        if (diffHours <= 1 && diffHours > 0 && !task.notifiedHour) {
            showNotification('⏰ Дедлайн через час', `Задача "${task.text}" должна быть выполнена до ${deadlineTime.toLocaleTimeString()}`);
            task.notifiedHour = true;
            saveTasks();
        }
    });
}

// Умные напоминания на основе истории (задачи, которые часто делались в определенное время)
function smartReminder() {
    const now = new Date();
    const currentHour = now.getHours();
    const todayStr = now.toISOString().split('T')[0];
    // Анализируем выполненные задачи за прошлые дни (кроме сегодня)
    const pastTasks = tasks.filter(t => t.status === 'done' && t.dateCreated !== todayStr);
    // Группируем по ключевым словам (упрощённо: по тексту)
    const freq = {};
    pa


stTasks.forEach(t => {
        const keyword = t.text.toLowerCase();
        freq[keyword] = (freq[keyword] || 0) + 1;
    });
    // Если какая-то задача выполнялась более 2 раз и сегодня её нет в списке – предложим
    for (let [text, count] of Object.entries(freq)) {
        if (count >= 2 && !tasks.some(t => t.text.toLowerCase() === text && t.dateCreated === todayStr)) {
            if (Math.random() < 0.3) { // не каждый час, чтобы не надоедать
                showNotification('💡 Напоминание', `Вы обычно делаете "${text}" в это время. Сегодня не забыли?`);
                break;
            }
        }
    }
}

function startDeadlineChecker() {
    setInterval(checkDeadlines, 60000);
}
function startReminderChecker() {
    setInterval(smartReminder, 3600000); // каждый час
}

function showNotification(title, body) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body, icon: 'icon.png' });
    }
}

// ---------------------------- Профиль и уровни ----------------------------
function loadUserProfile() {
    const saved = localStorage.getItem('userProfile');
    if (saved) {
        userProfile = JSON.parse(saved);
    } else {
        userProfile = { name: '', gender: 'male', avatar: '😎', goal: '', totalCompleted: 0, level: 1 };
    }
    updateProfileUI();
}

function saveUserProfile() {
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
    updateProfileUI();
}

function updateLevel() {
    let completed = userProfile.totalCompleted;
    let newLevel = 1;
    for (let i = levels.length-1; i >=0; i--) {
        if (completed >= levels[i].min) {
            newLevel = i+1;
            break;
        }
    }
    userProfile.level = newLevel;
    saveUserProfile();
    document.getElementById('levelBadge').innerText = levels[newLevel-1].name;
}

function updateProfileStats() {
    const completed = tasks.filter(t => t.status === 'done').length;
    userProfile.totalCompleted = completed;
    saveUserProfile();
    updateLevel();
    if (document.getElementById('profileCompleted')) {
        document.getElementById('profileCompleted').innerText = completed;
        document.getElementById('profileLevel').innerText = levels[userProfile.level-1].name;
        let next = (userProfile.level < 5) ? levels[userProfile.level].min - completed : 0;
        document.getElementById('nextLevelTasks').innerText = next > 0 ? next : 'Максимум!';
    }
}

function updateProfileUI() {
    document.getElementById('avatarPreview').innerText = userProfile.avatar;
    document.getElementById('userName').value = userProfile.name;
    document.getElementById('userGender').value = userProfile.gender;
    document.getElementById('userGoal').value = userProfile.goal;
}

// ---------------------------- UI события ----------------------------
function setupEventListeners() {
    document.getElementById('addBtn').addEventListener('click', addTask);
    document.getElementById('todayBtn').addEventListener('click', () => {
        currentView = 'today';
        document.getElementById('todayBtn').classList.add('active');
        document.getElementById('archiveBtn').classList.remove('active');
        renderTasks();
    });
    document.getElementById('archiveBtn').addEventListener('click', () => {
        currentView = 'archive';
        document.getElementById('archiveBtn').classList.add('active');
        document.getElementById('todayBtn').classList.remove('active');
        renderTasks();
    });
    document.getElementById('profileBtn').addEventListener('click', () => {
        updateProfileStats();
        document.getElementById('profileModal').style.display = 'flex';
    });
    document.getElementById('saveProfile').addEventListener('click', () => {
        userProfile.name = document.getElementById('userName').value;
        userProfile.gender = document.getElementById('userGender').value;
        userProfile.goal = document.getElementById('userGoal').value;


let newAvatar = document.getElementById('avatarEmoji').value.trim();
        if (newAvatar) userProfile.avatar = newAvatar;
        // загрузка картинки
        const fileInput = document.getElementById('avatarUpload');
        if (fileInput.files[0]) {
            const reader = new FileReader();
            reader.onload = e => {
                userProfile.avatar = e.target.result; // base64
                document.getElementById('avatarPreview').innerText = '';
                const img = document.createElement('img');
                img.src = e.target.result;
                img.style.width = '48px';
                document.getElementById('avatarPreview').appendChild(img);
                saveUserProfile();
            };
            reader.readAsDataURL(fileInput.files[0]);
        } else {
            saveUserProfile();
        }
        document.getElementById('profileModal').style.display = 'none';
        renderTasks(); // обновить отображение уровня в шапке
    });
    document.getElementById('closeProfile').addEventListener('click', () => {
        document.getElementById('profileModal').style.display = 'none';
    });
    // Ползунок оценки
    const slider = document.getElementById('difficultySlider');
    const emojiSpan = document.getElementById('sliderEmoji');
    slider.addEventListener('input', () => {
        const val = parseInt(slider.value);
        if (val === 1) emojiSpan.innerText = '😊';
        else if (val === 2) emojiSpan.innerText = '😐';
        else emojiSpan.innerText = '😟';
    });
    document.getElementById('submitRating').addEventListener('click', () => {
        const diff = parseInt(document.getElementById('difficultySlider').value);
        submitRating(diff);
    });
}

function updateStats() {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayTasks = tasks.filter(t => t.dateCreated === todayStr);
    const totalToday = todayTasks.length;
    const progress = todayTasks.filter(t => t.status === 'progress').length;
    const completed = todayTasks.filter(t => t.status === 'done').length;
    const overdue = todayTasks.filter(t => t.status !== 'done' && t.deadline && new Date(t.deadline) < new Date()).length;
    document.getElementById('totalCount').innerText = totalToday;
    document.getElementById('progressCount').innerText = progress;
    document.getElementById('completedCount').innerText = completed;
    document.getElementById('overdueCount').innerText = overdue;
}

// Декоративные линии на фон
function applyTealDesign() {
    const style = document.createElement('style');
    style.textContent = `
        body::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-image: repeating-linear-gradient(45deg, rgba(20,184,166,0.05) 0px, rgba(20,184,166,0.05) 2px, transparent 2px, transparent 8px);
            pointer-events: none;
            z-index: -1;
        }
    `;
    document.head.appendChild(style);
}