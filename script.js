
let isFAPILoaded = false;
let lastAdTime = 0;

const statusElement = document.getElementById('statusMessage');
const interstitialButton = document.getElementById('showInterstitial');
const rewardButton = document.getElementById('showReward');
const saveButton = document.getElementById('saveGame');
const loadButton = document.getElementById('loadGame');
const addStatButton = document.getElementById('addStat');
const removeStatButton = document.getElementById('removeStat');

interstitialButton.addEventListener('click', () => showAd('interstitial'));
rewardButton.addEventListener('click', () => showAd('reward'));
saveButton.addEventListener('click', save);
loadButton.addEventListener('click', load);
addStatButton.addEventListener('click', sendStatistic);
removeStatButton.addEventListener('click', removeStatistic);


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


function save() {
    console.log("save")
}

function load() {
    console.log("load")
}


function sendStatistic() {
    console.log("Сохранение статистики")
}

function removeStatistic() {
    console.log(' Удаление статистики ');
}

window.API_callback = function(method, result, data) {
    console.log("API_callback:", method, result, data);
};

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
