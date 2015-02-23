var eventemitter3 = require('eventemitter3').EventEmitter;
var Lynx = require('lynx');
var Etcd = require('node-etcd');
var async = require('async');
var util = require('util');

var Statsd = module.exports = function Statsd(opts) {
  eventemitter3.call(this);
  this.host = opts.host;
  this.port = opts.port;
  this.scope = opts.scope;
  this.onError = opts.onError;
  this.hostEtcd = opts.hostEtcd;
  this.portEtcd = opts.portEtcd;
  this.prefixEtcd = opts.prefixEtcd;
  this.etcdHost = opts.etcdHost;
  this.etcdPort = opts.etcdPort;

  if (opts.host && opts.port) {
    this._genLynx();
  }
  else {
    this._setupEtcdWatch();
  }
};
util.inherits(Statsd, eventemitter3);

Statsd.prototype.stop = function stop() {
  var self = this;
  if (self._hostWatcher) {
    self._hostWatcher.stop();
    self._hostWatcher = null;
  }
  if (self._portWatcher) {
    self._portWatcher.stop();
    self._portWatcher = null;
  }
  if (self._prefixWatcher) {
    self._prefixWatcher.stop();
    self._prefixWatcher = null;
  }
};

Statsd.prototype._genLynx = function _getLynx() {
  this._lynx = new Lynx(this.host, this.port, {
    //jscs:disable
    on_error: this.onError,
    //jscs:enable
    scope: this.scope
  });
};

Statsd.prototype._setupEtcdWatch = function _setupEtcdWatch() {
  var self = this;
  self._etcd = new Etcd(this.etcdHost, this.etcdPort);

  async.parallel([
    function hostAsync(callback) {
      if (!self.hostEtcd) {
        return callback();
      }
      self._etcd.get(self.hostEtcd, function hostGet(err, data) {
        if (err) {
          return callback(err);
        }
        self.host = data.node.value;

        self._hostWatcher = self._etcd.watcher(self.hostEtcd);
        self._hostWatcher.on('change', function hostWatch(data) {
          self.host = data.node.value;
          self.emit('etcdConfigChanged', {
            host: self.host,
            port: self.port,
            prefix: self.scope
          });
          self._genLynx();
        });

        return callback();
      });
    },
    function portAsync(callback) {
      if (!self.portEtcd) {
        return callback();
      }
      self._etcd.get(self.portEtcd, function hostGet(err, data) {
        if (err) {
          return callback(err);
        }
        self.port = Number(data.node.value);

        self._portWatcher = self._etcd.watcher(self.portEtcd);
        self._portWatcher.on('change', function portWatch(data) {
          self.port = data.node.value;
          self._genLynx();
          self.emit('etcdConfigChanged', {
            host: self.host,
            port: self.port,
            prefix: self.scope
          });
        });
        return callback();
      });
    },
    function prefixAsync(callback) {
      if (!self.prefixEtcd) {
        return callback();
      }
      self._etcd.get(self.prefixEtcd, function hostGet(err, data) {
        if (err) {
          return callback(err);
        }
        self.scope = data.node.value;
        self._prefixWatcher = self._etcd.watcher(self.prefixEtcd);
        self._prefixWatcher.on('change', function prefixWatch(data) {
          self.scope = data.node.value;
          self.emit('etcdConfigChanged', {
            host: self.host,
            port: self.port,
            prefix: self.scope
          });
          self._genLynx();
        });
        return callback();
      });
    }
  ], function asyncErr(err) {
    if (err) {
      return self.emit('error', err);
    }

    self._genLynx();

    return self.emit('etcdInitConfig', {
      host: self.host,
      port: self.port,
      prefix: self.scope
    });
  });
};

Statsd.prototype.count = function count(met, delta, samp) {
  if (!this._lynx) {
    return;
  }
  this._lynx.count(met, delta, samp);
};

Statsd.prototype.increment = function increment(met, samp) {
  if (!this._lynx) {
    return;
  }
  this._lynx.increment(met, samp);
};

Statsd.prototype.decrement = function decrement(met, samp) {
  if (!this._lynx) {
    return;
  }
  this._lynx.decrement(met, samp);
};

Statsd.prototype.timing = function timing(met, delta, samp) {
  if (!this._lynx) {
    return;
  }
  this._lynx.timing(met, delta, samp);
};

Statsd.prototype.createTimer = function createTimer(met, samp) {
  if (!this._lynx) {
    return {
      stop: function stop() {}
    };
  }
  return this._lynx.createTimer(met, samp);
};

Statsd.prototype.gauge = function gauge(met, value, samp) {
  if (!this._lynx) {
    return;
  }
  this._lynx.gauge(met, value, samp);
};

Statsd.prototype.set = function set(met, value, samp) {
  if (!this._lynx) {
    return;
  }
  this._lynx.set(met, value, samp);
};
