export function generateAST(source: string) {
    const contentRegex = /.*/g;
    const variableRegex = /\[var.*\]/g;

    console.log(source.search(contentRegex));
}
