/* eslint-env node, mocha */

// ----------------------------------------
// Tests for slogic
// ----------------------------------------

import assert from 'assert';

import parse from '../src/index';
import parser from '../src/parser/parser';


describe('lexer', () => {

  const lex = parser.lexer;
  it('should handle empty input', () => {
    assert.strictEqual(lex('').length, 0);
  });

  it('should handle whitespace-only input', () => {
    assert.strictEqual(lex('  ').length, 0);
  });

  it('should not treat whitespace as token', () => {
    assert.strictEqual(lex(' ab & cd ').length, 3);
  });

  it('should not treat "v" as disjunction', () => {
    assert.strictEqual(lex('v&v').length, 3);
  });

  it('should split on "not" followed by whitespace', () => {
    assert.strictEqual(lex('ab&not cd').length, 4);
  });

  it('should not split identifiers that start with "or"', () => {
    assert.strictEqual(lex('orab').length, 1);
  });

  it('should not split identifiers that start with "and"', () => {
    assert.strictEqual(lex('ab&andcd').length, 3);
  });

  it('should not split identifiers that start with "not"', () => {
    assert.strictEqual(lex('ab&notcd').length, 3);
  });

  it('should return 5 tokens in "ab&cd|ef"', () => {
    assert.strictEqual(lex('ab&cd|ef').length, 5);
  });

  it('should return 6 tokens in "p0->-v44&& ay3 "', () => {
    assert.strictEqual(lex('p0->-v44&& ay3 ').length, 6);
  });

});


describe('parser', () => {

  it('should handle empty input', () => {
    assert.strictEqual(parse('').length, 0);
  });

  it('should handle whitespace-only input', () => {
    assert.strictEqual(parse('   ').length, 0);
  });

  it('should handle non-wff "||"', () => {
    assert.strictEqual(parse('||').length, 0);
  });

  it('should handle non-wff "aa/*a++a*/aa"', () => {
    assert.strictEqual(parse('aa/*a++a*/aa').length, 0);
  });

  it('should handle non-wff ")a|b("', () => {
    assert.strictEqual(parse(')a|b(').length, 0);
  });

  it('should return correct chart size for wff "ab&cd|ef"', () => {
    const chart = parser.chart('ab&cd|ef');
    assert.deepStrictEqual(chart.map(x => x.length),
                           [13, 11, 5, 11, 7, 11]);
  });

  it('should return correct chart size for wff "-ab<->(-cd->ef)"', () => {
    const chart = parser.chart('-ab<->(-cd->ef)');
    assert.deepStrictEqual(chart.map(x => x.length),
                           [13, 5, 12, 11, 14, 5, 13, 9, 12, 11]);
  });

  it('should return correct chart size for non-wff "ab&|cd"', () => {
    const chart = parser.chart('ab&|cd');
    assert.deepStrictEqual(chart.map(x => x.length),
                           [13, 11, 5, 0, 0]);
  });

  it('should return correct ast for wff "p"', () => {
    assert.deepStrictEqual(parse('p')[0], {
      'name': 'p',
      'type': 'IDENT',
      'children': []
    });
  });

  it('should return correct ast for wff " a <->b"', () => {
    assert.deepStrictEqual(parse(' a <->b')[0], {
      'name': '(a ↔ b)',
      'type': 'iff',
      'children': [
        {
          'name': 'a',
          'type': 'IDENT',
          'children': []
        },
        {
          'name': 'b',
          'type': 'IDENT',
          'children': []
        }
      ]
    });
  });

  it('should return correct ast for wff "a&b2|c->dv&(z<->e)|m"', () => {
    assert.deepStrictEqual(parse('a&b2|c->dv&(z<->e)|m')[0], {
      'name': '(((a ∧ b2) ∨ c) → ((dv ∧ (z ↔ e)) ∨ m))',
      'type': 'imp',
      'children': [
        {
          'name': '((a ∧ b2) ∨ c)',
          'type': 'or',
          'children': [
            {
              'name': '(a ∧ b2)',
              'type': 'and',
              'children': [
                {
                  'name': 'a',
                  'type': 'IDENT',
                  'children': []
                },
                {
                  'name': 'b2',
                  'type': 'IDENT',
                  'children': []
                }
              ]
            },
            {
              'name': 'c',
              'type': 'IDENT',
              'children': []
            }
          ]
        },
        {
          'name': '((dv ∧ (z ↔ e)) ∨ m)',
          'type': 'or',
          'children': [
            {
              'name': '(dv ∧ (z ↔ e))',
              'type': 'and',
              'children': [
                {
                  'name': 'dv',
                  'type': 'IDENT',
                  'children': []
                },
                {
                  'name': '(z ↔ e)',
                  'type': 'iff',
                  'children': [
                    {
                      'name': 'z',
                      'type': 'IDENT',
                      'children': []
                    },
                    {
                      'name': 'e',
                      'type': 'IDENT',
                      'children': []
                    }
                  ]
                }
              ]
            },
            {
              'name': 'm',
              'type': 'IDENT',
              'children': []
            }
          ]
        }
      ]
    });
  });

  it('should return correct ast for wff "ab&cd|ef"', () => {
    assert.deepStrictEqual(parse('ab&cd|ef')[0], {
      'name': '((ab ∧ cd) ∨ ef)',
      'type': 'or',
      'children': [
        {
          'name': '(ab ∧ cd)',
          'type': 'and',
          'children': [
            {
              'name': 'ab',
              'type': 'IDENT',
              'children': []
            },
            {
              'name': 'cd',
              'type': 'IDENT',
              'children': []
            }
          ]
        },
        {
          'name': 'ef',
          'type': 'IDENT',
          'children': []
        }
      ]
    });
  });

  it('should return correct ast for wff "---p"', () => {
    assert.deepStrictEqual(parse('---p')[0], {
      'name': '¬¬¬p',
      'type': 'not',
      'children': [
        {
          'name': '¬¬p',
          'type': 'not',
          'children': [
            {
              'name': '¬p',
              'type': 'not',
              'children': [
                {
                  'name': 'p',
                  'type': 'IDENT',
                  'children': []
                }
              ]
            }
          ]
        }
      ]
    });
  });

  it('should handle wff "p|(p<->-p->--p->p)"', () => {
    assert.strictEqual(
      parse('p|(p<->-p->--p->p)')[0].name,
      '(p ∨ (p ↔ ((¬p → ¬¬p) → p)))');
  });

  it('should handle wff "avavava"', () => {
    assert.strictEqual(
      parse('avavava')[0].name,
      'avavava');
  });

  it('should handle wff "a | a | a | a"', () => {
    assert.strictEqual(
      parse('a | a | a | a')[0].name,
      '(((a ∨ a) ∨ a) ∨ a)');
  });

  it('should handle wff "a|a|a|a"', () => {
    assert.strictEqual(
      parse('a|a|a|a')[0].name,
      '(((a ∨ a) ∨ a) ∨ a)');
  });

});
