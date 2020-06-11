type TickerId = string;
export type TickerCallback = (data?: any) => any;

export interface TickerConfig {
    id: TickerId;
    callback?: (params?: any) => any;
}

type SubscriberId = string;

type SubscriberCallback = (data?: any) => void;

interface Subscriber {
    id: SubscriberId;
    interval: number;
    active?: boolean;
    callback?: SubscriberCallback;
}

export interface SubscriberConfig {
    tickerId: TickerId;
    id?: SubscriberId;
    interval?: number;
    callback?: SubscriberCallback;
    active?: boolean;
}

const defaultSubscriberId = 'default';

class Index {
    public params: TickerConfig;
    public subscribers: Subscriber[];
    public interval: number | undefined;

    public constructor(params: TickerConfig) {
        this.params = params;
        this.subscribers = [];
        this.interval = undefined;
    }
    public get id(): TickerId {
        return this.params.id;
    }
    public getSubscriber(id: SubscriberId): Subscriber | undefined {
        return this.subscribers.find(subscriber => {
            return subscriber.id === id;
        });
    }
    public addSubscriber(config: SubscriberConfig): void {
        const subscriber: Subscriber = {
            ...{
                id: defaultSubscriberId,
                interval: 3000
            },
            ...config
        };
        if (this.getSubscriber(subscriber.id) === undefined && subscriber.active !== false) {
            this.subscribers.push(subscriber);
            this.updateInterval();
        }
    }
    public removeSubscriber(config: SubscriberConfig): void {
        const i = this.subscribers.findIndex(el => {
            return el.id === (config.id || defaultSubscriberId);
        });
        if (i >= 0) {
            this.subscribers.splice(i, 1);
        }
        this.updateInterval();
    }
    public updateInterval(): void {
        if (this.interval) {
            //console.log('clear interval', this.id);
            clearInterval(this.interval);
        }
        if (this.subscribers.length > 0) {
            //console.log('create interval', this.id);
            const duration = this.getMinDuration();
            this.interval = setInterval(
                function(t: Index) {
                    if (t.subscribers.length > 0) {
                        const res = (t.params.callback && t.params.callback()) || null;
                        t.subscribers.forEach(sub => {
                            if (sub.callback) {
                                sub.callback(res);
                            }
                        });
                    }
                },
                duration,
                this
            );
        }
    }
    public getMinDuration(): number {
        return this.subscribers.sort((a, b) => {
            return a.interval > b.interval ? 1 : -1;
        })[0].interval;
    }
}

interface QueueItem {
    component: string;
    interval: number;
    callback?: (data?: any) => void;
}
interface QueueItemConfig {
    component?: string;
    interval?: number;
    callback?: (data?: any) => void;
}

class Queue {
    public items: Map<TickerId, SubscriberConfig[]>;
    public constructor() {
        this.items = new Map<TickerId, SubscriberConfig[]>();
    }
    public get(tickerId: TickerId): SubscriberConfig[] | undefined {
        return this.items.get(tickerId);
    }
    public add(config: SubscriberConfig): void {
        //console.log('add to Queue', config);
        const queue = this.get(config.tickerId);
        if (queue) {
            queue.push(config);
        } else {
            this.items.set(config.tickerId, [config]);
        }
    }
    public flush(tickerId: TickerId): SubscriberConfig[] {
        const queue = this.get(tickerId);
        if (queue) {
            this.items.delete(tickerId);
        }
        return queue || [];
    }
}

export default class Tickers {
    public tickers: Index[];
    public queue: Queue;

    public constructor() {
        //console.log('new tickers constucted!');
        this.tickers = [];
        this.queue = new Queue();
    }

    public get(id: TickerId): Index | undefined {
        return this.tickers.find(ticker => {
            return ticker.id === id;
        });
    }

    public isset(state: TickerId): boolean {
        return this.get(state) !== undefined;
    }

    public add(config: TickerConfig): void {
        if (!this.isset(config.id)) {
            const ticker = new Index(config);
            this.tickers.push(ticker);
            this.queue.flush(config.id).forEach((c: SubscriberConfig) => {
                ticker.addSubscriber(c);
            });
        }
    }
    public subscribe(config: SubscriberConfig): void {
        const ticker = this.get(config.tickerId);
        if (ticker !== undefined) {
            ticker.addSubscriber(config);
        } else {
            this.queue.add(config);
        }
    }
    public unsubscribe(config: SubscriberConfig): void {
        const ticker = this.get(config.tickerId);
        if (ticker !== undefined) {
            ticker.removeSubscriber(config);
        } else {
            this.queue.flush(config.tickerId);
        }
    }
}
