[![npm version](https://img.shields.io/npm/v/assessml.svg?style=flat)](https://www.npmjs.com/package/assessml) [![dependency Status](https://david-dm.org/prendus/assessml/status.svg)](https://david-dm.org/prendus/assessml) [![devDependency Status](https://david-dm.org/prendus/assessml/dev-status.svg)](https://david-dm.org/prendus/assessml?type=dev) [![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/prendus/assessml)

# AssessML (Assessment Markup Language)

AssessML (Assessment Markup Language) is a concise and flexible declarative language for educational assessments. It is meant to be used with projects such as the [Prendus Question Elements](https://github.com/Prendus/prendus-question-elements).This repository contains the language specification and JavaScript implementations of various language tools (AST generator, compilers, etc).

## Installation

```bash
npm install assessml
```

## Use

```javascript
import {generateAST, compileToHTML} from './node_modules/assessml/assessml';

// generate AST

const ast = generateAST(`
  What time is it?

  [*]1:00pm[*]
  [*]2:00pm[*]
  [*]3:00pm[*]
  [*]4:00pm[*]
`);

// compile to HTML from source code

const html = compileToHTML(`
  What time is it?

  [*]1:00pm[*]
  [*]2:00pm[*]
  [*]3:00pm[*]
  [*]4:00pm[*]
`);

// compile to HTML from AST

const html = compileToHTML(ast);
```

If you use TypeScript, you can import the typings:

```typescript
import {AST, Check, Content, Drag, Drop, Essay, Input, Radio, Variable} from 'assessml'; //if you use TypeScript
```

## Development

Clone the repository:

SSH:

```bash
git clone git@github.com:Prendus/assessml.git
```

HTTPS:

```bash
git clone https://github.com/Prendus/assessml.git
```

Install all dependencies:

```bash
cd assessml
npm install
```

Run test cases in terminal:

```bash
npm run test
```

Run test cases with debug window:

```bash
npm run test-window
```

## Language Specification

* [Syntax](#syntax)
* [BNF](#bnf-backus-naur-form-grammar)
* [AST](#ast-abstract-syntax-tree)

### Syntax

#### Essay Answer

[Click to see live example](https://prendus.com/question/cj4u618ht6y4c0151n6okiofg/view)

##### Question

```
Tell me about your feelings:

[essay]
```

##### Answer

```javascript
answer = essay1.includes('happy');
```

Essay answers provide a large textarea for users to write essay responses. Any JavaScript functionality can be used in the answer code to determine if the question is answered correctly. In this example, we use a simple string function to check if the user has mentioned the word `happy` anywhere in the response. String variables corresponding to essay inputs are available in the answer code. Each variable represents the string entered by the user into the essay input, and has a name that starts with `essay` and ends with a number corresponding to the order of the essay input relative to other essay inputs in the question text. The first variable will be `essay1`, the second will be `essay2`, etc.

#### Variable

[Click to see live example](https://prendus.com/question/cj4os7mld6kq4017073x00cjt/view)

##### Question

```
[var1] + [var2] = [input]
```

##### Answer

```javascript
var1.min = 0;
var1.max = 25;
var1.precision = 5;

var2.min = 26;
var2.max = 50;
var2.precision = 5;

answer = input1 == var1 + var2;
```

Variable names must be prefixed with `var` and followed by any non-empty string. All variables declared in the question text will be available as number variables in the answer code. Setting a min and max on a variable restricts the variable to that range inclusive. Setting a precision between 1 and 21 on a variable restricts that variable to the specified number of significant digits.

#### Multiple Choice (Single, radio buttons)

[Click to see live example](https://prendus.com/question/cj4osc9bh6lnc017201owg73u/view)

##### Question

```
What color is the sky?

[*]Red[*]
[*]Blue[*]
[*]Green[*]
[*]Yellow[*]
```

##### Answer

```javascript
answer = radio2 === true;
```

Any text or variable can go between the `[*]` tags. Boolean variables corresponding to radio buttons are available in the answer code. Each variable represents the checked state of the radio button, and has a name that starts with `radio` and ends with a number corresponding to the order of the radio button relative to other radio buttons in the question text. The first variable will be `radio1`, the second will be `radio2`, etc.

#### Multiple Choice (Multiple, checkboxes)

[Click to see live example](https://prendus.com/question/cj4osxzcl6vj90170h9ix6tdj/view)

##### Question

```
Who were presidents of the United States of America?

[x]Bing Crosby[x]
[x]Bill Cosby[x]
[x]Thomas Jefferson[x]
[x]George Washington[x]
```

##### Answer

```
answer = (
  check1 === false &&
  check2 === false &&
  check3 === true &&
  check4 === true
);
```

Any text or variable can go between the `[x]` tags. Boolean variables corresponding to checkboxes are available in the answer code. Each variable represents the checked state of the checkbox, and has a name that starts with `check` and ends with a number corresponding to the order of the checkbox relative to other checkboxes in the question text. The first variable will be `check1`, the second will be `check2`, etc.

#### Multiple Input

[Click to see live example](https://prendus.com/question/cj4ot1nlv6x630170jhxz2u9e/view)

##### Question

```
Fill in the blanks:

Sally was [input] across the field when she realized that she [input] into a stream of [input] water.
```

##### Answer

```
answer = (
  input1 === 'running' &&
  input2 === 'ran' &&
  input3 === 'running'
);
```

String variables corresponding to inputs are available in the answer code. Each variable represents the string entered by the user into the input, and has a name that starts with `input` and ends with a number corresponding to the order of the input relative to other inputs in the question text. The first variable will be `input1`, the second will be `input2`, etc.

#### Drag and Drop

Click to see live example (not yet implemented)

##### Question

```
Match the numbers with the words:

[drag]1[drag]
[drag]2[drag]
[drag]3[drag]
[drag]4[drag]

[drop]four[drop]
[drop]one[drop]
[drop]two[drop]
[drop]three[drop]
```

##### Answer

```
answer = (
  drop1 === drag4 &&
  drop2 === drag1 &&
  drop3 === drag2 &&
  drop4 === drag3
);
```

### BNF (Backus-Naur form) Grammar

```
<Document> := <Document><Content><Document> | <Document><Variable><Document> | <Document><Input><Document> | <Document><Essay><Document> | <Document><Check><Document> | <Document><Radio><Document> | <Document><Drag><Document> | <Document><Drop><Document> | <Empty>
<Content> := string
<Variable> := [var<Content>]
<Input> := [input]
<Essay> := [essay]
<Check> := [x]<ArbitraryVariableOrContent>[x]
<Radio> := [*]<ArbitraryVariableOrContent>[*]
<Drag> := [drag]<ArbitraryVariableOrContent>[drag]
<Drop> := [drop]<ArbitraryVariableOrContent>[drop]
<ArbitraryVariableOrContent> := <ArbitraryVariableOrContent><Variable><ArbitraryVariableOrContent> | <ArbitraryVariableOrContent><Content><ArbitraryVariableOrContent> | <Empty>
<Empty> := '' (the empty string)
```

### AST (Abstract Syntax Tree)

#### AST

```typescript
interface AST {
  type: 'AST';
  ast: (Content | Variable | Input | Essay | Check | Radio | Drag | Drop)[];
}
```

#### Content

```typescript
interface Content {
  type: 'CONTENT';
  content: string;
}
```

#### Variable

```typescript
interface Variable {
  type: 'VARIABLE';
  varName: string;
  value: number;
}
```

#### Input

```typescript
interface Input {
  type: 'INPUT';
  varName: string;
}
```

#### Essay

```typescript
interface Essay {
  type: 'ESSAY';
  varName: string;
}
```

#### Check

```typescript
interface Check {
  type: 'CHECK';
  varName: string;
  content: (Variable | Content)[];
}
```

#### Radio

```typescript
interface Radio {
  type: 'RADIO';
  varName: string;
  content: (Variable | Content)[];
}
```

#### Drag

```typescript
interface Drag {
  type: 'DRAG';
  varName: string;
  content: (Variable | Content)[];
}
```

#### Drop

```typescript
interface Drop {
  type: 'DROP';
  varName: string;
  content: (Variable | Content)[];
}
```
