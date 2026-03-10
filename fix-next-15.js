const fs = require('fs');

const filesToFix = [
    {
        path: 'app/api/ical/export/[slug]/route.ts',
        methodRegex: /\{ params \}: \{ params: \{ ([a-zA-Z]+): string \} \}/,
        methodReplace: 'context: { params: Promise<{ $1: string }> }',
        paramExtract: 'const { $1 } = await context.params;'
    },
    { path: 'app/api/guests/[id]/route.ts', methodRegex: /\{ params \}: \{ params: \{ ([a-zA-Z]+): string \} \}/g },
    { path: 'app/api/admin/properties/[id]/route.ts', methodRegex: /\{ params \}: \{ params: \{ ([a-zA-Z]+): string \} \}/g },
    { path: 'app/api/admin/guests/[id]/route.ts', methodRegex: /\{ params \}: \{ params: \{ ([a-zA-Z]+): string \} \}/g },
    { path: 'app/admin/properties/[id]/page.tsx', isPage: true }
];

filesToFix.forEach(({ path, methodRegex, isPage }) => {
    let content = fs.readFileSync(path, 'utf8');

    if (isPage) {
        content = content.replace(/\{ params \}: \{ params: \{ ([a-zA-Z]+): string \} \}/, 'props: { params: Promise<{ $1: string }> }');
        content = content.replace(/export default (async )?function ([a-zA-Z]+)\(props: \{ params: Promise<\{ ([a-zA-Z]+): string \}> \}\) \{/g, (match, isAsync, componentName, paramName) => {
            const asy = isAsync || "async ";
            return `export default ${asy}function ${componentName}(props: { params: Promise<{ ${paramName}: string }> }) {\n    const { ${paramName} } = await props.params;\n`;
        });
        content = content.replace(/params\.id/g, 'id');
    } else {
        content = content.replace(/\{ params \}: \{ params: \{ ([a-zA-Z]+): string \} \}/g, 'context: { params: Promise<{ $1: string }> }');
        content = content.replace(/export async function (GET|POST|PUT|PATCH|DELETE)\(\s*req: NextRequest,\s*context: \{ params: Promise<\{ ([a-zA-Z]+): string \}> \}\s*\)\s*\{/g, (match, method, paramName) => {
            return match + `\n    const { ${paramName} } = await context.params;\n`;
        });
        content = content.replace(/params\.id/g, 'id');
        content = content.replace(/params\.slug/g, 'slug');
    }

    fs.writeFileSync(path, content);
    console.log(`Modificado: ${path}`);
});
