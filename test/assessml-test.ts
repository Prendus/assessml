import {generateAST, compileToHTML} from '../assessml';

const html = compileToHTML(`
    What is [var1] + [var2]?

    [x]Hello[x]

    [*]Hi[*]
    [*]Sir[*]

    [input]
`);

console.log(html);
