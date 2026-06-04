const fs = require('fs');
let c = fs.readFileSync('controllers/userController.js', 'utf8');
const searchString = "let toUser = target.replace(/\\\\D/g, '');";
const replaceString = "let toUser = target.replace(/\\D/g, '');";

if (c.includes(searchString)) {
  c = c.replace(searchString, replaceString);
  fs.writeFileSync('controllers/userController.js', c);
  console.log('Fixed double slash');
} else {
  console.log('Could not find double slash');
}
