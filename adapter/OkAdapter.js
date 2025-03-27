"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var mobile_device_detect_1 = require("mobile-device-detect");
var constants_1 = require("../constants");
var EventsCore_1 = require("../EventsCore");
var Adapter_1 = require("./Adapter");
var events = new EventsCore_1.default();
var OkAdapter = /** @class */ (function (_super) {
    __extends(OkAdapter, _super);
    function OkAdapter() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.fapi = window["FAPI"];
        _this.params = {};
        _this.storageCache = {};
        _this.fullscreenAds = new FullscreenADS();
        _this.rewardedAds = new RewardedADS();
        _this.bannerAds = new StickyBanner();
        _this.group_id = 70000007535724;
        _this.appId = 512002798511;
        _this.appUrl = "https://ok.ru/game/" + _this.appId;
        return _this;
    }
    Object.defineProperty(OkAdapter.prototype, "version", {
        get: function () {
            return constants_1.OK_VERSION;
        },
        enumerable: false,
        configurable: true
    });
    OkAdapter.prototype.initConfig = function () {
        _super.prototype.initConfig.call(this);
        this.setOption(constants_1.SEND_POST_CONFIG_KEY, true);
        this.setOption(constants_1.PAUSE_ADS_CONFIG_KEY, true);
        this.setOption(constants_1.START_ADS_CONFIG_KEY, true);
        this.setOption(constants_1.REVIEW_CONFIG_KEY, true);
        this.setOption(constants_1.LEADERBOARD_CONFIG_KEY, true);
        this.setOption(constants_1.PAYMENTS_CONFIG_KEY, true);
        this.setOption(constants_1.ANALYTICS_CONFIG_KEY, true);
        this.setOption(constants_1.STATS_CONFIG_KEY, true);
        this.setOption(constants_1.WORD_REMOTE_DESCR_CONFIG_KEY, true);
    };
    OkAdapter.prototype.create = function () {
        var _this = this;
        this.initParams();
        this.lang = "ru"; //this.params["lang"];
        Promise.all([this.initFapi(), this.loadCatalog()])
            .then(function () {
            _this.adapterReady();
        });
    };
    OkAdapter.prototype.initFapi = function () {
        var _this = this;
        return new Promise(function (resolve) {
            _this.fapi.init(_this.params["api_server"], _this.params["apiconnection"], function () {
                console.log("ererrdscds");
                _this.__loaded = true;
                resolve();
            }, function () {
                resolve();
            });
        });
    };
    OkAdapter.prototype.getCurrency = function (v) {
        if (v === void 0) { v = 0; }
        return "OK";
    };
    OkAdapter.prototype.loadCatalog = function () {
        var _this = this;
        return fetch("https://dravk.ru/slova_ok/shop/items.json?t=" + Date.now())
            .then(function (response) { return response.json(); })
            .then(function (data) {
            _this.catalog = Object.keys(data).map(function (key) {
                var obj = data[key], priceValue = obj.price;
                return {
                    id: key,
                    title: obj.title || "",
                    descr: obj.descr || "",
                    price: priceValue + " " + _this.getCurrency(priceValue),
                    priceValue: priceValue
                };
            });
            return true;
        })
            .catch(function (e) {
            console.error("loadCatalog", e);
            return false;
        });
    };
    OkAdapter.prototype.canMember = function () {
        return this.isMember()
            .then(function (res) { return !res; });
    };
    OkAdapter.prototype.isMember = function () {
        var _this = this;
        return new Promise(function (resolve) {
            _this.fapi.Client.call({ "method": "group.getUserGroupsByIds", "uids": _this.getId(), "group_id": String(_this.group_id) }, function (status, data, error) {
                if (status !== "ok")
                    return resolve(false);
                return resolve(data.length ? (["active", "admin", "moderator"]).includes(data[0].status.toLowerCase()) : false);
            });
        });
    };
    OkAdapter.prototype.matchBonuses = function () {
        return Promise.all([this.isMember()])
            .then(function (res) {
            return res.filter(function (v) { return v; }).length - .5;
        });
    };
    OkAdapter.prototype.initEvents = function () {
        window["API_callback"] = function (method, result, data) {
            events.callEvent(method + "_" + result, data);
        };
    };
    OkAdapter.prototype.initParams = function () {
        this.params = this.fapi.Util.getRequestParameters();
    };
    OkAdapter.prototype.initAds = function () {
        this.fullscreenAds.init(this.fapi);
        this.rewardedAds.init(this.fapi);
        this.bannerAds.init(this.fapi);
    };
    OkAdapter.prototype.adapterReady = function () {
        this.initParams();
        this.initServer();
        this.initEvents();
        this.initAds();
        this.__ready = true;
        this.callWaiters();
    };
    OkAdapter.prototype.getId = function () {
        return this.params["logged_user_id"];
    };
    OkAdapter.prototype.getSignature = function () {
        return this.params["sig"];
    };
    OkAdapter.prototype.initServer = function () {
        console.log("TEST", this.params, constants_1.GAME_CODE);
        this.server.init(constants_1.GAME_CODE + constants_1.OK_VERSION, this.getId());
    };
    OkAdapter.prototype.save = function (data) {
        return Promise.all([this.saveOnServer(data), this.okSave(data)])
            .catch(function (e) {
            console.error(e);
        });
    };
    OkAdapter.prototype.okSave = function (data) {
        var _this = this;
        Object.keys(data).forEach(function (key) {
            _this.__okSaveItem(key, data[key]);
        });
    };
    OkAdapter.prototype.__okSaveItem = function (key, value) {
        try {
            if (this.storageCache[key] === value)
                return;
            this.storageCache[key] = value;
            this.fapi.Client.call({
                "method": "storage.set",
                "key": key,
                "value": value
            }, function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                console.log("save", key, value, args);
            });
        }
        catch (e) {
            console.error(e);
        }
    };
    OkAdapter.prototype.load = function (keys) {
        return Promise.all([this.loadFromServer(), this.okLoad(keys)])
            .then(function (res) {
            console.log("LOADS", res);
            return res.find(function (data) { return !!data; }) || null;
        })
            .catch(function (e) {
            console.error(e);
            return null;
        });
    };
    OkAdapter.prototype.okLoad = function (keys) {
        var _this = this;
        if (keys === void 0) { keys = []; }
        return new Promise(function (resolve, reject) {
            try {
                _this.fapi.Client.call({
                    "method": "storage.get",
                    "keys": keys,
                }, function (result, data) {
                    console.log("FAPI get", data);
                    try {
                        if (result === "ok") {
                            var obj_1 = data.data || {};
                            Object.keys(obj_1).forEach(function (key) {
                                _this.storageCache[key] = obj_1[key];
                            });
                            resolve(data.data || null);
                        }
                    }
                    catch (e) {
                        console.error(e);
                    }
                    resolve(null);
                });
            }
            catch (e) {
                console.error(e);
                resolve(null);
            }
        });
    };
    OkAdapter.prototype.showFullscreenAds = function () {
        return this.fullscreenAds.show();
    };
    OkAdapter.prototype.showRewardedAds = function () {
        return this.rewardedAds.show();
    };
    OkAdapter.prototype.showStickyBanner = function () {
        this.bannerAds.show();
    };
    OkAdapter.prototype.updateBanner = function () {
        this.bannerAds.update();
    };
    OkAdapter.prototype.hideStickyBanner = function () {
        this.bannerAds.hide();
    };
    OkAdapter.prototype.isAuth = function () {
        return Promise.resolve(true);
    };
    OkAdapter.prototype.canInvite = function () {
        return Promise.resolve(true);
    };
    OkAdapter.prototype.invite = function (message) {
        if (message === void 0) { message = ""; }
        this.fapi.UI.showInvite(message);
        return this.eventToPromise("showInvite")
            .then(function (e) {
            return true;
        })
            .catch(function (e) {
            return false;
        });
    };
    OkAdapter.prototype.member = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var prom = this.eventToPromise("joinGroup")
            .then(function () {
            return true;
        })
            .catch(function () {
            return false;
        });
        this.fapi.UI.joinGroup(this.group_id, true);
        return prom;
    };
    OkAdapter.prototype.sendPost = function (message) {
        if (message === void 0) { message = ""; }
        message = message.replace("{url}", this.appUrl);
        this.fapi.UI.postMediatopic({
            "media": [
                {
                    "type": "text",
                    "text": message
                },
                {
                    "type": "link",
                    "url": this.appUrl
                }
            ]
        });
        return this.eventToPromise("postMediatopic")
            .then(function () {
            return true;
        })
            .catch(function () {
            return false;
        });
    };
    OkAdapter.prototype.isReview = function () {
        var _this = this;
        return new Promise(function (resolve) {
            _this.fapi.Client.call({ "method": "apps.getAppUserRating", "app_id": _this.appId }, function (status, data, error) {
                if (error)
                    console.error(error);
                resolve(status === "ok" && data.success && data.rating > 0);
            });
        });
    };
    OkAdapter.prototype.canReview = function () {
        var _this = this;
        return new Promise(function (resolve) {
            _this.fapi.Client.call({ "method": "apps.getAppUserRating", "app_id": _this.appId }, function (status, data, error) {
                if (error)
                    console.error(error);
                resolve(status === "ok" && !(data.success && data.rating > 0));
            });
        });
    };
    OkAdapter.prototype.review = function () {
        this.fapi.UI.showRatingDialog();
        return this.eventToPromise("showRatingDialog")
            .then(function () {
            return true;
        })
            .catch(function (e) {
            console.error(e);
            return false;
        });
    };
    OkAdapter.prototype.getUsersData = function (ids) {
        var _this = this;
        return new Promise(function (resolve) {
            _this.fapi.Client.call({ "method": "users.getInfo", "fields": "first_name,last_name,pic128x128,uid,gender", "uids": ids, emptyPictures: true }, function (status, data, error) {
                if (status !== "ok")
                    return resolve([]);
                return resolve(data);
            });
        });
    };
    OkAdapter.prototype.getLbData = function () {
        var _this = this;
        return _super.prototype.getLbData.call(this)
            .then(function (arr) {
            return _this.getUsersData(arr.map(function (data) { return data.id; }))
                .then(function (obj) {
                console.log("users data", obj, arr.map(function (data) { return data.id; }));
                var f = function (user) {
                    var data = arr.find(function (el) { return Number(el.id) == user.uid; });
                    if (!data)
                        return;
                    var firstName = user.first_name || "", lastName = user.last_name || "";
                    data.avatar = user.pic128x128 || "https://dravk.ru/slova_ok/avatars/" + (user.gender === "female" ? "f" : "m") + ".png";
                    data.title = firstName + (lastName ? (" " + lastName) : "") || "";
                };
                obj.forEach(f);
                return arr;
            });
        });
    };
    OkAdapter.prototype.tryGetPurchase = function () {
        var _this = this;
        var maxAttempts = 5;
        var attempts = maxAttempts;
        return new Promise(function (resolve, reject) {
            var f = function () {
                if (attempts <= 0)
                    return reject(null);
                attempts -= 1;
                setTimeout(function () {
                    _this.getPurchase()
                        .then(function (arr) {
                        if (arr.length) {
                            resolve(arr);
                        }
                        else {
                            f();
                        }
                    })
                        .catch(function (e) {
                        console.error(e);
                        f();
                    });
                }, (1 + Math.pow(maxAttempts - attempts, 2) * .3) * constants_1.SECOND);
            };
            f();
        });
    };
    OkAdapter.prototype.consumePurchase = function (id, attempts) {
        var _this = this;
        if (attempts === void 0) { attempts = 3; }
        return this.server.request("https://bbb.dra.games/api/purchase/ok/close-transaction", {
            "transaction_id": id,
            "app_id": String(this.appId),
            "user_id": this.getId(),
            "sign": this.params
        })
            .then(function (e) {
            console.log("consumePurchase", e);
            if (e.error)
                return Promise.reject(e.error);
            return true;
        })
            .catch(function (e) {
            console.error("consumePurchase", e);
            if (attempts <= 1)
                return false;
            return _this.consumePurchase(id, attempts - 1);
        });
    };
    OkAdapter.prototype.getPurchase = function (attempts) {
        var _this = this;
        if (attempts === void 0) { attempts = 1; }
        return this.server.request("https://bbb.dra.games/api/purchase/ok/get-transactions", { "app_id": String(this.appId), "user_id": this.getId() })
            .then(function (e) {
            console.log("getPurchase", e);
            if (e.error)
                return Promise.reject(e.error);
            return e.data.filter(function (el) {
                return el["status"] !== "closed";
            }).map(function (el) {
                return {
                    "purchaseToken": el["transaction_id"],
                    "productID": el["data"]["product_code"]
                };
            }) || [];
        })
            .catch(function (e) {
            console.error("getPurchase", e);
            if (attempts <= 1)
                return [];
            return _this.getPurchase(attempts - 1);
        });
    };
    OkAdapter.prototype.getCatalogItemData = function (id) {
        if (!this.catalog)
            return null;
        return this.catalog.find(function (el) {
            return el.id === id;
        });
    };
    OkAdapter.prototype.buy = function (id) {
        var _this = this;
        var data = this.getCatalogItemData(id) || {};
        console.log("BUY", data);
        this.fapi.UI.showPayment(data.title || "", //name
        data.descr || "descr", //description
        id, //code
        data.priceValue || 1, //price
        null, //options
        JSON.stringify({ app_id: this.appId }), //attributes
        "ok", //currency
        "true" //callback
        );
        return this.eventToPromise("showPayment")
            .then(function () { return _this.tryGetPurchase(); })
            .then(function (arr) {
            var el = arr.find(function (el1) { return el1.productID === id; });
            if (!el)
                return false;
            return el;
        })
            .catch(function () { return false; });
    };
    OkAdapter.prototype.eventToPromise = function (key) {
        var listeners = [], clear = function () {
            listeners.forEach(function (f) { return events.removeListener(f); });
        };
        return new Promise(function (resolve, reject) {
            var error = function () {
                var arr = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    arr[_i] = arguments[_i];
                }
                console.error.apply(console, __spreadArray([key], arr, false));
                reject(arr);
            };
            listeners.push(events.addOnceListener(key + "_ok", function (data) {
                console.log(key + "_ok", data);
                resolve(data);
            }));
            listeners.push(events.addOnceListener(key + "_error", error));
            listeners.push(events.addOnceListener(key + "_cancel", error));
        })
            .then(function (data) {
            clear();
            return Promise.resolve(data);
        })
            .catch(function (e) {
            clear();
            return Promise.reject(e);
        });
    };
    return OkAdapter;
}(Adapter_1.default));
exports.default = OkAdapter;
;
var FullscreenADS = /** @class */ (function () {
    function FullscreenADS() {
        this.last = 0;
        this.min = 30000;
        this.fapi = null;
    }
    FullscreenADS.prototype.init = function (fapi) {
        this.fapi = fapi;
    };
    FullscreenADS.prototype.show = function () {
        var _this = this;
        var listeners = [];
        return new Promise(function (resolve) {
            try {
                if (!_this.fapi)
                    return resolve(false, "fapi is not defined");
                var t = Date.now();
                if (Math.abs(t - _this.last) < _this.min) {
                    return resolve(false);
                }
                _this.last = t;
                var isOpened_1 = false;
                listeners.push(events.addListener("showAd_ok", function (e) {
                    if (e.data === "ad_prepared") {
                        isOpened_1 = true;
                    }
                    else if (e.data === "ad_shown") {
                        resolve(true);
                    }
                }));
                listeners.push(events.addListener("showAd_error", function () {
                    resolve(false);
                }));
                _this.fapi.UI.showAd();
                setTimeout(function () {
                    if (!isOpened_1)
                        resolve(false);
                }, 10000);
            }
            catch (e) {
                resolve(false, e);
            }
        })
            .then(function (res) {
            listeners.forEach(function (f) { return events.removeListener(f); });
            return res;
        });
    };
    return FullscreenADS;
}());
;
var RewardedADS = /** @class */ (function () {
    function RewardedADS() {
        this.fapi = null;
        this.ready = false;
        this.loading = false;
        this.block = false;
    }
    RewardedADS.prototype.init = function (fapi) {
        console.log("REWARD init");
        this.fapi = fapi;
        this.load();
    };
    RewardedADS.prototype.load = function () {
        var _this = this;
        if (this.block || !this.fapi || this.ready || this.loading)
            return;
        this.loading = true;
        var listeners = [], end = function () {
            _this.loading = false;
            listeners.forEach(function (f) { return events.removeListener(f); });
            if (!_this.ready) {
                setTimeout(function () { return _this.load(); }, 10000);
            }
        };
        try {
            listeners.push(events.addListener("loadAd_ok", function (e) {
                _this.ready = true;
                end();
            }));
            listeners.push(events.addListener("loadAd_error", function (e) {
                end();
            }));
            this.fapi.UI.loadAd();
        }
        catch (e) {
            console.error(e);
            this.loading = false;
        }
    };
    RewardedADS.prototype.show = function () {
        var _this = this;
        var listeners = [];
        return new Promise(function (resolve) {
            var res = false;
            try {
                if (!_this.fapi)
                    return resolve(false, "fapi is not defined");
                if (!_this.ready)
                    return resolve(false);
                var isOpened_2 = false;
                listeners.push(events.addListener("showLoadedAd_ok", function (e) {
                    resolve(true);
                }));
                listeners.push(events.addListener("showLoadedAd_error", function (e) {
                    if (e.data === "mp4_not_supported")
                        _this.block = true;
                    resolve(false);
                }));
                _this.fapi.UI.showLoadedAd();
                setTimeout(function () {
                    if (!isOpened_2)
                        resolve(false);
                }, 20000);
            }
            catch (e) {
                console.error(e);
                resolve(res, e);
            }
        })
            .then(function (res) {
            _this.ready = false;
            setTimeout(function () { return _this.load(); }, constants_1.SECOND);
            listeners.forEach(function (f) { return events.removeListener(f); });
            return res;
        });
    };
    return RewardedADS;
}());
;
var StickyBanner = /** @class */ (function () {
    function StickyBanner() {
        this.fapi = null;
        this.switch = false;
        this.visible = false;
        this.ready = false;
        this.side = "bottom";
        this.block = false;
    }
    StickyBanner.prototype.search = function () {
        var _this = this;
        if (!this.fapi || this.block)
            return Promise.resolve(false);
        return new Promise(function (resolve) {
            events.addOnceListener("requestBannerAds_ok", function (e) {
                _this.ready = true;
                resolve(true);
            });
            events.addOnceListener("requestBannerAds_error", function (e) {
                setTimeout(function () {
                    events.addOnceListener("requestBannerAds_error", function (e) {
                        resolve(false);
                    });
                    _this.fapi.invokeUIMethod("requestBannerAds");
                }, 2000);
            });
            _this.fapi.invokeUIMethod("requestBannerAds");
        });
    };
    StickyBanner.prototype.update = function () {
        var _this = this;
        if (this.block || !this.visible)
            return;
        this.search()
            .then(function (res) {
            if (res && _this.visible)
                _this.__show();
        });
    };
    StickyBanner.prototype.__show = function () {
        if (!this.ready)
            return;
        this.fapi.invokeUIMethod("showBannerAds", this.side);
    };
    StickyBanner.prototype.__hide = function () {
        this.fapi.invokeUIMethod("hideBannerAds");
    };
    StickyBanner.prototype.init = function (fapi) {
        var _this = this;
        this.fapi = fapi;
        events.addOnceListener("getBannerFormats_ok", function (json) {
            var bannerFormat = "", bar = null;
            var data = JSON.parse(json), supported = data.supported;
            if (mobile_device_detect_1.isMobile) {
                bannerFormat = "bar_outer";
                _this.side = "bottom";
            }
            else {
                bannerFormat = "vertical_outer";
                _this.side = "right";
            }
            bar = supported[bannerFormat];
            if (!bar) {
                _this.block = true;
                return;
            }
            events.addOnceListener("setBannerFormat_ok", function () {
                _this.search();
            });
            events.addOnceListener("setBannerFormat_error", function () {
                _this.block = true;
            });
            fapi.invokeUIMethod("setBannerFormat", bannerFormat);
        });
        events.addOnceListener("getBannerFormats_error", function () {
            setTimeout(function () {
                fapi.invokeUIMethod("getBannerFormats");
            }, 2000);
        });
        fapi.invokeUIMethod("getBannerFormats");
    };
    StickyBanner.prototype.show = function () {
        if (this.switch)
            return;
        this.switch = true;
        this.check();
    };
    StickyBanner.prototype.hide = function () {
        if (!this.switch)
            return;
        this.switch = false;
        this.check();
    };
    StickyBanner.prototype.check = function () {
        var _this = this;
        if (!this.ready)
            return;
        var listeners = [], end = function () {
            listeners.forEach(function (f) { return events.removeListener(f); });
        };
        listeners.push(events.addOnceListener("isBannerAdsVisible_ok", function (data) {
            if (Boolean(data) && !_this.visible) {
                _this.__hide();
            }
            else if (!Boolean(data) && _this.visible) {
                _this.__show();
            }
            end();
        }));
        listeners.push(events.addOnceListener("isBannerAdsVisible_error", function (data) {
            end();
        }));
        this.fapi.invokeUIMethod("isBannerAdsVisible");
    };
    return StickyBanner;
}());
;
