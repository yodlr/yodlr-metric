var eventemitter3 = require('eventemitter3').EventEmitter;
var util = require('util');
var _ = require('lodash');

var Statsd = require('./Statsd');

function YodlrMetric(opts) {
  if (!(this instanceof YodlrMetric)) {
    return new YodlrMetric(opts);
  }
  eventemitter3.call(this);

  opts = opts || {};

  this.prefix = opts.prefix || '';
  this._onError = opts && typeof opts.onError === 'function'
               ? opts.onError
               : this._defaultErrHandler;

  if (opts.statsd) {
    this._validateStatsd(opts.statsd);
    this._constructStatsd(opts);
  }
}
util.inherits(YodlrMetric, eventemitter3);

YodlrMetric.prototype.stop = function stop() {
  if (this._statsd) {
    this._statsd.stop();
  }
};

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

YodlrMetric.prototype._constructStatsd = function _constructStatsd(opts) {
  var self = this;
  var statsOpts = opts.statsd;
  var config = {};

  // Join prefix & statsOpts.prefix with '.'

  var prefixes = [];
  if (statsOpts.prefix) {
    prefixes.push(statsOpts.prefix);
  }
  if (this.prefix) {
    prefixes.push(this.prefix);
  }
  config.scope = prefixes.join('.');
  config.etcdHost = opts.etcdHost;
  config.etcdPort = opts.etcdPort;

  config.onError = this._onError.bind(self); // we might need to emit events
  _.extend(config, statsOpts);

  self._statsd = new Statsd(config);
  self._statsd.once('etcdInitConfig', function etcdInitConfig(data) {
    self.emit('etcdInitConfig', data);
  });
  self._statsd.on('etcdConfigChanged', function etcdConfigChanged(data) {
    self.emit('etcdConfigChanged', data);
  });
};

YodlrMetric.prototype.count = function count(met, delta, samp) {
  var error;
  if (!met || !(typeof met === 'string')) {
    error = new Error('Metric must exist and be a string: [' + met + ']');
    return this._onError(error);
  }
  if (!delta || !(typeof delta === 'number')) {
    error = new Error('Delta must exist and be a number: [' + met + ']');
    return this._onError(error);
  }
  if (samp && !(typeof samp === 'number')) {
    error = new Error('Sample is optional but must be a number: [' + met + ']');
    return this._onError(error);
  }

  if (this._statsd) {
    this._statsd.count(met, delta, samp);
  }
};

YodlrMetric.prototype.increment = function increment(met, samp) {
  var error;
  if (!met || !(typeof met === 'string')) {
    error = new Error('Metric must exist and be a string: [' + met + ']');
    return this._onError(error);
  }
  if (samp && !(typeof samp === 'number')) {
    error = new Error('Sample is optional but must be a number: [' + met + ']');
    return this._onError(error);
  }

  if (this._statsd) {
    this._statsd.increment(met, samp);
  }
};

YodlrMetric.prototype.decrement = function decrement(met, samp) {
  var error;
  if (!met || !(typeof met === 'string')) {
    error = new Error('Metric must exist and be a string: [' + met + ']');
    return this._onError(error);
  }
  if (samp && !(typeof samp === 'number')) {
    error = new Error('Sample is optional but must be a number: [' + met + ']');
    return this._onError(error);
  }

  if (this._statsd) {
    this._statsd.decrement(met, samp);
  }
};

YodlrMetric.prototype.timing = function timing(met, delta, samp) {
  var error;
  if (!met || !(typeof met === 'string')) {
    error = new Error('Metric must exist and be a string: [' + met + ']');
    return this._onError(error);
  }
  if (!delta || !(typeof delta === 'number')) {
    error = new Error('Delta must exist and be a number: [' + met + ']');
    return this._onError(error);
  }
  if (samp && !(typeof samp === 'number')) {
    error = new Error('Sample is optional but must be a number: [' + met + ']');
    return this._onError(error);
  }

  if (this._statsd) {
    this._statsd.timing(met, delta, samp);
  }
};

YodlrMetric.prototype.createTimer = function timing(met, samp) {
  var error;
  if (!met || !(typeof met === 'string')) {
    error = new Error('Metric must exist and be a string: [' + met + ']');
    return this._onError(error);
  }
  if (samp && !(typeof samp === 'number')) {
    error = new Error('Sample is optional but must be a number: [' + met + ']');
    return this._onError(error);
  }

  if (this._statsd) {
    return this._statsd.createTimer(met, samp);
  }
  else {
    return {
      stat: met,
      stop: function stop() {

      }
    };
  }
};

YodlrMetric.prototype.gauge = function gauge(met, value, samp) {
  var error;
  if (!met || !(typeof met === 'string')) {
    error = new Error('Metric must exist and be a string: [' + met + ']');
    return this._onError(error);
  }
  if (!value || !(typeof value === 'number')) {
    error = new Error('Value must exist and be a number: [' + met + ']');
    return this._onError(error);
  }
  if (samp && !(typeof samp === 'number')) {
    error = new Error('Sample is optional but must be a number: [' + met + ']');
    return this._onError(error);
  }

  if (this._statsd) {
    this._statsd.gauge(met, value, samp);
  }
};

YodlrMetric.prototype.set = function set(met, value, samp) {
  var error;
  if (!met || !(typeof met === 'string')) {
    error = new Error('Metric must exist and be a string: [' + met + ']');
    return this._onError(error);
  }
  if (!value) {
    error = new Error('Value must exist: [' + met + ']');
    return this._onError(error);
  }
  if (samp && !(typeof samp === 'number')) {
    error = new Error('Sample is optional but must be a number: [' + met + ']');
    return this._onError(error);
  }

  if (this._statsd) {
    this._statsd.set(met, value, samp);
  }
};

YodlrMetric.prototype._defaultErrHandler = function _defaultErrHandler(e) {
  this.emit('error', e);
};

module.exports = YodlrMetric;
