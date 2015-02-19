var Lynx = require('lynx');

var Statsd = module.exports = function Statsd(opts) {
  console.log(opts);
  this._lynx = new Lynx(opts.host, opts.port, {
    //jscs:disable
    on_error: opts.onError,
    //jscs:enable
    scope: opts.scope
  });
};

Statsd.prototype.count = function count(met, delta, samp) {
  this._lynx.count(met, delta, samp);
};

Statsd.prototype.increment = function increment(met, samp) {
  this._lynx.increment(met, samp);
};

Statsd.prototype.decrement = function decrement(met, samp) {
  this._lynx.decrement(met, samp);
};

Statsd.prototype.timing = function timing(met, delta, samp) {
  this._lynx.timing(met, delta, samp);
};

Statsd.prototype.createTimer = function createTimer(met, samp) {
  return this._lynx.createTimer(met, samp);
};

Statsd.prototype.gauge = function gauge(met, value, samp) {
  this._lynx.gauge(met, value, samp);
};

Statsd.prototype.set = function set(met, value, samp) {
  this._lynx.set(met, value, samp);
};
