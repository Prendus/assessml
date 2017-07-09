export interface AST {
    type: 'AST';
    ast: (Content | Variable | Input | Essay | Check | Radio | Drag | Drop)[];
}

export interface Check {
    type: 'CHECK';
    varName: string;
    content: (Variable | Content)[];
}

export interface Content {
    type: 'CONTENT';
    content: string;
}

export interface Drag {
    type: 'DRAG';
    varName: string;
    content: (Variable | Content)[];
}

export interface Drop {
    type: 'DROP';
    varName: string;
    content: (Variable | Content)[];
}

export interface Essay {
    type: 'ESSAY';
    varName: string;
}

export interface Input {
    type: 'INPUT';
    varName: string;
}

export interface Radio {
    type: 'RADIO';
    varName: string;
    content: (Variable | Content)[];
}

export interface Variable {
    type: 'VARIABLE';
    varName: string;
    value: number;
}
