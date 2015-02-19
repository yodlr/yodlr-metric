# Yodlr Metrics Library

The goal of this library is to provide a consistent API for sending metrics
from our NodeJS services.

This library exposes a constructor which provides the following metric API calls:
 * count
 * increment
 * decrement
 * timing
 * timer
 * gauge
 * set

## Using this library

### Construction

#### Staticaly define host/port and prefixes
```javascript
var opts = {
  prefix: 'services.myapp', //optional
  statsd: {
    prefix: 'account-uuid', // optional
    host: '10.1.1.5',
    port: 8125
  }
  on_error: function errorHandler(err) { // if not defined, will emit 'error' instead
    console.log(err);
  }
```

#### Pull host/port and prefix from etcd.
If the values change, yodlr-metrics will dynamically reconfigure how it sends data.
You don't need to modify you code at all.

If insufficient data is provided in etcd, yodlr-metrics will
emit an error which you should capture and probably log.

```javascript
var opts = {
  etcd_host: '172.17.42.1', // default, optional
  etcd_port: 4001, // default, optional
  prefix: 'services.myapp', // optional
  statsd: {
    prefix_etcd: '/services/statsd/prefix', // optional
    hostEtcd: '/services/statsd/host',
    portEtcd: '/services/statsd/port'
  }
}
```

Once you've decided on your configuration, you can construct a metrics object like this:

```javascript
var YodlrMetrics = require('yodlr-metrics');

var opts = {
  prefix: 'services.myapp',
  statsd: {
    prefix: 'account-uuid',
    host: '10.1.1.5',
    port: 8125
  }
}

var metric = new YodlrMetrics(opts);
metric.on('error', function metricError(err) {
  console.log('Uh oh, error in yodlr-metrics', err);
})
```

### Count

Increases or decreased a counter by the provider number.

```javascript
metric.count('users.new', 5); // increments counter by 5
```

### Increment

Increases a counter by 1

```javascript
metric.increment('users.new'); // increments counter by 1
```

### Decrement

Decreases a counter by 1

```javascript
metric.decrement('users.new'); // increments counter by 1
```

### Timing

Sends a timing metric in ms

```javascript
metric.timing('user.ping_latency', 50); // sends timing metric of 50ms
```

### Timer

Variation on the timing metric which provides a timing object with a Stop() function

```javascript
var timer = metric.timer('user.ping_latency');
setTimeout(function() {
  timer.stop(); // sends timing metric from when object was created
}, 50);
```

### Gauge

Sets a currently configured gauge to this new value

```javascript
metric.gauge('users.current_connected', 500); // sets gauge to 500
```

### Set

Used to count unique occurrences of events between flushes, using a Set to store all occurring events.

If a method is called multiple times with the same value in the same sample period, that value will only be counted once.

```javascript
metric.set('users.active', 'Jared');
metric.set('users.active', 'Tom');
metric.set('users.active', 'Jared'); //
```
