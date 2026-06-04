const fs = require('fs');
let c = fs.readFileSync('controllers/userController.js', 'utf8');

const buggyText = "let toUser = target.replace(/\\\\D/g, '');";
const correctText = "let toUser = target.replace(/\\D/g, '');";

if (c.includes(buggyText)) {
  c = c.replace(buggyText, correctText);
  fs.writeFileSync('controllers/userController.js', c);
  console.log('Regex fixed!');
} else {
  console.log('Regex not found!');
}
