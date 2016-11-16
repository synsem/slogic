// ----------------------------------------
// ParseTree
// ----------------------------------------

export default class ParseTree {

  constructor(type, value, children) {
    this.type = type;         // token type or rule lhs
    this.value = value;       // token value, null for rule
    this.children = children; // child nodes, [] for leaf
  }

  toString() {
    if (this.value !== null) {
      return this.value;
    }
    const subtrees = this.children.map(c => c.toString());
    return `[${this.type} ${subtrees.join(' ')}]`;
  }

}
