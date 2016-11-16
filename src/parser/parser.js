// ----------------------------------------
// Earley-style chart parser
// ----------------------------------------

import ParseTree from '../types/ParseTree';
import Formula from '../types/Formula';
import PartialParse from '../types/PartialParse';
import DotRule from '../types/DotRule';

import * as grammar from '../grammars/propositional';
import lexer from './lexer';


// buildChart : [token] -> chart
//
// Construct parser chart for input tokens.
//
// @params:
// - tokens: a list of tokens (as returned by the lexer)
// @returns: a parser chart
//
function buildChart(tokens) {
  // initialize chart: array of arrays
  const chartsize = tokens.length + 1;
  const chart = [];
  for (let i = 0; i < chartsize; i++) {
    chart[i] = [];
  }
  let nextstate = [];
  grammar.rules.forEach(r => {
    if (r.lhs === grammar.startsymbol) {
      nextstate.push(new DotRule(r.lhs, [], r.rhs.slice(), 0, []));
    }
  });
  for (let i = 0; i < chartsize; i++) {
    const queue = nextstate;
    nextstate = [];
    let ruleid = -1;
    const isDuplicate = rule => chart[i].some(r => r.equals(rule));
    while (queue.length > 0) {
      const dotrule = queue.shift();
      if (!isDuplicate(dotrule)) {
        ruleid += 1;
        chart[i][ruleid] = dotrule;
        const {lhs, seen, unseen, offset} = dotrule;
        if (unseen.length > 0) {
          const exp = unseen[0];
          if (grammar.isTerminal(exp)) {
            if (i < tokens.length && exp === tokens[i].type) {
              // scan
              nextstate.push(new DotRule(
                lhs, seen.concat([tokens[i]]),
                unseen.slice(1), offset));
            }
          } else {
            // predict
            grammar.rules.forEach(r => {
              if (r.lhs === exp) {
                queue.push(new DotRule(
                  r.lhs, [], r.rhs.slice(), i, []));
              }
            });
          }
        } else {
          // complete
          chart[offset].forEach(dr => {
            if (dr.unseen.length > 0 && dr.unseen[0] === lhs) {
              queue.push(new DotRule(
                dr.lhs, dr.seen.concat([new PartialParse(lhs, i, ruleid)]),
                dr.unseen.slice(1), dr.offset));
            }
          });
        }
      }
    }
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
    return dotrule.seen.map(s => {
      if (grammar.isTerminal(s.type)) {
        // s is Token object
        return new ParseTree(s.type, s.value, []);
      } else { // assert: grammar.isNonTerminal(s.type)
        // s is PartialParse object
        const subrule = chart[s.chartidx][s.ruleid];
        return new ParseTree(s.type, null, rule2trees(chart, subrule));
      }
    });
  }

  const success = chart[chart.length-1].filter(st =>
    (st.lhs === grammar.startsymbol &&
     st.unseen.length === 0 &&
     st.offset === 0));
  return success.map(st => new ParseTree(
    st.lhs, null, rule2trees(chart, st)));
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
  default: {
    const children = tree.children.filter(
      // drop all terminal nodes except 'IDENT'
      c => (grammar.isNonTerminal(c.type) || c.type == 'IDENT'));
    if (children.length === 1 && tree.type === 'atom') {
      return toFormula(children[0]);
    }
    return new Formula(
      tree.type, tree.value,
      children.map(c => toFormula(c)));
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
  return chart2trees(buildChart(lexer(text))).map(
    t => toFormula(t).format());
}


// ---------- exports

export default {
  lexer,  // string -> [token]
  parse,  // string -> [tree]
  chart   // string -> chart
};
