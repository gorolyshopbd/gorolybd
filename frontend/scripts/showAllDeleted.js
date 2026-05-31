import { execSync } from 'child_process';

const diff = execSync('git diff 90f3ff9^ 90f3ff9 -- frontend/src/components/CartDrawer.js', { encoding: 'utf8' });
console.log(diff);
