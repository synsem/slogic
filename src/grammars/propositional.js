// ------------------------------------------------------------
// Propositional Logic
//
// An unambiguous grammar for propositional logic.
// (Connectives are left-associative.)
// ------------------------------------------------------------

import Rule from '../types/Rule';


// Start symbol of the grammar.
export const startsymbol = 'wff';

// Grammar rules.
export const rules = [
  new Rule('wff', ['iff']),
  new Rule('iff', ['iff', 'IFF', 'imp']),
  new Rule('iff', ['imp']),
  new Rule('imp', ['imp', 'IMP', 'or']),
  new Rule('imp', ['or']),
  new Rule('or', ['or', 'OR', 'and']),
  new Rule('or', ['and']),
  new Rule('and', ['and', 'AND', 'not']),
  new Rule('and', ['not']),
  new Rule('not', ['NOT', 'not']),
  new Rule('not', ['atom']),
  new Rule('atom', ['IDENT']),
  new Rule('atom', ['LP', 'wff', 'RP'])
];

// Non-terminal symbols of the grammar.
const nonterminals = ['wff', 'iff', 'imp', 'or', 'and', 'not', 'atom'];

// Token definitions.
export const tokens = {
  LP:     /^\(/,
  RP:     /^\)/,
  WHITE:  /^\s+/,
  IFF:    /^(?:iff\b|↔|<->|<=>)/,
  IMP:    /^(?:implies\b|→|->|=>)/,
  OR:     /^(?:or\b|∨|\|\||\|)/,
  AND:    /^(?:and\b|∧|&&|&|\^)/,
  NOT:    /^(?:not\b|¬|-|!)/,
  IDENT:  /^[A-Za-z]+[A-Za-z0-9]*/
};


// Return whether the given symbol is a terminal.
//
// Assumption: the symbol is a terminal or non-terminal.
export function isTerminal(symbol) {
  return nonterminals.indexOf(symbol) < 0;
}

// Return whether the given symbol is a non-terminal.
export function isNonTerminal(symbol) {
  return nonterminals.indexOf(symbol) > -1;
}
