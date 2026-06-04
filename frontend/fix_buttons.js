const fs = require('fs');
let content = fs.readFileSync('src/components/AdminDashboard.js', 'utf8');

// Match <button ...> whitespace <Search ...> or {customerListSearch ? <X /> : <Search />}
const multiLineRegex = /<button(?![^>]*type=)([^>]*?)>(\s*(\{.*?\?\s*<X[^>]*>\s*:\s*)?<Search)/g;
let count = 0;
content = content.replace(multiLineRegex, (match, p1, p2) => {
    count++;
    return `<button type="button"${p1}>${p2}`;
});

console.log('Modified', count, 'search buttons');
fs.writeFileSync('src/components/AdminDashboard.js', content, 'utf8');
