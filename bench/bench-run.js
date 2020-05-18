'use strict';

const Benchmark = require('benchmark');

module.exports = function (config) {
    const suite = new Benchmark.Suite();

    for (const name in config) {
        config[name]();
        suite.add(name, config[name]);
    }

    suite
        .on('cycle', (event) => {
            console.log(String(event.target));
        })
        .on('complete', () => {
            const fastest = suite.filter('fastest')[0];
            const slowest = suite.filter('slowest')[0];
            console.log(`${fastest.name  } is ${  Math.round(10 * fastest.hz / slowest.hz) / 10  }x faster`);
        })
        .run();
};
