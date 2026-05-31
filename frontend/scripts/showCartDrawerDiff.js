import { execSync } from 'child_process';

const diff = execSync('git diff 90f3ff9^ 90f3ff9 -- src/components/CartDrawer.js', { encoding: 'utf8' });
const lines = diff.split('\n');
lines.forEach((line) => {
  if (line.startsWith('-') || line.startsWith('+')) {
    if (line.includes('const') || line.includes('let') || line.includes('useState') || line.includes('useEffect') || line.includes('handle')) {
      console.log(line);
    }
  }
});
