export interface AST {
    readonly type: 'AST';
    readonly ast: ASTObject[];
}

export type ASTObject = Content | Variable | Input | Essay | Check | Radio | Drag | Drop | Image | Solution | Code | Graph | Shuffle;
export type ASTObjectType = 'VARIABLE' | 'INPUT' | 'ESSAY' | 'CONTENT' | 'CHECK' | 'RADIO' | 'DRAG' | 'DROP' | 'IMAGE' | 'SOLUTION' | 'CODE' | 'SHUFFLE' | 'GRAPH';

export interface Check {
    readonly type: 'CHECK';
    readonly varName: string;
    readonly content: ASTObject[];
}

export interface Content {
    readonly type: 'CONTENT';
    readonly varName: string;
    readonly content: string;
}

export interface Drag {
    readonly type: 'DRAG';
    readonly varName: string;
    readonly content: ASTObject[];
}

export interface Drop {
    readonly type: 'DROP';
    readonly varName: string;
    readonly content: ASTObject[];
}

export interface Essay {
    readonly type: 'ESSAY';
    readonly varName: string;
}

export interface Code {
    readonly type: 'CODE';
    readonly varName: string;
}

export interface Input {
    readonly type: 'INPUT';
    readonly varName: string;
}

export interface Radio {
    readonly type: 'RADIO';
    readonly varName: string;
    readonly content: ASTObject[];
}

export interface Variable {
    readonly type: 'VARIABLE';
    readonly varName: string;
    readonly value: number | string;
}

export interface Image {
    readonly type: 'IMAGE';
    readonly varName: string;
    readonly src: string;
}

export interface Graph {
    readonly type: 'GRAPH';
    readonly varName: string;
    readonly equations: string[];
}

export interface Solution {
    readonly type: 'SOLUTION';
    readonly varName: string;
    readonly content: ASTObject[];
}

export interface Shuffle {
    readonly type: 'SHUFFLE';
    readonly varName: string;
    readonly content: ASTObject[];
}

export interface BuildASTResult {
    readonly ast: AST;
    readonly numInputs: number;
    readonly numEssays: number;
    readonly numChecks: number;
    readonly numRadios: number;
    readonly numDrags: number;
    readonly numDrops: number;
    readonly numSolutions: number;
    readonly numCodes: number;
    readonly numShuffles: number;
}
