import OkAdapter from "./adapter/OkAdapter";

declare global {
    interface Window {
        includeScript: (src: string) => void;
        API_callback: (method: string, result: any, data: any) => void;
    }
}

window.includeScript("//api.ok.ru/js/fapi5.js");

type AdType = "interstitial" | "reward";

let isAdapterReady = false;
let lastAdTime = 0;
let adapter: OkAdapter | null = null;

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

function initAdapter(): boolean {
    if (typeof FAPI === 'undefined' || !FAPI.Util) {
        console.error('[error] FAPI не загружен');
        return false;
    }

    adapter = new OkAdapter();
    console.log("adapter2 =", adapter);

    adapter.init().then(() => {
        isAdapterReady = true;
        console.log('[success] Адаптер успешно инициализирован');
    }).catch((error) => {
        console.error(`[error] Ошибка инициализации адаптера:`, error);
    });
    
    return true;
}

async function showAd(adType: AdType): Promise<void> {
    if (!isAdapterReady || !adapter) {
        console.warn(`[warning] Адаптер не готов: Показ ${adType} рекламы`);
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
        console.error(`[error] Ошибка ${adType}:`, error);
    }
}

async function save(): Promise<void> {
    if (!isAdapterReady || !adapter) {
        console.warn("save (mock)");
        return;
    }
    console.log("adapter =", adapter);

    try {
        const data = {};
        await adapter.save(data);
        console.log("[success] Данные сохранены");
    } catch (error) {
        console.error("[error] Ошибка сохранения:", error);
    }
}

async function load(): Promise<any> {
    if (!isAdapterReady || !adapter) {
        console.warn("load (mock)");
        return null;
    }

    try {
        const data = await adapter.load();
        console.log("[success] Данные загружены", data);
        return data;
    } catch (error) {
        console.error("[error] Ошибка загрузки:", error);
        return null;
    }
}

function sendStatistic(): void {
    if (isAdapterReady && adapter) {
        adapter.reachGoal('stat_added');
    }
    console.log("Сохранение статистики");
}

function removeStatistic(): void {
    if (isAdapterReady && adapter) {
        adapter.reachGoal('stat_removed');
    }
    console.log('Удаление статистики');
}

window.API_callback = function(method: string, result: any, data: any): void {
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
            console.warn('[warning] FAPI не загружен');
        }
    }, 5000);
}
