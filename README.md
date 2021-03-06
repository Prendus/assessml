[![CircleCI](https://circleci.com/gh/Prendus/assessml.svg?style=shield)](https://circleci.com/gh/Prendus/assessml) [![npm version](https://img.shields.io/npm/v/assessml.svg?style=flat)](https://www.npmjs.com/package/assessml) [![dependency Status](https://david-dm.org/prendus/assessml/status.svg)](https://david-dm.org/prendus/assessml) [![devDependency Status](https://david-dm.org/prendus/assessml/dev-status.svg)](https://david-dm.org/prendus/assessml?type=dev)

# AssessML (Assessment Markup Language)

AssessML (Assessment Markup Language) is a concise and flexible declarative language for educational assessments. It is meant to be used with assessment editors such as [assess-elements](https://github.com/lastmjs/assess-elements) to create a fully featured assessment experience. This repository contains the language specification and JavaScript implementations of various language tools (AST generator, compilers, etc).

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
} from 'assessml';

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
} from 'assessml';
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

## Language specification

* [Syntax examples](#syntax-examples)
* [BNF](#bnf-backus-naur-form-grammar)
* [AST](#ast-abstract-syntax-tree)

### Syntax examples

AssessML is meant to be used with an assessment editor to provide functionality such as answer checking. We will use [assess-elements](https://github.com/lastmjs/assess-elements) for our examples. Exercises created with [assess-elements](https://github.com/lastmjs/assess-elements) have two components, which can be described as the exercise text and the answer code. The exercise text describes what the user will see, and is written with AssessML. The answer code gives the exercise its functionality, is where the final answer will need to be calculated, and is written in JavaScript. The following are examples of currently available AssessML tags, along with sample JavaScript functionality. 

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

Variable tags present variable strings or numbers to the user. The `compileToHTML` function takes a function as a parameter that will generate default initial values for variables. Variable names must start with `var` and end with any non-empty string. In the [assess-elements](https://github.com/lastmjs/assess-elements) assessment editor, variable tags declared in the exercise text will create variables with equivalent names in the answer code. These variables will contain the string or number value of the variable. Minimum and maximum values, as well as decimal precision, can be set using JavaScript functions defined elsewhere.

#### Fill in the blank

[Basic live demo](https://www.prendus.com/question/cjg7im37lb2s50114aod9vpkd/demo)

[Advanced live demo](https://www.prendus.com/question/cjg7iqz5nb4p70114nodd157x/demo)

##### AssessML (exercise text)

```
Fill in the blanks:

Sally was [input1] across the field when she realized that she [input2] into a stream of [input3] water.
```

##### JavaScript (answer code)

```javascript
answer = (
  input1 === 'running' &&
  input2 === 'ran' &&
  input3 === 'running'
);
```

Input tags create small inputs for users to enter short responses. Input names must start with `input` and end with any non-empty string. In the [assess-elements](https://github.com/lastmjs/assess-elements) assessment editor, input tags declared in the exercise text will create variables with equivalent names in the answer code. These variables will contain the string entered by the user into the input.

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

Essay tags provide a large textarea for users to write essay responses. Any JavaScript functionality can be used in the answer code to determine if the question is answered correctly. In this example, we use a simple string function to check if the user has mentioned the word `happy` anywhere in the response. Essay names must start with `essay` and end with any non-empty string. In the [assess-elements](https://github.com/lastmjs/assess-elements) assessment editor, essay tags declared in the exercise text will create variables with equivalent names in the answer code. These variables will contain the string entered by the user into the essay input.

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

Radio tags create radio buttons to the left of whatever is declared within the tags. Any text, including other AssessML tags, can go between radio tags. Radio names must start with `radio` and end with any non-empty string. In the [assess-elements](https://github.com/lastmjs/assess-elements) assessment editor, radio tags declared in the exercise text will create variables with equivalent names in the answer code. These variables will contain boolean values representing the checked state of the radio buttons.

#### Multiple select (checkboxes)

[Basic live demo](https://www.prendus.com/question/cjg7i6q89b6z801154qf7cmzx/demo)

[Advanced live demo](https://www.prendus.com/question/cjg7iik10bd3301266hfj6qlb/demo)

##### AssessML (exercise text)

```
Who were presidents of the United States of America?

[check1]Bing Crosby[check1]
[check2]Bill Cosby[check2]
[check3]Thomas Jefferson[check3]
[check4]George Washington[check4]
```

##### JavaScript (answer code)

```javascript
answer = (
  check1 === false &&
  check2 === false &&
  check3 === true &&
  check4 === true
);
```

Check tags create checkboxes to the left of whatever is declared within the tags. Any text, including other AssessML tags, can go between check tags. Check names must start with `check` and end with any non-empty string. In the [assess-elements](https://github.com/lastmjs/assess-elements) assessment editor, check tags declared in the exercise text will create variables with equivalent names in the answer code. These variables will contain boolean values representing the checked state of the checkboxes.

#### Image

[Basic live demo](https://www.prendus.com/question/cjg86oncn5r780195ubdk450g/demo)

[Advanced live demo](https://www.prendus.com/question/cj9t1lb4z774s01125a24euff/demo)

##### AssessML (exercise text)

```
What type of bird is this?

[img1]

[input1]
```

##### JavaScript (answer code)

```javascript
img1.src = 'https://images.pexels.com/photos/48894/galah-rose-breasted-cockatoo-parrot-bird-48894.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260';

answer = input1 === 'cockatoo';
```
Image tags create images. Image names must start with `image` and end with any non-empty string. In the [assess-elements](https://github.com/lastmjs/assess-elements) assessment editor, image tags declared in the exercise text will create variables with equivalent names in the answer code. These variables have one property, `src`, that must be set to some kind of image URI, such as the URL to a remotely hosted image, or a data URI for an inline image.

#### Code

[Basic live demo](https://www.prendus.com/question/cjg863dp15hcd0102v4y5olus/demo)

[Advanced live demo](https://www.prendus.com/question/cjg86aar45l5p0113463xjk69/demo)

##### AssessML (exercise text)

```
Create a function named hello that returns the string 'world!';

[code1]
```

##### JavaScript (answer code)

```javascript
if (code1) {
  eval(code1);
  answer = hello() === 'world!';
}
else {
  answer = false;
}
```

Code tags create an interactive code editor. Code names must start with `code` and end with any non-empty string. In the [assess-elements](https://github.com/lastmjs/assess-elements) assessment editor, code tags declared in the exercise text will create variables with equivalent names in the answer code. These variables will contain the string entered by the user into the code editor. The answer code can then `eval` the user code or perform static analysis to interact with and verify it. Be aware that `eval` can be a security vulnerability when executing untrusted code. [assess-elements](https://github.com/lastmjs/assess-elements) will and [secure-eval](https://github.com/Prendus/secure-eval) currently does provide means of mitigating `eval` risks.

#### Shuffle

##### AssessML (exercise text)

```
Which of the following is a number?

[shuffle1]
  [radio1]1[radio1]
  [radio2]Monkey[radio2]
  [radio3]Fish[radio3]
[shuffle1]
```

##### JavaScript (answer code)

```javascript
answer = radio1 === true;
```

Shuffle tags allow shuffling of their contents. For example, this makes it unnecessary to worry about order of options when creating multiple choice or multiple select exercises for which you want an unpredictable order. Shuffle tags can have any valid combination of AssessML tags between them. Shuffle names must start with `shuffle` and end with any non-empty string.

#### Solution

[Basic live demo](https://www.prendus.com/question/cjg87xs6r67n101215xzfirsu/demo)

[Advanced live demo](https://www.prendus.com/question/cj9ujbolb9tp60186ejo0ztx3/demo)

##### AssessML (exercise text)

```
What is the 5 + 5? [input1]

[solution1]
First take 5, then take another 5, then add them together. Boom, you have 10.
[solution1]
```

##### JavaScript (answer code)

```javascript
answer = input1 == 10;
```

Solution tags allow a solution to be delivered with the exercise text. The solution is stored in an HTML template, thus not initially rendered. An assessment editor can display the contents of the template as desired. Any text, including other AssessML tags, can go between solution tags. Solution names must start with `solution` and end with any non-empty string.

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