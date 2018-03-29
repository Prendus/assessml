// import './process.js';
import '../node_modules/@webcomponents/shadydom/shadydom.min.js';
import '../node_modules/@webcomponents/custom-elements/custom-elements.min.js';
import '../node_modules/guesswork/test-runner.ts';
import './prendus-assessml-test.ts';

window.document.body.innerHTML = `
    <test-runner>
        <prendus-assessml-test></prendus-assessml-test>
    </test-runner>
`;
