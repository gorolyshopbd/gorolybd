const fs = require('fs');
let c = fs.readFileSync('controllers/userController.js', 'utf8');

if (c.includes('target.replace(/\\\\D/g, \\'\\')')) {
  c = c.replace('target.replace(/\\\\D/g, \\'\\')', 'target.replace(/\\\\D/g, \\'\\')'); // wait, the literal string is /\\D/g
  // let's just do a regex replace
}
// Actually let's just use regex replace:
c = c.replace(/target\.replace\(\/\\\\D\/g, ''\)/g, "target.replace(/\\D/g, '')");
fs.writeFileSync('controllers/userController.js', c, 'utf8');
console.log('Fixed');
