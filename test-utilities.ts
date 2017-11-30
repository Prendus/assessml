import {AST, ASTObject, Variable, Content, Image} from './assessml.d';
import {compileToHTML, generateVarValue, getASTObjectPayload, shuffleItems} from './assessml';

const jsc = require('jsverify');

const arbContent = jsc.record({
    type: jsc.constant('CONTENT'),
    varName: jsc.bless({
        generator: () => {
            return `content`;
        }
    }),
    content: jsc.pair(jsc.nestring, jsc.nestring).smap((x: any) => { //TODO figure out the correct way to use smap
        return x[0].replace(/\[/g, 'd').replace(/\]/g, 'd').replace(/</g, '&lt;').replace(/>/g, '&gt;'); //do not allow ast types to be created in arbitrary content, otherwise it isn't content. Also, escape HTML brackets like in the compiler
    })
});

const arbVariable = jsc.record({
    type: jsc.constant('VARIABLE'),
    varName: jsc.pair(jsc.constant('var'), jsc.nat).smap((x: any) => { //TODO Figure out the correct way to use smap. I need to make the second function the inverse of the first
        return `${x[0]}${x[1]}`; //the variable will never have a ] in it because of the Regex...make sure to replace it with something or you could get an empty string
    }, (x: any) => {
        return x;
    }),
    value: jsc.oneof([jsc.number, jsc.string])
});

let numInputs = 1;
const arbInput = jsc.record({
    type: jsc.constant('INPUT'),
    varName: jsc.bless({
        generator: () => {
            return `input${numInputs++}`;
        }
    })
});

let numEssays = 1;
const arbEssay = jsc.record({
    type: jsc.constant('ESSAY'),
    varName: jsc.bless({
        generator: () => {
            return `essay${numEssays++}`;
        }
    })
});

let numCodes = 1;
const arbCode = jsc.record({
    type: jsc.constant('CODE'),
    varName: jsc.bless({
        generator: () => {
            return `code${numCodes++}`;
        }
    })
});

const arbImage = jsc.record({
    type: jsc.constant('IMAGE'),
    varName: jsc.pair(jsc.constant('img'), jsc.nat).smap((x: any) => { //TODO Figure out the correct way to use smap. I need to make the second function the inverse of the first
        return `${x[0]}${x[1]}`; //the variable will never have a ] in it because of the Regex...make sure to replace it with something or you could get an empty string
    }, (x: any) => {
        return x;
    }),
    src: jsc.nestring
});

const arbGraph = jsc.record({
    type: jsc.constant('GRAPH'),
    varName: jsc.pair(jsc.constant('graph'), jsc.nat).smap((x: any) => { //TODO Figure out the correct way to use smap. I need to make the second function the inverse of the first
        return `${x[0]}${x[1]}`; //the variable will never have a ] in it because of the Regex...make sure to replace it with something or you could get an empty string
    }, (x: any) => {
        return x;
    }),
    equations: jsc.array(jsc.nestring) //TODO make arbitrary equation strings
});

let numChecks = 1;
const arbCheck = jsc.record({
    type: jsc.constant('CHECK'),
    varName: jsc.bless({
        generator: () => {
            return `check${numChecks++}`;
        }
    }),
    content: jsc.bless({
        generator: () => {
            return jsc.sampler(arbASTArray)();
        }
    })
});

let numRadios = 1;
const arbRadio = jsc.record({
    type: jsc.constant('RADIO'),
    varName: jsc.bless({
        generator: () => {
            return `radio${numRadios++}`;
        }
    }),
    content: jsc.bless({
        generator: () => {
            return jsc.sampler(arbASTArray)();
        }
    })
});

let numSolutions = 1;
const arbSolution = jsc.record({
    type: jsc.constant('SOLUTION'),
    varName: jsc.bless({
        generator: () => {
            return `solution${numSolutions++}`;
        }
    }),
    content: jsc.bless({
        generator: () => {
            return jsc.sampler(arbASTArray)();
        }
    })
});

let numShuffles = 1;
const arbShuffle = jsc.record({
    type: jsc.constant('SHUFFLE'),
    varName: jsc.bless({
        generator: () => {
            return `shuffle${numShuffles++}`;
        }
    }),
    content: jsc.bless({
        generator: () => {
            return jsc.sampler(arbASTArray)();
        }
    })
});

const arbASTArray = jsc.array(jsc.oneof([arbContent, arbVariable, arbInput, arbEssay, arbImage, arbCode, arbGraph, jsc.oneof(arbContent, arbCheck), jsc.oneof(arbContent, arbRadio), jsc.oneof(arbContent, arbSolution), jsc.oneof(arbContent, arbShuffle)]));

export const arbAST = jsc.record({
    type: jsc.constant('AST'),
    ast: arbASTArray
});

// combine any content elements that are adjacent. Look at the previous astObject, if it is of type CONTENT and the current element is of type CONTENT, then remove the previous one and put yourself in, combinging your values
export function flattenContentObjects(ast: AST): AST {
    return {
        ...ast,
        ast: ast.ast.reduce((result: ASTObject[], astObject: ASTObject, index: number) => {
            if (astObject.type === 'CONTENT') {
                return flattenContent(ast, astObject, result, index);
            }

            if (
                astObject.type === 'RADIO' ||
                astObject.type === 'CHECK' ||
                astObject.type === 'SOLUTION' ||
                astObject.type === 'SHUFFLE' ||
                astObject.type === 'DRAG' ||
                astObject.type === 'DROP'
            ) {
                return [...result, {
                    ...astObject,
                    content: flattenContentObjects({
                        type: 'AST',
                        ast: astObject.content
                    }).ast
                }];
            }

            return [...result, astObject];
        }, [])
    };
}

function flattenContent(ast: AST, contentAstObject: Content, result: ASTObject[], index: number) {
    const previousAstObject = ast.ast[index - 1];
    if (previousAstObject && previousAstObject.type === 'CONTENT') {
        return [...result.slice(0, -1), {
            ...contentAstObject,
            content: `${previousAstObject.content}${contentAstObject.content}`
        }];
    }
    else {
        return [...result, contentAstObject];
    }
}

// Go through the htmlString and match based on the current astObject. If there is a match, remove it from the string and keep going. You should end up with an empty string at the end
export function verifyHTML(ast: AST, htmlString: string) {
    const result = ast.ast.reduce((result: string, astObject) => {
        if (astObject.type === 'CONTENT') {
            if (result.indexOf(astObject.content) === 0) {
                return result.replace(astObject.content, '');
            }
        }

        if (astObject.type === 'VARIABLE') {
            const variableString = `${astObject.value}`;
            if (result.indexOf(variableString) === 0) {
                return result.replace(variableString, '');
            }
        }

        if (astObject.type === 'INPUT') {
            const inputString = `<span id="${astObject.varName}" contenteditable="true" style="display: inline-block; min-width: 25px; min-height: 25px; padding: 5px; box-shadow: 0px 0px 1px black;"></span>`;
            if (result.indexOf(inputString) === 0) {
                return result.replace(inputString, '');
            }
        }

        if (astObject.type === 'ESSAY') {
            const essayString = `<textarea id="${astObject.varName}" style="width: 100%; height: 50vh;"></textarea>`;
            if (result.indexOf(essayString) === 0) {
                return result.replace(essayString, '');
            }
        }

        if (astObject.type === 'CODE') {
            const codeString = `<juicy-ace-editor id="${astObject.varName}" theme="ace/theme/chrome" mode="ace/mode/javascript" style="height: 50vh" fontsize="25px"></juicy-ace-editor>`;
            if (result.indexOf(codeString) === 0) {
                return result.replace(codeString, '');
            }
        }

        if (astObject.type === 'IMAGE') {
            const imageString = `<img src="${astObject.src}">`;
            if (result.indexOf(imageString) === 0) {
                return result.replace(imageString, '');
            }
        }

        if (astObject.type === 'GRAPH') {
            const graphString = `<function-plot data='[${astObject.equations.reduce((result, equation, index) => `${result}${index !== 0 ? ',' : ''}{ "fn": "${equation}" }`, '')}]'></function-plot>`;
            if (result.indexOf(graphString) === 0) {
                return result.replace(graphString, '');
            }
        }

        if (astObject.type === 'CHECK') {
            const checkString = `<input id="${astObject.varName}" type="checkbox" style="width: calc(40px - 1vw); height: calc(40px - 1vw);">${compileToHTML({
                    type: 'AST',
                    ast: astObject.content
                },
                (varName: string) => getASTObjectPayload(ast, 'VARIABLE', varName),
                (varName: string) => getASTObjectPayload(ast, 'IMAGE', varName),
                (varName: string) => getASTObjectPayload(ast, 'GRAPH', varName),
                (varName: string) => getASTObjectPayload(ast, 'SHUFFLE', varName)
            )}`;

            if (result.indexOf(checkString) === 0) {
                return result.replace(checkString, '');
            }
        }

        if (astObject.type === 'RADIO') {
            const radioGroupNameMatch = result.match(/name="((.|\n|\r)+?)"/);
            const radioGroupName = radioGroupNameMatch ? radioGroupNameMatch[1] : '';
            const radioString = `<input id="${astObject.varName}" type="radio" name="${radioGroupName}" style="width: calc(40px - 1vw); height: calc(40px - 1vw);">${compileToHTML({
                    type: 'AST',
                    ast: astObject.content
                },
                (varName: string) => getASTObjectPayload(ast, 'VARIABLE', varName),
                (varName: string) => getASTObjectPayload(ast, 'IMAGE', varName),
                (varName: string) => getASTObjectPayload(ast, 'GRAPH', varName),
                (varName: string) => getASTObjectPayload(ast, 'SHUFFLE', varName)
            )}`;

            if (result.indexOf(radioString) === 0) {
                return result.replace(radioString, '');
            }
        }

        if (astObject.type === 'SOLUTION') {
            const solutionString = `<template id="${astObject.varName}">${compileToHTML({
                    type: 'AST',
                    ast: astObject.content
                },
                (varName: string) => getASTObjectPayload(ast, 'VARIABLE', varName),
                (varName: string) => getASTObjectPayload(ast, 'IMAGE', varName),
                (varName: string) => getASTObjectPayload(ast, 'GRAPH', varName),
                (varName: string) => getASTObjectPayload(ast, 'SHUFFLE', varName)
            )}</template>`

            if (result.indexOf(solutionString) === 0) {
                return result.replace(solutionString, '');
            }
        }

        if (astObject.type === 'SHUFFLE') {
            //TODO Not sure this test is very useful. We are using the compileToHTML function in the implementation of the test for the compileToHTML function...albeit it is different because we're using it only on one piece of the AST instead of the entire AST
            //TODO this is not testing that the randomness works
            //TODO we also aren't testing that the content objects stay in place
            const shuffleString = compileToHTML({
                    type: 'AST',
                    ast: [astObject]
                },
                (varName: string) => getASTObjectPayload(ast, 'VARIABLE', varName),
                (varName: string) => getASTObjectPayload(ast, 'IMAGE', varName),
                (varName: string) => getASTObjectPayload(ast, 'GRAPH', varName),
                (varName: string) => getASTObjectPayload(ast, 'SHUFFLE', varName)
            );

            if (result.indexOf(shuffleString) === 0) {
                return result.replace(shuffleString, '');
            }
        }

        return result;
    }, htmlString);

    return result === '';
}

export function resetNums() {
    numInputs = 1;
    numEssays = 1;
    numCodes = 1;
    numChecks = 1;
    numRadios = 1;
    numSolutions = 1;
    numShuffles = 1;
}

export function addShuffledIndeces(ast: AST): AST {
    return {
        ...ast,
        ast: ast.ast.map((astObject: ASTObject) => {
            if (
                astObject.type === 'RADIO' ||
                astObject.type === 'CHECK' ||
                astObject.type === 'SOLUTION' ||
                astObject.type === 'SHUFFLE' ||
                astObject.type === 'DRAG' ||
                astObject.type === 'DROP'
            ) {
                if (astObject.type === 'SHUFFLE') {
                    const flattenedContentAST = flattenContentObjects({
                        type: 'AST',
                        ast: astObject.content
                    }).ast;

                    return {
                        ...astObject,
                        content: addShuffledIndeces({
                            type: 'AST',
                            ast: astObject.content
                        }).ast,
                        shuffledIndeces: shuffleItems(new Array(flattenedContentAST.length).fill(0).map((x, index) => index).filter((index: number) => flattenedContentAST[index].type !== 'CONTENT'))
                    };
                }
                else {
                    return {
                        ...astObject,
                        content: addShuffledIndeces({
                            type: 'AST',
                            ast: astObject.content
                        }).ast
                    };
                }
            }

            return astObject;
        })
    };
}
