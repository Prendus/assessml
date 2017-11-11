import {AST, ASTObject, Variable, Input, Essay, Content, Check, Radio, Drag, Drop, Image, Solution, Code} from './assessml.d';

export function compileToHTML(source: AST | string, generateVarValue: (varName: string) => number | string, generateImageSrc: (varName: string) => string): string {
    const ast: AST = typeof source === 'string' ? parse(source, generateVarValue, generateImageSrc) : source;
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
            return `${result}<juicy-ace-editor id="${astObject.varName}" theme="ace/theme/chrome" mode="ace/mode/javascript"></juicy-ace-editor>`;
        }

        if (astObject.type === 'CHECK') {
            return `${result}<input id="${astObject.varName}" type="checkbox" style="width: calc(40px - 1vw); height: calc(40px - 1vw);">${compileToHTML({
                type: 'AST',
                ast: astObject.content
            }, generateVarValue, generateImageSrc)}`;
        }

        if (astObject.type === 'RADIO') {
            return `${result}<input id="${astObject.varName}" type="radio" name="${radioGroupName}" style="width: calc(40px - 1vw); height: calc(40px - 1vw);">${compileToHTML({
                type: 'AST',
                ast: astObject.content
            }, generateVarValue, generateImageSrc)}`;
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
            }, generateVarValue, generateImageSrc)}</template>`;
        }

        return result;
    }, '');
}

export function compileToAssessML(source: AST | string, generateVarValue: (varName: string) => number | string, generateImageSrc: (varName: string) => string): string {
    const ast: AST = typeof source === 'string' ? parse(source, generateVarValue, generateImageSrc) : source;

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
            }, generateVarValue, generateImageSrc)}[x]`;
        }

        if (astObject.type === 'RADIO') {
            return `${result}[*]${compileToAssessML({
                type: 'AST',
                ast: astObject.content
            }, generateVarValue, generateImageSrc)}[*]`;
        }

        if (astObject.type === 'DRAG') {
            return `${result}DRAG NOT IMPLEMENTED`;
        }

        if (astObject.type === 'DROP') {
            return `${result}DROP NOT IMPLEMENTED`;
        }

        if (astObject.type === 'IMAGE') {
            return `${result}[${astObject.varName}]`;
        }

        if (astObject.type === 'SOLUTION') {
            return `${result}[solution]${compileToAssessML({
                type: 'AST',
                ast: astObject.content
            }, generateVarValue, generateImageSrc)}[solution]`;
        }

        return result;
    }, '');
}

export function parse(source: string, generateVarValue: (varName: string) => number | string, generateImageSrc: (varName: string) => string) {
    return buildAST(source, {
        type: 'AST',
        ast: []
    }, generateVarValue, generateImageSrc, 0, 0, 0, 0, 0, 0, 0, 0);
}

export function getAstObjects(ast: AST, type: 'VARIABLE' | 'INPUT' | 'ESSAY' | 'CONTENT' | 'CHECK' | 'RADIO' | 'DRAG' | 'DROP' | 'IMAGE' | 'SOLUTION' | 'CODE'): ASTObject[] {
    const topLevelAstObjects = ast.ast.filter((astObject: ASTObject) => {
        return astObject.type === type;
    });

    const nestedAstObjects = ast.ast.reduce((result: ASTObject[], astObject: ASTObject) => {
        if (astObject.type === 'CHECK' || astObject.type === 'RADIO' || astObject.type === 'SOLUTION') {
            return [...result, ...astObject.content.filter((astObject: Variable | Content | Image) => {
                return astObject.type === type;
            })];
        }

        return result;
    }, []);

    return [...topLevelAstObjects, ...nestedAstObjects];
}

function buildAST(source: string, ast: AST, generateVarValue: (varName: string) => number | string, generateImageSrc: (varName: string) => string, numInputs: number, numEssays: number, numChecks: number, numRadios: number, numDrags: number, numDrops: number, numSolutions: number, numCodes: number): AST {
    const variableRegex: RegExp = /\[var((.|\n|\r)+?)\]/;
    const inputRegex: RegExp = /\[input\]/;
    const essayRegex: RegExp = /\[essay\]/;
    const codeRegex: RegExp = /\[code\]/;
    const checkRegex: RegExp = /\[x\]((.|\n|\r)*?)\[x\]/;
    const radioRegex: RegExp = /\[\*\]((.|\n|\r)*?)\[\*\]/;
    const dragRegex: RegExp = /\[drag\]((.|\n|\r)*?)\[drag\]/;
    const dropRegex: RegExp = /\[drop\]((.|\n|\r)*?)\[drop\]/;
    const solutionRegex: RegExp = /\[solution\]((.|\n|\r)*?)\[solution\]/;
    const imageRegex: RegExp = /\[img((.|\n|\r)+?)\]/;
    const contentRegex: RegExp = new RegExp(`((.|\n|\r)+?)((${variableRegex.source}|${inputRegex.source}|${essayRegex.source}|${codeRegex.source}|${checkRegex.source}|${radioRegex.source}|${dragRegex.source}|${dropRegex.source}|${imageRegex.source}|${solutionRegex.source})|$)`);

    if (source.search(variableRegex) === 0) {
        const match = source.match(variableRegex) || [];
        const matchedContent = match[0];
        const varName = matchedContent.replace('[', '').replace(']', '');
        const existingVarValue = getVariableValue(ast, varName);
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
        }, generateVarValue, generateImageSrc, numInputs, numEssays, numChecks, numRadios, numDrags, numDrops, numSolutions, numCodes);
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
        }, generateVarValue, generateImageSrc, numInputs + 1, numEssays, numChecks, numRadios, numDrags, numDrops, numSolutions, numCodes);
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
        }, generateVarValue, generateImageSrc, numInputs, numEssays + 1, numChecks, numRadios, numDrags, numDrops, numSolutions, numCodes);
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
        }, generateVarValue, generateImageSrc, numInputs, numEssays, numChecks, numRadios, numDrags, numDrops, numSolutions, numCodes + 1);
    }

    if (source.search(checkRegex) === 0) {
        const match = source.match(checkRegex) || [];
        const matchedContent = match[0];
        const insideContent = match[1];
        const check: Check = {
            type: 'CHECK',
            varName: `check${numChecks + 1}`,
            content: <(Content | Variable | Image)[]> buildAST(insideContent, {
                type: 'AST',
                ast: []
            }, generateVarValue, generateImageSrc, 0, 0, 0, 0, 0, 0, 0, 0).ast
        };

        return buildAST(source.replace(matchedContent, ''), {
            ...ast,
            ast: [...ast.ast, check]
        }, generateVarValue, generateImageSrc, numInputs, numEssays, numChecks + 1, numRadios, numDrags, numDrops, numSolutions, numCodes);
    }

    if (source.search(radioRegex) === 0) {
        const match = source.match(radioRegex) || [];
        const matchedContent = match[0];
        const insideContent = match[1];
        const radio: Radio = {
            type: 'RADIO',
            varName: `radio${numRadios + 1}`,
            content: <(Content | Variable | Image)[]> buildAST(insideContent, {
                type: 'AST',
                ast: []
            }, generateVarValue, generateImageSrc, 0, 0, 0, 0, 0, 0, 0, 0).ast
        };

        return buildAST(source.replace(matchedContent, ''), {
            ...ast,
            ast: [...ast.ast, radio]
        }, generateVarValue, generateImageSrc, numInputs, numEssays, numChecks, numRadios + 1, numDrags, numDrops, numSolutions, numCodes);
    }

    if (source.search(dragRegex) === 0) {
        const match = source.match(dragRegex) || [];
        const matchedContent = match[0];
        const insideContent = match[1];
        const drag: Drag = {
            type: 'DRAG',
            varName: `drag${numDrags + 1}`,
            content: <(Content | Variable | Image)[]> buildAST(insideContent, {
                type: 'AST',
                ast: []
            }, generateVarValue, generateImageSrc, 0, 0, 0, 0, 0, 0, 0, 0).ast
        };

        return buildAST(source.replace(matchedContent, ''), {
            ...ast,
            ast: [...ast.ast, drag]
        }, generateVarValue, generateImageSrc, numInputs, numEssays, numChecks, numRadios, numDrags + 1, numDrops, numSolutions, numCodes);
    }

    if (source.search(dropRegex) === 0) {
        const match = source.match(dropRegex) || [];
        const matchedContent = match[0];
        const insideContent = match[1];
        const drop: Drop = {
            type: 'DROP',
            varName: `drop${numDrops + 1}`,
            content: <(Content | Variable | Image)[]> buildAST(insideContent, {
                type: 'AST',
                ast: []
            }, generateVarValue, generateImageSrc, 0, 0, 0, 0, 0, 0, 0, 0).ast
        };

        return buildAST(source.replace(matchedContent, ''), {
            ...ast,
            ast: [...ast.ast, drop]
        }, generateVarValue, generateImageSrc, numInputs, numEssays, numChecks, numRadios, numDrags, numDrops + 1, numSolutions, numCodes);
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
        }, generateVarValue, generateImageSrc, numInputs, numEssays, numChecks, numRadios, numDrags, numDrops, numSolutions, numCodes);
    }

    if (source.search(solutionRegex) === 0) {
        const match = source.match(solutionRegex) || [];
        const matchedContent = match[0];
        const insideContent = match[1];
        const solution: Solution = {
            type: 'SOLUTION',
            varName: `solution${numSolutions + 1}`,
            content: <(Content | Variable | Image)[]> buildAST(insideContent, {
                type: 'AST',
                ast: []
            }, generateVarValue, generateImageSrc, 0, 0, 0, 0, 0, 0, 0, 0).ast
        };

        return buildAST(source.replace(matchedContent, ''), {
            ...ast,
            ast: [...ast.ast, solution]
        }, generateVarValue, generateImageSrc, numInputs, numEssays, numChecks, numRadios, numDrags, numDrops, numSolutions + 1, numCodes);
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
        }, generateVarValue, generateImageSrc, numInputs, numEssays, numChecks, numRadios, numDrags, numDrops, numSolutions, numCodes);
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

export function normalizeVariables(ast: AST): AST {
    return {
        ...ast,
        ast: ast.ast.map((astObject: ASTObject, index: number) => {
            if (astObject.type === 'VARIABLE') {
                const variableValue = getVariableValue(ast, astObject.varName);
                return {
                    ...astObject,
                    value: variableValue === null ? astObject.value : variableValue
                };
            }

            if (astObject.type === 'RADIO' || astObject.type === 'CHECK' || astObject.type === 'SOLUTION') {
                return {
                    ...astObject,
                    content: astObject.content.map((variableOrContentOrImageAstObject: Variable | Content | Image, index: number) => {
                        if (variableOrContentOrImageAstObject.type === 'VARIABLE') {
                            const variableValue = getVariableValue(ast, variableOrContentOrImageAstObject.varName);
                            return {
                                ...variableOrContentOrImageAstObject,
                                value: variableValue === null ? variableOrContentOrImageAstObject.value : variableValue
                            };
                        }
                        else {
                            return variableOrContentOrImageAstObject;
                        }
                    })
                };
            }

            return astObject;
        })
    };
}

//TODO we might only need this function for testing purposes...look into its use in prendus-question-elements
export function normalizeImages(ast: AST): AST {
    return {
        ...ast,
        ast: ast.ast.map((astObject: ASTObject, index: number) => {
            if (astObject.type === 'IMAGE') {
                const imageSrc = getImageSrc(ast, astObject.varName);
                return {
                    ...astObject,
                    src: imageSrc === null ? astObject.src : imageSrc
                };
            }

            if (astObject.type === 'RADIO' || astObject.type === 'CHECK' || astObject.type === 'SOLUTION') {
                return {
                    ...astObject,
                    content: astObject.content.map((variableOrContentOrImageAstObject: Variable | Content | Image, index: number) => {
                        if (variableOrContentOrImageAstObject.type === 'IMAGE') {
                            const imageSrc = getImageSrc(ast, variableOrContentOrImageAstObject.varName);
                            return {
                                ...variableOrContentOrImageAstObject,
                                src: imageSrc === null ? variableOrContentOrImageAstObject.src : imageSrc
                            };
                        }
                        else {
                            return variableOrContentOrImageAstObject;
                        }
                    })
                };
            }

            return astObject;
        })
    };
}

export function generateVarValue(ast: AST, varName: string): number | string {
    const existingVarValue = getVariableValue(ast, varName);
    return existingVarValue === null ? generateRandomInteger(0, 100) : existingVarValue;
}

//TODO this function is very similar to getImageSrc
function getVariableValue(ast: AST, varName: string): number | string | null {
    const variables: Variable[] = <Variable[]> ast.ast.reduce((result: Variable[], astObject: ASTObject) => {
        if (astObject.type === 'VARIABLE' && astObject.varName === varName) {
            return [...result, astObject];
        }

        if (astObject.type === 'RADIO' || astObject.type === 'CHECK' || astObject.type === 'SOLUTION') {
            const variables: Variable[] = <Variable[]> astObject.content.filter((astObject: Variable | Content) => astObject.type === 'VARIABLE' && astObject.varName === varName);
            if (variables.length > 0) {
                return [...result, variables[0]];
            }
        }

        return result;
    }, []);

    return variables.length > 0 ? variables[0].value : null;
}

//TODO this function is very similar to getVariableValue
export function getImageSrc(ast: AST, varName: string): string | null {
    const images: Image[] = <Image[]> ast.ast.reduce((result: Image[], astObject: ASTObject) => {
        if (astObject.type === 'IMAGE' && astObject.varName === varName) {
            return [...result, astObject];
        }

        if (astObject.type === 'RADIO' || astObject.type === 'CHECK' || astObject.type === 'SOLUTION') {
            const images: Image[] = <Image[]> astObject.content.filter((astObject: Variable | Content | Image) => astObject.type === 'IMAGE' && astObject.varName === varName);
            if (images.length > 0) {
                return [...result, images[0]];
            }
        }

        return result;
    }, []);

    return images.length > 0 ? images[0].src : null;
}

function generateRandomInteger(min: number, max: number): number {
    //returns a random integer between min (included) and max (included)
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
