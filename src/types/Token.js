// ----------------------------------------
// Token
// ----------------------------------------

export default class Token {

  constructor(type, value) {
    this.type = type;
    this.value = value;
  }

  toString() {
    return `${this.type}('${this.value}')`;
  }

  equals(other) {
    return (other.hasOwnProperty('type') &&
            other.hasOwnProperty('value') &&
            other.type === this.type &&
            other.value === this.value);
  }

}
