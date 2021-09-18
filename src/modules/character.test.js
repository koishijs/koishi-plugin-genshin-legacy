const path = require('path')
const pug = require('pug')
const { writeFileSync } = require('fs')

const { uid, cookie } = require('./secret')
const { GenshinKit, util } = require('genshin-kit')
const { template } = require('koishi-utils')

template.set('genshin', require('../i18n'))

function m(k) {
  return template(`genshin.profile.${k}`)
}

const genshin = new GenshinKit()
genshin.loginWithCookie(cookie)

genshin.getUserRoles(uid).then((data) => {
  const Filter = new util.CharactersFilter(data)
  const character = Filter.name('迪奥娜')

  console.log(character)
  const config = {
    pretty: 1,
    ...character,
  }

  const html = pug.renderFile(
    path.resolve(__dirname, '../view/character.pug'),
    config
  )

  writeFileSync(path.resolve(__dirname, '../view/character.dev.html'), html)
})
