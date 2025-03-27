import OkAdapter from "./adapter/OkAdapter";

window["includeScript"]("//api.ok.ru/js/fapi5.js");

let isAdapterReady = false;
let lastAdTime = 0;
let adapter = null;

// Получаем элементы UI
const statusElement = document.getElementById('statusMessage');
const interstitialButton = document.getElementById('showInterstitial');
const rewardButton = document.getElementById('showReward');
const saveButton = document.getElementById('saveGame');
const loadButton = document.getElementById('loadGame');
const addStatButton = document.getElementById('addStat');
const removeStatButton = document.getElementById('removeStat');

// Инициализация адаптера
async function initAdapter() {
    try {
        // Ждем полной загрузки FAPI
        await waitForFAPI();
        
        // Создаем экземпляр адаптера
        adapter = new OkAdapter();
        console.log("Adapter created:", adapter);
        
        // Инициализируем адаптер
        await adapter.init();
        isAdapterReady = true;
        console.log('[success] Адаптер успешно инициализирован');
        
        // Включаем кнопки
        enableButtons();
        
        return true;
    } catch (error) {
        console.error('Ошибка инициализации адаптера:', error);
        return false;
    }
}

// Функция ожидания загрузки FAPI
function waitForFAPI() {
    return new Promise((resolve, reject) => {
        const checkInterval = setInterval(() => {
            if (typeof FAPI !== 'undefined' && FAPI.Util) {
                clearInterval(checkInterval);
                resolve(true);
            }
        }, 100);

        setTimeout(() => {
            clearInterval(checkInterval);
            reject(new Error('Timeout waiting for FAPI'));
        }, 5000);
    });
}

// Включаем кнопки после инициализации
function enableButtons() {
    interstitialButton?.removeAttribute('disabled');
    rewardButton?.removeAttribute('disabled');
    saveButton?.removeAttribute('disabled');
    loadButton?.removeAttribute('disabled');
    addStatButton?.removeAttribute('disabled');
    removeStatButton?.removeAttribute('disabled');
}

// Отключаем кнопки до инициализации
function disableButtons() {
    interstitialButton?.setAttribute('disabled', 'true');
    rewardButton?.setAttribute('disabled', 'true');
    saveButton?.setAttribute('disabled', 'true');
    loadButton?.setAttribute('disabled', 'true');
    addStatButton?.setAttribute('disabled', 'true');
    removeStatButton?.setAttribute('disabled', 'true');
}

// Инициализация обработчиков событий
function setupEventListeners() {
    interstitialButton?.addEventListener('click', () => showAd('interstitial'));
    rewardButton?.addEventListener('click', () => showAd('reward'));
    saveButton?.addEventListener('click', save);
    loadButton?.addEventListener('click', load);
    addStatButton?.addEventListener('click', sendStatistic);
    removeStatButton?.addEventListener('click', removeStatistic);
}

// Показ рекламы
async function showAd(adType) {
    if (!isAdapterReady || !adapter) {
        console.warn(`Адаптер не готов: Показ ${adType} рекламы`);
        return;
    }

    try {
        if (adType === 'reward') {
            const watched = await adapter.showRewardedAds();
            lastAdTime = Date.now();
            console.log(watched ? '[success] Награда получена!' : '[warning] Реклама закрыта до завершения');
        } else {
            await adapter.showFullscreenAds();
            lastAdTime = Date.now();
            console.log(`[success] Реклама ${adType} показана`);
        }
    } catch (error) {
        console.error(`Ошибка ${adType}:`, error);
    }
}

// Сохранение данных
async function save() {
    if (!isAdapterReady || !adapter) {
        console.warn("Адаптер не готов для сохранения");
        return;
    }

    try {
        const data = { /* ваши данные */ };
        await adapter.save(data);
        console.log("[success] Данные сохранены");
    } catch (error) {
        console.error("Ошибка сохранения:", error);
    }
}

// Загрузка данных
async function load() {
    if (!isAdapterReady || !adapter) {
        console.warn("Адаптер не готов для загрузки");
        return null;
    }

    try {
        const data = await adapter.load();
        console.log("[success] Данные загружены", data);
        return data;
    } catch (error) {
        console.error("Ошибка загрузки:", error);
        return null;
    }
}

// Статистика
function sendStatistic() {
    if (isAdapterReady && adapter) {
        adapter.reachGoal('stat_added');
    }
    console.log("Сохранение статистики");
}

function removeStatistic() {
    if (isAdapterReady && adapter) {
        adapter.reachGoal('stat_removed');
    }
    console.log('Удаление статистики');
}

// Инициализация приложения
async function initializeApp() {
    disableButtons();
    setupEventListeners();
    
    try {
        await initAdapter();
    } catch (error) {
        console.error('Ошибка инициализации приложения:', error);
    }
}

// Запускаем приложение
initializeApp();