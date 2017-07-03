# AML

Assessment Markup Language is a concise and flexible declarative language for educational assessments.

## Basic Syntax

### Variable

Example:
```
// Text
{{var1}} + {{var2}} = ?

// Code
var1.min = 0;
var1.max = 25;

var2.min = 26;
var2.max = 50;

answer = var1 + var2;
```

### Multiple Choice

Example:
```
// Text
What color is the sky?

[*] Red
[*] Blue
[*] Green
[*] Yellow

// Code
answer.check1 = false;
answer.check2 = true;
answer.check3 = false;
answer.check4 = false;
```

### Multiple Select

### Multiple Input

### Drag and Drop

## BNF

