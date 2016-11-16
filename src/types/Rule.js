// ----------------------------------------
// Grammar Rule
// ----------------------------------------

export default class Rule {

  // @params:
  // - lhs: a string (non-terminal symbols)
  // - rhs: an array of strings (non-terminal or terminal)
  constructor(lhs, rhs) {
    this.lhs = lhs;
    this.rhs = rhs;
  }

  toString() {
    return `${this.lhs} -> ${this.rhs.join(' ')}`;
  }
}
