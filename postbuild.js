const fs = require('fs')

// 复制打包内容到docs, 用于GitHub Page
fs.rmdirSync('./docs', { recursive: true })
fs.renameSync('./build', './docs')

// 复制worker内容
// TODO
