import {generateAST} from '../assessml';

const ast = generateAST(`
    What is [var1] + [var2]?
`);

console.log(ast);
