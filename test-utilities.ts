import {AST, ASTObject, Variable, Content, Image} from './assessml.d';
import {compileToHTML, generateVarValue, getASTObjectPayload, shuffleItems} from './assessml';
import jsverify from 'jsverify-es-module';

const arbContent = jsverify.record({
    type: jsverify.constant('CONTENT'),
    varName: jsverify.bless({
        generator: () => {
            return `content`;
        }
    }),
    content: jsverify.pair(jsverify.nestring, jsverify.nestring).smap((x: any) => { //TODO figure out the correct way to use smap
        return x[0].replace(/\[/g, 'd').replace(/\]/g, 'd').replace(/</g, '&lt;').replace(/>/g, '&gt;'); //do not allow ast types to be created in arbitrary content, otherwise it isn't content. Also, escape HTML brackets like in the compiler
    })
});

const arbVariable = jsverify.record({
    type: jsverify.constant('VARIABLE'),
    varName: jsverify.bless({
        generator: () => {
            //TODO realistically the check prefix could have more characters than the UUID function allows. But we need to make sure they are unique
            //TODO check var names being unique is a constraint that the user must follow. All nested tags must have unique variable names or the nesting will not work
            return `var${createUUID()}`;
        }
    }),
    value: jsverify.oneof([jsverify.number, jsverify.string])
});

const arbInput = jsverify.record({
    type: jsverify.constant('INPUT'),
    varName: jsverify.bless({
        generator: () => {
            //TODO realistically the check prefix could have more characters than the UUID function allows. But we need to make sure they are unique
            //TODO check var names being unique is a constraint that the user must follow. All nested tags must have unique variable names or the nesting will not work
            return `input${createUUID()}`;
        }
    })
});

const arbEssay = jsverify.record({
    type: jsverify.constant('ESSAY'),
    varName: jsverify.bless({
        generator: () => {
            //TODO realistically the check prefix could have more characters than the UUID function allows. But we need to make sure they are unique
            //TODO check var names being unique is a constraint that the user must follow. All nested tags must have unique variable names or the nesting will not work
            return `essay${createUUID()}`;
        }
    })
});

const arbCode = jsverify.record({
    type: jsverify.constant('CODE'),
    varName: jsverify.bless({
        generator: () => {
            //TODO realistically the check prefix could have more characters than the UUID function allows. But we need to make sure they are unique
            //TODO check var names being unique is a constraint that the user must follow. All nested tags must have unique variable names or the nesting will not work
            return `code${createUUID()}`;
        }
    })
});

const arbImage = jsverify.record({
    type: jsverify.constant('IMAGE'),
    varName: jsverify.bless({
        generator: () => {
            //TODO realistically the check prefix could have more characters than the UUID function allows. But we need to make sure they are unique
            //TODO check var names being unique is a constraint that the user must follow. All nested tags must have unique variable names or the nesting will not work
            return `img${createUUID()}`;
        }
    }),
    src: jsverify.nestring
});

const arbGraph = jsverify.record({
    type: jsverify.constant('GRAPH'),
    varName: jsverify.bless({
        generator: () => {
            //TODO realistically the check prefix could have more characters than the UUID function allows. But we need to make sure they are unique
            //TODO check var names being unique is a constraint that the user must follow. All nested tags must have unique variable names or the nesting will not work
            return `graph${createUUID()}`;
        }
    }),
    equations: jsverify.array(jsverify.nestring) //TODO make arbitrary equation strings
});

const arbCheck = jsverify.record({
    type: jsverify.constant('CHECK'),
    varName: jsverify.bless({
        generator: () => {
            //TODO realistically the check prefix could have more characters than the UUID function allows. But we need to make sure they are unique
            //TODO check var names being unique is a constraint that the user must follow. All nested tags must have unique variable names or the nesting will not work
            return `check${createUUID()}`;
        }
    }),
    content: jsverify.bless({
        generator: () => {
            return jsverify.sampler(arbASTArray)();
        }
    })
});

const arbRadio = jsverify.record({
    type: jsverify.constant('RADIO'),
    varName: jsverify.bless({
        generator: () => {
            //TODO realistically the check prefix could have more characters than the UUID function allows. But we need to make sure they are unique
            //TODO check var names being unique is a constraint that the user must follow. All nested tags must have unique variable names or the nesting will not work
            return `radio${createUUID()}`;
        }
    }),
    content: jsverify.bless({
        generator: () => {
            return jsverify.sampler(arbASTArray)();
        }
    })
});

const arbSolution = jsverify.record({
    type: jsverify.constant('SOLUTION'),
    varName: jsverify.bless({
        generator: () => {
            //TODO realistically the check prefix could have more characters than the UUID function allows. But we need to make sure they are unique
            //TODO check var names being unique is a constraint that the user must follow. All nested tags must have unique variable names or the nesting will not work
            return `solution${createUUID()}`;
        }
    }),
    content: jsverify.bless({
        generator: () => {
            return jsverify.sampler(arbASTArray)();
        }
    })
});

const arbMarkdown = jsverify.record({
    type: jsverify.constant('MARKDOWN'),
    varName: jsverify.bless({
        generator: () => {
            //TODO realistically the check prefix could have more characters than the UUID function allows. But we need to make sure they are unique
            //TODO check var names being unique is a constraint that the user must follow. All nested tags must have unique variable names or the nesting will not work
            return `markdown${createUUID()}`;
        }
    }),
    content: jsverify.bless({
        generator: () => {
            return jsverify.sampler(arbASTArray)();
        }
    })
});

const arbPretty = jsverify.record({
    type: jsverify.constant('PRETTY'),
    varName: jsverify.bless({
        generator: () => {
            //TODO realistically the check prefix could have more characters than the UUID function allows. But we need to make sure they are unique
            //TODO check var names being unique is a constraint that the user must follow. All nested tags must have unique variable names or the nesting will not work
            return `pretty${createUUID()}`;
        }
    }),
    content: jsverify.bless({
        generator: () => {
            return jsverify.sampler(arbASTArray)();
        }
    })
});

const arbShuffle = jsverify.record({
    type: jsverify.constant('SHUFFLE'),
    varName: jsverify.bless({
        generator: () => {
            //TODO realistically the check prefix could have more characters than the UUID function allows. But we need to make sure they are unique
            //TODO check var names being unique is a constraint that the user must follow. All nested tags must have unique variable names or the nesting will not work
            return `shuffle${createUUID()}`;
        }
    }),
    content: jsverify.bless({
        generator: () => {
            return jsverify.sampler(arbASTArray)();
        }
    })
});

const arbASTArray = jsverify.array(jsverify.oneof([arbContent, arbVariable, arbInput, arbEssay, arbImage, arbCode, arbGraph, jsverify.oneof(arbContent, arbCheck), jsverify.oneof(arbContent, arbRadio), jsverify.oneof(arbContent, arbSolution), jsverify.oneof(arbContent, arbShuffle), jsverify.oneof(arbContent, arbMarkdown), jsverify.oneof(arbContent, arbPretty)]));

export const arbAST = jsverify.record({
    type: jsverify.constant('AST'),
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
                astObject.type === 'DROP' ||
                astObject.type === 'MARKDOWN' ||
                astObject.type === 'PRETTY'
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
            const imageString = `<img style="height: auto; max-width: 50vw" src="${astObject.src}">`;
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

        if (astObject.type === 'MARKDOWN') {
            const markdownString = `<marked-element><div slot="markdown-html"></div><script type="text/markdown">${compileToHTML({
                    type: 'AST',
                    ast: astObject.content
                },
                (varName: string) => getASTObjectPayload(ast, 'VARIABLE', varName),
                (varName: string) => getASTObjectPayload(ast, 'IMAGE', varName),
                (varName: string) => getASTObjectPayload(ast, 'GRAPH', varName),
                (varName: string) => getASTObjectPayload(ast, 'SHUFFLE', varName)
            )}</script></marked-element>`

            if (result.indexOf(markdownString) === 0) {
                return result.replace(markdownString, '');
            }
        }

        if (astObject.type === 'PRETTY') {
            const prettyString = `<code-sample><template>${compileToHTML({
                    type: 'AST',
                    ast: astObject.content
                },
                (varName: string) => getASTObjectPayload(ast, 'VARIABLE', varName),
                (varName: string) => getASTObjectPayload(ast, 'IMAGE', varName),
                (varName: string) => getASTObjectPayload(ast, 'GRAPH', varName),
                (varName: string) => getASTObjectPayload(ast, 'SHUFFLE', varName)
            )}</template></code-sample>`

            if (result.indexOf(prettyString) === 0) {
                return result.replace(prettyString, '');
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
                astObject.type === 'DROP' ||
                astObject.type === 'MARKDOWN' ||
                astObject.type === 'PRETTY'
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
