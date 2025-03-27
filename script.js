// Состояние приложения
let isFAPILoaded = false;
let lastAdTime = 0;

// Элементы интерфейса
const statusElement = document.getElementById('statusMessage');
const interstitialButton = document.getElementById('showInterstitial');
const rewardButton = document.getElementById('showReward');
const saveButton = document.getElementById('saveGame');
const loadButton = document.getElementById('loadGame');
const addStatButton = document.getElementById('addStat');
const removeStatButton = document.getElementById('removeStat');

// Навешивание обработчиков
if (interstitialButton) interstitialButton.addEventListener('click', () => showAd('interstitial'));
if (rewardButton) rewardButton.addEventListener('click', () => showAd('reward'));
if (saveButton) saveButton.addEventListener('click', saveGameData);
if (loadButton) loadButton.addEventListener('click', loadGameData);
if (addStatButton) addStatButton.addEventListener('click', sendStatistic);
if (removeStatButton) removeStatButton.addEventListener('click', removeStatistic);

// Инициализация FAPI
function initFAPI() {
    if (typeof FAPI === 'undefined' || !FAPI.Util) {
        console.log('[error] FAPI не загружен');
        return false;
    }

    const rParams = FAPI.Util.getRequestParameters();
    
    FAPI.init(
        rParams["api_server"] || 'https://api.ok.ru',
        rParams["apiconnection"] || 'apiconnection',
        function() {
            console.log('[success] FAPI успешно инициализирован');
            isFAPILoaded = true;
        },
        function(error) {
            console.log(`[error] Ошибка инициализации FAPI: ${error}`);
        }
    );
    
    return true;
}

// Показать рекламу
function showAd(adType) {
    if (!isFAPILoaded) {
        console.log(`[warning] Mock: Показ ${adType} рекламы`);
        return;
    }

    FAPI.UI.showAd({
        adType: adType,
        callbacks: {
            onAdLoaded: () => console.log(`[info] Реклама ${adType} загружена`),
            onAdShown: () => {
                lastAdTime = Date.now();
                console.log(`[success] Реклама ${adType} показана`);
            },
            onAdClosed: (watched) => {
                if (adType === 'reward') {
                    console.log(watched ? '[success] Награда получена!' : '[warning] Реклама закрыта до завершения');
                } else {
                    console.log(`[info] Реклама ${adType} закрыта`);
                }
            },
            onAdError: (error) => console.log(`[error] Ошибка ${adType}: ${error}`)
        }
    });
}

// Работа с сохранениями
function saveGameData() {
    const gameData = { timestamp: Date.now(), data: "Пример данных для сохранения" };
    if (!isFAPILoaded) {
        console.log(`[warning] Mock: Данные сохранены: ${JSON.stringify(gameData)}`);
        return;
    }
    FAPI.Storage.set('game_data', JSON.stringify(gameData), (result) => {
        console.log(result ? '[success] Данные успешно сохранены' : '[error] Ошибка сохранения данных');
    });
}

function loadGameData() {
    if (!isFAPILoaded) {
        console.log('[warning] Mock: Загрузка тестовых данных');
        return;
    }
    FAPI.Storage.get('game_data', (data) => {
        if (!data) {
            console.log('[warning] Сохраненные данные не найдены');
            return;
        }
        try {
            const parsedData = JSON.parse(data);
            console.log(`[success] Данные загружены: ${JSON.stringify(parsedData)}`);
        } catch (e) {
            console.log(`[error] Ошибка чтения данных: ${e}`);
        }
    });
}

// Работа со статистикой
function sendStatistic() {
    const statData = { event: 'button_click', action: 'add_stat', timestamp: Date.now() };
    if (!isFAPILoaded) {
        console.log(`[warning] Mock: Статистика отправлена: ${JSON.stringify(statData)}`);
        return;
    }
    FAPI.Statistics.send(statData, (result) => {
        console.log(result ? '[success] Статистика успешно отправлена' : '[error] Ошибка отправки статистики');
    });
}

function removeStatistic() {
    console.log('[warning] Удаление статистики не поддерживается в API');
}

// Глобальный колбэк для FAPI
window.API_callback = function(method, result, data) {
    console.log("API_callback:", method, result, data);
};

// Инициализация при загрузке
if (typeof FAPI !== 'undefined') {
    initFAPI();
} else {
    console.log('[info] Ожидание загрузки FAPI...');
    const checkFAPI = setInterval(() => {
        if (typeof FAPI !== 'undefined') {
            clearInterval(checkFAPI);
            initFAPI();
        }
    }, 100);
    setTimeout(() => {
        if (!isFAPILoaded) {
            clearInterval(checkFAPI);
            console.log('[warning] FAPI не загружен, используется mock-режим');
        }
    }, 5000);
}
