import {parse, compileToHTML} from '../assessml';

const html = compileToHTML(`
    <p>Describe your feelings:</p>

    <p>[essay]</p>

    <p>Describe more of your feelings about the number [var1]:</p>

    

    <p>[essay]</p>
`);

document.body.innerHTML = html;
