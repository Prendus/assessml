import {compileToAssessML, compileToHTML, parse, getASTObjectPayload, normalizeASTObjectPayloads, generateVarValue} from '../../assessml';
import {AST, ASTObject, Variable} from '../../assessml.d';
import {flattenContentObjects, verifyHTML, arbAST, resetNums, addShuffledIndeces} from '../../test-utilities';

const deepEqual = require('deep-equal');

class PrendusAssessMLTest extends HTMLElement {
    static get is() { return 'prendus-assessml-test'; }

    beforeTest() {
        resetNums();
    }

    prepareTests(test: any) {
        test('The parse function should take an arbitrary AssessML string and return a correct AssessML AST', [arbAST], (arbAST: AST) => {
            this.beforeTest();
            const shuffledAst = addShuffledIndeces(arbAST);
            const flattenedAst = flattenContentObjects(shuffledAst);
            const normalizedAST = normalizeASTObjectPayloads(flattenedAst, flattenedAst);
            const parsedAst = parse(compileToAssessML(normalizedAST, (varName) => generateVarValue(normalizedAST, varName), (varName) => getASTObjectPayload(normalizedAST, 'IMAGE', varName), (varName) => getASTObjectPayload(normalizedAST, 'GRAPH', varName)), (varName) => generateVarValue(normalizedAST, varName), (varName) => getASTObjectPayload(normalizedAST, 'IMAGE', varName), (varName) => getASTObjectPayload(flattenedAst, 'GRAPH', varName));

            const result = deepEqual(normalizedAST, parsedAst, {
                strict: true
            });

            return result;
        });

         test('The compileToAssessML function should take an arbitrary AssessML string and return a correct AssessML string', [arbAST], (arbAST: AST) => {
             this.beforeTest();
             const shuffledAst = addShuffledIndeces(arbAST);
             const flattenedAst = flattenContentObjects(shuffledAst);
             const normalizedAST = normalizeASTObjectPayloads(flattenedAst, flattenedAst);
             const assessMLString = compileToAssessML(normalizedAST, (varName) => generateVarValue(normalizedAST, varName), (varName) => getASTObjectPayload(normalizedAST, 'IMAGE', varName), (varName) => getASTObjectPayload(normalizedAST, 'GRAPH', varName));

             const result = assessMLString === compileToAssessML(assessMLString, (varName) => generateVarValue(normalizedAST, varName), (varName) => getASTObjectPayload(normalizedAST, 'IMAGE', varName), (varName) => getASTObjectPayload(normalizedAST, 'GRAPH', varName));

             return result;
         });

         test('The compileToAssessML function should take an arbitrary AssessML AST and return a correct AssessML string', [arbAST], (arbAST: AST) => {
            this.beforeTest();
            const shuffledAst = addShuffledIndeces(arbAST);
            const flattenedAst = flattenContentObjects(shuffledAst);
            const normalizedAST = normalizeASTObjectPayloads(flattenedAst, flattenedAst);
            const assessMLString = compileToAssessML(normalizedAST, (varName) => generateVarValue(normalizedAST, varName), (varName) => getASTObjectPayload(normalizedAST, 'IMAGE', varName), (varName) => getASTObjectPayload(normalizedAST, 'GRAPH', varName));

            const result = assessMLString === compileToAssessML(normalizedAST, (varName) => generateVarValue(normalizedAST, varName), (varName) => getASTObjectPayload(normalizedAST, 'IMAGE', varName), (varName) => getASTObjectPayload(normalizedAST, 'GRAPH', varName));

            return result;
         });

        test('The compileToHTML function should take an arbitrary AssessML AST and return a correct HTML string', [arbAST], (arbAST: AST) => {
            this.beforeTest();
            const shuffledAst = addShuffledIndeces(arbAST);
            const flattenedAst = flattenContentObjects(shuffledAst);
            const normalizedAST = normalizeASTObjectPayloads(flattenedAst, flattenedAst);
            const htmlString = compileToHTML(normalizedAST, (varName) => generateVarValue(normalizedAST, varName), (varName) => getASTObjectPayload(normalizedAST, 'IMAGE', varName), (varName) => getASTObjectPayload(normalizedAST, 'GRAPH', varName));

            const result = verifyHTML(normalizedAST, htmlString);

            return result;
        });

        test('The compileToHTML function should take an arbitrary AssessML string and return a correct HTML string', [arbAST], (arbAST: AST) => {
            this.beforeTest();
            const shuffledAst = addShuffledIndeces(arbAST);
            const flattenedAst = flattenContentObjects(shuffledAst);
            const normalizedAST = normalizeASTObjectPayloads(flattenedAst, flattenedAst);
            const assessMLString = compileToAssessML(normalizedAST, (varName) => generateVarValue(normalizedAST, varName), (varName) => getASTObjectPayload(normalizedAST, 'IMAGE', varName), (varName) => getASTObjectPayload(normalizedAST, 'GRAPH', varName));
            const htmlString = compileToHTML(normalizedAST, (varName) => generateVarValue(normalizedAST, varName), (varName) => getASTObjectPayload(normalizedAST, 'IMAGE', varName), (varName) => getASTObjectPayload(normalizedAST, 'GRAPH', varName));

            const result = verifyHTML(normalizedAST, htmlString);

            return result;
        });
    }
}

window.customElements.define('prendus-assessml-test', PrendusAssessMLTest);
