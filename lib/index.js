var eventemitter3 = require('eventemitter3').EventEmitter;
var util = require('util');
function YodlrMetric(opts) {
  if (!(this instanceof YodlrMetric)) {
    return new YodlrMetric(opts);
  }
  eventemitter3.call(this);

  opts = opts || {};

  this._validateStatsd(opts.statsd);

  this.prefix = opts.prefix || '';
  this.onError = opts && typeof opts.onError === 'function'
               ? opts.onError
               : this._defaultErrHandler;
}
util.inherits(YodlrMetric, eventemitter3);

YodlrMetric.prototype._validateStatsd = function _validateStatsd(opts) {
  if (!opts) {
    return;
  }
  if (!opts.host && !opts.hostEtcd) {
    throw new Error('Statsd option must include either host or hostEtcd');
  }
  if (opts.host && opts.hostEtcd) {
    throw new Error('Statsd option can\'t include both host and hostEtcd');
  }
  if (!opts.port && !opts.portEtcd) {
    throw new Error('Statsd option must include either port or portEtcd');
  }
  if (opts.port && opts.portEtcd) {
    throw new Error('Statsd option can\'t include both port and portEtcd');
  }
  if (opts.prefix && opts.prefixEtcd) {
    throw new Error('Statsd option can\'t include both prefix and prfixEtcd');
  }
};

YodlrMetric.prototype.count = function count(met, delta, samp) {
  var error;
  if (!met || !(typeof met === 'string')) {
    error = new Error('Metric must exist and be a string: [' + met + ']');
    return this.onError(error);
  }
  if (!delta || !(typeof delta === 'number')) {
    error = new Error('Delta must exist and be a number: [' + met + ']');
    return this.onError(error);
  }
  if (samp && !(typeof samp === 'number')) {
    error = new Error('Sample is optional but must be a number: [' + met + ']');
    return this.onError(error);
  }
};

YodlrMetric.prototype.increment = function increment(met, samp) {
  var error;
  if (!met || !(typeof met === 'string')) {
    error = new Error('Metric must exist and be a string: [' + met + ']');
    return this.onError(error);
  }
  if (samp && !(typeof samp === 'number')) {
    error = new Error('Sample is optional but must be a number: [' + met + ']');
    return this.onError(error);
  }
};

YodlrMetric.prototype.decrement = function decrement(met, samp) {
  var error;
  if (!met || !(typeof met === 'string')) {
    error = new Error('Metric must exist and be a string: [' + met + ']');
    return this.onError(error);
  }
  if (samp && !(typeof samp === 'number')) {
    error = new Error('Sample is optional but must be a number: [' + met + ']');
    return this.onError(error);
  }
};

YodlrMetric.prototype.timing = function timing(met, delta, samp) {
  var error;
  if (!met || !(typeof met === 'string')) {
    error = new Error('Metric must exist and be a string: [' + met + ']');
    return this.onError(error);
  }
  if (!delta || !(typeof delta === 'number')) {
    error = new Error('Delta must exist and be a number: [' + met + ']');
    return this.onError(error);
  }
  if (samp && !(typeof samp === 'number')) {
    error = new Error('Sample is optional but must be a number: [' + met + ']');
    return this.onError(error);
  }
};

YodlrMetric.prototype.timer = function timing(met, samp) {
  var error;
  if (!met || !(typeof met === 'string')) {
    error = new Error('Metric must exist and be a string: [' + met + ']');
    return this.onError(error);
  }
  if (samp && !(typeof samp === 'number')) {
    error = new Error('Sample is optional but must be a number: [' + met + ']');
    return this.onError(error);
  }
  return {
    stat: met,
    stop: function stop() {

    }
  };
};

YodlrMetric.prototype.gauge = function gauge(met, value, samp) {
  var error;
  if (!met || !(typeof met === 'string')) {
    error = new Error('Metric must exist and be a string: [' + met + ']');
    return this.onError(error);
  }
  if (!value || !(typeof value === 'number')) {
    error = new Error('Value must exist and be a number: [' + met + ']');
    return this.onError(error);
  }
  if (samp && !(typeof samp === 'number')) {
    error = new Error('Sample is optional but must be a number: [' + met + ']');
    return this.onError(error);
  }
};

YodlrMetric.prototype.set = function set(met, value, samp) {
  var error;
  if (!met || !(typeof met === 'string')) {
    error = new Error('Metric must exist and be a string: [' + met + ']');
    return this.onError(error);
  }
  if (!value) {
    error = new Error('Value must exist: [' + met + ']');
    return this.onError(error);
  }
  if (samp && !(typeof samp === 'number')) {
    error = new Error('Sample is optional but must be a number: [' + met + ']');
    return this.onError(error);
  }
};

YodlrMetric.prototype._defaultErrHandler = function _defaultErrHandler(e) {
  this.emit('error', e);
};

module.exports = YodlrMetric;
