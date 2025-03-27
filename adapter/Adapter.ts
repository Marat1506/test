import { ADS_PAUSE_CONFIG_KEY, ANALYTICS_CONFIG_KEY, LEADERBOARD_CONFIG_KEY, MATCH_LOCATION_URL_CONFIG_KEY, PAUSE_ADS_CONFIG_KEY, PAYMENTS_CONFIG_KEY, REVIEW_CONFIG_KEY, SECOND, SEND_POST_CONFIG_KEY, START_ADS_AFTER_CLICK_CONFIG_KEY, START_ADS_CONFIG_KEY, START_ADS_FORCED_CONFIG_KEY, STATS_CONFIG_KEY, VK_VERSION, WORD_REMOTE_DESCR_CONFIG_KEY } from "../constants";
import Game from "../Game";
import gipi from "../gipi";
import { Empty, ICatalogItem, ILbEntrie, IPurchaseData } from "../interfaces";

export default class Adapter {
    protected lang: string = "en";
    protected catalog: Array<ICatalogItem> = [];

    protected __ready: boolean = false;
    protected __loaded: boolean = false;
    protected waiters: Array<any> = [];

    protected server: ServerData = new ServerData();

    protected score: number = 0;

    protected config: any = {};

    protected game: Game | Empty = null;

    constructor() {
        this.initConfig();

        setTimeout(() => {
            this.create();
        }, 0);
    }

    public reachGoal(goal: string): void {
        //
    }

    public loading(v: number = 0): void {
        //
    }

    public sendProgress(level: number = 0): void {
        //
    }

    public goalAchievement(id: string): Promise<boolean> {
        return Promise.resolve(true);
    }
    
    public setGame(game: Game): void {
        this.game = game;
    }

    protected initConfig(): void {
        this.setOption(PAUSE_ADS_CONFIG_KEY, false);
        this.setOption(START_ADS_CONFIG_KEY, false);
        this.setOption(START_ADS_FORCED_CONFIG_KEY, false);
        this.setOption(START_ADS_AFTER_CLICK_CONFIG_KEY, false);
        this.setOption(SEND_POST_CONFIG_KEY, false);
        this.setOption(REVIEW_CONFIG_KEY, false);
        this.setOption(ADS_PAUSE_CONFIG_KEY, 3);
        this.setOption(LEADERBOARD_CONFIG_KEY, false);
        this.setOption(PAYMENTS_CONFIG_KEY, false);
        this.setOption(ANALYTICS_CONFIG_KEY, false);
        this.setOption(STATS_CONFIG_KEY, false);
        this.setOption(WORD_REMOTE_DESCR_CONFIG_KEY, false);
        this.setOption(MATCH_LOCATION_URL_CONFIG_KEY, false)
    }

    public getOption(key: string): any {
        return this.config[key];
    }

    protected setOption(key: string, value: any): void {
        this.config[key] = value;
    }

    public getSignature(): string {
        return "";
    }

    protected create(): void {
        this.__ready = true;
    }

    public getStorage(): Promise<any> {
        return Promise.resolve(null);
    }

    public gameReady(): void {
        //
    }

    public get version(): string {
        return VK_VERSION;// DEF_VERSION;
    }

    public getVersion(): string {
        return this.version;
    }

    protected callWaiters(): void {
        this.waiters.forEach((waiter: any) => {
            try {
                waiter(this.__loaded);
            } catch(e) {
                console.error(e);
            }
        });
    }

    public review(): Promise<boolean> {
        return Promise.resolve(false);
    }

    public canReview(): Promise<boolean> {
        return Promise.resolve(this.getOption(REVIEW_CONFIG_KEY));
    }

    public isReview(): Promise<boolean> {
        return Promise.resolve(false);
    }

    public getLang(): Promise<string> {
        return Promise.resolve(this.lang);
    }

    public init(): Promise<boolean> {
        if(this.__ready)return Promise.resolve(this.__loaded);
        return new Promise((resolve: any) => {
            this.waiters.push(resolve);
        });
    }

    public save(data: any, force: boolean = false): any {
        return Promise.all([this.saveOnServer(data, force)])
            .catch((e: any) => {
                //console.error(e);
            });
    }

    protected saveOnServer(data: any, force: boolean = false): Promise<any> {
        return this.server.save(data, this.score, force);
    }

    public load(keys?: Array<string>): Promise<any> {
        return this.loadFromServer()
            .then((data: any) => data || null)
            .catch(() => {return null});
    }

    protected loadFromServer(): Promise<any> {
        return this.server.load();
    }

    public getId(): string {
        return "1";
    }

    public isAuth(): Promise<boolean> {
        return Promise.resolve(false);
    }

    public buy(...arr: Array<any>): Promise<boolean> {
        return Promise.reject(false);
    }

    public consumePurchase(...arr: Array<any>): Promise<any> {
        return Promise.resolve(false);
    }

    public getCatalog(): Array<ICatalogItem> {
        return this.catalog;
    }

    public getPurchase(): Promise<Array<IPurchaseData>> {
        return Promise.resolve([]);
    }

    public auth(): Promise<any> {
        return Promise.reject();
    }

    public setScore(v: number, isFirst: boolean = true): number {
        return this.score = Number(v) || 0;
    }

    public getRank(isFirst: boolean = true): Promise<number> {
        return this.server.getLb(0, 0)
            .then((data: any) => {
                return data?.player?.rank || 0;
            })
            .catch((e: any) => {
                //console.error(e);
                return 0;
            });
    }

    public getScore(isFirst: boolean = true): Promise<number> {
        if(isFirst || this.score <= 0) {
            return this.server.getLb(0, 0)
                .then((data: any) => {
                    return data?.player?.score || 0;
                })
                .catch((e: any) => {
                    //console.error(e);
                    return 0;
                });
        } else {
            return Promise.resolve(this.score);
        }
    }

    public addScore(v: number = 1): Promise<number> {
        return this.getScore()
            .then((score: number) => this.setScore(score + v));
    }

    protected entrieFormat(data: any): Promise<ILbEntrie> {
        return Promise.resolve((() => {
            try {
                return {
                    id: data["player_id"],
                    score: data.score,
                    rank: data.rank,
                    title: "",
                    avatar: "",
                    extra_data: data.extra_data
                };
            } catch(e: any) {
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
    }

    public getLbData(): Promise<Array<ILbEntrie>> {
        return this.server.getLb()
            .then((data: any) => {
                console.log("LB TEST", data);
                const top: Array<any> = data.top || [],
                    nearby: Array<any> = data.nearby || [],
                    player: any = data.player,
                    res: Array<any> = [],
                    add: any = (el: any) => {
                        if(!el || res.find((el0) => el0["player_id"] === el["player_id"]))return;
                        res.push(el);
                    };

                top.forEach(add);
                nearby.forEach(add);
                add(player);

                return Promise.all(res.map((el: any) => this.entrieFormat(el)))
            })
            .catch(() => []);
    }

    public showLb(): Promise<any> {
        return Promise.resolve(false);
    }

    public showFullscreenAds(): Promise<boolean> {
        return Promise.resolve(false);
    }

    public showRewardedAds(): Promise<boolean> {
        return Promise.resolve(false);
    }

    public showStickyBanner(): void {
        //
    }

    public updateBanner(): void {
        this.showStickyBanner();
    }

    public hideStickyBanner(): void {
        //
    }

    public sendPost(...args: Array<any>): Promise<any> {
        return Promise.resolve(false);
    }

    public canInvite(): Promise<boolean> {
        return Promise.resolve(false);
    }

    public invite(...args: Array<any>): Promise<any> {
        return Promise.resolve(false);
    }

    public member(...args: Array<any>): Promise<any> {
        return Promise.resolve(false);
    }

    public isMember(): Promise<boolean> {
        return Promise.resolve(false);
    }

    public openGroup(): void {
        //
    }

    public canMember(): Promise<boolean> {
        return Promise.resolve(false);
    }

    public favorite(...args: Array<any>): Promise<any> {
        return Promise.resolve(false);
    }

    public isFavorite(): Promise<boolean> {
        return Promise.resolve(false);
    }

    public canAddToFavorite(...args: Array<any>): Promise<any> {
        return Promise.resolve(false);
    }

    public matchBonuses(): Promise<number> {
        return Promise.resolve(0);
    }

    public isSignedForEvents(): Promise<boolean> {
        return Promise.resolve(false);
    }

    public canSignedForEvents(): Promise<boolean> {
        return Promise.resolve(false);
    }

    public signedForEvents(): Promise<boolean> {
        return Promise.resolve(false);
    }

    public canCreateShortcut(): Promise<boolean> {
        return Promise.resolve(false);
    }

    public createShortcut(): Promise<boolean> {
        return Promise.resolve(false);
    }
};

class ServerData {
    private game_code: string = "";
    private player_id: string = "";

    private actualData: string = "";
    private lastSaveTime: number = 0;
    private timer: any = null;
    private saveStep: number = SECOND;

    private score: number | Empty;
    private extra_data: string | Empty;

    public init(game_code: string = "", player_id: string = ""): void {
        this.game_code = game_code;
        this.player_id = player_id;

        console.log("SERVER init", this.game_code, this.player_id);
    }

    public setExtraData(data: any): void {
        try {
            if(!data) {
                this.extra_data = undefined;
            } else {
                this.extra_data = JSON.stringify(data);
            }
        } catch(e) {
            console.error(e);
        }
    }

    public save(data: any, score?: number, force: boolean = false): Promise<any> {
        this.score = score;

        if(!this.game_code || !this.player_id)return Promise.resolve(false);

        const json: string = JSON.stringify(data);

        if(this.actualData === json)return Promise.resolve(true);

        this.actualData = json;

        if(this.timer) {
            if(!force)return Promise.resolve(true);
            clearTimeout(this.timer);
            this.timer = null;
            return this.__save();
        }

        const t: number = Date.now();

        if(this.lastSaveTime > (t - this.saveStep)) {
            return new Promise((resolve: any) => {
                this.timer = setTimeout(() => {
                    this.timer = null;
                    this.__save()
                        .then(resolve);
                }, this.saveStep + this.lastSaveTime - t);
            });
        } else {
            return this.__save();
        }
    }

    private __save(attempts: number = 3): Promise<any> {
        if(attempts <= 0)return Promise.resolve(false);

        const data: string = this.actualData;

        this.lastSaveTime = Date.now();

        return this.request("https://bbb.dra.games/api/save-data", {
            game_code: this.game_code,
            player_id: this.player_id,
            game_data: data,
            score: this.score,
            extra_data: this.extra_data
        })
        .then((e: any) => {
            console.log("SERVER saved", data);
            return Promise.resolve(e);
        })
        .catch((e: any) => {
            console.error("SERVER save error", e);
            if(this.actualData !== data)return Promise.resolve(false);
            return this.__save(attempts - 1);
        });
    }

    public load(attempts: number = 2): Promise<any> {
        if(!this.game_code || !this.player_id)return Promise.resolve(null);

        return this.request("https://bbb.dra.games/api/get-data", {
                game_code: this.game_code,
                player_id: this.player_id
            })
            .then((e: any) => {
                console.log("SERVER loaded", e);
                const json: string = e?.data?.game_data || "";
                if(json)this.actualData = json;
                return Promise.resolve(json ? gipi.parseJSON(json) : null);
            })
            .catch((e: any) => {
                console.log("SERVER load error", e);
                if(attempts <= 0)return Promise.resolve(null);
                return this.load(attempts - 1);
            });
    }

    public getLb(top_limit: number = 10, nearby_limit: number = 6): Promise<any> {
        if(!this.game_code || !this.player_id)return Promise.reject();

        return this.request("https://bbb.dra.games/api/players/get-leaderboard", {
            game_code: this.game_code,
            player_id: this.player_id,
            top_limit,
            nearby_limit
        })
        .then((e: any) => {
            console.log(e);
            return Promise.resolve(e?.data || {});
        })
        .catch((e: any) => {
            console.error(e);
            return Promise.resolve(null);
        });
    }

    public request(url: string, data: any = null, contentType: string = "application/json"): Promise<any> {
        return new Promise((resolve: Function, reject: Function) => {
            const req = new XMLHttpRequest();
            req.open('POST', url, true);
            req.setRequestHeader("Content-type", contentType);

            req.onreadystatechange = (aEvt) => {
                if (req.readyState == 4) {
                    if(req.status == 200) {
                        resolve(gipi.parseJSON(req.responseText));
                    } else {
                        reject(gipi.parseJSON(req.responseText));
                    }
                }
            };
    
            req.send(JSON.stringify(data));
        });
    }
};