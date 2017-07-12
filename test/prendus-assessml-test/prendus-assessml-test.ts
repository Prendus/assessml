class PrendusAssessMLTest extends Polymer.Element {
    static get is() { return 'prendus-assessml-test'; }

    prepareTests(test) {
        const jsc = require('jsverify');

        test('Just testing it out', [jsc.number, jsc.number], (arbNumber1, arbNumber2) => {
            return add(arbNumber1, arbNumber2) === arbNumber1 + arbNumber2;
        });

        function add(x, y) {
            return x + y;
        }
    }
}

window.customElements.define(PrendusAssessMLTest.is, PrendusAssessMLTest);
