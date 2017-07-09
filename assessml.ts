export function compileToHTML(source: AssessML.AST | string): string {
    const ast: AssessML.AST = typeof source === 'string' ? parse(source) : source;
    const radioGroupName: string = createUUID();

    return ast.ast.reduce((result: string, astObject: AssessML.AST | AssessML.Variable | AssessML.Input | AssessML.Essay | AssessML.Content | AssessML.Check | AssessML.Radio | AssessML.Drag | AssessML.Drop) => {

        if (astObject.type === 'CONTENT') {
            return `${result}${astObject.content}`;
        }

        if (astObject.type === 'VARIABLE') {
            return `${result}${astObject.value}`;
        }

        if (astObject.type === 'INPUT') {
            return `${result}<span id="${astObject.varName}" contenteditable="true" style="display: inline-block; min-width: 25px; min-height: 25px; padding: 5px; box-shadow: 0px 0px 1px black;"></span>`
        }

        if (astObject.type === 'ESSAY') {
            return `${result}<textarea id="${astObject.varName}" style="width: 100%; height: 50vh;"></textarea>`
        }

        if (astObject.type === 'CHECK') {
            return `${result}<input id="${astObject.varName}" type="checkbox" style="width: calc(40px - 1vw); height: calc(40px - 1vw);">${compileToHTML({
                type: 'AST',
                ast: astObject.content
            })}`;
        }

        if (astObject.type === 'RADIO') {
            return `${result}<input id="${astObject.varName}" type="radio" name="${radioGroupName}" style="width: calc(40px - 1vw); height: calc(40px - 1vw);">${compileToHTML({
                type: 'AST',
                ast: astObject.content
            })}`;
        }

        if (astObject.type === 'DRAG') {
            return `${result}DRAG NOT IMPLEMENTED`;
        }

        if (astObject.type === 'DROP') {
            return `${result}DROP NOT IMPLEMENTED`;
        }

        return result;
    }, '');
}

export function parse(source: string) {
    return buildAST(source, {
        type: 'AST',
        ast: []
    }, 0, 0, 0, 0, 0, 0);
}

//TODO make sure that the nested variables and inputs are found
export function getAstObjects(ast: AssessML.AST, type: 'VARIABLE' | 'INPUT' | 'ESSAY' | 'CONTENT' | 'CHECK' | 'RADIO' | 'DRAG' | 'DROP'): (AssessML.Variable | AssessML.Input | AssessML.Essay | AssessML.Content | AssessML.Check | AssessML.Radio | AssessML.Drag | AssessML.Drop)[] {
    // const nestedAstObjects: (Check | Radio | Drag | Drop)[] = <(Check | Radio | Drag | Drop)[]> ast.ast.filter((astObject: Variable | Input | Essay | Content | Check | Radio | Drag | Drop) => {
    //     return astObject.type === 'CHECK' || astObject.type === 'RADIO' || astObject.type === 'DRAG' || astObject.type === 'DROP';
    // });

    return ast.ast.filter((astObject) => {
        return astObject.type === type;
    });
}

function buildAST(source: string, ast: AssessML.AST, numInputs: number, numEssays: number, numChecks: number, numRadios: number, numDrags: number, numDrops: number): AssessML.AST {
    const variableRegex: RegExp = /\[var(.+?)\]/;
    const inputRegex: RegExp = /\[input\]/;
    const essayRegex: RegExp = /\[essay\]/;
    const checkRegex: RegExp = /\[x\](.+?)\[x\]/;
    const radioRegex: RegExp = /\[\*\](.+?)\[\*\]/;
    const dragRegex: RegExp = /\[drag\](.+?)\[drag\]/;
    const dropRegex: RegExp = /\[drop\](.+?)\[drop\]/;
    const contentRegex: RegExp = new RegExp(`((.|\n)+?)((${variableRegex.source}|${inputRegex.source}|${essayRegex.source}|${checkRegex.source}|${radioRegex.source}|${dragRegex.source}|${dropRegex.source})|$)`);

    if (source.search(variableRegex) === 0) {
        const match = source.match(variableRegex) || [];
        const matchedContent = match[0];
        const variable: AssessML.Variable = {
            type: 'VARIABLE',
            varName: matchedContent.replace('[', '').replace(']', ''),
            value: generateRandomInteger(0, 100)
        };

        return buildAST(source.replace(matchedContent, ''), {
            ...ast,
            ast: [...ast.ast, variable]
        }, numInputs, numEssays, numChecks, numRadios, numDrags, numDrops);
    }

    if (source.search(inputRegex) === 0) {
        const match = source.match(inputRegex) || [];
        const matchedContent = match[0];
        const input: AssessML.Input = {
            type: 'INPUT',
            varName: `input${numInputs + 1}`
        };

        return buildAST(source.replace(matchedContent, ''), {
            ...ast,
            ast: [...ast.ast, input]
        }, numInputs + 1, numEssays, numChecks, numRadios, numDrags, numDrops);
    }

    if (source.search(essayRegex) === 0) {
        const match = source.match(essayRegex) || [];
        const matchedContent = match[0];
        const essay: AssessML.Essay = {
            type: 'ESSAY',
            varName: `essay${numEssays + 1}`
        };

        return buildAST(source.replace(matchedContent, ''), {
            ...ast,
            ast: [...ast.ast, essay]
        }, numInputs, numEssays + 1, numChecks, numRadios, numDrags, numDrops);
    }

    if (source.search(checkRegex) === 0) {
        const match = source.match(checkRegex) || [];
        const matchedContent = match[0];
        const insideContent = match[1];
        const check: AssessML.Check = {
            type: 'CHECK',
            varName: `check${numChecks + 1}`,
            content: <(AssessML.Content | AssessML.Variable)[]> buildAST(insideContent, {
                type: 'AST',
                ast: []
            }, 0, 0, 0, 0, 0, 0).ast
        };

        return buildAST(source.replace(matchedContent, ''), {
            ...ast,
            ast: [...ast.ast, check]
        }, numInputs, numEssays, numChecks + 1, numRadios, numDrags, numDrops);
    }

    if (source.search(radioRegex) === 0) {
        const match = source.match(radioRegex) || [];
        const matchedContent = match[0];
        const insideContent = match[1];
        const radio: AssessML.Radio = {
            type: 'RADIO',
            varName: `radio${numRadios + 1}`,
            content: <(AssessML.Content | AssessML.Variable)[]> buildAST(insideContent, {
                type: 'AST',
                ast: []
            }, 0, 0, 0, 0, 0, 0).ast
        };

        return buildAST(source.replace(matchedContent, ''), {
            ...ast,
            ast: [...ast.ast, radio]
        }, numInputs, numEssays, numChecks, numRadios + 1, numDrags, numDrops);
    }

    if (source.search(dragRegex) === 0) {
        const match = source.match(dragRegex) || [];
        const matchedContent = match[0];
        const insideContent = match[1];
        const drag: AssessML.Drag = {
            type: 'DRAG',
            varName: `drag${numDrags + 1}`,
            content: <(AssessML.Content | AssessML.Variable)[]> buildAST(insideContent, {
                type: 'AST',
                ast: []
            }, 0, 0, 0, 0, 0, 0).ast
        };

        return buildAST(source.replace(matchedContent, ''), {
            ...ast,
            ast: [...ast.ast, drag]
        }, numInputs, numEssays, numChecks, numRadios, numDrags + 1, numDrops);
    }

    if (source.search(dropRegex) === 0) {
        const match = source.match(dropRegex) || [];
        const matchedContent = match[0];
        const insideContent = match[1];
        const drop: AssessML.Drop = {
            type: 'DROP',
            varName: `drop${numDrops + 1}`,
            content: <(AssessML.Content | AssessML.Variable)[]> buildAST(insideContent, {
                type: 'AST',
                ast: []
            }, 0, 0, 0, 0, 0, 0).ast
        };

        return buildAST(source.replace(matchedContent, ''), {
            ...ast,
            ast: [...ast.ast, drop]
        }, numInputs, numEssays, numChecks, numRadios, numDrags, numDrops + 1);
    }

    if (source.search(contentRegex) === 0) {
        const match = source.match(contentRegex) || [];
        const matchedContent = match[1];
        const content: AssessML.Content = {
            type: 'CONTENT',
            content: matchedContent
        };

        return buildAST(source.replace(matchedContent, ''), {
            ...ast,
            ast: [...ast.ast, content]
        }, numInputs, numEssays, numChecks, numRadios, numDrags, numDrops);
    }

    return ast;
}

function createUUID() {
    //From persistence.js; Copyright (c) 2010 Zef Hemel <zef@zef.me> * * Permission is hereby granted, free of charge, to any person * obtaining a copy of this software and associated documentation * files (the "Software"), to deal in the Software without * restriction, including without limitation the rights to use, * copy, modify, merge, publish, distribute, sublicense, and/or sell * copies of the Software, and to permit persons to whom the * Software is furnished to do so, subject to the following * conditions: * * The above copyright notice and this permission notice shall be * included in all copies or substantial portions of the Software. * * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR * OTHER DEALINGS IN THE SOFTWARE.
	var s: any[] = [];
	var hexDigits = "0123456789ABCDEF";
	for ( var i = 0; i < 32; i++) {
		s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
	}
	s[12] = "4";
	s[16] = hexDigits.substr((s[16] & 0x3) | 0x8, 1);

	var uuid = s.join("");
	return uuid;
}

function generateRandomInteger(min: number, max: number) {
    //returns a random integer between min (included) and max (included)
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
