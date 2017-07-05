import {generateAST, compileToHTML} from '../assessml';

const html = compileToHTML(`
    <p>What is the color of the sky?</p>

    <p>[*]Blue[*]</p>
    <p>[*]Green[*]</p>
    <p>[*]Red[*]</p>
    <p>[*]Yellow[*]</p>

    <p>Which are dogs?</p>

    <p>[x]Shasta[x]</p>
    <p>[x]Monkey[x]</p>
    <p>[x]Brodey[x]</p>
    <p>[x]Puppy[x]</p>

    <p>What is [var1] + [var2] + [var3]?</p>

    <p>Sally was [input] through the forest and [input] a tree!</p>

    [drag]puppy[drag]
    [drop]puppy[drop]
`);

document.body.innerHTML = html;
