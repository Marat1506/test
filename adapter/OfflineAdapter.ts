import Adapter from "./Adapter";

export default class OfflineAdapter extends Adapter {
    protected create(): void {
        this.adapterReady();
    }

    private adapterReady(): void {
        this.__ready = true;
        this.callWaiters();
    }
};