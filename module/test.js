const fs = require('fs-extra')
const path = require('path')
require('./basic')().then(file => {
  fs.writeFileSync(path.resolve(__dirname, 'secret.test.png'), file)
})
