import codecs

file_path = r'frontend\src\components\AdminDashboard.js'
with codecs.open(file_path, 'r', 'utf-8') as f:
    content = f.read()

target1 = "categoryList.filter(c => !c.rootCategory || c.rootCategory === '--').map((cat, cIdx) => ("
replacement1 = "categoryList.map((cat, cIdx) => ("
content = content.replace(target1, replacement1)

target2 = "categoryList.filter(c => !c.rootCategory || c.rootCategory === '--' || !categoryList.some(p => p.name === c.rootCategory)).map((cat) => ("
replacement2 = "categoryList.map((cat) => ("
content = content.replace(target2, replacement2)

with codecs.open(file_path, 'w', 'utf-8') as f:
    f.write(content)

print("Replaced!")
