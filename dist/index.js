var asyncGenerator = function () {
  function AwaitValue(value) {
    this.value = value;
  }

  function AsyncGenerator(gen) {
    var front, back;

    function send(key, arg) {
      return new Promise(function (resolve, reject) {
        var request = {
          key: key,
          arg: arg,
          resolve: resolve,
          reject: reject,
          next: null
        };

        if (back) {
          back = back.next = request;
        } else {
          front = back = request;
          resume(key, arg);
        }
      });
    }

    function resume(key, arg) {
      try {
        var result = gen[key](arg);
        var value = result.value;

        if (value instanceof AwaitValue) {
          Promise.resolve(value.value).then(function (arg) {
            resume("next", arg);
          }, function (arg) {
            resume("throw", arg);
          });
        } else {
          settle(result.done ? "return" : "normal", result.value);
        }
      } catch (err) {
        settle("throw", err);
      }
    }

    function settle(type, value) {
      switch (type) {
        case "return":
          front.resolve({
            value: value,
            done: true
          });
          break;

        case "throw":
          front.reject(value);
          break;

        default:
          front.resolve({
            value: value,
            done: false
          });
          break;
      }

      front = front.next;

      if (front) {
        resume(front.key, front.arg);
      } else {
        back = null;
      }
    }

    this._invoke = send;

    if (typeof gen.return !== "function") {
      this.return = undefined;
    }
  }

  if (typeof Symbol === "function" && Symbol.asyncIterator) {
    AsyncGenerator.prototype[Symbol.asyncIterator] = function () {
      return this;
    };
  }

  AsyncGenerator.prototype.next = function (arg) {
    return this._invoke("next", arg);
  };

  AsyncGenerator.prototype.throw = function (arg) {
    return this._invoke("throw", arg);
  };

  AsyncGenerator.prototype.return = function (arg) {
    return this._invoke("return", arg);
  };

  return {
    wrap: function (fn) {
      return function () {
        return new AsyncGenerator(fn.apply(this, arguments));
      };
    },
    await: function (value) {
      return new AwaitValue(value);
    }
  };
}();





var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();







var get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

















var set = function set(object, property, value, receiver) {
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent !== null) {
      set(parent, property, value, receiver);
    }
  } else if ("value" in desc && desc.writable) {
    desc.value = value;
  } else {
    var setter = desc.set;

    if (setter !== undefined) {
      setter.call(receiver, value);
    }
  }

  return value;
};

// ----------------------------------------
// ParseTree
// ----------------------------------------

var ParseTree = function () {
  function ParseTree(type, value, children) {
    classCallCheck(this, ParseTree);

    this.type = type; // token type or rule lhs
    this.value = value; // token value, null for rule
    this.children = children; // child nodes, [] for leaf
  }

  createClass(ParseTree, [{
    key: 'toString',
    value: function toString() {
      if (this.value !== null) {
        return this.value;
      }
      var subtrees = this.children.map(function (c) {
        return c.toString();
      });
      return '[' + this.type + ' ' + subtrees.join(' ') + ']';
    }
  }]);
  return ParseTree;
}();

// ----------------------------------------
// Formula
// ----------------------------------------

var Formula = function () {

  // assert: either value or children must be non-null
  function Formula(type, value, children) {
    classCallCheck(this, Formula);

    this.type = type; // token type or rule lhs
    this.value = value; // token value, null for rule
    this.children = children; // child nodes, [] for leaf
  }

  createClass(Formula, [{
    key: 'showTree',
    value: function showTree() {
      if (this.value !== null) {
        return this.value;
      }
      var subtrees = this.children.map(function (c) {
        return c.showTree();
      });
      return '[' + this.type + ' ' + subtrees.join(' ') + ']';
    }
  }, {
    key: 'toString',
    value: function toString() {
      var c = this.children;
      switch (this.type) {
        case 'iff':
          return '(' + c[0] + ' \u2194 ' + c[1] + ')';
        case 'imp':
          return '(' + c[0] + ' \u2192 ' + c[1] + ')';
        case 'or':
          return '(' + c[0] + ' \u2228 ' + c[1] + ')';
        case 'and':
          return '(' + c[0] + ' \u2227 ' + c[1] + ')';
        case 'not':
          return '\xAC' + c[0];
        case 'atom':
          return '' + c[0];
        case 'IDENT':
          return this.value;
        default:
          throw Error('Unknown node type: ' + this.type);
      }
    }

    // Format as stringifiable object.

  }, {
    key: 'format',
    value: function format() {
      return {
        type: this.type,
        name: this.toString(),
        children: this.children.map(function (c) {
          return c.format();
        })
      };
    }
  }]);
  return Formula;
}();

// ----------------------------------------
// PartialParse
// ----------------------------------------

var PartialParse = function () {
  function PartialParse(type, chartidx, ruleid) {
    classCallCheck(this, PartialParse);

    this.type = type;
    this.chartidx = chartidx;
    this.ruleid = ruleid;
  }

  createClass(PartialParse, [{
    key: 'toString',
    value: function toString() {
      return this.type + '(via ' + this.chartidx + ',' + this.ruleid + ')';
    }
  }, {
    key: 'equals',
    value: function equals(other) {
      return other.hasOwnProperty('type') && other.hasOwnProperty('chartidx') && other.hasOwnProperty('ruleid') && other.type === this.type && other.chartidx === this.chartidx && other.ruleid === this.ruleid;
    }
  }]);
  return PartialParse;
}();

// ----------------------------------------
// Dotted Grammar Rule
// ----------------------------------------

var DotRule = function () {

  // @params:
  // - lhs: a string (non-terminal symbol)
  // - seen: an array of Tokens and/or PartialParses
  // - unseen: an array of strings (non-terminal or terminal symbols)
  // - offset: integer
  function DotRule(lhs, seen, unseen, offset) {
    classCallCheck(this, DotRule);

    this.lhs = lhs;
    this.seen = seen;
    this.unseen = unseen;
    this.offset = offset;
  }

  createClass(DotRule, [{
    key: 'toString',
    value: function toString() {
      return this.lhs + ' -> ' + this.seen.join(',') + ' . ' + this.unseen + ' @' + this.offset;
    }

    // deepStrictEqual

  }, {
    key: 'equals',
    value: function equals(other) {
      if (this.lhs !== other.lhs || this.offset !== other.offset || this.seen.length !== other.seen.length || this.unseen.length !== other.unseen.length) {
        return false;
      } else {
        for (var i = 0; i < this.seen.length; i++) {
          // Token or PartialParse
          if (!this.seen[i].equals(other.seen[i])) {
            return false;
          }
        }
        for (var _i = 0; _i < this.unseen.length; _i++) {
          if (this.unseen[_i] !== other.unseen[_i]) {
            return false;
          }
        }
      }
      return true;
    }
  }]);
  return DotRule;
}();

// ----------------------------------------
// Grammar Rule
// ----------------------------------------

var Rule = function () {

  // @params:
  // - lhs: a string (non-terminal symbols)
  // - rhs: an array of strings (non-terminal or terminal)
  function Rule(lhs, rhs) {
    classCallCheck(this, Rule);

    this.lhs = lhs;
    this.rhs = rhs;
  }

  createClass(Rule, [{
    key: 'toString',
    value: function toString() {
      return this.lhs + ' -> ' + this.rhs.join(' ');
    }
  }]);
  return Rule;
}();

// ------------------------------------------------------------
// Propositional Logic
//
// An unambiguous grammar for propositional logic.
// (Connectives are left-associative.)
// ------------------------------------------------------------

// Start symbol of the grammar.
var startsymbol = 'wff';

// Grammar rules.
var rules = [new Rule('wff', ['iff']), new Rule('iff', ['iff', 'IFF', 'imp']), new Rule('iff', ['imp']), new Rule('imp', ['imp', 'IMP', 'or']), new Rule('imp', ['or']), new Rule('or', ['or', 'OR', 'and']), new Rule('or', ['and']), new Rule('and', ['and', 'AND', 'not']), new Rule('and', ['not']), new Rule('not', ['NOT', 'not']), new Rule('not', ['atom']), new Rule('atom', ['IDENT']), new Rule('atom', ['LP', 'wff', 'RP'])];

// Non-terminal symbols of the grammar.
var nonterminals = ['wff', 'iff', 'imp', 'or', 'and', 'not', 'atom'];

// Token definitions.
var tokens = {
  LP: /^\(/,
  RP: /^\)/,
  WHITE: /^\s+/,
  IFF: /^(?:iff\b|↔|<->|<=>)/,
  IMP: /^(?:implies\b|→|->|=>)/,
  OR: /^(?:or\b|∨|\|\||\|)/,
  AND: /^(?:and\b|∧|&&|&|\^)/,
  NOT: /^(?:not\b|¬|-|!)/,
  IDENT: /^[A-Za-z]+[A-Za-z0-9]*/
};

// Return whether the given symbol is a terminal.
//
// Assumption: the symbol is a terminal or non-terminal.
function isTerminal(symbol) {
  return nonterminals.indexOf(symbol) < 0;
}

// Return whether the given symbol is a non-terminal.
function isNonTerminal(symbol) {
  return nonterminals.indexOf(symbol) > -1;
}

// ----------------------------------------
// Token
// ----------------------------------------

var Token = function () {
  function Token(type, value) {
    classCallCheck(this, Token);

    this.type = type;
    this.value = value;
  }

  createClass(Token, [{
    key: 'toString',
    value: function toString() {
      return this.type + '(\'' + this.value + '\')';
    }
  }, {
    key: 'equals',
    value: function equals(other) {
      return other.hasOwnProperty('type') && other.hasOwnProperty('value') && other.type === this.type && other.value === this.value;
    }
  }]);
  return Token;
}();

// ----------------------------------------
// Lexer
// ----------------------------------------

// lexer: return a list of tokens (or an empty list if the input
// string contains any non-tokens or is empty).
//
// @params:
// - text: input string
// @returns: a list of Token objects
//
var lexer = function (text) {
  var output = [];
  var suffix = text;
  while (suffix.length > 0) {
    var matched = false;
    for (var token in tokens) {
      if (!matched) {
        var match = tokens[token].exec(suffix);
        if (match !== null) {
          if (token !== 'WHITE') {
            output.push(new Token(token, match[0]));
          }
          suffix = suffix.substring(match[0].length);
          matched = true;
        }
      }
    }
    if (!matched) {
      // input string is not well-formed
      return [];
    }
  }
  return output;
};

// ----------------------------------------
// Earley-style chart parser
// ----------------------------------------

// buildChart : [token] -> chart
//
// Construct parser chart for input tokens.
//
// @params:
// - tokens: a list of tokens (as returned by the lexer)
// @returns: a parser chart
//
function buildChart(tokens$$1) {
  // initialize chart: array of arrays
  var chartsize = tokens$$1.length + 1;
  var chart = [];
  for (var i = 0; i < chartsize; i++) {
    chart[i] = [];
  }
  var nextstate = [];
  rules.forEach(function (r) {
    if (r.lhs === startsymbol) {
      nextstate.push(new DotRule(r.lhs, [], r.rhs.slice(), 0, []));
    }
  });

  var _loop = function _loop(_i) {
    var queue = nextstate;
    nextstate = [];
    var ruleid = -1;
    var isDuplicate = function isDuplicate(rule) {
      return chart[_i].some(function (r) {
        return r.equals(rule);
      });
    };
    while (queue.length > 0) {
      var dotrule = queue.shift();
      if (!isDuplicate(dotrule)) {
        (function () {
          ruleid += 1;
          chart[_i][ruleid] = dotrule;
          var lhs = dotrule.lhs,
              seen = dotrule.seen,
              unseen = dotrule.unseen,
              offset = dotrule.offset;

          if (unseen.length > 0) {
            (function () {
              var exp = unseen[0];
              if (isTerminal(exp)) {
                if (_i < tokens$$1.length && exp === tokens$$1[_i].type) {
                  // scan
                  nextstate.push(new DotRule(lhs, seen.concat([tokens$$1[_i]]), unseen.slice(1), offset));
                }
              } else {
                // predict
                rules.forEach(function (r) {
                  if (r.lhs === exp) {
                    queue.push(new DotRule(r.lhs, [], r.rhs.slice(), _i, []));
                  }
                });
              }
            })();
          } else {
            // complete
            chart[offset].forEach(function (dr) {
              if (dr.unseen.length > 0 && dr.unseen[0] === lhs) {
                queue.push(new DotRule(dr.lhs, dr.seen.concat([new PartialParse(lhs, _i, ruleid)]), dr.unseen.slice(1), dr.offset));
              }
            });
          }
        })();
      }
    }
  };

  for (var _i = 0; _i < chartsize; _i++) {
    _loop(_i);
  }
  return chart;
}

// chart -> [ParseTree]
//
// Given a completed Earley chart, reconstruct all parsetrees.
function chart2trees(chart) {

  // dotrule -> [ParseTree]
  function rule2trees(chart, dotrule) {
    // assert: (dotrule.seen.length === 0)
    return dotrule.seen.map(function (s) {
      if (isTerminal(s.type)) {
        // s is Token object
        return new ParseTree(s.type, s.value, []);
      } else {
        // assert: grammar.isNonTerminal(s.type)
        // s is PartialParse object
        var subrule = chart[s.chartidx][s.ruleid];
        return new ParseTree(s.type, null, rule2trees(chart, subrule));
      }
    });
  }

  var success = chart[chart.length - 1].filter(function (st) {
    return st.lhs === startsymbol && st.unseen.length === 0 && st.offset === 0;
  });
  return success.map(function (st) {
    return new ParseTree(st.lhs, null, rule2trees(chart, st));
  });
}

// ParseTree -> Formula
function toFormula(tree) {
  switch (tree.children.length) {
    case 0:
      // token leaf node
      return new Formula(tree.type, tree.value, []);
    case 1:
      // suppress nodes with a single child
      return toFormula(tree.children[0]);
    default:
      {
        var children = tree.children.filter(
        // drop all terminal nodes except 'IDENT'
        function (c) {
          return isNonTerminal(c.type) || c.type == 'IDENT';
        });
        if (children.length === 1 && tree.type === 'atom') {
          return toFormula(children[0]);
        }
        return new Formula(tree.type, tree.value, children.map(function (c) {
          return toFormula(c);
        }));
      }}
}

// ---------- interface

// chart : string -> chart
// Return parser chart (for debugging and testing).
function chart(text) {
  return buildChart(lexer(text));
}

// parse : string -> [tree]
// Main parsing function.
function parse(text) {
  return chart2trees(buildChart(lexer(text))).map(function (t) {
    return toFormula(t).format();
  });
}

// ---------- exports

var parser = {
  lexer: lexer, // string -> [token]
  parse: parse, // string -> [tree]
  chart: chart // string -> chart
};

// ----------------------------------------
// slogic
// ----------------------------------------

var index = parser.parse;

export default index;
