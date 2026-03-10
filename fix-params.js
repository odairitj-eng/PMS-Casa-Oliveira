const fs = require('fs');
const glob = require('glob');

const files = [
    'app/api/ical/export/[slug]/route.ts',
    'app/api/guests/[id]/route.ts',
    'app/api/admin/properties/[id]/route.ts',
    'app/api/admin/guests/[id]/route.ts',
    'app/api/admin/guests/[id]/recalibrate/route.ts',
    'app/admin/properties/[id]/page.tsx'
];

files.forEach(file => {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf-8');

    // Replace API Route params signature
    content = content.replace(/\{ params \}: \{ params: \{ ([a-zA-Z]+): string \} \}/g, '( context: { params: Promise<{ $1: string }> } )');
    content = content.replace(/req: NextRequest,\s*\( context: \{ params: Promise/g, 'req: NextRequest, context: { params: Promise');
    // For pages
    content = content.replace(/\{ params \}: \{ params: \{ ([a-zA-Z]+): string \} \}/g, 'context: { params: Promise<{ $1: string }> }');

    // Insert await params if it uses params.id or params.slug
    // We replace the first use of params.id/slug with the await, and change others. Or better, just inject const { id } = await context.params; at the beginning of the function

    // We do it manually: replace params.id with id, and insert the await at the top of the block.
    // It's easier to just do: `const { id } = await context.params;` right after the open brace of the function.
    content = content.replace(/export async function (GET|POST|PUT|PATCH|DELETE)\([^)]*context: \{ params: Promise<\{ ([a-zA-Z]+): string \}> \}[^)]*\)\s*\{/g, (match, method, paramName) => {
        return match + `\n    const { ${paramName} } = await context.params;\n`;
    });

    content = content.replace(/export default function ([a-zA-Z]+)\(context: \{ params: Promise<\{ ([a-zA-Z]+): string \}> \}\)\s*\{/g, (match, componentName, paramName) => {
        return match + `\n    // Remember to await params if it's async, or use React.use() if it's a client component. But Server Components can be async.\n`;
    });

    // Replace params.id or params.slug with id / slug
    content = content.replace(/params\.id/g, 'id');
    content = content.replace(/params\.slug/g, 'slug');

    fs.writeFileSync(file, content);
    console.log('Fixed', file);
});
