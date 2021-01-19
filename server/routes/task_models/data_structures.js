class NDArray {
  constructor (constructorDefault) {
    this.root = {};
    this.constructorDefault = constructorDefault;
  }

  get (keys) {
    let node = this.root;
    for (const key of keys.slice(0, -1)) {
      if (node[key] === undefined) {
        node[key] = new NDArray(this.constructorDefault);
      }
      node = node[key].root;
    }
    if (node[keys[keys.length - 1]] === undefined) {
      node[keys[keys.length - 1]] = this.constructorDefault();
    }
    return node[keys[keys.length - 1]];
  }

  applyFn (fn, keys) {
    /* Execute  x[keys] = fn(x[keys]) */
    let node = this.root;
    for (const key of keys.slice(0, -1)) {
      if (node[key] === undefined) {
        node[key] = new NDArray(this.constructorDefault);
      }
      node = node[key].root;
    }
    if (node[keys[keys.length - 1]] === undefined) {
      node[keys[keys.length - 1]] = this.constructorDefault();
    }
    node[keys[keys.length - 1]] = fn(node[keys[keys.length - 1]]);    
  }

  keys (depth=-1, node=undefined) {
    if (depth == 0) { return [[]]; }
    depth = depth - 1;
    node = node || this.root;
    let keys = [];
    for (const [k, v] of Object.entries(node)) {
      if (v.root !== undefined) {
        keys = keys.concat(
          this.keys(depth, v.root).map(ks => [k].concat(ks))
        );
      } else {
        keys.push([k]);
      }
    }
    return keys;
  }
}

module.exports = {NDArray};
