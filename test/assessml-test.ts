import {generateAST} from '../assessml';

const ast = generateAST(`
    What [input] is [var1] + [var2] [input] [input] [input]?
`);

console.log(ast);
