var should = require('should');
var YodlrMetric = require('../');
var dgram = require('dgram');
var _ = require('lodash');

describe('02 statsd static', function() {
  var s;
  var m;
  before(function (done){
    s = dgram.createSocket('udp4');
    s.bind(1234, done);
  });

  after(function (done) {
    if (s) {
      s.close();
    }
    done();
  });

  var STATSD_OPTS = {
    host: 'localhost',
    port: 1234
  };

  describe('prefix', function() {
    var p = 'outside_prefix';
    var sp = 'statsd_prefix';
    var m = 'test';

    it('should support prefix (i.e. account) for just statsd', function(done) {
      s.once('message', function(msg) {
        msg = msg.toString();
        msg.should.eql([[sp, m].join('.'), '1|c'].join(':'));
        done();
      });
      var opts = {
        statsd: _.clone(STATSD_OPTS)
      }
      opts.statsd.prefix = sp;

      var metric = new YodlrMetric(opts);
      metric.increment(m);
    });

    it('should support a common prefix', function(done) {
      s.once('message', function(msg) {
        msg = msg.toString();
        msg.should.eql([[p, m].join('.'), '1|c'].join(':'));
        done();
      });
      var opts = {
        prefix: p,
        statsd: _.clone(STATSD_OPTS)
      }
      var metric = new YodlrMetric(opts);
      metric.increment(m);
    });

    it('should put statsd prefix before common prefix', function(done) {
      s.once('message', function(msg) {
        msg = msg.toString();
        msg.should.eql([[sp, p, m].join('.'), '1|c'].join(':'));
        done();
      });
      var opts = {
        prefix: p,
        statsd: _.clone(STATSD_OPTS)
      };
      opts.statsd.prefix = sp;
      var metric = new YodlrMetric(opts);
      metric.increment(m);
    });
  });

  describe('count', function() {
    var m = 'counter';
    var opts = {
      statsd: _.clone(STATSD_OPTS)
    }
    var metric = new YodlrMetric(opts);
    it('should support positive counts', function(done) {
      s.once('message', function(msg) {
        msg = msg.toString();
        msg.should.eql(m + ':5|c');
        done();
      });
      metric.count(m, 5);
    });

    it('should support negative counts', function(done) {
      s.once('message', function(msg) {
        msg = msg.toString();
        msg.should.eql(m + ':-5|c');
        done();
      });
      metric.count(m, -5);
    });

    it('should support sampling counts', function(done) {
      s.once('message', function(msg) {
        msg = msg.toString();
        msg.should.eql(m + ':1|c|@1');
        done();
      });
      metric.count(m, 1, 1);
    });
  });

  describe('increment', function() {
    var m = 'inc';
    var opts = {
      statsd: _.clone(STATSD_OPTS)
    }
    var metric = new YodlrMetric(opts);
    it('should increment count by 1', function(done) {
      s.once('message', function(msg) {
        msg = msg.toString();
        msg.should.eql(m + ':1|c');
        done();
      });
      metric.increment(m);
    });

    it('should support sampling counts', function(done) {
      s.once('message', function(msg) {
        msg = msg.toString();
        msg.should.eql(m + ':1|c|@1');
        done();
      });
      metric.increment(m, 1);
    });
  });

  describe('decrement', function() {
    var m = 'dec';
    var opts = {
      statsd: _.clone(STATSD_OPTS)
    }
    var metric = new YodlrMetric(opts);
    it('should decrement count by 1', function(done) {
      s.once('message', function(msg) {
        msg = msg.toString();
        msg.should.eql(m + ':-1|c');
        done();
      });
      metric.decrement(m);
    });

    it('should support sampling counts', function(done) {
      s.once('message', function(msg) {
        msg = msg.toString();
        msg.should.eql(m + ':-1|c|@1');
        done();
      });
      metric.decrement(m, 1);
    });
  });

  describe('timing', function() {
    var m = 'timing';
    var opts = {
      statsd: _.clone(STATSD_OPTS)
    }
    var metric = new YodlrMetric(opts);
    it('should support basic timing', function(done) {
      s.once('message', function(msg) {
        msg = msg.toString();
        msg.should.eql(m + ':50|ms');
        done();
      });
      metric.timing(m, 50);
    });

    it('should support sampling counts', function(done) {
      s.once('message', function(msg) {
        msg = msg.toString();
        msg.should.eql(m + ':50|ms|@1');
        done();
      });
      metric.timing(m, 50, 1);
    });
  });

  describe('createTimer', function() {
    var m = 'timer';
    var opts = {
      statsd: _.clone(STATSD_OPTS)
    }
    var metric = new YodlrMetric(opts);
    it('should create a timer object with stop()', function(done) {
      s.once('message', function(msg) {
        msg = msg.toString();
        msg.should.startWith(m);
        var ms = Number(msg.split(':')[1].split('|')[0]);
        ms.should.be.within(29, 40);
        done();
      });
      var timer = metric.createTimer(m);
      setTimeout(function() {
        timer.stop();
      }, 30);
    });

    it('should support sampling counts', function(done) {
      s.once('message', function(msg) {
        msg = msg.toString();
        msg.should.startWith(m);
        var ms = Number(msg.split(':')[1].split('|')[0]);
        ms.should.be.within(29, 40);
        msg.should.endWith('|@1');
        done();
      });
      var timer = metric.createTimer(m, 1);
      setTimeout(function() {
        timer.stop();
      }, 30);
    });
  });

  describe('gauge', function() {
    var m = 'gauge';
    var opts = {
      statsd: _.clone(STATSD_OPTS)
    }
    var metric = new YodlrMetric(opts);
    it('should support positive gauge', function(done) {
      s.once('message', function(msg) {
        msg = msg.toString();
        msg.should.eql(m + ':50|g');
        done();
      });
      metric.gauge(m, 50);
    });

    it('should support negative counts', function(done) {
      s.once('message', function(msg) {
        msg = msg.toString();
        msg.should.eql(m + ':-50|g');
        done();
      });
      metric.gauge(m, -50);
    });

    it('should support sampling counts', function(done) {
      s.once('message', function(msg) {
        msg = msg.toString();
        msg.should.eql(m + ':75|g|@1');
        done();
      });
      metric.gauge(m, 75, 1);
    });
  });

  describe('set', function() {
    var m = 'set';
    var opts = {
      statsd: _.clone(STATSD_OPTS)
    }
    var metric = new YodlrMetric(opts);
    it('should support positive number', function(done) {
      s.once('message', function(msg) {
        msg = msg.toString();
        msg.should.eql(m + ':50|s');
        done();
      });
      metric.set(m, 50);
    });

    it('should support negative number', function(done) {
      s.once('message', function(msg) {
        msg = msg.toString();
        msg.should.eql(m + ':-50|s');
        done();
      });
      metric.set(m, -50);
    });

    it('should support strings', function(done) {
      s.once('message', function(msg) {
        msg = msg.toString();
        msg.should.eql(m + ':hello|s');
        done();
      });
      metric.set(m, 'hello');
    });

    it('should support sampling counts', function(done) {
      s.once('message', function(msg) {
        msg = msg.toString();
        msg.should.eql(m + ':fred|s|@1');
        done();
      });
      metric.set(m, 'fred', 1);
    });
  });
});
