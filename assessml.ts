interface Content {
    type: 'CONTENT';
    content: string;
}

interface Variable {
    type: 'VARIABLE';
    varName: string;
    value: number;
}

interface AST {
    type: 'AST';
    ast: (Content | Variable)[];
}

export function generateAST(source: string) {
    return buildAST(source, {
        type: 'AST',
        ast: []
    });
}

function buildAST(source: string, ast: AST): AST {
    console.log(source);

    const variableRegex: RegExp = /\[var.+\]/;
    const inputRegex: RegExp = /\[input\]/;
    const checkRegex: RegExp = /\[x\].+\[x\]/;
    const radioRegex: RegExp = /\[\*\].+\[\*\]/;
    const dragRegex: RegExp = /\[drag\].+\[drag\]/;
    const dropRegex: RegExp = /\[drop\].+\[drop\]/;
    const contentRegex: RegExp = new RegExp(`((.|\n)+?)(${variableRegex.source}|${inputRegex.source})`);

    if (source.search(variableRegex) === 0) {
        const match = source.match(variableRegex) || [];
        const matchedContent = match[0];
        console.log(match)
        return buildAST(source.replace(matchedContent, ''), {
            ...ast,
            ast: [...ast.ast, {
                type: 'VARIABLE',
                varName: matchedContent.replace('[', '').replace(']', ''),
                value: 0
            }]
        })
    }

    if (source.search(contentRegex) === 0) {
        const match = source.match(contentRegex) || [];
        const matchedContent = match[1];
        return buildAST(source.replace(matchedContent, ''), {
            ...ast,
            ast: [...ast.ast, {
                type: 'CONTENT',
                content: matchedContent
            }]
        });
    }

    return ast;
}
