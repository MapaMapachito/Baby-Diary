
// === Global State ===
const children = [];   // each: { name, foods:[], sleeps:[], diapers:[], health:[] }
let currentChildIndex = 0;

// === Elements ===
const loginScreen = document.getElementById('loginScreen');
const childSetup = document.getElementById('childSetup');
const appScreen   = document.getElementById('app');

const emailInput  = document.getElementById('email');
const passInput   = document.getElementById('password');
const btnLogin    = document.getElementById('btnLogin');

const childNameInput = document.getElementById('childName');
const btnAddChild = document.getElementById('btnAddChild');
const childListUl = document.getElementById('childList');
const btnStartApp = document.getElementById('btnStartApp');

const childSelect = document.getElementById('childSelect');

// Tabs
const navButtons = document.querySelectorAll('.tabs .tab');

// Sections
const sectionMap = {
    food: document.getElementById('section-food'),
    sleep: document.getElementById('section-sleep'),
    diaper: document.getElementById('section-diaper'),
    health: document.getElementById('section-health')
};

// Child‑specific forms / lists (query after DOM load)
const foodForm = document.getElementById('foodForm');
const foodList = document.getElementById('foodList');
const btnStartSleep = document.getElementById('btnStartSleep');
const btnStopSleep = document.getElementById('btnStopSleep');
const currentDuration = document.getElementById('currentDuration');
const sleepTableBody = document.querySelector('#sleepTable tbody');
const diaperForm = document.getElementById('diaperForm');
const diaperTableBody = document.querySelector('#diaperTable tbody');
const diaperTotal = document.getElementById('diaperTotal');
const healthForm = document.getElementById('healthForm');
const healthList = document.getElementById('healthList');

let sleepStart = null;
let currentTab = 'food';

// === Login flow ===
btnLogin.addEventListener('click', () => {
    const email = emailInput.value.trim();
    const pass  = passInput.value.trim();
    if (!email || !pass) { alert('Ingresa correo y contraseña'); return; }
    loginScreen.classList.add('hidden');
    childSetup.classList.remove('hidden');
});

// === Child setup ===
btnAddChild.addEventListener('click', () => {
    const name = childNameInput.value.trim();
    if (!name) { alert('Ingresa un nombre'); return; }
    children.push({ name, foods:[], sleeps:[], diapers:[], health:[] });
    renderChildList();
    childNameInput.value = '';
    btnStartApp.disabled = false;
});

btnStartApp.addEventListener('click', () => {
    if (children.length === 0) { alert('Agrega al menos un hijo'); return; }
    childSetup.classList.add('hidden');
    appScreen.classList.remove('hidden');
    populateChildSelect();
    switchChild(0);
    switchSection('food');
});

function renderChildList() {
    childListUl.innerHTML = '';
    children.forEach((c, idx) => {
        const li = document.createElement('li');
        li.textContent = c.name;
        childListUl.appendChild(li);
    });
}

function populateChildSelect() {
    childSelect.innerHTML = '';
    children.forEach((c, idx) => {
        const opt = document.createElement('option');
        opt.value = idx;
        opt.textContent = c.name;
        childSelect.appendChild(opt);
    });
}

childSelect.addEventListener('change', e => {
    switchChild(parseInt(e.target.value, 10));
});

function switchChild(idx) {
    currentChildIndex = idx;
    renderAll();
}


// === Navigation ===
navButtons.forEach(btn => btn.addEventListener('click', () => switchSection(btn.dataset.target)));

function switchSection(target) {
    currentTab = target;
    Object.values(sectionMap).forEach(sec => sec.classList.add('hidden'));
    sectionMap[target].classList.remove('hidden');

    navButtons.forEach(b => b.classList.remove('active'));
    document.querySelector('.tabs .tab[data-target=' + target + ']').classList.add('active');

    const titles = {
        food:'Registro de Alimentos', sleep:'Registro de Sueño',
        diaper:'Registro de Pañales', health:'Menú de Salud'
    };
    document.getElementById('sectionTitle').innerText = titles[target];
}

// === Food ===
foodForm.addEventListener('submit', e => {
    e.preventDefault();
    const amount = document.getElementById('foodAmount').value;
    const name   = document.getElementById('foodName').value;
    const notes  = document.getElementById('foodNotes').value;
    children[currentChildIndex].foods.push({ amount, name, notes });
    renderFoods();
    foodForm.reset();
});

function renderFoods() {
    foodList.innerHTML = '';
    children[currentChildIndex].foods.forEach(f => {
        const li = document.createElement('li');
        li.innerText = `${f.name} - ${f.amount}g`;
        li.title = f.notes;
        foodList.appendChild(li);
    });
}

// === Sleep ===
btnStartSleep.addEventListener('click', () => {
    sleepStart = new Date();
    btnStartSleep.disabled = true;
    btnStopSleep.disabled  = false;
    updateDuration();
});
btnStopSleep.addEventListener('click', () => {
    if (!sleepStart) return;
    const end = new Date();
    const dur = end - sleepStart;
    children[currentChildIndex].sleeps.push({ start:sleepStart, end, dur });
    sleepStart = null;
    btnStartSleep.disabled = false;
    btnStopSleep.disabled = true;
    currentDuration.textContent = '';
    renderSleeps();
});

function updateDuration() {
    if (!sleepStart) return;
    const now = new Date();
    const diff = now - sleepStart;
    const hrs = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000)/60000);
    currentDuration.textContent = `Duración actual: ${hrs}h ${mins}m`;
    requestAnimationFrame(updateDuration);
}

function renderSleeps() {
    sleepTableBody.innerHTML = '';
    children[currentChildIndex].sleeps.forEach(s => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${fmt(s.start)}</td><td>${fmt(s.end)}</td><td>${msToHm(s.dur)}</td>`;
        sleepTableBody.appendChild(tr);
    });
}

// === Diaper ===
diaperForm.addEventListener('submit', e => {
    e.preventDefault();
    const type = document.getElementById('chkMixed').checked
        ? '💧+💩 Mixto'
        : document.getElementById('chkPoop').checked
        ? '💩 Popó'
        : '💧 Pipi';
    const note = document.getElementById('diaperNote').value;
    children[currentChildIndex].diapers.push({ time:new Date(), type, note });
    renderDiapers();
    diaperForm.reset();
});

function renderDiapers() {
    diaperTableBody.innerHTML = '';
    const diapers = children[currentChildIndex].diapers;
    diapers.forEach(d => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${fmt(d.time)}</td><td>${d.type}</td><td>${d.note}</td>`;
        diaperTableBody.appendChild(tr);
    });
    diaperTotal.textContent = `Total hoy: ${diapers.length}`;
}

// === Health ===
if (healthForm) {
    healthForm.addEventListener('submit', e => {
        e.preventDefault();
        const type = document.getElementById('healthType').value;
        const detail = document.getElementById('healthDetail').value.trim();
        if (!type) { alert('Selecciona un tipo'); return;}
        children[currentChildIndex].health.push({ time:new Date(), type, detail });
        renderHealth();
        healthForm.reset();
    });
}

function renderHealth() {
    healthList.innerHTML = '';
    children[currentChildIndex].health.forEach(rec => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${rec.type}</strong> — ${rec.detail}<br><small>${fmt(rec.time)}</small>`;
        healthList.appendChild(li);
    });
}

// === Render all for current child ===
function renderAll() {
    renderFoods();
    renderSleeps();
    renderDiapers();
    renderHealth();
    childSelect.value = currentChildIndex;
}

// === Utils ===
function fmt(d){return d.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});}
function msToHm(ms){const h=Math.floor(ms/3600000);const m=Math.round((ms%3600000)/60000);return `${h}h ${m}m`;}
