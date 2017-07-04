import {AST} from './typings/ast';
import {Variable} from './typings/variable';
import {Input} from './typings/input';
import {Content} from './typings/content';
import {Check} from './typings/check';
import {Radio} from './typings/radio';
import {Drag} from './typings/drag';
import {Drop} from './typings/drop';

export function generateAST(source: string) {
    return buildAST(source, {
        type: 'AST',
        ast: []
    }, 0, 0, 0, 0, 0);
}

function buildAST(source: string, ast: AST, numInputs: number, numChecks: number, numRadios: number, numDrags: number, numDrops: number): AST {
    const variableRegex: RegExp = /\[var(.+?)\]/;
    const inputRegex: RegExp = /\[input\]/;
    const checkRegex: RegExp = /\[x\](.+?)\[x\]/;
    const radioRegex: RegExp = /\[\*\](.+?)\[\*\]/;
    const dragRegex: RegExp = /\[drag\](.+?)\[drag\]/;
    const dropRegex: RegExp = /\[drop\](.+?)\[drop\]/;
    const contentRegex: RegExp = new RegExp(`((.|\n)+?)((${variableRegex.source}|${inputRegex.source}|${checkRegex.source}|${radioRegex.source})|$)`);

    if (source.search(variableRegex) === 0) {
        const match = source.match(variableRegex) || [];
        const matchedContent = match[0];
        const variable: Variable = {
            type: 'VARIABLE',
            varName: matchedContent.replace('[', '').replace(']', ''),
            value: 0
        };

        return buildAST(source.replace(matchedContent, ''), {
            ...ast,
            ast: [...ast.ast, variable]
        }, numInputs, numChecks, numRadios, numDrags, numDrops);
    }

    if (source.search(inputRegex) === 0) {
        const match = source.match(inputRegex) || [];
        const matchedContent = match[0];
        const input: Input = {
            type: 'INPUT',
            varName: `input${numInputs + 1}`
        };

        return buildAST(source.replace(matchedContent, ''), {
            ...ast,
            ast: [...ast.ast, input]
        }, numInputs + 1, numChecks, numRadios, numDrags, numDrops);
    }

    if (source.search(checkRegex) === 0) {
        const match = source.match(checkRegex) || [];
        const matchedContent = match[0];
        const insideContent = match[1];
        const check: Check = {
            type: 'CHECK',
            varName: `check${numChecks + 1}`,
            content: <(Content | Variable)[]> buildAST(insideContent, {
                type: 'AST',
                ast: []
            }, 0, 0, 0, 0, 0).ast
        };

        return buildAST(source.replace(matchedContent, ''), {
            ...ast,
            ast: [...ast.ast, check]
        }, numInputs, numChecks + 1, numRadios, numDrags, numDrops);
    }

    if (source.search(radioRegex) === 0) {
        const match = source.match(radioRegex) || [];
        const matchedContent = match[0];
        const insideContent = match[1];
        const radio: Radio = {
            type: 'RADIO',
            varName: `radio${numRadios + 1}`,
            content: <(Content | Variable)[]> buildAST(insideContent, {
                type: 'AST',
                ast: []
            }, 0, 0, 0, 0, 0).ast
        };

        return buildAST(source.replace(matchedContent, ''), {
            ...ast,
            ast: [...ast.ast, radio]
        }, numInputs, numChecks, numRadios + 1, numDrags, numDrops);
    }

    if (source.search(dragRegex) === 0) {
        const match = source.match(dragRegex) || [];
        const matchedContent = match[0];
        const insideContent = match[1];
        const drag: Drag = {
            type: 'DRAG',
            varName: `drag${numDrags + 1}`,
            content: <(Content | Variable)[]> buildAST(insideContent, {
                type: 'AST',
                ast: []
            }, 0, 0, 0, 0, 0).ast
        };

        return buildAST(source.replace(matchedContent, ''), {
            ...ast,
            ast: [...ast.ast, drag]
        }, numInputs, numChecks, numRadios, numDrags + 1, numDrops);
    }

    if (source.search(dropRegex) === 0) {
        const match = source.match(dropRegex) || [];
        const matchedContent = match[0];
        const insideContent = match[1];
        const drop: Drop = {
            type: 'DROP',
            varName: `drop${numDrops + 1}`,
            content: <(Content | Variable)[]> buildAST(insideContent, {
                type: 'AST',
                ast: []
            }, 0, 0, 0, 0, 0).ast
        };

        return buildAST(source.replace(matchedContent, ''), {
            ...ast,
            ast: [...ast.ast, drop]
        }, numInputs, numChecks, numRadios, numDrags, numDrops + 1);
    }

    if (source.search(contentRegex) === 0) {
        const match = source.match(contentRegex) || [];
        const matchedContent = match[1];
        const content: Content = {
            type: 'CONTENT',
            content: matchedContent
        };

        return buildAST(source.replace(matchedContent, ''), {
            ...ast,
            ast: [...ast.ast, content]
        }, numInputs, numChecks, numRadios, numDrags, numDrops);
    }

    return ast;
}
