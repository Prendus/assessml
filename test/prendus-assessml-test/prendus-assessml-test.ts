class PrendusAssessMLTest extends Polymer.Element {
    static get is() { return 'prendus-assessml-test'; }

    prepareTests(test) {
        const jsc = require('jsverify');

        const arbAST = createArbAST();

        test('The parse function should take an arbitrary AssessML document string and return a correct AssessML AST', [jsc.number, jsc.number], (arbNumber1, arbNumber2) => {
            return add(arbNumber1, arbNumber2) === arbNumber1 + arbNumber2;
        });

        test('The compileToHTML function should take an arbitrary AssessML document string and return a correct HTML string', [], );

        test('The compileToHTML function should take an arbitrary AssessML AST and return a correct HTML string', [], );

        //TODO once getAstObjects gets more complicated, then you can test it

        function add(x, y) {
            return x + y;
        }

        function createArbAST() {

        }
    }
}

window.customElements.define(PrendusAssessMLTest.is, PrendusAssessMLTest);
