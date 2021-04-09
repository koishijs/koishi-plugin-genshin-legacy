const pug = require('pug')
const path = require('path')
const { writeFileSync } = require('fs')

const { uid, cookie } = require('./secret')
const { GenshinKit } = require('genshin-kit')

const genshin = new GenshinKit()
genshin.loginWithCookie(cookie)
genshin.getUserInfo(uid).then((data) => {
  const html = pug.renderFile(
    path.resolve(__dirname, '../public/profile.pug'),
    {
      pretty: 1,
      uid: 100000001,
      ...data,
    }
  )
  writeFileSync(path.resolve(__dirname, '../public/profile.test.html'), html)
})
