# AssessML (Assessment Markup Language)

Assessment Markup Language is a concise and flexible declarative language for educational assessments.

## Basic Syntax

### Short Answer

Click to see live example (not yet implemented)

#### Text

```
What is the year of the Unix epoch?
```

#### Code

```javascript
answer = '1970';
```

### Variable

[Click to see live example](https://prendus.com/question/cj4os7mld6kq4017073x00cjt/view)

#### Text

```
[var] + [var] = ?
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

[Click to see live example](https://prendus.com/question/cj4osc9bh6lnc017201owg73u/view)

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

[Click to see live example](https://prendus.com/question/cj4osxzcl6vj90170h9ix6tdj/view)

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

[Click to see live example](https://prendus.com/question/cj4ot1nlv6x630170jhxz2u9e/view)

#### Text

```
Fill in the blanks:

Sally was [input] across the field when she realized that she [input] into a stream of [input] water.
```

#### Code

```
answer.input1 = 'running';
answer.input2 = 'ran';
answer.input3 = 'running';
```

### Drag and Drop

Click to see live example (not yet implemented)

#### Text

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

#### Code

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

## BNF

