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
    Markdown,
    BuildASTResult
} from './assessml.d';

export function compileToHTML(source: AST | string, generateVarValue: (varName: string) => number | string, generateImageSrc: (varName: string) => string, generateGraphEquations: (varName: string) => string[], generateShuffledIndeces: (varName: string) => number[]): string {
    const ast: AST = typeof source === 'string' ? parse(source, generateVarValue, generateImageSrc, generateGraphEquations, generateShuffledIndeces) : source;
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
                }, generateVarValue, generateImageSrc, generateGraphEquations, generateShuffledIndeces)}`,
                radioGroupName: result.radioGroupName,
                radioGroupNumber: result.radioGroupNumber
            };
        }

        if (astObject.type === 'RADIO') {
            const previousASTObject = ast.ast[index - 1];
            const thereIsARadioPreceeding = previousASTObject ? (
                previousASTObject.type === 'CONTENT' && (
                    previousASTObject.content.replace(/<p>|<\/p>|<span>|<\/span>|<br>/g, '') === ''
                )
            ) ||
            previousASTObject.type === 'RADIO' :
            false;
            const radioGroupName = thereIsARadioPreceeding ? result.radioGroupName : `${result.radioGroupName}${result.radioGroupNumber}`;

            return {
                htmlString: `${result.htmlString}<input id="${astObject.varName}" type="radio" name="${radioGroupName}" style="width: calc(40px - 1vw); height: calc(40px - 1vw);">${compileToHTML({
                    type: 'AST',
                    ast: astObject.content
                }, generateVarValue, generateImageSrc, generateGraphEquations, generateShuffledIndeces)}`,
                radioGroupName,
                radioGroupNumber: result.radioGroupNumber + 1
            };
        }

        // if (astObject.type === 'DRAG') {
        //     return {
        //         htmlString: `${result.htmlString}DRAG NOT IMPLEMENTED`,
        //         radioGroupName: result.radioGroupName,
        //         radioGroupNumber: result.radioGroupNumber
        //     };
        // }
        //
        // if (astObject.type === 'DROP') {
        //     return {
        //         htmlString: `${result.htmlString}DROP NOT IMPLEMENTED`,
        //         radioGroupName: result.radioGroupName,
        //         radioGroupNumber: result.radioGroupNumber
        //     };
        // }

        if (astObject.type === 'IMAGE') {
            return {
                htmlString: `${result.htmlString}<img style="height: auto; max-width: 50vw" src="${astObject.src}">`,
                radioGroupName: result.radioGroupName,
                radioGroupNumber: result.radioGroupNumber
            };
        }

        if (astObject.type === 'SOLUTION') {
            return {
                htmlString: `${result.htmlString}<template id="${astObject.varName}">${compileToHTML({
                    type: 'AST',
                    ast: astObject.content
                }, generateVarValue, generateImageSrc, generateGraphEquations, generateShuffledIndeces)}</template>`,
                radioGroupName: result.radioGroupName,
                radioGroupNumber: result.radioGroupNumber
            };
        }

        if (astObject.type === 'MARKDOWN') {
            return {
                htmlString: `${result.htmlString}<marked-element><div slot="markdown-html"></div><script type="text/markdown">${compileToHTML({
                    type: 'AST',
                    ast: astObject.content
                }, generateVarValue, generateImageSrc, generateGraphEquations, generateShuffledIndeces)}</script></marked-element>`,
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
                    ast: astObject.content.reduce((result, innerASTObject: ASTObject) => {
                        if (innerASTObject.type !== 'CONTENT') {
                            return {
                                ast: [...result.ast, astObject.content[result.shuffledIndeces[0]]],
                                shuffledIndeces: result.shuffledIndeces.slice(1)
                            };
                        }

                        return {
                            ...result,
                            ast: [...result.ast, innerASTObject]
                        };
                    }, {
                        ast: [],
                        shuffledIndeces: astObject.shuffledIndeces
                    }).ast
                }, generateVarValue, generateImageSrc, generateGraphEquations, generateShuffledIndeces)}`,
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

export function compileToAssessML(source: AST | string, generateVarValue: (varName: string) => number | string, generateImageSrc: (varName: string) => string, generateGraphEquations: (varName: string) => string[], generateShuffledIndeces: (varName: string) => number[]): string {
    const ast: AST = typeof source === 'string' ? parse(source, generateVarValue, generateImageSrc, generateGraphEquations, generateShuffledIndeces) : source;

    return ast.ast.reduce((result: string, astObject: ASTObject) => {

        if (astObject.type === 'CONTENT') {
            return `${result}${astObject.content}`;
        }

        if (
            astObject.type === 'VARIABLE' ||
            astObject.type === 'INPUT' ||
            astObject.type === 'ESSAY' ||
            astObject.type === 'CODE' ||
            astObject.type === 'IMAGE' ||
            astObject.type === 'GRAPH'
        ) {
            return `${result}[${astObject.varName}]`;
        }

        if (
            astObject.type === 'CHECK' ||
            astObject.type === 'RADIO' ||
            astObject.type === 'SHUFFLE' ||
            astObject.type === 'SOLUTION' ||
            astObject.type === 'DRAG' ||
            astObject.type === 'DROP' ||
            astObject.type === 'MARKDOWN'
        ) {
            return `${result}[${astObject.varName}]${compileToAssessML({
                type: 'AST',
                ast: astObject.content
            }, generateVarValue, generateImageSrc, generateGraphEquations, generateShuffledIndeces)}[${astObject.varName}]`;
        }

        return result;
    }, '');
}

export function parse(source: string, generateVarValue: (varName: string) => number | string, generateImageSrc: (varName: string) => string, generateGraphEquations: (varName: string) => string[], generateShuffledIndeces: (varName: string) => number[]) {
    return buildAST(source, {
        type: 'AST',
        ast: []
    }, generateVarValue, generateImageSrc, generateGraphEquations, generateShuffledIndeces, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0).ast;
}

function buildAST(source: string, ast: AST, generateVarValue: (varName: string) => number | string, generateImageSrc: (varName: string) => string, generateGraphEquations: (varName: string) => string[], generateShuffledIndeces: (varName: string) => number[], numInputs: number, numEssays: number, numChecks: number, numRadios: number, numDrags: number, numDrops: number, numSolutions: number, numCodes: number, numShuffles: number, numMarkdowns: number): BuildASTResult {
    const variableRegex: RegExp = /\[var((.|\n|\r)+?)\]/;
    const inputRegex: RegExp = /\[input((.|\n|\r)+?)\]/;
    const essayRegex: RegExp = /\[essay((.|\n|\r)+?)\]/;
    const codeRegex: RegExp = /\[code((.|\n|\r)+?)\]/;
    const checkStartRegex: RegExp = /\[check((.|\n|\r)+?)\]/;
    const checkRegex: RegExp = /\[check((.|\n|\r)+?)\]((.|\n|\r)*?)\[check\1\]/;
    const radioStartRegex: RegExp = /\[radio((.|\n|\r)+?)\]/;
    const radioRegex: RegExp = /\[radio((.|\n|\r)+?)\]((.|\n|\r)*?)\[radio\1\]/;
    const shuffleStartRegex: RegExp = /\[shuffle((.|\n|\r)+?)\]/;
    const shuffleRegex: RegExp = /\[shuffle((.|\n|\r)+?)\]((.|\n|\r)*?)\[shuffle\1\]/;
    const solutionStartRegex: RegExp = /\[solution((.|\n|\r)+?)\]/;
    const solutionRegex: RegExp = /\[solution((.|\n|\r)+?)\]((.|\n|\r)*?)\[solution\1\]/;
    const markdownStartRegex: RegExp = /\[markdown((.|\n|\r)+?)\]/;
    const markdownRegex: RegExp = /\[markdown((.|\n|\r)+?)\]((.|\n|\r)*?)\[markdown\1\]/;
    const imageRegex: RegExp = /\[img((.|\n|\r)+?)\]/;
    const graphRegex: RegExp = /\[graph((.|\n|\r)+?)\]/;
    const contentRegex: RegExp = new RegExp(`((.|\n|\r)+?)((${variableRegex.source}|${inputRegex.source}|${essayRegex.source}|${codeRegex.source}|${checkRegex.source}|${checkStartRegex.source}|${radioRegex.source}|${radioStartRegex.source}|${imageRegex.source}|${graphRegex.source}|${solutionRegex.source}|${solutionStartRegex.source}|${markdownRegex.source}|${markdownStartRegex.source}|${shuffleRegex.source}|${shuffleStartRegex.source})|$)`);

    if (source.search(variableRegex) === 0) {
        const match = source.match(variableRegex) || [];
        const matchedContent = match[0];
        const varNameSuffix = match[1];
        const varName = `var${varNameSuffix}`;

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
        }, generateVarValue, generateImageSrc, generateGraphEquations, generateShuffledIndeces, numInputs, numEssays, numChecks, numRadios, numDrags, numDrops, numSolutions, numCodes, numShuffles, numMarkdowns);
    }

    if (source.search(inputRegex) === 0) {
        const match = source.match(inputRegex) || [];
        const matchedContent = match[0];
        const varNameSuffix = match[1];
        const varName = `input${varNameSuffix}`;

        const input: Input = {
            type: 'INPUT',
            varName
        };

        return buildAST(source.replace(matchedContent, ''), {
            ...ast,
            ast: [...ast.ast, input]
        }, generateVarValue, generateImageSrc, generateGraphEquations, generateShuffledIndeces, numInputs + 1, numEssays, numChecks, numRadios, numDrags, numDrops, numSolutions, numCodes, numShuffles, numMarkdowns);
    }

    if (source.search(essayRegex) === 0) {
        const match = source.match(essayRegex) || [];
        const matchedContent = match[0];
        const varNameSuffix = match[1];
        const varName = `essay${varNameSuffix}`;

        const essay: Essay = {
            type: 'ESSAY',
            varName
        };

        return buildAST(source.replace(matchedContent, ''), {
            ...ast,
            ast: [...ast.ast, essay]
        }, generateVarValue, generateImageSrc, generateGraphEquations, generateShuffledIndeces, numInputs, numEssays + 1, numChecks, numRadios, numDrags, numDrops, numSolutions, numCodes, numShuffles, numMarkdowns);
    }

    if (source.search(codeRegex) === 0) {
        const match = source.match(codeRegex) || [];
        const matchedContent = match[0];
        const varNameSuffix = match[1];
        const varName = `code${varNameSuffix}`;

        const code: Code = {
            type: 'CODE',
            varName
        };

        return buildAST(source.replace(matchedContent, ''), {
            ...ast,
            ast: [...ast.ast, code]
        }, generateVarValue, generateImageSrc, generateGraphEquations, generateShuffledIndeces, numInputs, numEssays, numChecks, numRadios, numDrags, numDrops, numSolutions, numCodes + 1, numShuffles, numMarkdowns);
    }

    if (source.search(checkRegex) === 0) {
        const match = source.match(checkRegex) || [];
        const matchedContent = match[0];
        const variableSuffix = match[1];
        const insideContent = match[3];
        const varName = `check${variableSuffix}`;

        const contentAST: BuildASTResult = buildAST(insideContent, {
            type: 'AST',
            ast: []
        }, generateVarValue, generateImageSrc, generateGraphEquations, generateShuffledIndeces, numInputs, numEssays, numChecks + 1, numRadios, numDrags, numDrops, numSolutions, numCodes, numShuffles, numMarkdowns);
        const check: Check = {
            type: 'CHECK',
            varName,
            content: contentAST.ast.ast
        };

        return buildAST(source.replace(matchedContent, ''), {
            ...ast,
            ast: [...ast.ast, check]
        }, generateVarValue, generateImageSrc, generateGraphEquations, generateShuffledIndeces, contentAST.numInputs, contentAST.numEssays, contentAST.numChecks, contentAST.numRadios, contentAST.numDrags, contentAST.numDrops, contentAST.numSolutions, contentAST.numCodes, contentAST.numShuffles, contentAST.numMarkdowns);
    }

    if (source.search(radioRegex) === 0) {
        const match = source.match(radioRegex) || [];
        const matchedContent = match[0];
        const variableSuffix = match[1];
        const insideContent = match[3];
        const varName = `radio${variableSuffix}`;

        const contentAST: BuildASTResult = buildAST(insideContent, {
            type: 'AST',
            ast: []
        }, generateVarValue, generateImageSrc, generateGraphEquations, generateShuffledIndeces, numInputs, numEssays, numChecks, numRadios + 1, numDrags, numDrops, numSolutions, numCodes, numShuffles, numMarkdowns);
        const radio: Radio = {
            type: 'RADIO',
            varName,
            content: contentAST.ast.ast
        };

        return buildAST(source.replace(matchedContent, ''), {
            ...ast,
            ast: [...ast.ast, radio]
        }, generateVarValue, generateImageSrc, generateGraphEquations, generateShuffledIndeces, contentAST.numInputs, contentAST.numEssays, contentAST.numChecks, contentAST.numRadios, contentAST.numDrags, contentAST.numDrops, contentAST.numSolutions, contentAST.numCodes, contentAST.numShuffles, contentAST.numMarkdowns);
    }

    if (source.search(solutionRegex) === 0) {
        const match = source.match(solutionRegex) || [];
        const matchedContent = match[0];
        const variableSuffix = match[1];
        const insideContent = match[3];
        const varName = `solution${variableSuffix}`;

        const contentAST: BuildASTResult = buildAST(insideContent, {
            type: 'AST',
            ast: []
        }, generateVarValue, generateImageSrc, generateGraphEquations, generateShuffledIndeces, numInputs, numEssays, numChecks, numRadios, numDrags, numDrops, numSolutions + 1, numCodes, numShuffles, numMarkdowns);
        const solution: Solution = {
            type: 'SOLUTION',
            varName,
            content: contentAST.ast.ast
        };

        return buildAST(source.replace(matchedContent, ''), {
            ...ast,
            ast: [...ast.ast, solution]
        }, generateVarValue, generateImageSrc, generateGraphEquations, generateShuffledIndeces, contentAST.numInputs, contentAST.numEssays, contentAST.numChecks, contentAST.numRadios, contentAST.numDrags, contentAST.numDrops, contentAST.numSolutions, contentAST.numCodes, contentAST.numShuffles, contentAST.numMarkdowns);
    }

    if (source.search(markdownRegex) === 0) {
        const match = source.match(markdownRegex) || [];
        const matchedContent = match[0];
        const variableSuffix = match[1];
        const insideContent = match[3];
        const varName = `markdown${variableSuffix}`;

        const contentAST: BuildASTResult = buildAST(insideContent, {
            type: 'AST',
            ast: []
        }, generateVarValue, generateImageSrc, generateGraphEquations, generateShuffledIndeces, numInputs, numEssays, numChecks, numRadios, numDrags, numDrops, numSolutions, numCodes, numShuffles, numMarkdowns + 1);
        const markdown: Markdown = {
            type: 'MARKDOWN',
            varName,
            content: contentAST.ast.ast
        };

        return buildAST(source.replace(matchedContent, ''), {
            ...ast,
            ast: [...ast.ast, markdown]
        }, generateVarValue, generateImageSrc, generateGraphEquations, generateShuffledIndeces, contentAST.numInputs, contentAST.numEssays, contentAST.numChecks, contentAST.numRadios, contentAST.numDrags, contentAST.numDrops, contentAST.numSolutions, contentAST.numCodes, contentAST.numShuffles, contentAST.numMarkdowns);
    }

    if (source.search(shuffleRegex) === 0) {
        const match = source.match(shuffleRegex) || [];
        const matchedContent = match[0];
        const variableSuffix = match[1];
        const insideContent = match[3];
        const varName = `shuffle${variableSuffix}`;

        const contentAST: BuildASTResult = buildAST(insideContent, {
            type: 'AST',
            ast: []
        }, generateVarValue, generateImageSrc, generateGraphEquations, generateShuffledIndeces, numInputs, numEssays, numChecks, numRadios, numDrags, numDrops, numSolutions, numCodes, numShuffles + 1, numMarkdowns);
        const existingShuffledIndeces = generateShuffledIndeces(varName);
        const shuffle: Shuffle = {
            type: 'SHUFFLE',
            varName,
            content: contentAST.ast.ast,
            shuffledIndeces: existingShuffledIndeces !== null ? existingShuffledIndeces : shuffleItems(new Array(contentAST.ast.ast.length).fill(0).map((x, index) => index).filter((index: number) => contentAST.ast.ast[index].type !== 'CONTENT'))
        };

        return buildAST(source.replace(matchedContent, ''), {
            ...ast,
            ast: [...ast.ast, shuffle]
        }, generateVarValue, generateImageSrc, generateGraphEquations, generateShuffledIndeces, contentAST.numInputs, contentAST.numEssays, contentAST.numChecks, contentAST.numRadios, contentAST.numDrags, contentAST.numDrops, contentAST.numSolutions, contentAST.numCodes, contentAST.numShuffles, contentAST.numMarkdowns);
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
        const varNameSuffix = match[1];
        const varName = `img${varNameSuffix}`;

        const image: Image = {
            type: 'IMAGE',
            varName,
            src: generateImageSrc(varName)
        };

        return buildAST(source.replace(matchedContent, ''), {
            ...ast,
            ast: [...ast.ast, image]
        }, generateVarValue, generateImageSrc, generateGraphEquations, generateShuffledIndeces, numInputs, numEssays, numChecks, numRadios, numDrags, numDrops, numSolutions, numCodes, numShuffles, numMarkdowns);
    }

    if (source.search(graphRegex) === 0) {
        const match = source.match(graphRegex) || [];
        const matchedContent = match[0];
        const varNameSuffix = match[1];
        const varName = `graph${varNameSuffix}`;

        const graph: Graph = {
            type: 'GRAPH',
            varName,
            equations: generateGraphEquations(varName)
        };

        return buildAST(source.replace(matchedContent, ''), {
            ...ast,
            ast: [...ast.ast, graph]
        }, generateVarValue, generateImageSrc, generateGraphEquations, generateShuffledIndeces, numInputs, numEssays, numChecks, numRadios, numDrags, numDrops, numSolutions, numCodes, numShuffles, numMarkdowns);
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
        }, generateVarValue, generateImageSrc, generateGraphEquations, generateShuffledIndeces, numInputs, numEssays, numChecks, numRadios, numDrags, numDrops, numSolutions, numCodes, numShuffles, numMarkdowns);
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
        numShuffles,
        numMarkdowns
    };
}

export function getAstObjects(ast: AST, type: ASTObjectType, typesToExclude?: ASTObjectType[]): ASTObject[] {
    return ast.ast.reduce((result: ASTObject[], astObject: ASTObject) => {
        const shouldExcludeType = typesToExclude && typesToExclude.includes(astObject.type);

        if (
            (
                astObject.type === 'CHECK' ||
                astObject.type === 'RADIO' ||
                astObject.type === 'SOLUTION' ||
                astObject.type === 'SHUFFLE' ||
                astObject.type === 'DRAG' ||
                astObject.type === 'DROP' ||
                astObject.type === 'MARKDOWN'
            ) &&
            !shouldExcludeType
        ) {
            if (astObject.type === type) {
                return [...result, astObject, ...getAstObjects({
                    type: 'AST',
                    ast: astObject.content
                }, type, typesToExclude)];
            }
            else {
                return [...result, ...getAstObjects({
                    type: 'AST',
                    ast: astObject.content
                }, type, typesToExclude)];
            }
        }

        if (astObject.type === type && !shouldExcludeType) {
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
                astObject.type === 'DROP' ||
                astObject.type === 'MARKDOWN'
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

    if (astObjectType === 'SHUFFLE') {
        return astObjects.length > 0 ? (<Shuffle> astObjects[0]).shuffledIndeces : null;
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
