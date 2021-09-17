const fs = require('fs')
fs.rmdirSync('./docs', { recursive: true })
fs.renameSync('./build', './docs')
