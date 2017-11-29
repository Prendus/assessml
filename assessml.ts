import {
    AST,
    ASTObject,
    ASTObjectType,
    Variable,
    Input,
    Essay,
    Content,
    Check,
    Radio,
    Drag,
    Drop,
    Image,
    Solution,
    Code,
    Graph,
    Shuffle,
    BuildASTResult
} from './assessml.d';
import XRegExp from './node_modules/xregexp/src/index';

export function compileToHTML(source: AST | string, generateVarValue: (varName: string) => number | string, generateImageSrc: (varName: string) => string, generateGraphEquations: (varName: string) => string[]): string {
    const ast: AST = typeof source === 'string' ? parse(source, generateVarValue, generateImageSrc, generateGraphEquations) : source;
    return ast.ast.reduce((result: { htmlString: string; radioGroupName: string; radioGroupNumber: number; }, astObject: ASTObject, index: number) => {

        if (astObject.type === 'CONTENT') {
            return {
                htmlString: `${result.htmlString}${astObject.content}`,
                radioGroupName: result.radioGroupName,
                radioGroupNumber: result.radioGroupNumber
            }
        }

        if (astObject.type === 'VARIABLE') {
            return {
                htmlString: `${result.htmlString}${astObject.value}`,
                radioGroupName: result.radioGroupName,
                radioGroupNumber: result.radioGroupNumber
            };
        }

        if (astObject.type === 'INPUT') {
            return {
                htmlString: `${result.htmlString}<span id="${astObject.varName}" contenteditable="true" style="display: inline-block; min-width: 25px; min-height: 25px; padding: 5px; box-shadow: 0px 0px 1px black;"></span>`,
                radioGroupName: result.radioGroupName,
                radioGroupNumber: result.radioGroupNumber
            };
        }

        if (astObject.type === 'ESSAY') {
            return {
                htmlString: `${result.htmlString}<textarea id="${astObject.varName}" style="width: 100%; height: 50vh;"></textarea>`,
                radioGroupName: result.radioGroupName,
                radioGroupNumber: result.radioGroupNumber
            };
        }

        if (astObject.type === 'CODE') {
            return {
                htmlString: `${result.htmlString}<juicy-ace-editor id="${astObject.varName}" theme="ace/theme/chrome" mode="ace/mode/javascript" style="height: 50vh" fontsize="25px"></juicy-ace-editor>`,
                radioGroupName: result.radioGroupName,
                radioGroupNumber: result.radioGroupNumber
            };
        }

        if (astObject.type === 'CHECK') {
            return {
                htmlString: `${result.htmlString}<input id="${astObject.varName}" type="checkbox" style="width: calc(40px - 1vw); height: calc(40px - 1vw);">${compileToHTML({
                    type: 'AST',
                    ast: astObject.content
                }, generateVarValue, generateImageSrc, generateGraphEquations)}`,
                radioGroupName: result.radioGroupName,
                radioGroupNumber: result.radioGroupNumber
            };
        }

        if (astObject.type === 'RADIO') {
            const previousASTObject = ast.ast[index - 1];
            const previousASTObjectType = previousASTObject ? previousASTObject.type : null;
            const radioGroupName = previousASTObjectType === 'RADIO' ? result.radioGroupName : `${result.radioGroupName}${result.radioGroupNumber}`;

            return {
                htmlString: `${result.htmlString}<input id="${astObject.varName}" type="radio" name="${radioGroupName}" style="width: calc(40px - 1vw); height: calc(40px - 1vw);">${compileToHTML({
                    type: 'AST',
                    ast: astObject.content
                }, generateVarValue, generateImageSrc, generateGraphEquations)}`,
                radioGroupName,
                radioGroupNumber: result.radioGroupNumber + 1
            };
        }

        if (astObject.type === 'DRAG') {
            return {
                htmlString: `${result.htmlString}DRAG NOT IMPLEMENTED`,
                radioGroupName: result.radioGroupName,
                radioGroupNumber: result.radioGroupNumber
            };
        }

        if (astObject.type === 'DROP') {
            return {
                htmlString: `${result.htmlString}DROP NOT IMPLEMENTED`,
                radioGroupName: result.radioGroupName,
                radioGroupNumber: result.radioGroupNumber
            };
        }

        if (astObject.type === 'IMAGE') {
            return {
                htmlString: `${result.htmlString}<img src="${astObject.src}">`,
                radioGroupName: result.radioGroupName,
                radioGroupNumber: result.radioGroupNumber
            };
        }

        if (astObject.type === 'SOLUTION') {
            return {
                htmlString: `${result.htmlString}<template id="${astObject.varName}">${compileToHTML({
                    type: 'AST',
                    ast: astObject.content
                }, generateVarValue, generateImageSrc, generateGraphEquations)}</template>`,
                radioGroupName: result.radioGroupName,
                radioGroupNumber: result.radioGroupNumber
            };
        }

        if (astObject.type === 'GRAPH') {
            return {
                htmlString: `${result.htmlString}<function-plot data='[${astObject.equations.reduce((result, equation, index) => `${result}${index !== 0 ? ',' : ''}{ "fn": "${equation}" }`, '')}]'></function-plot>`,
                radioGroupName: result.radioGroupName,
                radioGroupNumber: result.radioGroupNumber
            };
        }

        if (astObject.type === 'SHUFFLE') {
            return {
                htmlString: `${result.htmlString}${compileToHTML({
                    type: 'AST',
                    ast: astObject.shuffledIndeces.map((index: number) => astObject.content[index])
                }, generateVarValue, generateImageSrc, generateGraphEquations)}`,
                radioGroupName: result.radioGroupName,
                radioGroupNumber: result.radioGroupNumber
            };
        }

        return result;
    }, {
        htmlString: '',
        radioGroupName: 'radio-group-',
        radioGroupNumber: 0
    }).htmlString;
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
            return `${result}[check start]${compileToAssessML({
                type: 'AST',
                ast: astObject.content
            }, generateVarValue, generateImageSrc, generateGraphEquations)}[check end]`;
        }

        if (astObject.type === 'RADIO') {
            return `${result}[radio start]${compileToAssessML({
                type: 'AST',
                ast: astObject.content
            }, generateVarValue, generateImageSrc, generateGraphEquations)}[radio end]`;
        }

        if (astObject.type === 'DRAG') {
            return `${result}[drag start]${compileToAssessML({
                type: 'AST',
                ast: astObject.content
            }, generateVarValue, generateImageSrc, generateGraphEquations)}[drag end]`;
        }

        if (astObject.type === 'DROP') {
            return `${result}[drop]${compileToAssessML({
                type: 'AST',
                ast: astObject.content
            }, generateVarValue, generateImageSrc, generateGraphEquations)}`;
        }

        if (astObject.type === 'IMAGE') {
            return `${result}[${astObject.varName}]`;
        }

        if (astObject.type === 'SOLUTION') {
            return `${result}[solution start]${compileToAssessML({
                type: 'AST',
                ast: astObject.content
            }, generateVarValue, generateImageSrc, generateGraphEquations)}[solution end]`;
        }

        if (astObject.type === 'GRAPH') {
            return `${result}[${astObject.varName}]`;
        }

        if (astObject.type === 'SHUFFLE') {
            return `${result}[shuffle start]${compileToAssessML({
                type: 'AST',
                ast: astObject.content
            }, generateVarValue, generateImageSrc, generateGraphEquations)}[shuffle end]`;
        }

        return result;
    }, '');
}

export function parse(source: string, generateVarValue: (varName: string) => number | string, generateImageSrc: (varName: string) => string, generateGraphEquations: (varName: string) => string[]) {
    return buildAST(source, {
        type: 'AST',
        ast: []
    }, generateVarValue, generateImageSrc, generateGraphEquations, 0, 0, 0, 0, 0, 0, 0, 0, 0).ast;
}

function buildAST(source: string, ast: AST, generateVarValue: (varName: string) => number | string, generateImageSrc: (varName: string) => string, generateGraphEquations: (varName: string) => string[], numInputs: number, numEssays: number, numChecks: number, numRadios: number, numDrags: number, numDrops: number, numSolutions: number, numCodes: number, numShuffles: number): BuildASTResult {
    const variableRegex: RegExp = /\[var((.|\n|\r)+?)\]/;
    const inputRegex: RegExp = /\[input\]/;
    const essayRegex: RegExp = /\[essay\]/;
    const codeRegex: RegExp = /\[code\]/;
    const shuffleStartRegex: RegExp = /\[shuffle start\]((.|\n|\r)*)/;
    const shuffleEndRegex: RegExp = /\[shuffle end\]((.|\n|\r)*)/;
    const checkStartRegex: RegExp = /\[check start\]((.|\n|\r)*)/;
    const checkEndRegex: RegExp = /\[check end\]((.|\n|\r)*)/;
    const radioStartRegex: RegExp = /\[radio start\]((.|\n|\r)*)/;
    const radioEndRegex: RegExp = /\[radio end\]((.|\n|\r)*)/;
    const solutionStartRegex: RegExp = /\[solution start\]((.|\n|\r)*)/;
    const solutionEndRegex: RegExp = /\[solution end\]((.|\n|\r)*)/;
    const imageRegex: RegExp = /\[img((.|\n|\r)+?)\]/;
    const graphRegex: RegExp = /\[graph((.|\n|\r)+?)\]/;
    const contentRegex: RegExp = new RegExp(`((.|\n|\r)+?)((${variableRegex.source}|${inputRegex.source}|${essayRegex.source}|${codeRegex.source}|${checkStartRegex.source}|${checkEndRegex.source}|${radioStartRegex.source}|${radioEndRegex.source}|${imageRegex.source}|${graphRegex.source}|${solutionStartRegex.source}|${solutionEndRegex.source}|${shuffleStartRegex.source}|${shuffleEndRegex.source})|$)`);

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
        }, generateVarValue, generateImageSrc, generateGraphEquations, numInputs, numEssays, numChecks, numRadios, numDrags, numDrops, numSolutions, numCodes, numShuffles);
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
        }, generateVarValue, generateImageSrc, generateGraphEquations, numInputs + 1, numEssays, numChecks, numRadios, numDrags, numDrops, numSolutions, numCodes, numShuffles);
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
        }, generateVarValue, generateImageSrc, generateGraphEquations, numInputs, numEssays + 1, numChecks, numRadios, numDrags, numDrops, numSolutions, numCodes, numShuffles);
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
        }, generateVarValue, generateImageSrc, generateGraphEquations, numInputs, numEssays, numChecks, numRadios, numDrags, numDrops, numSolutions, numCodes + 1, numShuffles);
    }

    if (source.indexOf(`[check start]${XRegExp.matchRecursive(source, '\\[check start\\]', '\\[check end\\]')[0]}[check end]`) === 0) {
        const insideContent = XRegExp.matchRecursive(source, '\\[check start\\]', '\\[check end\\]')[0];
        const matchedContent = `[check start]${insideContent}[check end]`;
        const contentAST: BuildASTResult = buildAST(insideContent, {
            type: 'AST',
            ast: []
        }, generateVarValue, generateImageSrc, generateGraphEquations, numInputs, numEssays, numChecks + 1, numRadios, numDrags, numDrops, numSolutions, numCodes, numShuffles);
        const check: Check = {
            type: 'CHECK',
            varName: `check${numChecks + 1}`,
            content: contentAST.ast.ast
        };

        return buildAST(source.replace(matchedContent, ''), {
            ...ast,
            ast: [...ast.ast, check]
        }, generateVarValue, generateImageSrc, generateGraphEquations, contentAST.numInputs, contentAST.numEssays, contentAST.numChecks, contentAST.numRadios, contentAST.numDrags, contentAST.numDrops, contentAST.numSolutions, contentAST.numCodes, contentAST.numShuffles);
    }

    if (source.indexOf(`[radio start]${XRegExp.matchRecursive(source, '\\[radio start\\]', '\\[radio end\\]')[0]}[radio end]`) === 0) {
        const insideContent = XRegExp.matchRecursive(source, '\\[radio start\\]', '\\[radio end\\]')[0];
        const matchedContent = `[radio start]${insideContent}[radio end]`;
        const contentAST: BuildASTResult = buildAST(insideContent, {
            type: 'AST',
            ast: []
        }, generateVarValue, generateImageSrc, generateGraphEquations, numInputs, numEssays, numChecks, numRadios + 1, numDrags, numDrops, numSolutions, numCodes, numShuffles);
        const radio: Radio = {
            type: 'RADIO',
            varName: `radio${numRadios + 1}`,
            content: contentAST.ast.ast
        };

        return buildAST(source.replace(matchedContent, ''), {
            ...ast,
            ast: [...ast.ast, radio]
        }, generateVarValue, generateImageSrc, generateGraphEquations, contentAST.numInputs, contentAST.numEssays, contentAST.numChecks, contentAST.numRadios, contentAST.numDrags, contentAST.numDrops, contentAST.numSolutions, contentAST.numCodes, contentAST.numShuffles);
    }

    if (source.indexOf(`[solution start]${XRegExp.matchRecursive(source, '\\[solution start\\]', '\\[solution end\\]')[0]}[solution end]`) === 0) {
        const insideContent = XRegExp.matchRecursive(source, '\\[solution start\\]', '\\[solution end\\]')[0];
        const matchedContent = `[solution start]${insideContent}[solution end]`;
        const contentAST: BuildASTResult = buildAST(insideContent, {
            type: 'AST',
            ast: []
        }, generateVarValue, generateImageSrc, generateGraphEquations, numInputs, numEssays, numChecks, numRadios, numDrags, numDrops, numSolutions + 1, numCodes, numShuffles);
        const solution: Solution = {
            type: 'SOLUTION',
            varName: `solution${numSolutions + 1}`,
            content: contentAST.ast.ast
        };

        return buildAST(source.replace(matchedContent, ''), {
            ...ast,
            ast: [...ast.ast, solution]
        }, generateVarValue, generateImageSrc, generateGraphEquations, contentAST.numInputs, contentAST.numEssays, contentAST.numChecks, contentAST.numRadios, contentAST.numDrags, contentAST.numDrops, contentAST.numSolutions, contentAST.numCodes, contentAST.numShuffles);
    }

    if (source.indexOf(`[shuffle start]${XRegExp.matchRecursive(source, '\\[shuffle start\\]', '\\[shuffle end\\]')[0]}[shuffle end]`) === 0) {
        const insideContent = XRegExp.matchRecursive(source, '\\[shuffle start\\]', '\\[shuffle end\\]')[0];
        const matchedContent = `[shuffle start]${insideContent}[shuffle end]`;
        const contentAST: BuildASTResult = buildAST(insideContent, {
            type: 'AST',
            ast: []
        }, generateVarValue, generateImageSrc, generateGraphEquations, numInputs, numEssays, numChecks, numRadios, numDrags, numDrops, numSolutions, numCodes, numShuffles + 1);
        const shuffle: Shuffle = {
            type: 'SHUFFLE',
            varName: `shuffle${numShuffles + 1}`,
            content: contentAST.ast.ast,
            shuffledIndeces: shuffleItems(new Array(contentAST.ast.ast.length).map((x, index) => index))
        };

        return buildAST(source.replace(matchedContent, ''), {
            ...ast,
            ast: [...ast.ast, shuffle]
        }, generateVarValue, generateImageSrc, generateGraphEquations, contentAST.numInputs, contentAST.numEssays, contentAST.numChecks, contentAST.numRadios, contentAST.numDrags, contentAST.numDrops, contentAST.numSolutions, contentAST.numCodes, contentAST.numShuffles);
    }

    // if (source.search(dragRegex) === 0) {
    //     const match = source.match(dragRegex) || [];
    //     const matchedContent = match[0];
    //     const insideContent = match[1];
    //     const drag: Drag = {
    //         type: 'DRAG',
    //         varName: `drag${numDrags + 1}`,
    //         content: buildAST(insideContent, {
    //             type: 'AST',
    //             ast: []
    //         }, generateVarValue, generateImageSrc, generateGraphEquations, 0, 0, 0, 0, 0, 0, 0, 0, 0).ast
    //     };
    //
    //     return buildAST(source.replace(matchedContent, ''), {
    //         ...ast,
    //         ast: [...ast.ast, drag]
    //     }, generateVarValue, generateImageSrc, generateGraphEquations, numInputs, numEssays, numChecks, numRadios, numDrags + 1, numDrops, numSolutions, numCodes, numShuffles);
    // }

    // if (source.search(dropRegex) === 0) {
    //     const match = source.match(dropRegex) || [];
    //     const matchedContent = match[0];
    //     const insideContent = match[1];
    //     const drop: Drop = {
    //         type: 'DROP',
    //         varName: `drop${numDrops + 1}`,
    //         content: buildAST(insideContent, {
    //             type: 'AST',
    //             ast: []
    //         }, generateVarValue, generateImageSrc, generateGraphEquations, 0, 0, 0, 0, 0, 0, 0, 0, 0).ast
    //     };
    //
    //     return buildAST(source.replace(matchedContent, ''), {
    //         ...ast,
    //         ast: [...ast.ast, drop]
    //     }, generateVarValue, generateImageSrc, generateGraphEquations, numInputs, numEssays, numChecks, numRadios, numDrags, numDrops + 1, numSolutions, numCodes, numShuffles);
    // }

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
        }, generateVarValue, generateImageSrc, generateGraphEquations, numInputs, numEssays, numChecks, numRadios, numDrags, numDrops, numSolutions, numCodes, numShuffles);
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
        }, generateVarValue, generateImageSrc, generateGraphEquations, numInputs, numEssays, numChecks, numRadios, numDrags, numDrops, numSolutions, numCodes, numShuffles);
    }

    if (source.search(contentRegex) === 0) {
        const match = source.match(contentRegex) || [];
        const matchedContent = match[1];
        const content: Content = {
            type: 'CONTENT',
            varName: `content`,
            content: matchedContent
        };

        return buildAST(source.replace(matchedContent, ''), {
            ...ast,
            ast: [...ast.ast, content]
        }, generateVarValue, generateImageSrc, generateGraphEquations, numInputs, numEssays, numChecks, numRadios, numDrags, numDrops, numSolutions, numCodes, numShuffles);
    }

    return {
        ast,
        numInputs,
        numEssays,
        numChecks,
        numRadios,
        numDrags,
        numDrops,
        numSolutions,
        numCodes,
        numShuffles
    };
}

// export function createUUID(): string {
//     //From persistence.js; Copyright (c) 2010 Zef Hemel <zef@zef.me> * * Permission is hereby granted, free of charge, to any person * obtaining a copy of this software and associated documentation * files (the "Software"), to deal in the Software without * restriction, including without limitation the rights to use, * copy, modify, merge, publish, distribute, sublicense, and/or sell * copies of the Software, and to permit persons to whom the * Software is furnished to do so, subject to the following * conditions: * * The above copyright notice and this permission notice shall be * included in all copies or substantial portions of the Software. * * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR * OTHER DEALINGS IN THE SOFTWARE.
// 	var s: any[] = [];
// 	var hexDigits = "0123456789ABCDEF";
// 	for ( var i = 0; i < 32; i++) {
// 		s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
// 	}
// 	s[12] = "4";
// 	s[16] = hexDigits.substr((s[16] & 0x3) | 0x8, 1);
//
// 	var uuid = s.join("");
// 	return uuid;
// }

export function getAstObjects(ast: AST, type: ASTObjectType): ASTObject[] {
    return ast.ast.reduce((result: ASTObject[], astObject: ASTObject) => {
        if (
            astObject.type === 'CHECK' ||
            astObject.type === 'RADIO' ||
            astObject.type === 'SOLUTION' ||
            astObject.type === 'SHUFFLE' ||
            astObject.type === 'DRAG' ||
            astObject.type === 'DROP'
        ) {
            if (astObject.type === type) {
                return [...result, astObject, ...getAstObjects({
                    type: 'AST',
                    ast: astObject.content
                }, type)];
            }
            else {
                return [...result, ...getAstObjects({
                    type: 'AST',
                    ast: astObject.content
                }, type)];
            }
        }

        if (astObject.type === type) {
            return [...result, astObject];
        }

        return result;
    }, []);
}

export function normalizeASTObjectPayloads(originalAST: AST, currentAST: AST): AST {
    return {
        ...currentAST,
        ast: currentAST.ast.map((astObject: ASTObject) => {
            if (astObject.type === 'VARIABLE') {
                const variableValue = <string | null> getASTObjectPayload(originalAST, 'VARIABLE', astObject.varName);
                return {
                    ...astObject,
                    value: variableValue === null ? astObject.value : variableValue
                };
            }

            if (astObject.type === 'IMAGE') {
                const imageSrc = <string | null> getASTObjectPayload(originalAST, 'IMAGE', astObject.varName);
                return {
                    ...astObject,
                    src: imageSrc === null ? astObject.src : imageSrc
                };
            }

            if (astObject.type === 'GRAPH') {
                const equations = <string[]> getASTObjectPayload(originalAST, 'GRAPH', astObject.varName);
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
                    content: normalizeASTObjectPayloads(originalAST, {
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

export function getASTObjectPayload(ast: AST, astObjectType: ASTObjectType, varName: string) {
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
export function shuffleItems(items: any[]) {
  return items.reduce((result, item, index) => {
    if (index === items.length - 1) {
      return result;
    }

    const jindex = Math.floor(Math.random() * (items.length - 1 - index + 1)) + index;
    [result[index], result[jindex]] = [result[jindex], result[index]];

    return result;
  }, items);
}
