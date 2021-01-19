const {calcCohensKappa} = require('./quality');


function testCohen () {
  const answers = [
    {a: 1, b: 2},
    {a: 1, b: 2},
    {a: 2, b: 3},
    {a: 1, b: 2},
    {a: 1, b: 3},
    {a: 3, b: 1}, // 4 disagree
    {a: 1, b: 1},
    {a: 2, b: 2},
    {a: 3, b: 3},
    {a: 1, b: 1}, // 4 agree
  ];
  // Grid:
  //          a 
  //     | 1  2  3
  //  ---+--------
  //   1 | 2  0  1
  // b 2 | 3  1  0
  //   3 | 1  1  1
  //
  // po = 0.4
  // p_{a1} = 0.6
  // p_{a2} = 0.2
  // p_{a3} = 0.2
  // p_{b1} = 0.3
  // p_{b2} = 0.4
  // p_{b3} = 0.3
  // pe = 0.6 * 0.3 + 0.2 * 0.4 + 0.2 * 0.3 = 0.32
  // kappa = (0.4 - 0.32) / (1 - 0.32) = 0.1176
  console.log(calcCohensKappa(answers));
}


function testCohen2 () {
  const answers = [
    {a: 1, b: 2},
    {a: 2, b: 2},
    {a: 1, b: 1},
    {a: 1, b: 1},
    {a: 2, b: 2},
    {a: 1, b: 1}, // 4 disagree
    {a: 1, b: 1},
    {a: 1, b: 1},
    {a: 1, b: 1},
    {a: 1, b: 1}, // 4 agree
  ];
  // po = 0.9
  // p_{a1} = 1.0
  // p_{a2} = 0.0
  // p_{a3} = 0.0
  // p_{b1} = 0.9
  // p_{b2} = 0.1
  // p_{b3} = 0.0
  // pe = 1.0 * 0.9 = 0.9
  // kappa = (0.9 - 0.9) / (1 - 0.9) = 0.1176

  console.log(calcCohensKappa(answers), 'expect 1');
}

// testCohen();
testCohen2();
