[![CircleCI](https://circleci.com/gh/Prendus/assessml.svg?style=shield)](https://circleci.com/gh/Prendus/assessml) [![npm version](https://img.shields.io/npm/v/assessml.svg?style=flat)](https://www.npmjs.com/package/assessml) [![dependency Status](https://david-dm.org/prendus/assessml/status.svg)](https://david-dm.org/prendus/assessml) [![devDependency Status](https://david-dm.org/prendus/assessml/dev-status.svg)](https://david-dm.org/prendus/assessml?type=dev)

# AssessML (Assessment Markup Language)

AssessML (Assessment Markup Language) is a concise and flexible declarative language for educational assessments. It is meant to be used with projects such as the [Assess Elements](https://github.com/lastmjs/assess-elements).This repository contains the language specification and JavaScript implementations of various language tools (AST generator, compilers, etc).

## Installation

```bash
npm install assessml
```

## Use

The elements are written in TypeScript, and there is no built-in build process. You will have to provide your own build process to consume them. We use [Zwitterion](https://github.com/lastmjs/zwitterion).

```javascript
import { 
  generateAST,
  compileToHTML,
  compileToAssessML
} from './node_modules/assessml/assessml';

// generate AST

const ast = generateAST(`
  What time is it?

  [radio1]1:00pm[radio1]
  [radio2]2:00pm[radio2]
  [radio3]3:00pm[radio3]
  [radio4]4:00pm[radio4]
`);

// compile to HTML from source code

const html = compileToHTML(`
  What time is it?

  [radio1]1:00pm[radio1]
  [radio2]2:00pm[radio2]
  [radio3]3:00pm[radio3]
  [radio4]4:00pm[radio4]
`);

// compile to HTML from AST

const html = compileToHTML(ast);

// compile to AssessML from source code

const assessML = compileToAssessML(`
  What time is it?

  [radio1]1:00pm[radio1]
  [radio2]2:00pm[radio2]
  [radio3]3:00pm[radio3]
  [radio4]4:00pm[radio4]
`);

// compile to AssessML from AST

const assessML = compileToAssessML(ast);
```

If you use TypeScript, you can import the typings:

```typescript
import {
  AST,
  Check,
  Content,
  Drag,
  Drop,
  Essay,
  Input,
  Radio,
  Variable
} from 'assessml'; //if you use TypeScript
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

Run test cases manually in browser:

```bash
npm run test-manual
```

## Language Specification

* [Syntax examples](#syntax-examples)
* [BNF](#bnf-backus-naur-form-grammar)
* [AST](#ast-abstract-syntax-tree)

### Syntax examples

Exercises created with AssessML have two components, which can be described as the exercise text and the answer code. The exercise text describes what the user will see, and is written with AssessML. The answer code gives the exercise its functionality, is where the final answer will need to be calculated, and is written in JavaScript. The following are examples of currently available AssessML tags, along with sample JavaScript functionality. 

#### Essay

[Basic live demo](https://www.prendus.com/question/cjg7ivcm4b36k0120t8tceqjc/demo)
[Advanced live demo](https://www.prendus.com/question/cj4zyq5qbfjhs0121ced4hecl/demo)

##### AssessML (exercise text)

```
Tell me about your feelings:

[essay1]
```

##### JavaScript (answer code)

```javascript
answer = essay1.includes('happy');
```

Essay tags provide a large textarea for users to write essay responses. Any JavaScript functionality can be used in the answer code to determine if the question is answered correctly. In this example, we use a simple string function to check if the user has mentioned the word `happy` anywhere in the response. Essay names must start with `essay` and end with any non-empty string. Essay tags declared in the exercise text will create variables with equivalent names in the answer code. These variables will contain the string entered by the user into the essay input.

#### Variable

[Basic live demo](https://www.prendus.com/question/cjg86joz35q4i0144ouidk5c5/demo)
[Advanced live demo](https://www.prendus.com/question/cj9oy530qftpd0194ovo8g5z2/demo)

##### AssessML (exercise text)

```
[var1] + [var2] = [input1]
```

##### JavaScript (answer code)

```javascript
// randInt has been defined elsewhere

var1 = randInt(0, 25);
var2 = randInt(26, 50);

answer = input1 == var1 + var2;
```

Variable tags present variable strings or numbers to the user. The `compileToHTML` function takes a function as a parameter that will generate default initial values for variables. Variable names must start with `var` and end with any non-empty string. Variable tags declared in the exercise text will create variables with equivalent names in the answer code. These variables will contain the string or number value of the variable. Minimum and maximum values, as well as decimal precision, can be set using JavaScript functions defined elsewhere.

#### Multiple choice (radio buttons)

[Basic live demo](https://www.prendus.com/question/cjg7hm4ysanc001208wyufca1/demo)
[Advanced live demo](https://www.prendus.com/question/cjg7i2u5gb3e801382ly78oyp/demo)

##### AssessML (exercise text)

```
What color is the sky?

[radio1]Red[radio1]
[radio2]Blue[radio2]
[radio3]Green[radio3]
[radio4]Yellow[radio4]
```

##### JavaScript (answer code)

```javascript
answer = radio2 === true;
```

Radio tags create radio buttons to the left of whatever is declared within the tags. Any text, including other AssessML tags, can go between radio tags. Radio names must start with `radio` and end with any non-empty string. Radio tags declared in the exercise text will create variables with equivalent names in the answer code. These variables will contain boolean values representing the checked state of the radio buttons.

#### Multiple Choice (checkboxes)

[Basic live demo](https://www.prendus.com/question/cjg7hm4ysanc001208wyufca1/demo)
[Advanced live demo](https://www.prendus.com/question/cjg7i2u5gb3e801382ly78oyp/demo)

##### AssessML (exercise text)

```
Who were presidents of the United States of America?

[check1]Bing Crosby[check1]
[check2]Bill Cosby[check2]
[check3]Thomas Jefferson[check3]
[check4]George Washington[check4]
```

##### JavaScript (answer code)

```
answer = (
  check1 === false &&
  check2 === false &&
  check3 === true &&
  check4 === true
);
```

Check tags create checkboxes to the left of whatever is declared within the tags. Any text, including other AssessML tags, can go between check tags. Check names must start with `check` and end with any non-empty string. Check tags declared in the exercise text will create variables with equivalent names in the answer code. These variables will contain boolean values representing the checked state of the checkboxes.

#### Fill in the blank

[Basic live demo](https://www.prendus.com/question/cjg7im37lb2s50114aod9vpkd/demo)
[Advanced live demo](https://www.prendus.com/question/cjg7iqz5nb4p70114nodd157x/demo)

##### AssessML (exercise text)

```
Fill in the blanks:

Sally was [input1] across the field when she realized that she [input2] into a stream of [input3] water.
```

##### JavaScript (answer code)

```
answer = (
  input1 === 'running' &&
  input2 === 'ran' &&
  input3 === 'running'
);
```

Input tags create single-line inputs for users to enter short responses. Input names must start with `input` and end with any non-empty string. Input tags declared in the exercise text will create variables with equivalent names in the answer code. These variables will contain the string entered by the user into the input.

### BNF (Backus-Naur form) Grammar

```
<Document> := <Document><Content><Document> | <Document><Variable><Document> | <Document><Input><Document> | <Document><Essay><Document> | <Document><Radio><Document> | <Document><Check><Document> | <Document><Image><Document>| <Document><Code><Document> | <Document><Shuffle><Document> | <Document><Solution><Document> | <Empty>
<Content> := string
<Variable> := [var<Content>]
<Input> := [input<Content>]
<Essay> := [essay<Content>]
<Radio> := [radio<Content>]<Document>[radio<Content>]
<Check> := [check<Content>]<Document>[check<Content>]
<Image> := [img<Content>]
<Code> := [code<Content>]
<Shuffle> := [shuffle<Content>]<Document>[shuffle<Content>]
<Solution> := [solution<Content>]<Document>[solution<Content>]
<Empty> := '' (the empty string)
```

### AST (Abstract Syntax Tree)

#### AST

```typescript
interface AST {
    readonly type: 'AST';
    readonly ast: ASTObject[];
}

type ASTObject = Content | Variable | Input | Essay | Radio | Check | Image | Code | Shuffle | Solution;
```

#### Content

```typescript
interface Content {
    readonly type: 'CONTENT';
    readonly varName: string;
    readonly content: string;
}
```

#### Variable

```typescript
interface Variable {
    readonly type: 'VARIABLE';
    readonly varName: string;
    readonly value: number | string;
}
```

#### Input

```typescript
interface Input {
    readonly type: 'INPUT';
    readonly varName: string;
}
```

#### Essay

```typescript
interface Essay {
    readonly type: 'ESSAY';
    readonly varName: string;
}
```

#### Radio

```typescript
interface Radio {
    readonly type: 'RADIO';
    readonly varName: string;
    readonly content: ASTObject[];
}
```

#### Check

```typescript
interface Check {
    readonly type: 'CHECK';
    readonly varName: string;
    readonly content: ASTObject[];
}
```

#### Image

```typescript
interface Image {
    readonly type: 'IMAGE';
    readonly varName: string;
    readonly src: string;
}
```

#### Code

```typescript
interface Code {
    readonly type: 'CODE';
    readonly varName: string;
}
```

#### Shuffle

```typescript
interface Shuffle {
    readonly type: 'SHUFFLE';
    readonly varName: string;
    readonly content: ASTObject[];
    readonly shuffledIndeces: number[];
}
```

#### Solution

```typescript
interface Solution {
    readonly type: 'SOLUTION';
    readonly varName: string;
    readonly content: ASTObject[];
}
```