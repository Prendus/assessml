# AssessML (Assessment Markup Language)

AssessML (Assessment Markup Language) is a concise and flexible declarative language for educational assessments. This repository contains the language specification and JavaScript implementations of various language tools (AST generator, compilers, etc).

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

compileToHTML(`
  What time is it?

  [*]1:00pm[*]
  [*]2:00pm[*]
  [*]3:00pm[*]
  [*]4:00pm[*]
`);

// compile to HTML from AST

compileToHTML(ast);
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

* [Basic Syntax](#basic-syntax)
* [BNF](#bnf-backus-naur-form-grammar)
* [AST](#ast-abstract-syntax-tree)

### Basic Syntax

#### Essay Answer

Click to see live example (not yet implemented)

##### Text

```
Tell me about your feelings:

[essay]
```

##### Code

```javascript
answer = essay1.includes('happy');
```

#### Variable

Variable names must be prefixed with `var`. Any string can come after the `var` prefix.

[Click to see live example](https://prendus.com/question/cj4os7mld6kq4017073x00cjt/view)

##### Text

```
[var1] + [var2] = [input]
```

##### Code

```javascript
var1.min = 0;
var1.max = 25;

var2.min = 26;
var2.max = 50;

answer = input1 == var1 + var2;
```

#### Multiple Choice

[Click to see live example](https://prendus.com/question/cj4osc9bh6lnc017201owg73u/view)

##### Text

```
What color is the sky?

[*]Red[*]
[*]Blue[*]
[*]Green[*]
[*]Yellow[*]
```

##### Code

```javascript
answer = radio2 === true;
```

#### Multiple Select

[Click to see live example](https://prendus.com/question/cj4osxzcl6vj90170h9ix6tdj/view)

##### Text

```
Who were presidents of the United States of America?

[x]Bing Crosby[x]
[x]Bill Cosby[x]
[x]Thomas Jefferson[x]
[x]George Washington[x]
```

##### Code

```
answer = (
  check1 === false && 
  check2 === false && 
  check3 === true && 
  check4 == true
);
```

#### Multiple Input

[Click to see live example](https://prendus.com/question/cj4ot1nlv6x630170jhxz2u9e/view)

##### Text

```
Fill in the blanks:

Sally was [input] across the field when she realized that she [input] into a stream of [input] water.
```

##### Code

```
answer = (
  input1 === 'running' &&
  input2 === 'ran' &&
  input3 === 'running'
);
```

#### Drag and Drop

Click to see live example (not yet implemented)

##### Text

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

##### Code

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
