import { execSync } from 'child_process';
import fs from 'fs';

try {
  const diff = execSync('git show 90f3ff9698e001c0ebbe681aac636ee58b4f5318 -- frontend/src/components/CartDrawer.js', { encoding: 'utf8' });
  fs.writeFileSync('scripts/diff_output.txt', diff);
  console.log('Diff length:', diff.length);
} catch (e) {
  console.error('Error:', e.message);
}
