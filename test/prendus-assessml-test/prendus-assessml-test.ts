import {compileToAssessML, parse} from '../../assessml';

const jsc = require('jsverify');
const deepEqual = require('deep-equal');

const arbContent = jsc.record({
    type: jsc.constant('CONTENT'),
    content: jsc.nestring
});

const arbVariable = jsc.record({
    type: jsc.constant('VARIABLE'),
    varName: jsc.pair(jsc.constant('var'), jsc.nestring).smap((x) => { //TODO Figure out the correct way to use smap. I need to make the second function the inverse of the first
        return `${x[0]}${x[1].replace(/\]/g, '')}`; //the variable will never have a ] in it because of the Regex
    }, (x) => {
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

class PrendusAssessMLTest extends Polymer.Element {
    static get is() { return 'prendus-assessml-test'; }

    beforeTest() {
        numInputs = 1;
        numEssays = 1;
        numChecks = 1;
        numRadios = 1;
    }

    prepareTests(test) {
        test('The parse function should take an arbitrary AssessML document string and return a correct AssessML AST', [arbAST], (arbAST) => {
            this.beforeTest();

            // combine any content elements that are adjacent. Look at the previous astObject, if it is of type CONTENT and the current element is of type CONTENT, then remove the previous one and put yourself in, combinging your values
            //TODO this function does not work perfectly
            const combinedContentArbAST = {
                ...arbAST,
                ast: arbAST.ast.reduce((result, astObject, index) => {
                    if (astObject.type === 'CONTENT') {
                        const previousAstObject = result[index - 1];
                        if (previousAstObject && previousAstObject.type === 'CONTENT') {
                            return [...result.slice(0, -1), {
                                ...astObject,
                                content: `${result[index - 1].content}${astObject.content}`
                            }];
                        }
                    }

                    return [...result, astObject];
                }, [])
            };

            console.log('combinedContentArbAST', combinedContentArbAST);
            console.log('parsed AST', parse(compileToAssessML(combinedContentArbAST)));

            console.log('astsAreEqual', astsAreEqual(combinedContentArbAST, parse(compileToAssessML(combinedContentArbAST))));

            return astsAreEqual(combinedContentArbAST, parse(compileToAssessML(combinedContentArbAST)));
        });

        // test('The compileToHTML function should take an arbitrary AssessML document string and return a correct HTML string', [], );
        //
        // test('The compileToHTML function should take an arbitrary AssessML AST and return a correct HTML string', [], );

        // test('The compileToAssessML function should take an arbitrary AssessML document string and return a correct AsessML string')
        // test('Teh compileToAssessML function should take an arbitrary AssessML AST and return a correct AssessML string')

        //TODO once getAstObjects gets more complicated, then you can test it
    }
}

window.customElements.define(PrendusAssessMLTest.is, PrendusAssessMLTest);

function astsAreEqual(ast1, ast2) {
    return ast1.type === ast2.type && ast1.type === 'AST' && ast1.ast.reduce((result: boolean, astObject, index) => {
        if (result === false) {
            return false;
        }

        if (astObject.type === 'CONTENT') {
            return (
                ast1.ast[index].type === ast2.ast[index].type &&
                ast1.ast[index].content === ast2.ast[index].content
            );
        }

        if (astObject.type === 'VARIABLE') {
            return (
                ast1.ast[index].type === ast2.ast[index].type &&
                ast1.ast[index].varName === ast2.ast[index].varName &&
                typeof ast1.ast[index].value === 'number' &&
                typeof ast2.ast[index].value === 'number'
            );
        }

        if (astObject.type === 'INPUT' || astObject.type === 'ESSAY') {
            return (
                ast1.ast[index].type === ast2.ast[index].type &&
                ast1.ast[index].varName === ast2.ast[index].varName
            );
        }

        if (astObject.type === 'CHECK' || astObject.type === 'RADIO') {
            return (
                ast1.ast[index].type === ast2.ast[index].type &&
                ast1.ast[index].varName === ast2.ast[index].varName &&
                deepEqual(ast1.ast[index].content, ast2.ast[index].content, {
                    strict: true
                }) //TODO this must change once we allow variables inside of checkboxes and radios
            );
        }

        return false;
    }, true);
}
