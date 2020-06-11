[![NPM](https://img.shields.io/npm/v/@livestd/react-ticker-hook.svg)](https://www.npmjs.com/package/@livestd/react-ticker-hook)

Simple ticker model for pooling requests and other timing functions.
Each component can subscribe for some ticker event, that defined previously.
If the ticker event have not listeners, he does not work.

## Installation
```
npm install --save @livestd/react-ticker-hook
```

## Usage

```js
import Tickers, { useTicker, SubscriberConfig, TickerCallback } from '@livestd/react-ticker-hook';

const IntervalId = 'mainEvent';
const IntervalEvent = () => {
  return "value"
}
const SubscriberId = "id"
// Same events must not be duplicated
_ticker.add({ id: IntervalId, callback: IntervalEvent });

const Component = () => {
  // Let activate ticker only on top of the page
  const [ontop, setOntop] = useState(true);
  const [counter, setCounter] = useState(0);
  const callback = (value) => {
    setCounter(counter + 1);
  };
  // Call main event each 5 seconds
  useTicker(
    {
      tickerId: IntervalId,
      // Id is need if you want to make uniq subscriber
      id: SubscriberId,
      active: ontop,
      // Ticker calls callback by the least interval of subscribers
      interval: 5000,
      // Subscriber callback is need if you wait some response from the ticker event
      callback: callback
    },
    // Update subscriber only when "ontop" is updated
    [ontop]
  );
  return (<>content</>);
} 

```