declare module AssessML {
    interface AST {
        type: 'AST';
        ast: (Content | Variable | Input | Essay | Check | Radio | Drag | Drop)[];
    }

    interface Check {
        type: 'CHECK';
        varName: string;
        content: (Variable | Content)[];
    }

    interface Content {
        type: 'CONTENT';
        content: string;
    }

    interface Drag {
        type: 'DRAG';
        varName: string;
        content: (Variable | Content)[];
    }

    interface Drop {
        type: 'DROP';
        varName: string;
        content: (Variable | Content)[];
    }

    interface Essay {
        type: 'ESSAY';
        varName: string;
    }

    interface Input {
        type: 'INPUT';
        varName: string;
    }

    interface Radio {
        type: 'RADIO';
        varName: string;
        content: (Variable | Content)[];
    }

    interface Variable {
        type: 'VARIABLE';
        varName: string;
        value: number;
    }
}
