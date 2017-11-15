export interface AST {
    type: 'AST';
    ast: ASTObject[];
}

export type ASTObject = Content | Variable | Input | Essay | Check | Radio | Drag | Drop | Image | Solution | Code | Graph;

export interface Check {
    type: 'CHECK';
    varName: string;
    content: (Variable | Content | Image | Graph)[];
}

export interface Content {
    type: 'CONTENT';
    content: string;
}

export interface Drag {
    type: 'DRAG';
    varName: string;
    content: (Variable | Content | Image | Graph)[];
}

export interface Drop {
    type: 'DROP';
    varName: string;
    content: (Variable | Content | Image | Graph)[];
}

export interface Essay {
    type: 'ESSAY';
    varName: string;
}

export interface Code {
    type: 'CODE';
    varName: string;
}

export interface Input {
    type: 'INPUT';
    varName: string;
}

export interface Radio {
    type: 'RADIO';
    varName: string;
    content: (Variable | Content | Image | Graph)[];
}

export interface Variable {
    type: 'VARIABLE';
    varName: string;
    value: number | string;
}

export interface Image {
    type: 'IMAGE';
    varName: string;
    src: string;
}

export interface Graph {
    type: 'GRAPH';
    varName: string;
    equations: string[];
}

export interface Solution {
    type: 'SOLUTION';
    varName: string;
    content: (Variable | Content | Image | Graph)[];
}
