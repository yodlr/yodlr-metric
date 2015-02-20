var should = require('should');
var YodlrMetric = require('../');
describe('01 Constructor', function() {
  this.timeout(50);

  it('should return instanceof YodlrMetrics', function() {
    var metric = YodlrMetric();
    metric.should.be.instanceof(YodlrMetric);
  });

  it('should return instanceof YodlrMetrics with new', function() {
    var metric = new YodlrMetric();
    metric.should.be.instanceof(YodlrMetric);
  });

  it('should default prefix to empty string', function() {
    var metric = new YodlrMetric();
    metric.prefix.should.equal('');
  });

  it('should optionally accept a prefix option', function() {
    var opts = {
      prefix: 'services.myapp'
    };
    var metric = new YodlrMetric(opts);
    metric.prefix.should.equal(opts.prefix);
  });

  describe('statsd option', function() {
    it('should throw if no host or hostEtcd', function() {
      var opts = {
        statsd: {
          port: 500
        }
      };
      (function() {
        var metric = new YodlrMetric(opts);
      }).should.throw('Statsd option must include either host or hostEtcd');
    });

    it('should accept host without hostEtcd', function() {
      var opts = {
        statsd: {
          host: 'stuff',
          port: 500
        }
      }
      should.doesNotThrow(function() {
        var metric = new YodlrMetric(opts);
      });
    });

    it('should accept hostEtcd without host', function() {
      var opts = {
        statsd: {
          hostEtcd: 'stuff',
          port: 500
        }
      }
      should.doesNotThrow(function() {
        var metric = new YodlrMetric(opts);
      });
    });

    it('should throw if both host and hostEtcd', function() {
      var opts = {
        statsd: {
          host: 'test',
          hostEtcd: 'test2',
          port: 500
        }
      };
      (function() {
        var metric = new YodlrMetric(opts);
      }).should.throw('Statsd option can\'t include both host and hostEtcd');
    });

    it('should throw if no port or portEtcd', function() {
      var opts = {
        statsd: {
          host: 'test'
        }
      };
      (function() {
        var metric = new YodlrMetric(opts);
      }).should.throw('Statsd option must include either port or portEtcd');
    });

    it('should accept port without portEtcd', function() {
      var opts = {
        statsd: {
          host: 'test',
          port: 500
        }
      }
      should.doesNotThrow(function() {
        var metric = new YodlrMetric(opts);
      });
    });

    it('should accept portEtcd without port', function() {
      var opts = {
        statsd: {
          host: 'test',
          portEtcd: 'portetcd'
        }
      }
      should.doesNotThrow(function() {
        var metric = new YodlrMetric(opts);
      });
    });

    it('should throw if both port and portEtcd', function() {
      var opts = {
        statsd: {
          host: 'test',
          port: 500,
          portEtcd: 'portEtcd'
        }
      };
      (function() {
        var metric = new YodlrMetric(opts);
      }).should.throw('Statsd option can\'t include both port and portEtcd');
    });


    it('should accept prefix without prefixEtcd', function() {
      var opts = {
        statsd: {
          host: 'host',
          port: 500,
          prefix: 'stuff'
        }
      }
      should.doesNotThrow(function() {
        var metric = new YodlrMetric(opts);
      });
    });

    it('should accept prefixEtcd without prefix', function() {
      var opts = {
        statsd: {
          host: 'host',
          port: 500,
          prefixEtcd: 'stuff'
        }
      }
      should.doesNotThrow(function() {
        var metric = new YodlrMetric(opts);
      });
    });

    it('should throw if both prefix and prefixEtcd', function() {
      var opts = {
        statsd: {
          host: 'host',
          port: 500,
          prefix: 'test',
          prefixEtcd: 'test2'
        }
      };
      (function() {
        var metric = new YodlrMetric(opts);
      }).should.throw('Statsd option can\'t include both prefix and prfixEtcd');
    });
  });

  describe('prototype functions', function() {
    var metric = new YodlrMetric();

    describe('count', function() {
      it('should expose count function', function() {
        should.exist(metric.count);
        metric.count.should.be.an.instanceof(Function);
      });

      it('calling without params should emit error', function(done) {
        metric.once('error', function metricError(err) {
          should.exist(err);
          err.should.be.an.instanceof(Error);
          err.message.should.containEql('Metric must exist and be a string');
          done();
        });
        metric.count();
      });

      it('calling with non-string metric should emit error', function(done) {
        metric.once('error', function metricError(err) {
          should.exist(err);
          err.should.be.an.instanceof(Error);
          err.message.should.containEql('Metric must exist and be a string');
          done();
        });
        metric.count(123);
      });

      it('calling with non-existant Delta should emit error', function(done) {
        metric.once('error', function metricError(err) {
          should.exist(err);
          err.should.be.an.instanceof(Error);
          err.message.should.containEql('Delta must exist and be a number');
          done();
        });
        metric.count('my.metric');
      });

      it('calling with non-number Delta should emit error', function(done) {
        metric.once('error', function metricError(err) {
          should.exist(err);
          err.should.be.an.instanceof(Error);
          err.message.should.containEql('Delta must exist and be a number');
          done();
        });
        metric.count('my.metric', 'shouldbeanum');
      });

      it('calling with non-number sample should emit error', function(done) {
        metric.once('error', function metricError(err) {
          should.exist(err);
          err.should.be.an.instanceof(Error);
          err.message.should.containEql('Sample is optional but must be a number');
          done();
        });
        metric.count('my.metric', 5, 'sample');
      });
    });

    describe('increment', function() {
      it('should expose increment function', function() {
        should.exist(metric.increment);
        metric.increment.should.be.an.instanceof(Function);
      });

      it('calling without params should emit error', function(done) {
        metric.once('error', function metricError(err) {
          should.exist(err);
          err.should.be.an.instanceof(Error);
          err.message.should.containEql('Metric must exist and be a string');
          done();
        });
        metric.increment();
      });

      it('calling with non-string metric should emit error', function(done) {
        metric.once('error', function metricError(err) {
          should.exist(err);
          err.should.be.an.instanceof(Error);
          err.message.should.containEql('Metric must exist and be a string');
          done();
        });
        metric.increment(123);
      });

      it('calling with non-number sample should emit error', function(done) {
        metric.once('error', function metricError(err) {
          should.exist(err);
          err.should.be.an.instanceof(Error);
          err.message.should.containEql('Sample is optional but must be a number');
          done();
        });
        metric.increment('my.metric', 'sample');
      });
    });

    describe('decrement', function() {
      it('should expose decrement function', function() {
        should.exist(metric.decrement);
        metric.increment.should.be.an.instanceof(Function);
      });

      it('calling without params should emit error', function(done) {
        metric.once('error', function metricError(err) {
          should.exist(err);
          err.should.be.an.instanceof(Error);
          err.message.should.containEql('Metric must exist and be a string');
          done();
        });
        metric.decrement();
      });

      it('calling with non-string metric should emit error', function(done) {
        metric.once('error', function metricError(err) {
          should.exist(err);
          err.should.be.an.instanceof(Error);
          err.message.should.containEql('Metric must exist and be a string');
          done();
        });
        metric.decrement(123);
      });

      it('calling with non-number sample should emit error', function(done) {
        metric.once('error', function metricError(err) {
          should.exist(err);
          err.should.be.an.instanceof(Error);
          err.message.should.containEql('Sample is optional but must be a number');
          done();
        });
        metric.decrement('my.metric', 'sample');
      });
    });

    describe('timing', function() {
      it('should expose timing function', function() {
        should.exist(metric.count);
        metric.timing.should.be.an.instanceof(Function);
      });

      it('calling without params should emit error', function(done) {
        metric.once('error', function metricError(err) {
          should.exist(err);
          err.should.be.an.instanceof(Error);
          err.message.should.containEql('Metric must exist and be a string');
          done();
        });
        metric.timing();
      });

      it('calling with non-string metric should emit error', function(done) {
        metric.once('error', function metricError(err) {
          should.exist(err);
          err.should.be.an.instanceof(Error);
          err.message.should.containEql('Metric must exist and be a string');
          done();
        });
        metric.timing(123);
      });

      it('calling with non-existant time should emit error', function(done) {
        metric.once('error', function metricError(err) {
          should.exist(err);
          err.should.be.an.instanceof(Error);
          err.message.should.containEql('Delta must exist and be a number');
          done();
        });
        metric.timing('my.metric');
      });

      it('calling with non-number time should emit error', function(done) {
        metric.once('error', function metricError(err) {
          should.exist(err);
          err.should.be.an.instanceof(Error);
          err.message.should.containEql('Delta must exist and be a number');
          done();
        });
        metric.timing('my.metric', 'shouldbeanum');
      });

      it('calling with non-number sample should emit error', function(done) {
        metric.once('error', function metricError(err) {
          should.exist(err);
          err.should.be.an.instanceof(Error);
          err.message.should.containEql('Sample is optional but must be a number');
          done();
        });
        metric.timing('my.metric', 5, 'sample');
      });
    });

    describe('createTimer', function() {
      it('should expose createTimer function', function() {
        should.exist(metric.count);
        metric.createTimer.should.be.an.instanceof(Function);
      });

      it('calling without params should emit error', function(done) {
        metric.once('error', function metricError(err) {
          should.exist(err);
          err.should.be.an.instanceof(Error);
          err.message.should.containEql('Metric must exist and be a string');
          done();
        });
        metric.createTimer();
      });

      it('calling with non-string metric should emit error', function(done) {
        metric.once('error', function metricError(err) {
          should.exist(err);
          err.should.be.an.instanceof(Error);
          err.message.should.containEql('Metric must exist and be a string');
          done();
        });
        metric.createTimer(123);
      });

      it('calling with non-number sample should emit error', function(done) {
        metric.once('error', function metricError(err) {
          should.exist(err);
          err.should.be.an.instanceof(Error);
          err.message.should.containEql('Sample is optional but must be a number');
          done();
        });
        metric.createTimer('my.metric', 'sample');
      });

      it('should return createTimer with stop() function', function() {
        var timer = metric.createTimer('my.timer');
        should.exist(timer);
        should.exist(timer.stop);
        timer.stop.should.be.an.instanceof(Function);
      });
    });

    describe('gauge', function() {
      it('should expose gauge function', function() {
        should.exist(metric.gauge);
        metric.gauge.should.be.an.instanceof(Function);
      });

      it('calling without params should emit error', function(done) {
        metric.once('error', function metricError(err) {
          should.exist(err);
          err.should.be.an.instanceof(Error);
          err.message.should.containEql('Metric must exist and be a string');
          done();
        });
        metric.gauge();
      });

      it('calling with non-string metric should emit error', function(done) {
        metric.once('error', function metricError(err) {
          should.exist(err);
          err.should.be.an.instanceof(Error);
          err.message.should.containEql('Metric must exist and be a string');
          done();
        });
        metric.gauge(123);
      });

      it('calling with non-existant Value should emit error', function(done) {
        metric.once('error', function metricError(err) {
          should.exist(err);
          err.should.be.an.instanceof(Error);
          err.message.should.containEql('Value must exist and be a number');
          done();
        });
        metric.gauge('my.metric');
      });

      it('calling with non-number Value should emit error', function(done) {
        metric.once('error', function metricError(err) {
          should.exist(err);
          err.should.be.an.instanceof(Error);
          err.message.should.containEql('Value must exist and be a number');
          done();
        });
        metric.gauge('my.metric', 'shouldbeanum');
      });

      it('calling with non-number sample should emit error', function(done) {
        metric.once('error', function metricError(err) {
          should.exist(err);
          err.should.be.an.instanceof(Error);
          err.message.should.containEql('Sample is optional but must be a number');
          done();
        });
        metric.gauge('my.metric', 5, 'sample');
      });
    });

    describe('set', function() {
      it('should expose set function', function() {
        should.exist(metric.set);
        metric.set.should.be.an.instanceof(Function);
      });

      it('calling without params should emit error', function(done) {
        metric.once('error', function metricError(err) {
          should.exist(err);
          err.should.be.an.instanceof(Error);
          err.message.should.containEql('Metric must exist and be a string');
          done();
        });
        metric.set();
      });

      it('calling with non-string metric should emit error', function(done) {
        metric.once('error', function metricError(err) {
          should.exist(err);
          err.should.be.an.instanceof(Error);
          err.message.should.containEql('Metric must exist and be a string');
          done();
        });
        metric.set(123);
      });

      it('calling with non-existant Value should emit error', function(done) {
        metric.once('error', function metricError(err) {
          should.exist(err);
          err.should.be.an.instanceof(Error);
          err.message.should.containEql('Value must exist');
          done();
        });
        metric.set('my.metric');
      });

      it('calling with non-number sample should emit error', function(done) {
        metric.once('error', function metricError(err) {
          should.exist(err);
          err.should.be.an.instanceof(Error);
          err.message.should.containEql('Sample is optional but must be a number');
          done();
        });
        metric.set('my.metric', 5, 'sample');
      });
    });

  });
});
