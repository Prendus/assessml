import {generateAST} from '../assessml';

const ast = generateAST(`
    What color is the sky?
    [*] Blue [*]
    [*] Red [*]
    [*] Green [*]
    [*] Yellow [*]


    
`);

console.log(ast);
