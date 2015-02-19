var YodlrMetrics = require('./lib');

var opts = {
  prefix: 'services.myapp',
  statsd: {
    prefix: 'account-1234',
    host: '104.239.164.69',
    port: 8125
  }
};

var metric = new YodlrMetrics(opts);
metric.on('error', function metricError(err) {
  console.log('Uh oh, error in yodlr-metrics', err);
});

metric.increment('my.increment');
metric.decrement('my.decrement');
metric.count('my.count', 5);
metric.timing('my.timing', 50);
var timer = metric.createTimer('my.timer');
setTimeout(function() {
  timer.stop();
}, 50);


metric.gauge('my.gauge', 100);
metric.set('my.set', 'ross');
metric.set('my.set', 'ross');
metric.set('my.set', 'jared');
