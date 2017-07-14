import {compileToAssessML, compileToHTML, parse} from '../../assessml';
import {AST, ASTObject, Variable} from '../../assessml.d';

const jsc = require('jsverify');
const deepEqual = require('deep-equal');

const arbContent = jsc.record({
    type: jsc.constant('CONTENT'),
    content: jsc.pair(jsc.nestring, jsc.nestring).smap((x: any) => {
        return x[0].replace(/\[/g, 'd').replace(/\]/g, 'd'); //do not allow ast types to be created in arbitrary content, otherwise it isn't content
    })
});

const arbVariable = jsc.record({
    type: jsc.constant('VARIABLE'),
    varName: jsc.pair(jsc.constant('var'), jsc.nestring).smap((x: any) => { //TODO Figure out the correct way to use smap. I need to make the second function the inverse of the first
        return `${x[0]}${x[1].replace(/\]/g, 'd')}`; //the variable will never have a ] in it because of the Regex...make sure to replace it with something or you could get an empty string
    }, (x: any) => {
        return x;
    }),
    value: jsc.number
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

let numChecks = 1;
const arbCheck = jsc.record({
    type: jsc.constant('CHECK'),
    varName: jsc.bless({
        generator: () => {
            return `check${numChecks++}`;
        }
    }),
    content: jsc.tuple([arbContent]) //TODO once we support variables in here this will need to change
});

let numRadios = 1;
const arbRadio = jsc.record({
    type: jsc.constant('RADIO'),
    varName: jsc.bless({
        generator: () => {
            return `radio${numRadios++}`;
        }
    }),
    content: jsc.tuple([arbContent])//TODO once we support variables in here this will need to change
});

const arbAST = jsc.record({
    type: jsc.constant('AST'),
    ast: jsc.array(jsc.oneof([arbContent, arbVariable, arbInput, arbEssay, arbCheck, arbRadio]))
});

declare var Polymer: any;

class PrendusAssessMLTest extends Polymer.Element {
    static get is() { return 'prendus-assessml-test'; }

    beforeTest() {
        numInputs = 1;
        numEssays = 1;
        numChecks = 1;
        numRadios = 1;
    }

    prepareTests(test: any) {
        test('The parse function should take an arbitrary AssessML string and return a correct AssessML AST', [arbAST], (arbAST: AST) => {
            this.beforeTest();
            const flattenedAst = normalizeVariables(flattenContentObjects(arbAST));
            const parsedAst = parse(compileToAssessML(flattenedAst, (varName) => generateVarValue(flattenedAst, varName)), (varName) => generateVarValue(flattenedAst, varName));
            return deepEqual(flattenedAst, parsedAst, {
                strict: true
            });
        });

         test('The compileToAssessML function should take an arbitrary AssessML string and return a correct AssessML string', [arbAST], (arbAST: AST) => {
             this.beforeTest();
             const flattenedAst = normalizeVariables(flattenContentObjects(arbAST));
             const assessMLString = compileToAssessML(flattenedAst, (varName) => generateVarValue(flattenedAst, varName));
             return assessMLString === compileToAssessML(assessMLString, (varName) => generateVarValue(flattenedAst, varName));
         });

         test('The compileToAssessML function should take an arbitrary AssessML AST and return a correct AssessML string', [arbAST], (arbAST: AST) => {
            this.beforeTest();
            const flattenedAst = normalizeVariables(flattenContentObjects(arbAST));
            const assessMLString = compileToAssessML(flattenedAst, (varName) => generateVarValue(flattenedAst, varName));
            return assessMLString === compileToAssessML(flattenedAst, (varName) => generateVarValue(flattenedAst, varName));
         });

        test('The compileToHTML function should take an arbitrary AssessML AST and return a correct HTML string', [arbAST], (arbAST: AST) => {
            this.beforeTest();
            const flattenedAst = normalizeVariables(flattenContentObjects(arbAST));
            const htmlString = compileToHTML(flattenedAst, (varName) => generateVarValue(flattenedAst, varName));
            return verifyHTML(flattenedAst, htmlString);
        });

        test('The compileToHTML function should take an arbitrary AssessML string and return a correct HTML string', [arbAST], (arbAST: AST) => {
            this.beforeTest();
            const flattenedAst = normalizeVariables(flattenContentObjects(arbAST));
            const assessMLString = compileToAssessML(flattenedAst, (varName) => generateVarValue(flattenedAst, varName));
            const htmlString = compileToHTML(assessMLString, (varName) => generateVarValue(flattenedAst, varName));
            return verifyHTML(flattenedAst, htmlString);
        });

        //TODO once getAstObjects gets more complicated, then you can test it
    }
}

window.customElements.define(PrendusAssessMLTest.is, PrendusAssessMLTest);

// combine any content elements that are adjacent. Look at the previous astObject, if it is of type CONTENT and the current element is of type CONTENT, then remove the previous one and put yourself in, combinging your values
function flattenContentObjects(ast: AST) {
    return {
        ...ast,
        ast: ast.ast.reduce((result, astObject: ASTObject, index: number) => {
            if (astObject.type === 'CONTENT') {
                const previousAstObject = ast.ast[index - 1];
                if (previousAstObject && previousAstObject.type === 'CONTENT') {
                    return [...result.slice(0, -1), {
                        ...astObject,
                        content: `${previousAstObject.content}${astObject.content}`
                    }];
                }
            }

            return [...result, astObject];
        }, [])
    };
}

// the arbitrary variables need to have the same values if they have the same name. The arbitraries will not do this on their own
function normalizeVariables(ast: AST): AST {
    return {
        ...ast,
        ast: ast.ast.map((astObject: ASTObject, index: number) => {
            if (astObject.type === 'VARIABLE') {
                const arrayToSearch = ast.ast.slice(0, index);
                const identicalVariables: Variable[] = <Variable[]> arrayToSearch.filter((innerAstObject: ASTObject) => {
                    return innerAstObject.type === 'VARIABLE' && innerAstObject.varName === astObject.varName;
                });
                return identicalVariables.length > 0 ? {
                    ...astObject,
                    value: identicalVariables[0].value
                } : astObject;
            }

            return astObject;
        })
    };
}

// Go through the htmlString and match based on the current astObject. If there is a match, remove it from the string and keep going. You should end up with an empty string at the end
function verifyHTML(ast: AST, htmlString: string) {
    return '' === ast.ast.reduce((result: string, astObject) => {

        if (astObject.type === 'CONTENT') {
            if (result.indexOf(astObject.content) === 0) {
                return result.replace(astObject.content, '');
            }
        }

        if (astObject.type === 'VARIABLE') {
            if (result.indexOf(astObject.value.toString()) === 0) {
                return result.replace(astObject.value.toString(), '');
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

        if (astObject.type === 'CHECK') {
            const checkString = `<input id="${astObject.varName}" type="checkbox" style="width: calc(40px - 1vw); height: calc(40px - 1vw);">${compileToHTML({
                type: 'AST',
                ast: astObject.content
            }, (varName) => generateVarValue(ast, varName))}`

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
            }, (varName) => generateVarValue(ast, varName))}`;

            if (result.indexOf(radioString) === 0) {
                return result.replace(radioString, '');
            }
        }

        return result;
    }, htmlString);
}

function generateRandomInteger(min: number, max: number): number {
    //returns a random integer between min (included) and max (included)
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateVarValue(ast: AST, varName: string) {
    const existingVarValue = getVariableValue(ast, varName);
    return existingVarValue === NaN ? generateRandomInteger(0, 100) : existingVarValue;
}

function getVariableValue(ast: AST, varName: string): number {
    const variables: Variable[] = <Variable[]> ast.ast.filter((astObject: ASTObject) => astObject.type === 'VARIABLE' && astObject.varName === varName);
    return variables.length > 0 ? variables[0].value : NaN;
}
