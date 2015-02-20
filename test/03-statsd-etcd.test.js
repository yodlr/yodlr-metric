var restify = require('restify');
var should = require('should');
var YodlrMetric = require('../');
var dgram = require('dgram');
var _ = require('lodash');
var async = require('async');


describe('03 statsd etcd', function() {
  this.timeout(80);
  beforeEach(function() {
    statsHostChanged = false;
    statsPortChanged = false;
    statsPrefixChanged = false;
  });

  var s;
  var sChange;
  var m;
  before(function (done){
    async.parallel([
      function(callback) {
        s = dgram.createSocket('udp4');
        s.bind(1234, callback);
      },
      function(callback) {
        sChange = dgram.createSocket('udp4');
        sChange.bind(12345, callback);
      },
      function(callback) {
        initEtcd(callback);
      }
    ], done);
  });
  after(stopEtcd);

  describe('static etcd config', function() {
    var STATSD_OPTS = {
      hostEtcd: '/services/statsd/host',
      portEtcd: '/services/statsd/port',
      prefixEtcd: '/services/statsd/prefix'
    };
    var m = 'test';

    it('should emit event etcdConfig when config received', function(done) {
      var opts = {
        etcdHost: 'localhost',
        etcdPort: 4001,
        statsd: _.clone(STATSD_OPTS)
      }
      var metric = new YodlrMetric(opts);
      metric.on('etcdInitConfig', function(config) {
        should.exist(config);
        should.exist(config.host);
        config.host.should.eql('localhost')
        should.exist(config.port);
        config.port.should.eql(1234);
        done();
      });
    });

    it('should support getting host, port, prefix from etcd', function(done) {
      s.once('message', function(msg) {
        msg = msg.toString();
        msg.should.eql([['myprefix', m].join('.'), '1|c'].join(':'));
        done();
      });
      var opts = {
        etcdHost: 'localhost',
        etcdPort: 4001,
        statsd: _.clone(STATSD_OPTS)
      }
      var metric = new YodlrMetric(opts);
      metric.on('etcdInitConfig', function(config) {
        should.exist(config);
        should.exist(config.host);
        config.host.should.eql('localhost')
        should.exist(config.port);
        config.port.should.eql(1234);
        metric.increment(m);
      })
    });
  });

  describe('dynamic etcd config', function() {

    var STATSD_OPTS = {
      hostEtcd: '/services/statsdChange/host',
      portEtcd: '/services/statsdChange/port',
      prefixEtcd: '/services/statsdChange/prefix'
    };
    var m = 'test';

    it('should emit event etcdConfig when config received', function(done) {
      var opts = {
        etcdHost: 'localhost',
        etcdPort: 4001,
        statsd: _.clone(STATSD_OPTS)
      }
      var metric = new YodlrMetric(opts);
      metric.once('etcdInitConfig', function(config) {
        should.exist(config);
        should.exist(config.host);
        config.host.should.eql('localhost')
        should.exist(config.port);
        config.port.should.eql(1234);
        metric.stop();
        done();
      });
    });

    it('should support getting host, port, prefix from etcd', function(done) {
      sChange.once('message', function(msg) {
        msg = msg.toString();
        msg.should.eql([['changedprefix', m].join('.'), '1|c'].join(':'));
        done();
      });
      var opts = {
        etcdHost: 'localhost',
        etcdPort: 4001,
        statsd: _.clone(STATSD_OPTS)
      }
      var metric = new YodlrMetric(opts);
      metric.on('etcdConfigChanged', function(config) {
        if (config.host !== '127.0.0.1'
            || config.port !== 12345
            || config.prefix !== 'changedprefix') {
          return;
        }
        should.exist(config);
        should.exist(config.host);
        config.host.should.eql('127.0.0.1')
        should.exist(config.port);
        config.port.should.eql(12345);
        should.exist(config.prefix);
        config.prefix.should.eql('changedprefix');
        setTimeout(function() {
          metric.increment(m);
          metric.stop();
        }, 20);
      })
    });
  });

});

var etcd;
function initEtcd(callback) {

  etcd = restify.createServer();
  etcd.use(restify.bodyParser());
  etcd.use(restify.queryParser());
  etcd.get('/v2/keys/services/statsd/host', statsdHost);
  etcd.get('/v2/keys/services/statsd/port', statsdPort);
  etcd.get('/v2/keys/services/statsd/prefix', statsdPrefix);
  etcd.get('/v2/keys/services/statsdChange/host', statsdChangeHost);
  etcd.get('/v2/keys/services/statsdChange/port', statsdChangePort);
  etcd.get('/v2/keys/services/statsdChange/prefix', statsdChangePrefix);

  etcd.listen(4001, function() {
    callback(null);
  });
};

function stopEtcd(callback) {
  etcd.close();
  callback();
};

var statsHostChanged = false;
function statsdHost(req, res) {
  if (statsHostChanged) {
    return;
  }
  var response = {
    action: "get",
    node: {
      key: "/services/statsd/host",
      value: "localhost",
      modifiedIndex: 1,
      createdIndex: 1
    }
  };
  statsHostChanged = true;
  res.send(200, response);
}

function statsdPort(req, res) {
  if (statsPortChanged) {
    return;
  }
  var response = {
    action: "get",
    node: {
      key: "/services/statsd/port",
      value: 1234,
      modifiedIndex: 1,
      createdIndex: 1
    }
  };
  statsPortChanged = true;
  res.send(200, response);
}

function statsdPrefix(req, res) {
  if (statsPrefixChanged) {
    return;
  }
  var response = {
    action: "get",
    node: {
      key: "/services/statsd/prefix",
      value: 'myprefix',
      modifiedIndex: 1,
      createdIndex: 1
    }
  };
  statsPrefixChanged = true;
  res.send(200, response);
}

function statsdChangeHost(req, res) {
  if (statsHostChanged) {
    return;
  }
  var response = {
    action: "get",
    node: {
      key: "/services/statsdChange/host",
      value: "localhost",
      modifiedIndex: 1,
      createdIndex: 1
    }
  };
  if (req.query.wait) {
    response.action = 'set';
    response.node.value = '127.0.0.1';
    response.node.modifiedIndex = 2;
    statsHostChanged = true;
  }
  res.send(200, response);
}

function statsdChangePort(req, res) {
  if (statsPortChanged) {
    return;
  }
  var response = {
    action: "get",
    node: {
      key: "/services/statsdChange/port",
      value: 1234,
      modifiedIndex: 1,
      createdIndex: 1
    }
  };
  if (req.query.wait) {
    response.action = 'set';
    response.node.value = 12345;
    response.node.modifiedIndex = 3;
    statsPortChanged = true;
  }
  res.send(200, response);
}

function statsdChangePrefix(req, res) {
  if (statsPrefixChanged) {
    return;
  }
  var response = {
    action: "get",
    node: {
      key: "/services/statsdChange/prefix",
      value: 'myprefix',
      modifiedIndex: 1,
      createdIndex: 1
    }
  };
  if (req.query.wait) {
    response.action = 'set';
    response.node.value = 'changedprefix';
    response.node.modifiedIndex = 4;
    statsPrefixChanged = true;
  }
  res.send(200, response);
}
