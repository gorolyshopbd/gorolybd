const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend/src/components/AdminDashboard.js');
const contentPath = path.join(__dirname, 'domain_content.txt');

let content = fs.readFileSync(filePath, 'utf8');
const newBlock = fs.readFileSync(contentPath, 'utf8');

const startAnchor = "{activeTab === 'seller_custom_domain' && (";
const endAnchor = "          {/* Remove Domain */}";

const startIndex = content.indexOf(startAnchor);
const endIndex = content.indexOf(endAnchor);

if (startIndex !== -1 && endIndex !== -1) {
  const beforeBlock = content.slice(0, startIndex);
  const afterBlock = content.slice(endIndex);
  fs.writeFileSync(filePath, beforeBlock + newBlock + afterBlock, 'utf8');
  console.log('SUCCESS: Custom Domain Tutorial injected!');
} else if (startIndex === -1) {
  console.log('ERROR: start anchor not found');
} else {
  console.log('ERROR: end anchor not found');
}
