const {NDArray} = require('./data_structures.js');


function findPatternPeriod (annotations) {
  annotations = flattenNestedArray(annotations);
  const maxPeriod = Math.max(
    Math.min(Math.floor(annotations.length / 3), 5), 1
  );
  if (annotations.length < maxPeriod * 2) {
    return 0;
  }
  for (let period = 1; period <= maxPeriod; period += 1) {
    // check if annotations[:period] repeats all the results.
    let allSame = true;
    for (let start = 0; start < annotations.length; start += period) {
      allSame = (
        allSame
        && equalArray(
          annotations.slice(0, period),
          annotations.slice(start, start + period)
        )
      );
    }
    if (allSame) {
      return period;
    }
  }
  return 0;
}


function calcAgreeInter(annotations, metric) {
  /* Params:
   * @{Array} annotations:
   * Return: {@Object} where the key is the submission id, and value is the 
   * agreement.
   */
  // Extract answers. 
  let answerss = {};
  for (const annotation of annotations) {
    // answerss[annotation.submissionID] = flattenNestedArray(annotation.answer);
    answerss[annotation.submissionID] = Array.isArray(annotation.answer)
      ? annotation.answer : [annotation.answer];
  }
  let agreements = [];
  let lenAnswer = Object.values(answerss)[0].length;
  for (let i = 0; i < lenAnswer; i += 1) {
    let answerIs = {};  // answer at index i.
    for (const [idSubmit, answers] of Object.entries(answerss)) {
      answerIs[idSubmit] = answers[i];
    }

    if (metric === 'major') {
      // count occurrence 
      let counter = {};
      for (const answer of Object.values(answerIs)) {
        counter[answer] = (counter[answer] || 0) + 1;
      }
      
      // find majority
      let majority;
      let max = -1;
      for (const [ans, count] of Object.entries(counter)) {
        if (count > max) {
          max = count;
          majority = ans;
        } else if (count === max) {
          majority = undefined;  // a tie, thus no majority.
        }        
      }

      // calc agreement
      let agreement = {};
      for (const [idSubmit, answer] of Object.entries(answerIs)) {
        if (majority === undefined) {
          agreement[idSubmit] = undefined; // a tie.
        } else {
          agreement[idSubmit] = (`${answer}` === `${majority}`) ? 1 : 0;
        }
      }
      agreements.push(agreement);
    }    
  }
  // aggregate
  let aggregated = {};
  for (const key in agreements[0]) {
    const scores = agreements.filter(x => x[key] !== undefined).map(x => x[key]);
    if (scores.length === 0) {
      aggregated[key] = undefined;
    } else {
      aggregated[key] = scores.reduce(
        (a1, a2) => (a1 + a2), 0
      ) / scores.length;
    }
    if (typeof(aggregated[key]) !== 'number') {debugger;}
  }  
  return aggregated;
}

function equalArray (xs, ys) {
  if (xs.length != ys.length) {return false;}
  for (let i = 0; i < xs.length; i += 1) {
    if (xs[i] !== ys[i]) {
      return false;
    }
  }
  return true;
}


function flattenNestedArray (xs) {
  if (!Array.isArray(xs)) {
    return [xs];
  } else {
    let flatten = [];
    for (const x of xs) {
      flatten = flatten.concat(flattenNestedArray(x));
    }
    return flatten;
  }
}


function equalAnnotation (xs, ys) {
  /* annotation can be a nested array. */
  if (!Array.isArray(xs)) {
    return `${xs}` === `${ys}`;
  } else {
    for (let i = 0; i < xs.length; i += 1) {
      if (! equalAnnotation(xs[i], ys[i])) {
        return false;
      }
    }
    return true;
  }
}


function calcCohensKappa (answers) {
  /* Params:
   * {@Array} answers[idxUnit][idWorker]
   */
  // grid[w1][w2][a1][a2] is the count that w1 and w2 answer a1 a2
  let grid = new NDArray(() => 0);
  for (const answer of answers) {
    for (const [w1, a1] of Object.entries(answer)) {
      for (const [w2, a2] of Object.entries(answer)) {
        const sA1 = String(a1);
        const sA2 = String(a2);
        if (w1 >= w2) { continue; }
        grid.applyFn(
          x => x + 1,
          [w1, w2, sA1, sA2]
        );
      }
    }
  }
  let kappas = [];
  for (const [w1, w2] of grid.keys(2)) {
    let N = 0;
    let nAgree = 0;
    let n1s = {};
    let n2s = {};
    for (const [a1, a2] of grid.get([w1, w2]).keys(2)) {
      const n = grid.get([w1, w2, a1, a2]);
      N += n;
      if (a1 === a2) {
        nAgree += n;
      }
      n1s[a1] = (n1s[a1] || 0) + n;
      n2s[a2] = (n2s[a2] || 0) + n;
    }
    const po = nAgree / N;
    const pe = Object.entries(n1s).map(
      ([a1, n1]) => ((n1 / N) * ( (n2s[a1] || 0) / N))
    ).reduce((a, b) => (a + b), 0);
    const kappa = (po - pe + 1e-10) / (1 - pe + 1e-10);
    kappas.push(kappa);
  }
  return kappas.reduce((a, b) => (a + b), 0) / kappas.length;
}


function pairwiseF1 (answers) {
  /* Params:
   * {@Array} answers[idxUnit][idWorker]
   */
  let f1s = [];
  for (const [idUnit, unit] of Object.entries(answers)) {
    let unitF1s = [];
    for (const [idWorker1, answer1] of Object.entries(unit)) {
      for (const [idWorker2, answer2] of Object.entries(unit)) {
        if (idWorker1 <= idWorker2) {continue;}
        const set1 = new Set(answer1.map(a => a.value));
        const set2 = new Set(answer2.map(a => a.value));
        const interset = answer1.map(a => a.value).filter(a => set2.has(a));
        const p = interset.length / (set2.size + 1e-10);
        const r = interset.length / (set1.size + 1e-10);
        const f1 = 2 * p * r / (p + r + 1e-10);
        unitF1s.push(f1);
      }      
    }
    debugger;
    f1s.push(unitF1s.reduce((a, b) => a + b, 0) / (unitF1s.length + 1e-10));
  }
  const avg = f1s.reduce((a, b) => a + b, 0) / f1s.length;
  return avg;
}

module.exports = {findPatternPeriod, equalAnnotation, calcAgreeInter,
                  calcCohensKappa, pairwiseF1};
