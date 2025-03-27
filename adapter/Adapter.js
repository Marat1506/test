"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var constants_1 = require("../constants");
var gipi_1 = require("../gipi");
var Adapter = /** @class */ (function () {
    function Adapter() {
        var _this = this;
        this.lang = "en";
        this.catalog = [];
        this.__ready = false;
        this.__loaded = false;
        this.waiters = [];
        this.server = new ServerData();
        this.score = 0;
        this.config = {};
        this.game = null;
        this.initConfig();
        setTimeout(function () {
            _this.create();
        }, 0);
    }
    Adapter.prototype.reachGoal = function (goal) {
        //
    };
    Adapter.prototype.loading = function (v) {
        if (v === void 0) { v = 0; }
        //
    };
    Adapter.prototype.sendProgress = function (level) {
        if (level === void 0) { level = 0; }
        //
    };
    Adapter.prototype.goalAchievement = function (id) {
        return Promise.resolve(true);
    };
    Adapter.prototype.setGame = function (game) {
        this.game = game;
    };
    Adapter.prototype.initConfig = function () {
        this.setOption(constants_1.PAUSE_ADS_CONFIG_KEY, false);
        this.setOption(constants_1.START_ADS_CONFIG_KEY, false);
        this.setOption(constants_1.START_ADS_FORCED_CONFIG_KEY, false);
        this.setOption(constants_1.START_ADS_AFTER_CLICK_CONFIG_KEY, false);
        this.setOption(constants_1.SEND_POST_CONFIG_KEY, false);
        this.setOption(constants_1.REVIEW_CONFIG_KEY, false);
        this.setOption(constants_1.ADS_PAUSE_CONFIG_KEY, 3);
        this.setOption(constants_1.LEADERBOARD_CONFIG_KEY, false);
        this.setOption(constants_1.PAYMENTS_CONFIG_KEY, false);
        this.setOption(constants_1.ANALYTICS_CONFIG_KEY, false);
        this.setOption(constants_1.STATS_CONFIG_KEY, false);
        this.setOption(constants_1.WORD_REMOTE_DESCR_CONFIG_KEY, false);
        this.setOption(constants_1.MATCH_LOCATION_URL_CONFIG_KEY, false);
    };
    Adapter.prototype.getOption = function (key) {
        return this.config[key];
    };
    Adapter.prototype.setOption = function (key, value) {
        this.config[key] = value;
    };
    Adapter.prototype.getSignature = function () {
        return "";
    };
    Adapter.prototype.create = function () {
        this.__ready = true;
    };
    Adapter.prototype.getStorage = function () {
        return Promise.resolve(null);
    };
    Adapter.prototype.gameReady = function () {
        //
    };
    Object.defineProperty(Adapter.prototype, "version", {
        get: function () {
            return constants_1.VK_VERSION; // DEF_VERSION;
        },
        enumerable: false,
        configurable: true
    });
    Adapter.prototype.getVersion = function () {
        return this.version;
    };
    Adapter.prototype.callWaiters = function () {
        var _this = this;
        this.waiters.forEach(function (waiter) {
            try {
                waiter(_this.__loaded);
            }
            catch (e) {
                console.error(e);
            }
        });
    };
    Adapter.prototype.review = function () {
        return Promise.resolve(false);
    };
    Adapter.prototype.canReview = function () {
        return Promise.resolve(this.getOption(constants_1.REVIEW_CONFIG_KEY));
    };
    Adapter.prototype.isReview = function () {
        return Promise.resolve(false);
    };
    Adapter.prototype.getLang = function () {
        return Promise.resolve(this.lang);
    };
    Adapter.prototype.init = function () {
        var _this = this;
        if (this.__ready)
            return Promise.resolve(this.__loaded);
        return new Promise(function (resolve) {
            _this.waiters.push(resolve);
        });
    };
    Adapter.prototype.save = function (data, force) {
        if (force === void 0) { force = false; }
        return Promise.all([this.saveOnServer(data, force)])
            .catch(function (e) {
            //console.error(e);
        });
    };
    Adapter.prototype.saveOnServer = function (data, force) {
        if (force === void 0) { force = false; }
        return this.server.save(data, this.score, force);
    };
    Adapter.prototype.load = function (keys) {
        return this.loadFromServer()
            .then(function (data) { return data || null; })
            .catch(function () { return null; });
    };
    Adapter.prototype.loadFromServer = function () {
        return this.server.load();
    };
    Adapter.prototype.getId = function () {
        return "1";
    };
    Adapter.prototype.isAuth = function () {
        return Promise.resolve(false);
    };
    Adapter.prototype.buy = function () {
        var arr = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            arr[_i] = arguments[_i];
        }
        return Promise.reject(false);
    };
    Adapter.prototype.consumePurchase = function () {
        var arr = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            arr[_i] = arguments[_i];
        }
        return Promise.resolve(false);
    };
    Adapter.prototype.getCatalog = function () {
        return this.catalog;
    };
    Adapter.prototype.getPurchase = function () {
        return Promise.resolve([]);
    };
    Adapter.prototype.auth = function () {
        return Promise.reject();
    };
    Adapter.prototype.setScore = function (v, isFirst) {
        if (isFirst === void 0) { isFirst = true; }
        return this.score = Number(v) || 0;
    };
    Adapter.prototype.getRank = function (isFirst) {
        if (isFirst === void 0) { isFirst = true; }
        return this.server.getLb(0, 0)
            .then(function (data) {
            var _a;
            return ((_a = data === null || data === void 0 ? void 0 : data.player) === null || _a === void 0 ? void 0 : _a.rank) || 0;
        })
            .catch(function (e) {
            //console.error(e);
            return 0;
        });
    };
    Adapter.prototype.getScore = function (isFirst) {
        if (isFirst === void 0) { isFirst = true; }
        if (isFirst || this.score <= 0) {
            return this.server.getLb(0, 0)
                .then(function (data) {
                var _a;
                return ((_a = data === null || data === void 0 ? void 0 : data.player) === null || _a === void 0 ? void 0 : _a.score) || 0;
            })
                .catch(function (e) {
                //console.error(e);
                return 0;
            });
        }
        else {
            return Promise.resolve(this.score);
        }
    };
    Adapter.prototype.addScore = function (v) {
        var _this = this;
        if (v === void 0) { v = 1; }
        return this.getScore()
            .then(function (score) { return _this.setScore(score + v); });
    };
    Adapter.prototype.entrieFormat = function (data) {
        return Promise.resolve((function () {
            try {
                return {
                    id: data["player_id"],
                    score: data.score,
                    rank: data.rank,
                    title: "",
                    avatar: "",
                    extra_data: data.extra_data
                };
            }
            catch (e) {
                //console.error(e);
                return {
                    id: "",
                    score: 0,
                    rank: 0,
                    avatar: "",
                    title: ""
                };
            }
        })());
    };
    Adapter.prototype.getLbData = function () {
        var _this = this;
        return this.server.getLb()
            .then(function (data) {
            console.log("LB TEST", data);
            var top = data.top || [], nearby = data.nearby || [], player = data.player, res = [], add = function (el) {
                if (!el || res.find(function (el0) { return el0["player_id"] === el["player_id"]; }))
                    return;
                res.push(el);
            };
            top.forEach(add);
            nearby.forEach(add);
            add(player);
            return Promise.all(res.map(function (el) { return _this.entrieFormat(el); }));
        })
            .catch(function () { return []; });
    };
    Adapter.prototype.showLb = function () {
        return Promise.resolve(false);
    };
    Adapter.prototype.showFullscreenAds = function () {
        return Promise.resolve(false);
    };
    Adapter.prototype.showRewardedAds = function () {
        return Promise.resolve(false);
    };
    Adapter.prototype.showStickyBanner = function () {
        //
    };
    Adapter.prototype.updateBanner = function () {
        this.showStickyBanner();
    };
    Adapter.prototype.hideStickyBanner = function () {
        //
    };
    Adapter.prototype.sendPost = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return Promise.resolve(false);
    };
    Adapter.prototype.canInvite = function () {
        return Promise.resolve(false);
    };
    Adapter.prototype.invite = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return Promise.resolve(false);
    };
    Adapter.prototype.member = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return Promise.resolve(false);
    };
    Adapter.prototype.isMember = function () {
        return Promise.resolve(false);
    };
    Adapter.prototype.openGroup = function () {
        //
    };
    Adapter.prototype.canMember = function () {
        return Promise.resolve(false);
    };
    Adapter.prototype.favorite = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return Promise.resolve(false);
    };
    Adapter.prototype.isFavorite = function () {
        return Promise.resolve(false);
    };
    Adapter.prototype.canAddToFavorite = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return Promise.resolve(false);
    };
    Adapter.prototype.matchBonuses = function () {
        return Promise.resolve(0);
    };
    Adapter.prototype.isSignedForEvents = function () {
        return Promise.resolve(false);
    };
    Adapter.prototype.canSignedForEvents = function () {
        return Promise.resolve(false);
    };
    Adapter.prototype.signedForEvents = function () {
        return Promise.resolve(false);
    };
    Adapter.prototype.canCreateShortcut = function () {
        return Promise.resolve(false);
    };
    Adapter.prototype.createShortcut = function () {
        return Promise.resolve(false);
    };
    return Adapter;
}());
exports.default = Adapter;
;
var ServerData = /** @class */ (function () {
    function ServerData() {
        this.game_code = "";
        this.player_id = "";
        this.actualData = "";
        this.lastSaveTime = 0;
        this.timer = null;
        this.saveStep = constants_1.SECOND;
    }
    ServerData.prototype.init = function (game_code, player_id) {
        if (game_code === void 0) { game_code = ""; }
        if (player_id === void 0) { player_id = ""; }
        this.game_code = game_code;
        this.player_id = player_id;
        console.log("SERVER init", this.game_code, this.player_id);
    };
    ServerData.prototype.setExtraData = function (data) {
        try {
            if (!data) {
                this.extra_data = undefined;
            }
            else {
                this.extra_data = JSON.stringify(data);
            }
        }
        catch (e) {
            console.error(e);
        }
    };
    ServerData.prototype.save = function (data, score, force) {
        var _this = this;
        if (force === void 0) { force = false; }
        this.score = score;
        if (!this.game_code || !this.player_id)
            return Promise.resolve(false);
        var json = JSON.stringify(data);
        if (this.actualData === json)
            return Promise.resolve(true);
        this.actualData = json;
        if (this.timer) {
            if (!force)
                return Promise.resolve(true);
            clearTimeout(this.timer);
            this.timer = null;
            return this.__save();
        }
        var t = Date.now();
        if (this.lastSaveTime > (t - this.saveStep)) {
            return new Promise(function (resolve) {
                _this.timer = setTimeout(function () {
                    _this.timer = null;
                    _this.__save()
                        .then(resolve);
                }, _this.saveStep + _this.lastSaveTime - t);
            });
        }
        else {
            return this.__save();
        }
    };
    ServerData.prototype.__save = function (attempts) {
        var _this = this;
        if (attempts === void 0) { attempts = 3; }
        if (attempts <= 0)
            return Promise.resolve(false);
        var data = this.actualData;
        this.lastSaveTime = Date.now();
        return this.request("https://bbb.dra.games/api/save-data", {
            game_code: this.game_code,
            player_id: this.player_id,
            game_data: data,
            score: this.score,
            extra_data: this.extra_data
        })
            .then(function (e) {
            console.log("SERVER saved", data);
            return Promise.resolve(e);
        })
            .catch(function (e) {
            console.error("SERVER save error", e);
            if (_this.actualData !== data)
                return Promise.resolve(false);
            return _this.__save(attempts - 1);
        });
    };
    ServerData.prototype.load = function (attempts) {
        var _this = this;
        if (attempts === void 0) { attempts = 2; }
        if (!this.game_code || !this.player_id)
            return Promise.resolve(null);
        return this.request("https://bbb.dra.games/api/get-data", {
            game_code: this.game_code,
            player_id: this.player_id
        })
            .then(function (e) {
            var _a;
            console.log("SERVER loaded", e);
            var json = ((_a = e === null || e === void 0 ? void 0 : e.data) === null || _a === void 0 ? void 0 : _a.game_data) || "";
            if (json)
                _this.actualData = json;
            return Promise.resolve(json ? gipi_1.default.parseJSON(json) : null);
        })
            .catch(function (e) {
            console.log("SERVER load error", e);
            if (attempts <= 0)
                return Promise.resolve(null);
            return _this.load(attempts - 1);
        });
    };
    ServerData.prototype.getLb = function (top_limit, nearby_limit) {
        if (top_limit === void 0) { top_limit = 10; }
        if (nearby_limit === void 0) { nearby_limit = 6; }
        if (!this.game_code || !this.player_id)
            return Promise.reject();
        return this.request("https://bbb.dra.games/api/players/get-leaderboard", {
            game_code: this.game_code,
            player_id: this.player_id,
            top_limit: top_limit,
            nearby_limit: nearby_limit
        })
            .then(function (e) {
            console.log(e);
            return Promise.resolve((e === null || e === void 0 ? void 0 : e.data) || {});
        })
            .catch(function (e) {
            console.error(e);
            return Promise.resolve(null);
        });
    };
    ServerData.prototype.request = function (url, data, contentType) {
        if (data === void 0) { data = null; }
        if (contentType === void 0) { contentType = "application/json"; }
        return new Promise(function (resolve, reject) {
            var req = new XMLHttpRequest();
            req.open('POST', url, true);
            req.setRequestHeader("Content-type", contentType);
            req.onreadystatechange = function (aEvt) {
                if (req.readyState == 4) {
                    if (req.status == 200) {
                        resolve(gipi_1.default.parseJSON(req.responseText));
                    }
                    else {
                        reject(gipi_1.default.parseJSON(req.responseText));
                    }
                }
            };
            req.send(JSON.stringify(data));
        });
    };
    return ServerData;
}());
;
