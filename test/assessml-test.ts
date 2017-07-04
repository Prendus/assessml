import {generateAST} from '../assessml';

const ast = generateAST(`
    What color is the sky?

    [*] Blue [*]
    [*] Red [*]
    [*] Green [*]
    [*] Yellow [*]


    What is the best part of the 4th of July?

    [x] Fireworks [x]
    [x] Parade [x]
    [x] Hot Dogs [x]
    [x] Pondering Freedom [x]

    Is [var1] the same as [var2]?

    [input]

    [drag]Hello[drag]
    [drag]Hello there[drag]

    [drop]Hello[drop]
    [drop]There my friend[drop]
`);

console.log(ast);
