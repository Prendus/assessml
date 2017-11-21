import {AST, ASTObject, ASTObjectType, Variable, Input, Essay, Content, Check, Radio, Drag, Drop, Image, Solution, Code, Graph, Shuffle} from './assessml.d';

export function compileToHTML(source: AST | string, generateVarValue: (varName: string) => number | string, generateImageSrc: (varName: string) => string, generateGraphEquations: (varName: string) => string[]): string {
    const ast: AST = typeof source === 'string' ? parse(source, generateVarValue, generateImageSrc, generateGraphEquations) : source;
    const radioGroupName: string = createUUID();

    return ast.ast.reduce((result: string, astObject: ASTObject) => {

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

        if (astObject.type === 'CODE') {
            return `${result}<juicy-ace-editor id="${astObject.varName}" theme="ace/theme/chrome" mode="ace/mode/javascript" style="height: 50vh" fontsize="25px"></juicy-ace-editor>`;
        }

        if (astObject.type === 'CHECK') {
            return `${result}<input id="${astObject.varName}" type="checkbox" style="width: calc(40px - 1vw); height: calc(40px - 1vw);">${compileToHTML({
                type: 'AST',
                ast: astObject.content
            }, generateVarValue, generateImageSrc, generateGraphEquations)}`;
        }

        if (astObject.type === 'RADIO') {
            return `${result}<input id="${astObject.varName}" type="radio" name="${radioGroupName}" style="width: calc(40px - 1vw); height: calc(40px - 1vw);">${compileToHTML({
                type: 'AST',
                ast: astObject.content
            }, generateVarValue, generateImageSrc, generateGraphEquations)}`;
        }

        if (astObject.type === 'DRAG') {
            return `${result}DRAG NOT IMPLEMENTED`;
        }

        if (astObject.type === 'DROP') {
            return `${result}DROP NOT IMPLEMENTED`;
        }

        if (astObject.type === 'IMAGE') {
            return `${result}<img src="${astObject.src}">`;
        }

        if (astObject.type === 'SOLUTION') {
            return `${result}<template id="${astObject.varName}">${compileToHTML({
                type: 'AST',
                ast: astObject.content
            }, generateVarValue, generateImageSrc, generateGraphEquations)}</template>`;
        }

        if (astObject.type === 'GRAPH') {
            return `${result}<function-plot data='[${astObject.equations.reduce((result, equation, index) => `${result}${index !== 0 ? ',' : ''}{ "fn": "${equation}" }`, '')}]'></function-plot>`;
        }

        if (astObject.type === 'SHUFFLE') {
            return `${result}${compileToHTML({
                type: 'AST',
                ast: shuffleItems(astObject.content)
            }, generateVarValue, generateImageSrc, generateGraphEquations)}`;
        }

        return result;
    }, '');
}

export function compileToAssessML(source: AST | string, generateVarValue: (varName: string) => number | string, generateImageSrc: (varName: string) => string, generateGraphEquations: (varName: string) => string[]): string {
    const ast: AST = typeof source === 'string' ? parse(source, generateVarValue, generateImageSrc, generateGraphEquations) : source;

    return ast.ast.reduce((result: string, astObject: ASTObject) => {

        if (astObject.type === 'CONTENT') {
            return `${result}${astObject.content}`;
        }

        if (astObject.type === 'VARIABLE') {
            return `${result}[${astObject.varName}]`;
        }

        if (astObject.type === 'INPUT') {
            return `${result}[input]`
        }

        if (astObject.type === 'ESSAY') {
            return `${result}[essay]`
        }

        if (astObject.type === 'CODE') {
            return `${result}[code]`
        }

        if (astObject.type === 'CHECK') {
            return `${result}[x]${compileToAssessML({
                type: 'AST',
                ast: astObject.content
            }, generateVarValue, generateImageSrc, generateGraphEquations)}[x]`;
        }

        if (astObject.type === 'RADIO') {
            return `${result}[*]${compileToAssessML({
                type: 'AST',
                ast: astObject.content
            }, generateVarValue, generateImageSrc, generateGraphEquations)}[*]`;
        }

        if (astObject.type === 'DRAG') {
            return `${result}[drag]${compileToAssessML({
                type: 'AST',
                ast: astObject.content
            }, generateVarValue, generateImageSrc, generateGraphEquations)}[drag]`;
        }

        if (astObject.type === 'DROP') {
            return `${result}[drop]${compileToAssessML({
                type: 'AST',
                ast: astObject.content
            }, generateVarValue, generateImageSrc, generateGraphEquations)}[drop]`;
        }

        if (astObject.type === 'IMAGE') {
            return `${result}[${astObject.varName}]`;
        }

        if (astObject.type === 'SOLUTION') {
            return `${result}[solution]${compileToAssessML({
                type: 'AST',
                ast: astObject.content
            }, generateVarValue, generateImageSrc, generateGraphEquations)}[solution]`;
        }

        if (astObject.type === 'GRAPH') {
            return `${result}[${astObject.varName}]`;
        }

        if (astObject.type === 'SHUFFLE') {
            return `${result}[shuffle]${compileToAssessML({
                type: 'AST',
                ast: astObject.content
            }, generateVarValue, generateImageSrc, generateGraphEquations)}[shuffle]`;
        }

        return result;
    }, '');
}

export function parse(source: string, generateVarValue: (varName: string) => number | string, generateImageSrc: (varName: string) => string, generateGraphEquations: (varName: string) => string[]) {
    return buildAST(source, {
        type: 'AST',
        ast: []
    }, generateVarValue, generateImageSrc, generateGraphEquations, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
}

function buildAST(source: string, ast: AST, generateVarValue: (varName: string) => number | string, generateImageSrc: (varName: string) => string, generateGraphEquations: (varName: string) => string[], numInputs: number, numEssays: number, numChecks: number, numRadios: number, numDrags: number, numDrops: number, numSolutions: number, numCodes: number, numShuffles: number, numContents: number): AST {
    const variableRegex: RegExp = /\[var((.|\n|\r)+?)\]/;
    const inputRegex: RegExp = /\[input\]/;
    const shuffleRegex: RegExp = /\[shuffle\]/;
    const essayRegex: RegExp = /\[essay\]/;
    const codeRegex: RegExp = /\[code\]/;
    const checkRegex: RegExp = /\[x\]((.|\n|\r)*?)\[x\]/;
    const radioRegex: RegExp = /\[\*\]((.|\n|\r)*?)\[\*\]/;
    const dragRegex: RegExp = /\[drag\]((.|\n|\r)*?)\[drag\]/;
    const dropRegex: RegExp = /\[drop\]((.|\n|\r)*?)\[drop\]/;
    const solutionRegex: RegExp = /\[solution\]((.|\n|\r)*?)\[solution\]/;
    const imageRegex: RegExp = /\[img((.|\n|\r)+?)\]/;
    const graphRegex: RegExp = /\[graph((.|\n|\r)+?)\]/;
    const contentRegex: RegExp = new RegExp(`((.|\n|\r)+?)((${variableRegex.source}|${inputRegex.source}|${essayRegex.source}|${codeRegex.source}|${checkRegex.source}|${radioRegex.source}|${dragRegex.source}|${dropRegex.source}|${imageRegex.source}|${graphRegex.source}|${solutionRegex.source}|${shuffleRegex.source})|$)`);

    if (source.search(variableRegex) === 0) {
        const match = source.match(variableRegex) || [];
        const matchedContent = match[0];
        const varName = matchedContent.replace('[', '').replace(']', '');
        const existingVarValue = <string | null> getASTObjectPayload(ast, 'VARIABLE', varName);
        const generatedVarValue = generateVarValue(varName);
        const newVarValue = existingVarValue === null ? generatedVarValue : existingVarValue;
        const variable: Variable = {
            type: 'VARIABLE',
            varName,
            value: newVarValue
        };

        return buildAST(source.replace(matchedContent, ''), {
            ...ast,
            ast: [...ast.ast, variable]
        }, generateVarValue, generateImageSrc, generateGraphEquations, numInputs, numEssays, numChecks, numRadios, numDrags, numDrops, numSolutions, numCodes, numShuffles, numContents);
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
        }, generateVarValue, generateImageSrc, generateGraphEquations, numInputs + 1, numEssays, numChecks, numRadios, numDrags, numDrops, numSolutions, numCodes, numShuffles, numContents);
    }

    if (source.search(essayRegex) === 0) {
        const match = source.match(essayRegex) || [];
        const matchedContent = match[0];
        const essay: Essay = {
            type: 'ESSAY',
            varName: `essay${numEssays + 1}`
        };

        return buildAST(source.replace(matchedContent, ''), {
            ...ast,
            ast: [...ast.ast, essay]
        }, generateVarValue, generateImageSrc, generateGraphEquations, numInputs, numEssays + 1, numChecks, numRadios, numDrags, numDrops, numSolutions, numCodes, numShuffles, numContents);
    }

    if (source.search(shuffleRegex) === 0) {
        const match = source.match(shuffleRegex) || [];
        const matchedContent = match[0];
        const insideContent = match[1];
        const shuffle: Shuffle = {
            type: 'SHUFFLE',
            varName: `shuffle${numShuffles + 1}`,
            content: buildAST(insideContent, {
                type: 'AST',
                ast: []
            }, generateVarValue, generateImageSrc, generateGraphEquations, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0).ast
        };

        return buildAST(source.replace(matchedContent, ''), {
            ...ast,
            ast: [...ast.ast, shuffle]
        }, generateVarValue, generateImageSrc, generateGraphEquations, numInputs + 1, numEssays, numChecks, numRadios, numDrags, numDrops, numSolutions, numCodes, numShuffles + 1, numContents);
    }

    if (source.search(codeRegex) === 0) {
        const match = source.match(codeRegex) || [];
        const matchedContent = match[0];
        const code: Code = {
            type: 'CODE',
            varName: `code${numCodes + 1}`
        };

        return buildAST(source.replace(matchedContent, ''), {
            ...ast,
            ast: [...ast.ast, code]
        }, generateVarValue, generateImageSrc, generateGraphEquations, numInputs, numEssays, numChecks, numRadios, numDrags, numDrops, numSolutions, numCodes + 1, numShuffles, numContents);
    }

    if (source.search(checkRegex) === 0) {
        const match = source.match(checkRegex) || [];
        const matchedContent = match[0];
        const insideContent = match[1];
        const check: Check = {
            type: 'CHECK',
            varName: `check${numChecks + 1}`,
            content: buildAST(insideContent, {
                type: 'AST',
                ast: []
            }, generateVarValue, generateImageSrc, generateGraphEquations, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0).ast
        };

        return buildAST(source.replace(matchedContent, ''), {
            ...ast,
            ast: [...ast.ast, check]
        }, generateVarValue, generateImageSrc, generateGraphEquations, numInputs, numEssays, numChecks + 1, numRadios, numDrags, numDrops, numSolutions, numCodes, numShuffles, numContents);
    }

    if (source.search(radioRegex) === 0) {
        const match = source.match(radioRegex) || [];
        const matchedContent = match[0];
        const insideContent = match[1];
        const radio: Radio = {
            type: 'RADIO',
            varName: `radio${numRadios + 1}`,
            content: buildAST(insideContent, {
                type: 'AST',
                ast: []
            }, generateVarValue, generateImageSrc, generateGraphEquations, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0).ast
        };

        return buildAST(source.replace(matchedContent, ''), {
            ...ast,
            ast: [...ast.ast, radio]
        }, generateVarValue, generateImageSrc, generateGraphEquations, numInputs, numEssays, numChecks, numRadios + 1, numDrags, numDrops, numSolutions, numCodes, numShuffles, numContents);
    }

    if (source.search(dragRegex) === 0) {
        const match = source.match(dragRegex) || [];
        const matchedContent = match[0];
        const insideContent = match[1];
        const drag: Drag = {
            type: 'DRAG',
            varName: `drag${numDrags + 1}`,
            content: buildAST(insideContent, {
                type: 'AST',
                ast: []
            }, generateVarValue, generateImageSrc, generateGraphEquations, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0).ast
        };

        return buildAST(source.replace(matchedContent, ''), {
            ...ast,
            ast: [...ast.ast, drag]
        }, generateVarValue, generateImageSrc, generateGraphEquations, numInputs, numEssays, numChecks, numRadios, numDrags + 1, numDrops, numSolutions, numCodes, numShuffles, numContents);
    }

    if (source.search(dropRegex) === 0) {
        const match = source.match(dropRegex) || [];
        const matchedContent = match[0];
        const insideContent = match[1];
        const drop: Drop = {
            type: 'DROP',
            varName: `drop${numDrops + 1}`,
            content: buildAST(insideContent, {
                type: 'AST',
                ast: []
            }, generateVarValue, generateImageSrc, generateGraphEquations, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0).ast
        };

        return buildAST(source.replace(matchedContent, ''), {
            ...ast,
            ast: [...ast.ast, drop]
        }, generateVarValue, generateImageSrc, generateGraphEquations, numInputs, numEssays, numChecks, numRadios, numDrags, numDrops + 1, numSolutions, numCodes, numShuffles, numContents);
    }

    if (source.search(imageRegex) === 0) {
        const match = source.match(imageRegex) || [];
        const matchedContent = match[0];
        const varName = matchedContent.replace('[', '').replace(']', '');
        const image: Image = {
            type: 'IMAGE',
            varName,
            src: generateImageSrc(varName)
        };

        return buildAST(source.replace(matchedContent, ''), {
            ...ast,
            ast: [...ast.ast, image]
        }, generateVarValue, generateImageSrc, generateGraphEquations, numInputs, numEssays, numChecks, numRadios, numDrags, numDrops, numSolutions, numCodes, numShuffles, numContents);
    }

    if (source.search(graphRegex) === 0) {
        const match = source.match(graphRegex) || [];
        const matchedContent = match[0];
        const varName = matchedContent.replace('[', '').replace(']', '');
        const graph: Graph = {
            type: 'GRAPH',
            varName,
            equations: generateGraphEquations(varName)
        };

        return buildAST(source.replace(matchedContent, ''), {
            ...ast,
            ast: [...ast.ast, graph]
        }, generateVarValue, generateImageSrc, generateGraphEquations, numInputs, numEssays, numChecks, numRadios, numDrags, numDrops, numSolutions, numCodes, numShuffles, numContents);
    }

    if (source.search(solutionRegex) === 0) {
        const match = source.match(solutionRegex) || [];
        const matchedContent = match[0];
        const insideContent = match[1];
        const solution: Solution = {
            type: 'SOLUTION',
            varName: `solution${numSolutions + 1}`,
            content: buildAST(insideContent, {
                type: 'AST',
                ast: []
            }, generateVarValue, generateImageSrc, generateGraphEquations, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0).ast
        };

        return buildAST(source.replace(matchedContent, ''), {
            ...ast,
            ast: [...ast.ast, solution]
        }, generateVarValue, generateImageSrc, generateGraphEquations, numInputs, numEssays, numChecks, numRadios, numDrags, numDrops, numSolutions + 1, numCodes, numShuffles, numContents);
    }

    if (source.search(contentRegex) === 0) {
        const match = source.match(contentRegex) || [];
        const matchedContent = match[1];
        const content: Content = {
            type: 'CONTENT',
            varName: `content${numContents + 1}`,
            content: matchedContent
        };

        return buildAST(source.replace(matchedContent, ''), {
            ...ast,
            ast: [...ast.ast, content]
        }, generateVarValue, generateImageSrc, generateGraphEquations, numInputs, numEssays, numChecks, numRadios, numDrags, numDrops, numSolutions, numCodes, numShuffles, numContents + 1);
    }

    return ast;
}

export function createUUID(): string {
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

export function getAstObjects(ast: AST, type: ASTObjectType): ASTObject[] {
    const topLevelAstObjects = ast.ast.filter((astObject: ASTObject) => {
        return astObject.type === type;
    });

    const nestedAstObjects = ast.ast.reduce((result: ASTObject[], astObject: ASTObject) => {
        if (
            astObject.type === 'CHECK' ||
            astObject.type === 'RADIO' ||
            astObject.type === 'SOLUTION' ||
            astObject.type === 'SHUFFLE' ||
            astObject.type === 'DRAG' ||
            astObject.type === 'DROP'
        ) {
            return [...result, ...getAstObjects({
                type: 'AST',
                ast: astObject.content
            }, type)];
        }
        return result;
    }, []);

    return [...topLevelAstObjects, ...nestedAstObjects];
}

export function normalizeASTObjectPayloads(ast: AST): AST {
    return {
        ...ast,
        ast: ast.ast.map((astObject: ASTObject, index: number) => {
            if (astObject.type === 'VARIABLE') {
                const variableValue = <string | null> getASTObjectPayload(ast, 'VARIABLE', astObject.varName);
                return {
                    ...astObject,
                    value: variableValue === null ? astObject.value : variableValue
                };
            }

            if (astObject.type === 'IMAGE') {
                const imageSrc = <string | null> getASTObjectPayload(ast, 'IMAGE', astObject.varName);
                return {
                    ...astObject,
                    src: imageSrc === null ? astObject.src : imageSrc
                };
            }

            if (astObject.type === 'GRAPH') {
                const equations = <string[]> getASTObjectPayload(ast, 'GRAPH', astObject.varName);
                return {
                    ...astObject,
                    equations
                };
            }

            if (
                astObject.type === 'RADIO' ||
                astObject.type === 'CHECK' ||
                astObject.type === 'SOLUTION' ||
                astObject.type === 'SHUFFLE' ||
                astObject.type === 'DRAG' ||
                astObject.type === 'DROP'
            ) {
                return {
                    ...astObject,
                    content: normalizeASTObjectPayloads({
                        type: 'AST',
                        ast: astObject.content
                    }).ast
                };
            }

            return astObject;
        })
    };
}

export function generateVarValue(ast: AST, varName: string): number | string {
    const existingVarValue = <number | null> getASTObjectPayload(ast, 'VARIABLE', varName);
    return existingVarValue === null ? generateRandomInteger(0, 100) : existingVarValue;
}

function getASTObjectPayload(ast: AST, astObjectType: ASTObjectType, varName: string) {
    const astObjects: ASTObject[] = getAstObjects(ast, astObjectType).filter((astObject: ASTObject) => astObject.varName === varName);

    if (astObjectType === 'VARIABLE') {
        return astObjects.length > 0 ? (<Variable> astObjects[0]).value : null;
    }

    if (astObjectType === 'IMAGE') {
        return astObjects.length > 0 ? (<Image> astObjects[0]).src : null;
    }

    if (astObjectType === 'GRAPH') {
        return astObjects.length > 0 ? (<Graph> astObjects[0]).equations : [];
    }
}

function generateRandomInteger(min: number, max: number): number {
    //returns a random integer between min (included) and max (included)
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// shuffles items and returns a new array. Based on the modern Fisher-Yates shuffle algorithm
function shuffleItems(items: any[]) {
  return items.reduce((result, item, index) => {
    if (index === items.length - 1) {
      return result;
    }

    const jindex = Math.floor(Math.random() * (items.length - 1 - index + 1)) + index;
    [result[index], result[jindex]] = [result[jindex], result[index]];

    return result;
  }, items);
}
