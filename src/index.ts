import { useEffect } from 'react';
import Tickers, { SubscriberConfig, TickerCallback } from './base';

let _ticker: Tickers = new Tickers();

const useTicker = (config: SubscriberConfig, deps?: any[]) => {
  if (!deps) {
    deps = [];
  }
  useEffect(() => {
    _ticker.subscribe(config);
    return () => {
      _ticker.unsubscribe(config);
    };
  }, deps);
};
// export const HistoryInterval = 'history.getHistory';
//
// export const TickersMap = new Map<string, TickerCallback>([
//     [HistoryInterval, () => historyStore.fetchHistory()]
// ]);
//
// export const TickersInit = function() {
//     TickersMap.forEach((v, k) => {
//         _ticker.add({ id: k, callback: v });
//     });
// };
//
// const [ontop, setOntop] = useState(true);
//
// useTicker({ tickerId: HistoryInterval, active: ontop, interval: 5000 }, [ontop]);

export {useTicker, SubscriberConfig, TickerCallback, Tickers}

export default _ticker;
