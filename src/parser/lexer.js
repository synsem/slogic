// ----------------------------------------
// Lexer
// ----------------------------------------

import Token from '../types/Token';
import { tokens } from '../grammars/propositional';

// lexer: return a list of tokens (or an empty list if the input
// string contains any non-tokens or is empty).
//
// @params:
// - text: input string
// @returns: a list of Token objects
//
export default function (text) {
  const output = [];
  let suffix = text;
  while (suffix.length > 0) {
    let matched = false;
    for (const token in tokens) {
      if (!matched) {
        const match = tokens[token].exec(suffix);
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
}
