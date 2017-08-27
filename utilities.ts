import {AST, ASTObject, Variable} from './assessml.d';

export function normalizeVariables(ast: AST): AST {
    return {
        ...ast,
        ast: ast.ast.map((astObject: ASTObject, index: number) => {
            if (astObject.type === 'VARIABLE') {
                const arrayToSearch = ast.ast.slice(0, index);
                const identicalVariables: Variable[] = <Variable[]> arrayToSearch.filter((innerAstObject: ASTObject) => {
                    return innerAstObject.type === 'VARIABLE' && innerAstObject.varName === astObject.varName;
                });
                return identicalVariables.length > 0 ? {
                    ...astObject,
                    value: identicalVariables[0].value
                } : astObject;
            }

            return astObject;
        })
    };
}

export function generateVarValue(ast: AST, varName: string) {
    const existingVarValue = getVariableValue(ast, varName);
    return existingVarValue === NaN ? generateRandomInteger(0, 100) : existingVarValue;
}

function generateRandomInteger(min: number, max: number): number {
    //returns a random integer between min (included) and max (included)
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getVariableValue(ast: AST, varName: string): number {
    const variables: Variable[] = <Variable[]> ast.ast.filter((astObject: ASTObject) => astObject.type === 'VARIABLE' && astObject.varName === varName);
    return variables.length > 0 ? variables[0].value : NaN;
}
