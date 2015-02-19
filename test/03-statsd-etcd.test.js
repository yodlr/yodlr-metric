var restify = require('restify');
var should = require('should');
var YodlrMetric = require('../');
var dgram = require('dgram');
var _ = require('lodash');
var async = require('async');


describe.skip('03 statsd etcd', function() {

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
    };
    var m = 'test';

    it('should emit event etcdConfig when config received', function(done) {
      var opts = {
        statsd: _.clone(STATSD_OPTS)
      }
      var metric = new YodlrMetric(opts);
      metric.on('etcdConfig', function(event) {
        should.exist(event);
        done();
      })
    });

    it.skip('should support getting host and port from etcd', function(done) {
      s.once('message', function(msg) {
        msg = msg.toString();
        msg.should.eql([m, '1|c'].join(':'));
        done();
      });
      var opts = {
        statsd: _.clone(STATSD_OPTS)
      }
      var metric = new YodlrMetric(opts);
      setTimeout(function() {
        metric.increment(m);
      }, 20)
    });
  });

});

var etcd;
function initEtcd(callback) {

  etcd = restify.createServer();
  etcd.use(restify.bodyParser());
  etcd.use(restify.queryParser());
//  etcd.get('/v2/keys/services/statsd', statsd);
  etcd.get('/v2/keys/services/statsd/host', statsdHost);
  etcd.get('/v2/keys/services/statsd/port', statsdPort);
  etcd.get('/v2/keys/services/statsd/prefix', statsdPrefix);
  /*etcd.get('/v2/keys/services/statsdChange', statsd);
  etcd.get('/v2/keys/services/statsdChange/host', statsdChangeHost);
  etcd.get('/v2/keys/services/statsdChange/port', statsdChangePort);
  etcd.get('/v2/keys/services/statsdChange/prefix', statsdChangePrefix);*/

  etcd.listen(7000, function() {
    callback(null);
  });
};

function stopEtcd(callback) {
  etcd.close(function() {
    callback(null);
  });
};

function statsdHost(req, res) {
  var response = {
    action: "get",
    node: {
      key: "/services/statsd/host",
      value: "localhost",
      modifiedIndex: 1,
      createdIndex: 1
    }
  };
  res.send(200, response);
}

function statsdPort(req, res) {
  var response = {
    action: "get",
    node: {
      key: "/services/statsd/port",
      value: 1234,
      modifiedIndex: 1,
      createdIndex: 1
    }
  };
  res.send(200, response);
}

function statsdPrefix(req, res) {
  var response = {
    action: "get",
    node: {
      key: "/services/statsd/prefix",
      value: 'myprefix',
      modifiedIndex: 1,
      createdIndex: 1
    }
  };
  res.send(200, response);
}
