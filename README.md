# slogic: Simple Logic Parser

`slogic` is a simple logic parser written in JavaScript (ES2015).

Its current implementation rests on an Earley-style chart parser
and an unambiguous grammar for propositional logic.


## Installation

The library can be installed with `npm` from github:

```
npm install synsem/slogic#build
```


## Usage

The library exports a single function `parse` that takes a string
representation of a formula as input and returns a list of parse
tree objects.

Each node in the tree has the following properties:

- `name`: A normalized string representation of this subformula.
- `type`: The node type (one of `"iff"`, `"imp"`, `"or"`, `"and"`,
  `"not"`, `"IDENT"`).
- `children`: A list of child nodes.

For example:

```JavaScript
import parse from 'slogic';
parse('ab&cd|ef')[0];
```

will return the object:

```JavaScript
{
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
}
```


## Demo

- [syntree](http://synsem-tools.appspot.com/syntree):
    A browser-based visualization of the syntactic structure
    of logical formulas, built on top of D3 and slogic.


## License

Copyright 2016 Mathias Schenner

This software is distributed under the ISC License.
