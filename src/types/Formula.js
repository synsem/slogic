// ----------------------------------------
// Formula
// ----------------------------------------

export default class Formula {

  // assert: either value or children must be non-null
  constructor(type, value, children) {
    this.type = type;         // token type or rule lhs
    this.value = value;       // token value, null for rule
    this.children = children; // child nodes, [] for leaf
  }

  showTree() {
    if (this.value !== null) {
      return this.value;
    }
    const subtrees = this.children.map(c => c.showTree());
    return `[${this.type} ${subtrees.join(' ')}]`;
  }

  toString() {
    const c = this.children;
    switch (this.type) {
    case 'iff':
      return `(${c[0]} ↔ ${c[1]})`;
    case 'imp':
      return `(${c[0]} → ${c[1]})`;
    case 'or':
      return `(${c[0]} ∨ ${c[1]})`;
    case 'and':
      return `(${c[0]} ∧ ${c[1]})`;
    case 'not':
      return `¬${c[0]}`;
    case 'atom':
      return `${c[0]}`;
    case 'IDENT':
      return this.value;
    default:
      throw Error(`Unknown node type: ${this.type}`);
    }
  }

  // Format as stringifiable object.
  format() {
    return {
      type: this.type,
      name: this.toString(),
      children: this.children.map(c => c.format())
    };
  }

}
