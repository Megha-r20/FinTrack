const fs = require('fs');
const path = require('path');

const filesToConvert = [
  'app/layout.tsx',
  'app/page.tsx',
  'app/(auth)/login/page.tsx',
  'app/(auth)/register/page.tsx',
  'app/(dashboard)/layout.tsx',
  'app/(dashboard)/dashboard/page.tsx',
  'app/(dashboard)/transactions/page.tsx',
  'app/(dashboard)/budgets/page.tsx',
  'app/(dashboard)/goals/page.tsx',
  'app/(dashboard)/recurring/page.tsx',
  'app/(dashboard)/analytics/page.tsx',
  'app/(dashboard)/ai-advisor/page.tsx',
  'app/(dashboard)/profile/page.tsx',
  'app/api/ai/advisor/route.ts',
  'app/api/ai/chat/route.ts',
  'app/api/analytics/route.ts',
  'app/api/auth/login/route.ts',
  'app/api/auth/logout/route.ts',
  'app/api/auth/me/route.ts',
  'app/api/auth/register/route.ts',
  'app/api/budgets/route.ts',
  'app/api/categories/route.ts',
  'app/api/goals/[id]/contribute/route.ts',
  'app/api/goals/route.ts',
  'app/api/import-export/route.ts',
  'app/api/recurring/route.ts',
  'app/api/transactions/[id]/route.ts',
  'app/api/transactions/route.ts',
  'components/AddTransactionModal.tsx',
  'components/CategoryIcon.tsx',
  'components/CommandPaletteModal.tsx',
  'components/Navbar.tsx',
  'components/Sidebar.tsx',
  'components/StudentPacingCard.tsx',
  'context/AuthContext.tsx',
  'context/ThemeContext.tsx',
  'context/ToastContext.tsx',
  'prisma/seed.ts',
  'next.config.ts'
];

function cleanTsAnnotations(code) {
  return code
    // Remove interfaces & type declarations
    .replace(/^export interface \w+[\s\S]*?\n\}/gm, '')
    .replace(/^interface \w+[\s\S]*?\n\}/gm, '')
    .replace(/^export type \w+ = [\s\S]*?;/gm, '')
    .replace(/^type \w+ = [\s\S]*?;/gm, '')
    // Remove React.FC, React.FormEvent, React.ReactNode, etc.
    .replace(/: React\.\w+(<[^>]+>)?/g, '')
    // Remove inline param/var type annotations like `(e: React.FormEvent)`, `(msg: any)`, `(textToSend?: string)`
    .replace(/(\w+)\?: \w+(\[[\]])?/g, '$1')
    .replace(/(\w+): (string|number|boolean|any|any\[\]|User \| null|Date|\[\])/g, '$1')
    .replace(/<[A-Za-z0-9_ |?\[\]"']*>(?=\(|\{|\,)/g, '') // remove generic type parameters like useState<any[]>
    .replace(/ as unknown as \{[^}]*\}/g, '')
    .replace(/ as UserPayload/g, '')
    .replace(/ as any/g, '')
    .replace(/Array<\{[^}]*\}>/g, 'Array');
}

filesToConvert.forEach(relPath => {
  const fullPath = path.join(process.cwd(), relPath);
  if (!fs.existsSync(fullPath)) return;

  const content = fs.readFileSync(fullPath, 'utf8');
  const ext = path.extname(relPath);
  const isJsx = ext === '.tsx';
  const newExt = isJsx ? '.jsx' : '.js';
  const newRelPath = relPath.slice(0, -ext.length) + newExt;
  const newFullPath = path.join(process.cwd(), newRelPath);

  const cleanedContent = cleanTsAnnotations(content);
  fs.writeFileSync(newFullPath, cleanedContent, 'utf8');
  fs.unlinkSync(fullPath);
  console.log(`Converted: ${relPath} -> ${newRelPath}`);
});

// Also remove lib/prisma.ts, lib/auth.ts, lib/defaultCategories.ts if they still exist
['lib/prisma.ts', 'lib/auth.ts', 'lib/defaultCategories.ts'].forEach(f => {
  const p = path.join(process.cwd(), f);
  if (fs.existsSync(p)) fs.unlinkSync(p);
});
