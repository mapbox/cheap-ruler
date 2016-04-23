'use strict';

var Benchmark = require('benchmark');

module.exports = function (config) {
    var suite = new Benchmark.Suite();

    for (var name in config) {
        suite.add(name, config[name]);
    }

    suite
    .on('cycle', function (event) {
        console.log(String(event.target));
    })
    .on('complete', function () {
        var fastest = this.filter('fastest')[0];
        var slowest = this.filter('slowest')[0];
        console.log(fastest.name + ' is ' + (Math.round(10 * fastest.hz / slowest.hz) / 10) + 'x faster');
    })
    .run();
};
