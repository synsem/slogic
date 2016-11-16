// ----------------------------------------
// PartialParse
// ----------------------------------------

export default class PartialParse {

  constructor(type, chartidx, ruleid) {
    this.type = type;
    this.chartidx = chartidx;
    this.ruleid = ruleid;
  }

  toString() {
    return `${this.type}(via ${this.chartidx},${this.ruleid})`;
  }

  equals(other) {
    return (other.hasOwnProperty('type') &&
            other.hasOwnProperty('chartidx') &&
            other.hasOwnProperty('ruleid') &&
            other.type === this.type &&
            other.chartidx === this.chartidx &&
            other.ruleid === this.ruleid);
  }

}
