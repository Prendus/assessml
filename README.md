# AML

Assessment Markup Language is a concise and flexible declarative language for educational assessments.

## Basic Syntax

### Variable

Example:

#### Text

```
{{var1}} + {{var2}} = ?
```

#### Code

```javascript
var1.min = 0;
var1.max = 25;

var2.min = 26;
var2.max = 50;

answer = var1 + var2;
```

### Multiple Choice

Example:

#### Text

```
What color is the sky?

[*] Red
[*] Blue
[*] Green
[*] Yellow
```

#### Code

```javascript
answer.radio1 = false;
answer.radio2 = true;
answer.radio3 = false;
answer.radio4 = false;
```

### Multiple Select

Example:

#### Text

```
Who were presidents of the United States of America?

[x] Bing Crosby
[x] Bill Cosby
[x] Thomas Jefferson
[x] George Washington
```

#### Code

```
answer.check1 = false;
answer.check2 = false;
answer.check3 = true;
answer.check4 = true;
```

### Multiple Input

Example:

#### Text

```
Fill in the blanks:

Sally was [[input]] across the field when she realized that she [[input]] into a stream of [[input]] water.
```

#### Code

```
answer.input1 = 'running';
answer.input2 = 'ran';
answer.input3 = 'running';
```

### Drag and Drop

## BNF

