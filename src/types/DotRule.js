// ----------------------------------------
// Dotted Grammar Rule
// ----------------------------------------

export default class DotRule {

  // @params:
  // - lhs: a string (non-terminal symbol)
  // - seen: an array of Tokens and/or PartialParses
  // - unseen: an array of strings (non-terminal or terminal symbols)
  // - offset: integer
  constructor(lhs, seen, unseen, offset) {
    this.lhs = lhs;
    this.seen = seen;
    this.unseen = unseen;
    this.offset = offset;
  }

  toString() {
    return `${this.lhs} -> ${this.seen.join(',')} . ${this.unseen} @${this.offset}`;
  }

  // deepStrictEqual
  equals(other) {
    if (this.lhs !== other.lhs || this.offset !== other.offset ||
        this.seen.length !== other.seen.length ||
        this.unseen.length !== other.unseen.length) {
      return false;
    } else {
      for (let i = 0; i < this.seen.length; i++) {
        // Token or PartialParse
        if (!(this.seen[i].equals(other.seen[i]))) {
          return false;
        }
      }
      for (let i = 0; i < this.unseen.length; i++) {
        if (this.unseen[i] !== other.unseen[i]) {
          return false;
        }
      }
    }
    return true;
  }

}
