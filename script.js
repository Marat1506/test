// Конфигурация приложения
// const OK_CONFIG = {
//     app_id: 512002514780,
//     app_key: 'CNFQFLLGDIHBABABA'
// };

// Состояние приложения
let isFAPILoaded = false;
let lastAdTime = 0;

// Элементы интерфейса
const statusElement = document.getElementById('statusMessage');
const buttons = {
    interstitial: document.getElementById('showInterstitial'),
    reward: document.getElementById('showReward'),
    save: document.getElementById('saveGame'),
    load: document.getElementById('loadGame'),
    addStat: document.getElementById('addStat'),
    removeStat: document.getElementById('removeStat')
};

// Инициализация FAPI
function initFAPI() {
    if (typeof FAPI === 'undefined' || !FAPI.Util) {
        updateStatus('FAPI не загружен', 'error');
        return false;
    }

    const rParams = FAPI.Util.getRequestParameters();
    
    FAPI.init(
        rParams["api_server"] || 'https://api.ok.ru',
        rParams["apiconnection"] || 'apiconnection',
        function() {
            updateStatus('FAPI успешно инициализирован', 'success');
            isFAPILoaded = true;
            setupButtons();
        },
        function(error) {
            updateStatus(`Ошибка инициализации FAPI: ${error}`, 'error');
        }
    );
    
    return true;
}

// Настройка обработчиков кнопок
function setupButtons() {
    Object.keys(buttons).forEach(key => {
        buttons[key].addEventListener('click', () => {
            switch(key) {
                case 'interstitial': showAd('interstitial'); break;
                case 'reward': showAd('reward'); break;
                case 'save': saveGameData(); break;
                case 'load': loadGameData(); break;
                case 'addStat': sendStatistic(); break;
                case 'removeStat': removeStatistic(); break;
            }
        });
    });
}

// Показать рекламу (универсальный метод)
function showAd(adType) {
    if (!isFAPILoaded) {
        updateStatus(`Mock: Показ ${adType} рекламы`, 'warning');
        return;
    }

    FAPI.UI.showAd({
        adType: adType,
        callbacks: {
            onAdLoaded: () => updateStatus(`Реклама ${adType} загружена`, 'info'),
            onAdShown: () => {
                lastAdTime = Date.now();
                updateStatus(`Реклама ${adType} показана`, 'success');
            },
            onAdClosed: (watched) => {
                if (adType === 'reward') {
                    updateStatus(watched ? 'Награда получена!' : 'Реклама закрыта до завершения', 
                               watched ? 'success' : 'warning');
                } else {
                    updateStatus(`Реклама ${adType} закрыта`, 'info');
                }
            },
            onAdError: (error) => updateStatus(`Ошибка ${adType}: ${error}`, 'error')
        }
    });
}

// Работа с сохранениями
function saveGameData() {
    const gameData = {
        timestamp: Date.now(),
        data: "Пример данных для сохранения"
    };
    
    if (!isFAPILoaded) {
        updateStatus(`Mock: Данные сохранены: ${JSON.stringify(gameData)}`, 'warning');
        return;
    }
    
    FAPI.Storage.set('game_data', JSON.stringify(gameData), (result) => {
        updateStatus(result ? 'Данные успешно сохранены' : 'Ошибка сохранения данных',
                    result ? 'success' : 'error');
    });
}

function loadGameData() {
    if (!isFAPILoaded) {
        updateStatus('Mock: Загрузка тестовых данных', 'warning');
        return;
    }
    
    FAPI.Storage.get('game_data', (data) => {
        if (!data) {
            updateStatus('Сохраненные данные не найдены', 'warning');
            return;
        }
        
        try {
            const parsedData = JSON.parse(data);
            updateStatus(`Данные загружены: ${JSON.stringify(parsedData)}`, 'success');
        } catch (e) {
            updateStatus(`Ошибка чтения данных: ${e}`, 'error');
        }
    });
}

// Работа со статистикой
function sendStatistic() {
    const statData = {
        event: 'button_click',
        action: 'add_stat',
        timestamp: Date.now()
    };
    
    if (!isFAPILoaded) {
        updateStatus(`Mock: Статистика отправлена: ${JSON.stringify(statData)}`, 'warning');
        return;
    }
    
    FAPI.Statistics.send(statData, (result) => {
        updateStatus(result ? 'Статистика успешно отправлена' : 'Ошибка отправки статистики',
                    result ? 'success' : 'error');
    });
}

function removeStatistic() {
    updateStatus('Удаление статистики не поддерживается в API', 'warning');
}

// Вспомогательные функции
function updateStatus(message, type = 'info') {
    if (!statusElement) return;
    
    statusElement.textContent = message;
    statusElement.style.color = 
        type === 'error' ? '#ff0000' :
        type === 'success' ? '#00aa00' :
        type === 'warning' ? '#ffaa00' : '#000000';
    
    console.log(`[${type}] ${message}`);
}

// Глобальный колбэк для FAPI
window.API_callback = function(method, result, data) {
    console.log("API_callback:", method, result, data);
};

// Инициализация при загрузке
if (typeof FAPI !== 'undefined') {
    initFAPI();
} else {
    updateStatus('Ожидание загрузки FAPI...', 'info');
    
    // Проверяем загрузку FAPI с таймаутом
    const checkFAPI = setInterval(() => {
        if (typeof FAPI !== 'undefined') {
            clearInterval(checkFAPI);
            initFAPI();
        }
    }, 100);
    
    // Таймаут на загрузку FAPI (5 сек)
    setTimeout(() => {
        if (!isFAPILoaded) {
            clearInterval(checkFAPI);
            updateStatus('FAPI не загружен, используется mock-режим', 'warning');
            setupButtons();
        }
    }, 5000);
}