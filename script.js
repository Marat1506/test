import OkAdapter from "./adapter/OkAdapter";

window["includeScript"]("//api.ok.ru/js/fapi5.js");

let isAdapterReady = false;
let lastAdTime = 0;
let adapter = null;

const statusElement = document.getElementById('statusMessage');
const interstitialButton = document.getElementById('showInterstitial');
const rewardButton = document.getElementById('showReward');
const saveButton = document.getElementById('saveGame');
const loadButton = document.getElementById('loadGame');
const addStatButton = document.getElementById('addStat');
const removeStatButton = document.getElementById('removeStat');


interstitialButton?.addEventListener('click', () => showAd('interstitial'));
rewardButton?.addEventListener('click', () => showAd('reward'));
saveButton?.addEventListener('click', save);
loadButton?.addEventListener('click', load);
addStatButton?.addEventListener('click', sendStatistic);
removeStatButton?.addEventListener('click', removeStatistic);

function initAdapter() {
    if (typeof FAPI === 'undefined' || !FAPI.Util) {
        console.log('[error] FAPI не загружен');
        return false;
    }

    adapter = new OkAdapter();
    
    adapter.init().then(() => {
        isAdapterReady = true;
        console.log('[success] Адаптер успешно инициализирован');
    }).catch((error) => {
        console.log(`[error] Ошибка инициализации адаптера: ${error}`);
    });
    
    return true;
}

async function showAd(adType) {
    if (!isAdapterReady || !adapter) {
        console.log(`[warning] Адаптер не готов: Показ ${adType} рекламы`);
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
        console.log(`[error] Ошибка ${adType}: ${error}`);
    }
}

async function save() {
    if (!isAdapterReady || !adapter) {
        console.log("save (mock)");
        return;
    }

    try {
        const data = {  };
        await adapter.save(data);
        console.log("[success] Данные сохранены");
    } catch (error) {
        console.log(`[error] Ошибка сохранения: ${error}`);
    }
}

async function load() {
    if (!isAdapterReady || !adapter) {
        console.log("load (mock)");
        return null;
    }

    try {
        const data = await adapter.load();
        console.log("[success] Данные загружены", data);
        return data;
    } catch (error) {
        console.log(`[error] Ошибка загрузки: ${error}`);
        return null;
    }
}

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

window.API_callback = function(method, result, data) {
    console.log("API_callback:", method, result, data);
};

if (typeof FAPI !== 'undefined') {
    initAdapter();
} else {
    console.log('[info] Ожидание загрузки FAPI...');
    const checkFAPI = setInterval(() => {
        if (typeof FAPI !== 'undefined') {
            clearInterval(checkFAPI);
            initAdapter();
        }
    }, 100);
    
    setTimeout(() => {
        if (!isAdapterReady) {
            clearInterval(checkFAPI);
            console.log('[warning] FAPI не загружен');
        }
    }, 5000);
}