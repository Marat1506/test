"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var OkAdapter_1 = require("./adapter/OkAdapter");
window.includeScript("//api.ok.ru/js/fapi5.js");
var isAdapterReady = false;
var lastAdTime = 0;
var adapter = null;
var statusElement = document.getElementById('statusMessage');
var interstitialButton = document.getElementById('showInterstitial');
var rewardButton = document.getElementById('showReward');
var saveButton = document.getElementById('saveGame');
var loadButton = document.getElementById('loadGame');
var addStatButton = document.getElementById('addStat');
var removeStatButton = document.getElementById('removeStat');
interstitialButton === null || interstitialButton === void 0 ? void 0 : interstitialButton.addEventListener('click', function () { return showAd('interstitial'); });
rewardButton === null || rewardButton === void 0 ? void 0 : rewardButton.addEventListener('click', function () { return showAd('reward'); });
saveButton === null || saveButton === void 0 ? void 0 : saveButton.addEventListener('click', save);
loadButton === null || loadButton === void 0 ? void 0 : loadButton.addEventListener('click', load);
addStatButton === null || addStatButton === void 0 ? void 0 : addStatButton.addEventListener('click', sendStatistic);
removeStatButton === null || removeStatButton === void 0 ? void 0 : removeStatButton.addEventListener('click', removeStatistic);
function initAdapter() {
    if (typeof FAPI === 'undefined' || !FAPI.Util) {
        console.error('[error] FAPI не загружен');
        return false;
    }
    adapter = new OkAdapter_1.default();
    console.log("adapter2 =", adapter);
    adapter.init().then(function () {
        isAdapterReady = true;
        console.log('[success] Адаптер успешно инициализирован');
    }).catch(function (error) {
        console.error("[error] \u041E\u0448\u0438\u0431\u043A\u0430 \u0438\u043D\u0438\u0446\u0438\u0430\u043B\u0438\u0437\u0430\u0446\u0438\u0438 \u0430\u0434\u0430\u043F\u0442\u0435\u0440\u0430:", error);
    });
    return true;
}
function showAd(adType) {
    return __awaiter(this, void 0, void 0, function () {
        var watched, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!isAdapterReady || !adapter) {
                        console.warn("[warning] \u0410\u0434\u0430\u043F\u0442\u0435\u0440 \u043D\u0435 \u0433\u043E\u0442\u043E\u0432: \u041F\u043E\u043A\u0430\u0437 ".concat(adType, " \u0440\u0435\u043A\u043B\u0430\u043C\u044B"));
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    if (!(adType === 'reward')) return [3 /*break*/, 3];
                    return [4 /*yield*/, adapter.showRewardedAds()];
                case 2:
                    watched = _a.sent();
                    lastAdTime = Date.now();
                    console.log(watched ? '[success] Награда получена!' : '[warning] Реклама закрыта до завершения');
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, adapter.showFullscreenAds()];
                case 4:
                    _a.sent();
                    lastAdTime = Date.now();
                    console.log("[success] \u0420\u0435\u043A\u043B\u0430\u043C\u0430 ".concat(adType, " \u043F\u043E\u043A\u0430\u0437\u0430\u043D\u0430"));
                    _a.label = 5;
                case 5: return [3 /*break*/, 7];
                case 6:
                    error_1 = _a.sent();
                    console.error("[error] \u041E\u0448\u0438\u0431\u043A\u0430 ".concat(adType, ":"), error_1);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    });
}
function save() {
    return __awaiter(this, void 0, void 0, function () {
        var data, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!isAdapterReady || !adapter) {
                        console.warn("save (mock)");
                        return [2 /*return*/];
                    }
                    console.log("adapter =", adapter);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    data = {};
                    return [4 /*yield*/, adapter.save(data)];
                case 2:
                    _a.sent();
                    console.log("[success] Данные сохранены");
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    console.error("[error] Ошибка сохранения:", error_2);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function load() {
    return __awaiter(this, void 0, void 0, function () {
        var data, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!isAdapterReady || !adapter) {
                        console.warn("load (mock)");
                        return [2 /*return*/, null];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, adapter.load()];
                case 2:
                    data = _a.sent();
                    console.log("[success] Данные загружены", data);
                    return [2 /*return*/, data];
                case 3:
                    error_3 = _a.sent();
                    console.error("[error] Ошибка загрузки:", error_3);
                    return [2 /*return*/, null];
                case 4: return [2 /*return*/];
            }
        });
    });
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
window.API_callback = function (method, result, data) {
    console.log("API_callback:", method, result, data);
};
if (typeof FAPI !== 'undefined') {
    initAdapter();
}
else {
    console.log('[info] Ожидание загрузки FAPI...');
    var checkFAPI_1 = setInterval(function () {
        if (typeof FAPI !== 'undefined') {
            clearInterval(checkFAPI_1);
            initAdapter();
        }
    }, 100);
    setTimeout(function () {
        if (!isAdapterReady) {
            clearInterval(checkFAPI_1);
            console.warn('[warning] FAPI не загружен');
        }
    }, 5000);
}
