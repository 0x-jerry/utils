const Benchmark = require('benchmark')

const suite = new Benchmark.Suite()

// add tests
suite
  .add('case#1', function () {
    //
  })
  .add('case#2', function () {
    //
  })
  // add listeners
  .on('cycle', function (event) {
    console.log(String(event.target))
  })
  .on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'))
  })
  // run async
  .run({ async: true })
