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
            const assessML = compileToAssessML(
                normalizedAST,
                (varName: string) => generateVarValue(normalizedAST, varName),
                (varName: string) => getASTObjectPayload(normalizedAST, 'IMAGE', varName),
                (varName: string) => getASTObjectPayload(normalizedAST, 'GRAPH', varName),
                (varName: string) => getASTObjectPayload(normalizedAST, 'SHUFFLE', varName)
            );
            const parsedAst = parse(
                assessML,
                (varName: string) => generateVarValue(normalizedAST, varName),
                (varName: string) => getASTObjectPayload(normalizedAST, 'IMAGE', varName),
                (varName: string) => getASTObjectPayload(flattenedAst, 'GRAPH', varName),
                (varName: string) => getASTObjectPayload(normalizedAST, 'SHUFFLE', varName)
            );

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
             const assessMLString = compileToAssessML(
                 normalizedAST,
                 (varName: string) => generateVarValue(normalizedAST, varName),
                 (varName: string) => getASTObjectPayload(normalizedAST, 'IMAGE', varName),
                 (varName: string) => getASTObjectPayload(normalizedAST, 'GRAPH', varName),
                 (varName: string) => getASTObjectPayload(normalizedAST, 'SHUFFLE', varName)
             );

             const result = assessMLString === compileToAssessML(
                 assessMLString,
                 (varName: string) => generateVarValue(normalizedAST, varName),
                 (varName: string) => getASTObjectPayload(normalizedAST, 'IMAGE', varName),
                 (varName: string) => getASTObjectPayload(normalizedAST, 'GRAPH', varName),
                 (varName: string) => getASTObjectPayload(normalizedAST, 'SHUFFLE', varName)
             );

             return result;
         });

         test('The compileToAssessML function should take an arbitrary AssessML AST and return a correct AssessML string', [arbAST], (arbAST: AST) => {
            this.beforeTest();
            const shuffledAst = addShuffledIndeces(arbAST);
            const flattenedAst = flattenContentObjects(shuffledAst);
            const normalizedAST = normalizeASTObjectPayloads(flattenedAst, flattenedAst);
            const assessMLString = compileToAssessML(normalizedAST,
                (varName: string) => generateVarValue(normalizedAST, varName),
                (varName: string) => getASTObjectPayload(normalizedAST, 'IMAGE', varName),
                (varName: string) => getASTObjectPayload(normalizedAST, 'GRAPH', varName),
                (varName: string) => getASTObjectPayload(normalizedAST, 'SHUFFLE', varName)
            );

            const result = assessMLString === compileToAssessML(
                normalizedAST,
                (varName: string) => generateVarValue(normalizedAST, varName),
                (varName: string) => getASTObjectPayload(normalizedAST, 'IMAGE', varName),
                (varName: string) => getASTObjectPayload(normalizedAST, 'GRAPH', varName),
                (varName: string) => getASTObjectPayload(normalizedAST, 'SHUFFLE', varName)
            );

            return result;
         });

        test('The compileToHTML function should take an arbitrary AssessML AST and return a correct HTML string', [arbAST], (arbAST: AST) => {
            this.beforeTest();
            const shuffledAst = addShuffledIndeces(arbAST);
            const flattenedAst = flattenContentObjects(shuffledAst);
            const normalizedAST = normalizeASTObjectPayloads(flattenedAst, flattenedAst);

            try {
                const htmlString = compileToHTML(
                    normalizedAST,
                    (varName: string) => generateVarValue(normalizedAST, varName),
                    (varName: string) => getASTObjectPayload(normalizedAST, 'IMAGE', varName),
                    (varName: string) => getASTObjectPayload(normalizedAST, 'GRAPH', varName),
                    (varName: string) => getASTObjectPayload(normalizedAST, 'SHUFFLE', varName)
                );

                const result = verifyHTML(normalizedAST, htmlString);

                return result;
            }
            catch(error) {
                console.log(normalizedAST);
            }
        });

        test('The compileToHTML function should take an arbitrary AssessML string and return a correct HTML string', [arbAST], (arbAST: AST) => {
            this.beforeTest();
            const shuffledAst = addShuffledIndeces(arbAST);
            const flattenedAst = flattenContentObjects(shuffledAst);
            const normalizedAST = normalizeASTObjectPayloads(flattenedAst, flattenedAst);
            const assessMLString = compileToAssessML(
                normalizedAST,
                (varName: string) => generateVarValue(normalizedAST, varName),
                (varName: string) => getASTObjectPayload(normalizedAST, 'IMAGE', varName),
                (varName: string) => getASTObjectPayload(normalizedAST, 'GRAPH', varName),
                (varName: string) => getASTObjectPayload(normalizedAST, 'SHUFFLE', varName)
            );
            const htmlString = compileToHTML(
                normalizedAST,
                (varName: string) => generateVarValue(normalizedAST, varName),
                (varName: string) => getASTObjectPayload(normalizedAST, 'IMAGE', varName),
                (varName: string) => getASTObjectPayload(normalizedAST, 'GRAPH', varName),
                (varName: string) => getASTObjectPayload(normalizedAST, 'SHUFFLE', varName)
            );

            const result = verifyHTML(normalizedAST, htmlString);

            return result;
        });
    }
}

window.customElements.define('prendus-assessml-test', PrendusAssessMLTest);
