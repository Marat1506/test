import { isMobile } from "mobile-device-detect";
import { ANALYTICS_CONFIG_KEY, GAME_CODE, LEADERBOARD_CONFIG_KEY, OK_VERSION, PAUSE_ADS_CONFIG_KEY, PAYMENTS_CONFIG_KEY, REVIEW_CONFIG_KEY, SECOND, SEND_POST_CONFIG_KEY, START_ADS_CONFIG_KEY, STATS_CONFIG_KEY, WORD_REMOTE_DESCR_CONFIG_KEY } from "../constants";
import EventsCore from "../EventsCore";
import { Empty, ICatalogItem, ILbEntrie, IPurchaseData } from "../interfaces";
import Adapter from "./Adapter";

const events: EventsCore = new EventsCore();

export default class OkAdapter extends Adapter {
    private fapi: any = window["FAPI"];
    private params: any = {};

    private storageCache: any = {};

    private fullscreenAds: FullscreenADS = new FullscreenADS();
    private rewardedAds: RewardedADS = new RewardedADS();
    private bannerAds: StickyBanner = new StickyBanner();

    private group_id: number = 70000007535724;

    private appId: number = 512002798511;
    private appUrl: string = "https://ok.ru/game/" + this.appId;

    public get version(): string {
        return OK_VERSION;
    }

    protected initConfig(): void {
        super.initConfig();
        this.setOption(SEND_POST_CONFIG_KEY, true);
        this.setOption(PAUSE_ADS_CONFIG_KEY, true);
        this.setOption(START_ADS_CONFIG_KEY, true);
        this.setOption(REVIEW_CONFIG_KEY, true);
        this.setOption(LEADERBOARD_CONFIG_KEY, true);
        this.setOption(PAYMENTS_CONFIG_KEY, true);
        this.setOption(ANALYTICS_CONFIG_KEY, true);
        this.setOption(STATS_CONFIG_KEY, true);
        this.setOption(WORD_REMOTE_DESCR_CONFIG_KEY, true);
    }

    protected create(): void {
        this.initParams();

        this.lang = "ru";//this.params["lang"];

        Promise.all([this.initFapi(), this.loadCatalog()])
            .then(() => {
                this.adapterReady();
            });
    }

    private initFapi(): Promise<any> {
        return new Promise((resolve: any) => {
            this.fapi.init(this.params["api_server"], this.params["apiconnection"], () => {
                this.__loaded = true;
                resolve();
            }, () => {
                resolve();
            });
        });
    }

    public getCurrency(v: number = 0): string {
        return "OK";
    }

    private loadCatalog(): Promise<boolean> {
        return fetch("https://dravk.ru/slova_ok/shop/items.json?t=" + Date.now())
            .then((response: any) => response.json())
            .then((data: any) => {
                this.catalog = Object.keys(data).map((key: string) => {
                    const obj: any = data[key],
                        priceValue: number = obj.price;

                    return {
                        id: key,
                        title: obj.title || "",
                        descr: obj.descr || "",
                        price: priceValue + " " + this.getCurrency(priceValue),
                        priceValue
                    };
                });
                return true;
            })
            .catch((e: any) => {
                console.error("loadCatalog", e);
                return false;
            });
    }

    public canMember(): Promise<boolean> {
        return this.isMember()
            .then((res: boolean) => !res);
    }

    public isMember(): Promise<boolean> {
        return new Promise((resolve: any) => {
            this.fapi.Client.call({"method":"group.getUserGroupsByIds", "uids": this.getId(), "group_id": String(this.group_id)}, (status: string, data: Array<any>, error: any) => {
                if(status !== "ok")return resolve(false);
                return resolve(data.length ? (["active", "admin", "moderator"]).includes(data[0].status.toLowerCase()) : false);
            });
        });
    }

    public matchBonuses(): Promise<number> {
        return Promise.all([this.isMember()])
            .then((res: Array<boolean>) => {
                return res.filter((v: boolean) => v).length - .5;
            });
    }

    private initEvents(): void {
        window["API_callback"] = (method, result, data) => {
            events.callEvent(method + "_" + result, data);
        };
    }

    private initParams(): void {
        this.params = this.fapi.Util.getRequestParameters();
    }

    private initAds(): void {
        this.fullscreenAds.init(this.fapi);
        this.rewardedAds.init(this.fapi);
        this.bannerAds.init(this.fapi);
    }

    private adapterReady(): void {
        this.initParams();
        this.initServer();
        this.initEvents();
        this.initAds();
        this.__ready = true;
        this.callWaiters();
    }

    public getId(): string {
        return this.params["logged_user_id"];
    }

    public getSignature(): string {
        return this.params["sig"];
    }

    private initServer(): void {
        console.log("TEST", this.params, GAME_CODE);
        this.server.init(GAME_CODE + OK_VERSION, this.getId());
    }
    
    public save(data: any): any {
        return Promise.all([this.saveOnServer(data), this.okSave(data)])
            .catch((e: any) => {
                console.error(e);
            });
    }

    public okSave(data: any): void {
        Object.keys(data).forEach((key: string) => {
            this.__okSaveItem(key, data[key]);
        });
    }

    private __okSaveItem(key: string, value: number): void {
        try {
            if(this.storageCache[key] === value)return;

            this.storageCache[key] = value;

            this.fapi.Client.call({
                "method": "storage.set",
                "key": key,
                "value": value
            }, (...args) => {
                console.log("save", key, value, args);
            });
        } catch(e) {
            console.error(e);
        }
    }

    public load(keys?: Array<string>): Promise<any> {
        return Promise.all([this.loadFromServer(), this.okLoad(keys)])
            .then((res: Array<any>) => {
                console.log("LOADS", res);
                return res.find((data: any) => !!data) || null;
            })
            .catch((e: any) => {
                console.error(e);
                return null;
            });
    }

    public okLoad(keys: Array<string> = []): Promise<any> {
        return new Promise((resolve: any, reject) => {
            try {
                this.fapi.Client.call({
                    "method": "storage.get", 
                    "keys": keys,
                }, (result: string, data: any) => {
                    console.log("FAPI get", data);
                    try {
                        if(result === "ok") {
                            const obj: any = data.data || {};

                            Object.keys(obj).forEach((key: string) => {
                                this.storageCache[key] = obj[key];
                            });

                            resolve(data.data || null);
                        }
                    } catch(e) {
                        console.error(e);
                    }

                    resolve(null);
                });
            } catch(e) {
                console.error(e);
                resolve(null);
            }
        });
    }

    public showFullscreenAds(): Promise<boolean> {
        return this.fullscreenAds.show();
    }

    public showRewardedAds(): Promise<boolean> {
        return this.rewardedAds.show();
    }

    public showStickyBanner(): void {
        this.bannerAds.show();
    }

    public updateBanner(): void {
        this.bannerAds.update();
    }

    public hideStickyBanner(): void {
        this.bannerAds.hide();
    }

    public isAuth(): Promise<boolean> {
        return Promise.resolve(true);
    }

    public canInvite(): Promise<boolean> {
        return Promise.resolve(true);
    }

    public invite(message: string = ""): Promise<any> {
        this.fapi.UI.showInvite(message);

        return this.eventToPromise("showInvite")
            .then((e: any) => {
                return true;
            })
            .catch((e: any) => {
                return false;
            });
    }

    public member(...args: Array<any>): Promise<any> {
        const prom: Promise<any> = this.eventToPromise("joinGroup")
            .then(() => {
                return true;
            })
            .catch(() => {
                return false;
            });

        this.fapi.UI.joinGroup(this.group_id, true);

        return prom;
    }

    public sendPost(message: string = ""): Promise<any> {
        message = message.replace("{url}", this.appUrl);
        this.fapi.UI.postMediatopic({
            "media":[
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
            .then(() => {
                return true;
            })
            .catch(() => {
                return false;
            });
    }

    public isReview(): Promise<boolean> {
        return new Promise((resolve: any) => {
            this.fapi.Client.call({"method":"apps.getAppUserRating", "app_id": this.appId}, (status: string, data: any, error: any) => {
                if(error)console.error(error);
                resolve(status === "ok" && data.success && data.rating > 0);
            });
        });
    }

    public canReview(): Promise<boolean> {
        return new Promise((resolve: any) => {
            this.fapi.Client.call({"method":"apps.getAppUserRating", "app_id": this.appId}, (status: string, data: any, error: any) => {
                if(error)console.error(error);
                resolve(status === "ok" && !(data.success && data.rating > 0));
            });
        });
    }

    public review(): Promise<boolean> {
        this.fapi.UI.showRatingDialog();

        return this.eventToPromise("showRatingDialog")
            .then(() => {
                return true;
            })
            .catch((e: any) => {
                console.error(e);
                return false;
            });
    }

    private getUsersData(ids: Array<string>): Promise<any> {
        return new Promise((resolve: any) => {
            this.fapi.Client.call({"method":"users.getInfo", "fields":"first_name,last_name,pic128x128,uid,gender", "uids": ids, emptyPictures: true}, (status: string, data: Array<any>, error: any) => {
                if(status !== "ok")return resolve([]);
                return resolve(data);
            });
        });
    }
    
    public getLbData(): Promise<Array<ILbEntrie>> {
        return super.getLbData()
            .then((arr: Array<ILbEntrie>) => {
                return this.getUsersData(arr.map((data: ILbEntrie) => data.id))
                    .then((obj: any) => {

                        console.log("users data", obj, arr.map((data: ILbEntrie) => data.id));

                        const f: any = (user: any) => {
                            const data: any = arr.find((el: ILbEntrie) => Number(el.id) == user.uid);

                            if(!data)return;

                            const firstName: string = user.first_name || "",
                                lastName: string = user.last_name || "";

                            data.avatar = user.pic128x128 || "https://dravk.ru/slova_ok/avatars/" + (user.gender === "female" ? "f" : "m") + ".png";
                            data.title = firstName + (lastName ? (" " + lastName) : "") || "";
                        };

                        obj.forEach(f);

                        return arr;
                    });
            });
    }

    private tryGetPurchase(): Promise<Array<IPurchaseData>> {
        const maxAttempts: number = 5;
        let attempts: number = maxAttempts;

        return new Promise((resolve: any, reject: any) => {
            const f: any = () => {
                    if(attempts <= 0)return reject(null);

                    attempts-=1;

                    setTimeout(() => {
                        this.getPurchase()
                            .then((arr: Array<IPurchaseData>) => {
                                if(arr.length) {
                                    resolve(arr);
                                } else {
                                    f();
                                }
                            })
                            .catch((e: any) => {
                                console.error(e);
                                f();
                            });
                    }, (1 + Math.pow(maxAttempts - attempts, 2) * .3) * SECOND);
                };

            f();
        });
    }

    public consumePurchase(id: string, attempts: number = 3): Promise<any> {
        return this.server.request("https://bbb.dra.games/api/purchase/ok/close-transaction", {
                "transaction_id": id,
                "app_id": String(this.appId),
                "user_id": this.getId(),
                "sign": this.params
            })
            .then((e: any) => {
                console.log("consumePurchase", e);
                if(e.error)return Promise.reject(e.error);
                return true;
            })
            .catch((e: any) => {
                console.error("consumePurchase", e);
                if(attempts <= 1)return false;
                return this.consumePurchase(id, attempts - 1);
            });
    }

    public getPurchase(attempts: number = 1): Promise<Array<IPurchaseData>> {
        return this.server.request("https://bbb.dra.games/api/purchase/ok/get-transactions", {"app_id": String(this.appId), "user_id": this.getId()})
            .then((e: any) => {
                console.log("getPurchase", e);
                if(e.error)return Promise.reject(e.error);
                return e.data.filter((el: any) => {
                    return el["status"] !== "closed";
                }).map((el: any) => {
                    return {
                        "purchaseToken": el["transaction_id"],
                        "productID": el["data"]["product_code"]
                    };
                }) || [];
            })
            .catch((e: any) => {
                console.error("getPurchase", e);
                if(attempts <= 1)return [];
                return this.getPurchase(attempts - 1);
            });
    }

    private getCatalogItemData(id: string): ICatalogItem | Empty {
        if(!this.catalog)return null;

        return this.catalog.find((el: ICatalogItem) => {
            return el.id === id;
        });
    }

    public buy(id: string): Promise<any> {
        const data: any = this.getCatalogItemData(id) || {};

        console.log("BUY", data);

        this.fapi.UI.showPayment(
            data.title || "",//name
            data.descr || "descr",//description
            id,//code
            data.priceValue || 1,//price
            null,//options
            JSON.stringify({app_id: this.appId}),//attributes
            "ok",//currency
            "true"//callback
        );

        return this.eventToPromise("showPayment")
            .then(() => this.tryGetPurchase())
            .then((arr: Array<IPurchaseData>) => {
                const el: IPurchaseData | Empty = arr.find((el1: IPurchaseData) => el1.productID === id);
                if(!el)return false;
                return el;
            })
            .catch(() => false);
    }

    private eventToPromise(key: string): Promise<any> {
        const listeners: Array<any> = [],
            clear: any = () => {
                listeners.forEach((f) => events.removeListener(f));
            };

        return new Promise((resolve, reject) => {
            const error: any = (...arr: Array<any>) => {
                console.error(key, ...arr);
                reject(arr);
            };
            listeners.push(events.addOnceListener(key + "_ok", (data: any) => {
                console.log(key + "_ok", data);
                resolve(data);
            }));
            listeners.push(events.addOnceListener(key + "_error", error));
            listeners.push(events.addOnceListener(key + "_cancel", error));
        })
        .then((data: any) => {
            clear();
            return Promise.resolve(data);
        })
        .catch((e: any) => {
            clear();
            return Promise.reject(e);
        });
    }
};

class FullscreenADS {
    private last: number = 0;
    private min: number = 30000;

    private fapi: any = null;

    constructor() {

    }

    public init(fapi: any): void {
        this.fapi = fapi;
    }

    public show(): Promise<any> {
        const listeners: Array<any> = [];

        return new Promise((resolve: Function) => {
                try {
                    if(!this.fapi)return resolve(false, "fapi is not defined");

                    const t: number = Date.now();

                    if(Math.abs(t - this.last) < this.min) {
                        return resolve(false);
                    }

                    this.last = t;

                    let isOpened: boolean = false;

                    listeners.push(events.addListener("showAd_ok", (e: any) => {
                        if(e.data === "ad_prepared") {
                            isOpened = true;
                        } else if(e.data === "ad_shown") {
                            resolve(true);
                        }
                    }));

                    listeners.push(events.addListener("showAd_error", () => {
                        resolve(false);
                    }));

                    this.fapi.UI.showAd();

                    setTimeout(() => {
                        if(!isOpened)resolve(false);
                    }, 10000);
                } catch(e) {
                    resolve(false, e);
                }
            })
            .then((res: any) => {
                listeners.forEach((f: any) => events.removeListener(f));
                return res;
            });
    }
};

class RewardedADS {
    private fapi: any = null;

    private ready: boolean = false;
    private loading: boolean = false;

    private block: boolean = false;

    constructor() {

    }

    public init(fapi: any): void {
        console.log("REWARD init");
        this.fapi = fapi;
        this.load();
    }

    private load(): void {
        if(this.block || !this.fapi || this.ready || this.loading)return;

        this.loading = true;

        const listeners: Array<any> = [],
            end: any = () => {
                this.loading = false;

                listeners.forEach((f: any) => events.removeListener(f));

                if(!this.ready) {
                    setTimeout(() => this.load(), 10000);
                }
            };

        try {
            listeners.push(events.addListener("loadAd_ok", (e: any) => {
                this.ready = true;
                end();
            }));

            listeners.push(events.addListener("loadAd_error", (e: any) => {
                end();
            }));

            this.fapi.UI.loadAd();
        } catch(e) {
            console.error(e);
            this.loading = false;
        }
    }

    public show(): Promise<any> {
        const listeners: Array<any> = [];

        return new Promise((resolve: Function) => {
            let res: boolean = false;

            try {
                if(!this.fapi)return resolve(false, "fapi is not defined");
                if(!this.ready)return resolve(false);

                let isOpened: boolean = false;

                listeners.push(events.addListener("showLoadedAd_ok", (e: any) => {
                    resolve(true);
                }));

                listeners.push(events.addListener("showLoadedAd_error", (e: any) => {
                    if(e.data === "mp4_not_supported")this.block = true;
                    resolve(false);
                }));
                
                this.fapi.UI.showLoadedAd();

                setTimeout(() => {
                    if(!isOpened)resolve(false);
                }, 20000);
            } catch(e) {
                console.error(e);
                resolve(res, e);
            }
        })
        .then((res: any) => {
            this.ready = false;
            setTimeout(() => this.load(), SECOND);
            listeners.forEach((f: any) => events.removeListener(f));
            return res;
        });
    }
};

class StickyBanner {
    private fapi: any = null;
    private switch: boolean = false;
    private visible: boolean = false;
    private ready: boolean = false;

    private side: string = "bottom";

    private block: boolean = false;

    constructor() {

    }

    public search(): Promise<any> {
        if(!this.fapi || this.block)return Promise.resolve(false);

        return new Promise((resolve: any) => {
            events.addOnceListener("requestBannerAds_ok", (e: any) => {
                this.ready = true;
                resolve(true);
            });

            events.addOnceListener("requestBannerAds_error", (e: any) => {
                setTimeout(() => {
                    events.addOnceListener("requestBannerAds_error", (e: any) => {
                        resolve(false);
                    });

                    this.fapi.invokeUIMethod("requestBannerAds");
                }, 2000);
            });

            this.fapi.invokeUIMethod("requestBannerAds");
        });
    }

    public update(): void {
        if(this.block || !this.visible)return;

        this.search()
            .then((res: boolean) => {
                if(res && this.visible)this.__show();
            });
    }

    private __show(): void {
        if(!this.ready)return;

        this.fapi.invokeUIMethod("showBannerAds", this.side);
    }

    private __hide(): void {
        this.fapi.invokeUIMethod("hideBannerAds");
    }

    public init(fapi: any): void {
        this.fapi = fapi;

        events.addOnceListener("getBannerFormats_ok", (json: string) => {
            let bannerFormat: string = "",
                bar: Array<string> | Empty = null;
            const data: any = JSON.parse(json),
                supported: Array<any> = data.supported;

            if(isMobile) {
                bannerFormat = "bar_outer";
                this.side = "bottom";
            } else {
                bannerFormat = "vertical_outer";
                this.side = "right";
            }

            bar = supported[bannerFormat];

            if(!bar) {
                this.block = true;
                return;
            }
            
            events.addOnceListener("setBannerFormat_ok", () => {
                this.search();
            });

            events.addOnceListener("setBannerFormat_error", () => {
                this.block = true;
            });

            fapi.invokeUIMethod("setBannerFormat", bannerFormat)
        });

        events.addOnceListener("getBannerFormats_error", () => {
            setTimeout(() => {
                fapi.invokeUIMethod("getBannerFormats");
            }, 2000);
        });

        fapi.invokeUIMethod("getBannerFormats");
    }

    public show(): void {
        if(this.switch)return;
        this.switch = true;
        this.check();
    }

    public hide(): void {
        if(!this.switch)return;
        this.switch = false;
        this.check();
    }

    private check(): void {
        if(!this.ready)return;

        const listeners: Array<any> = [],
            end: any = () => {
                listeners.forEach((f: any) => events.removeListener(f));
            };

        listeners.push(events.addOnceListener("isBannerAdsVisible_ok", (data: boolean) => {
            if(Boolean(data) && !this.visible) {
                this.__hide();
            } else if(!Boolean(data) && this.visible) {
                this.__show();
            }

            end();
        }));

        listeners.push(events.addOnceListener("isBannerAdsVisible_error", (data: boolean) => {
            end();
        }));

        this.fapi.invokeUIMethod("isBannerAdsVisible");
    }
};