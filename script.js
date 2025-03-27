// Инициализация FAPI
let isFAPILoaded = false;

function initFAPI() {
    if (typeof FAPI === 'undefined' || !FAPI.Util) {
        console.warn("FAPI не загружен");
        return false;
    }

    const rParams = FAPI.Util.getRequestParameters();
    FAPI.init(
        rParams["api_server"],
        rParams["apiconnection"],
        function() {
            console.log("FAPI успешно инициализирован");
            isFAPILoaded = true;
        },
        function(error) {
            console.error("Ошибка инициализации FAPI:", error);
        }
    );
    return true;
}

// Обработчики кнопок
function setupButtonHandlers() {
    // Получаем элементы кнопок
    const elements = {
        interstitial: document.getElementById('showInterstitial'),
        reward: document.getElementById('showReward'),
        save: document.getElementById('saveGame'),
        load: document.getElementById('loadGame'),
        addStat: document.getElementById('addStat'),
        removeStat: document.getElementById('removeStat')
    };

    // Обработчики
    elements.interstitial.addEventListener('click', showInterstitial);
    elements.reward.addEventListener('click', showReward);
    elements.save.addEventListener('click', saveGame);
    elements.load.addEventListener('click', loadGame);
    elements.addStat.addEventListener('click', addStatistic);
    elements.removeStat.addEventListener('click', removeStatistic);
}

// Функции для работы с FAPI
function showInterstitial() {
    if (!isFAPILoaded) {
        console.log("Mock: Показ interstitial рекламы");
        return;
    }

    FAPI.Ads.showBanner({
        format: 'interstitial',
        onClose: () => console.log("Interstitial закрыт"),
        onError: (error) => console.error("Ошибка interstitial:", error)
    });
}

function showReward() {
    if (!isFAPILoaded) {
        console.log("Mock: Показ reward рекламы");
        return;
    }

    FAPI.Ads.showRewardedVideo({
        onClose: (watched) => console.log(
            watched ? "Reward просмотрен" : "Reward не досмотрен"
        ),
        onError: (error) => console.error("Ошибка reward:", error)
    });
}

function saveGame() {
    const gameData = {
        level: 1,
        score: 0,
        timestamp: Date.now()
    };

    if (!isFAPILoaded) {
        console.log("Mock: Сохранение игры", gameData);
        return;
    }

    FAPI.Storage.set('game_save', JSON.stringify(gameData), (result) => {
        console.log(result ? "Сохранено успешно" : "Ошибка сохранения");
    });
}

function loadGame() {
    if (!isFAPILoaded) {
        console.log("Mock: Загрузка игры");
        return;
    }

    FAPI.Storage.get('game_save', (data) => {
        if (data) {
            try {
                console.log("Загружены данные:", JSON.parse(data));
            } catch (e) {
                console.error("Ошибка парсинга данных:", e);
            }
        } else {
            console.warn("Данные не найдены");
        }
    });
}

function addStatistic() {
    const statData = {
        event: 'button_click',
        button: 'add_stat',
        timestamp: Date.now()
    };

    if (!isFAPILoaded) {
        console.log("Mock: Отправка статистики", statData);
        return;
    }

    FAPI.Statistics.send(statData, (result) => {
        console.log(result ? "Статистика отправлена" : "Ошибка отправки");
    });
}

function removeStatistic() {
    console.log("Удаление статистики не поддерживается в API");
}

// Инициализация
if (initFAPI()) {
    // Если FAPI загружен, ждем его инициализации
    const checkInit = setInterval(() => {
        if (isFAPILoaded) {
            clearInterval(checkInit);
            setupButtonHandlers();
        }
    }, 100);
} else {
    // Если FAPI не загружен, сразу настраиваем кнопки с мок-функциями
    setupButtonHandlers();
}