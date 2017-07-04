# AssessML (Assessment Markup Language)

AssessML (Assessment Markup Language) is a concise and flexible declarative language for educational assessments. This repository contains the language specification and JavaScript implementations of various language tools (AST generator, compilers, etc).

## Installation

```bash
npm install assessml
```

## Use

### Browser

### Node.js

```javascript
const aml = require('assessml');

// generate AST

const ast = aml.generateAST(`
  What time is it?
  
  [*] 1:00pm
  [*] 2:00pm
  [*] 3:00pm
  [*] 4:00pm
`);

// compile to HTML from source code

aml.compileToHTML(`
  What time is it?
  
  [*] 1:00pm
  [*] 2:00pm
  [*] 3:00pm
  [*] 4:00pm
`);

// compile to HTML from AST

aml.compileToHTML(ast);
```

## Language Specification

* [Basic Syntax](#basic-syntax)
* [BNF](#bnf-backus-normal-form-grammar)
* [AST](#ast-abstract-syntax-tree)

### Basic Syntax

#### Short Answer

Click to see live example (not yet implemented)

##### Text

```
What is the year of the Unix epoch?
```

##### Code

```javascript
answer = '1970';
```

#### Variable

Variable names must be prefixed with `var`. Any string can come after the `var` prefix.

[Click to see live example](https://prendus.com/question/cj4os7mld6kq4017073x00cjt/view)

##### Text

```
[var1] + [var2] = ?
```

##### Code

```javascript
var1.min = 0;
var1.max = 25;

var2.min = 26;
var2.max = 50;

answer = var1 + var2;
```

#### Multiple Choice

[Click to see live example](https://prendus.com/question/cj4osc9bh6lnc017201owg73u/view)

##### Text

```
What color is the sky?

[*] Red
[*] Blue
[*] Green
[*] Yellow
```

##### Code

```javascript
answer.radio1 = false;
answer.radio2 = true;
answer.radio3 = false;
answer.radio4 = false;
```

#### Multiple Select

[Click to see live example](https://prendus.com/question/cj4osxzcl6vj90170h9ix6tdj/view)

##### Text

```
Who were presidents of the United States of America?

[x] Bing Crosby
[x] Bill Cosby
[x] Thomas Jefferson
[x] George Washington
```

##### Code

```
answer.check1 = false;
answer.check2 = false;
answer.check3 = true;
answer.check4 = true;
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
answer.input1 = 'running';
answer.input2 = 'ran';
answer.input3 = 'running';
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
answer.drop1 = drag4;
answer.drop2 = drag1;
answer.drop3 = drag2;
answer.drop4 = drag3;

// or

answer.drag1 = drop2;
answer.drag2 = drop3;
answer.drag3 = drop4;
answer.drag4 = drop1;
```

### BNF (Backus normal form) Grammar

```
<Document> ::= 
```

### AST (Abstract Syntax Tree)

#### Document

```typescript
interface Document {
  type: 'DOCUMENT';
  content: [];
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

#### Check

```typescript
interface Check {
  type: 'CHECK';
  varName: string;
  content: Document;
}
```

#### Radio

```typescript
interface Radio {
  type: 'RADIO';
  varName: string;
  content: Document;
}
```

#### Drag

```typescript
interface Drag {
  type: 'DRAG';
  varName: string;
  content: Document;
}
```

#### Drop

```typescript
interface Drop {
  type: 'DROP';
  varName: string;
  content: Document;
}
```
