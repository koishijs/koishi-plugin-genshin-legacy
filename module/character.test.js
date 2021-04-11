const path = require('path')
const pug = require('pug')
const { writeFileSync } = require('fs')

const { uid, cookie } = require('./secret')
const { GenshinKit, util } = require('genshin-kit')
const { template, sleep } = require('koishi-utils')
const ppt = require('puppeteer')
const { stringify } = require('querystring')
const { character_reliquaries } = require('../i18n')

template.set('genshin', require('../i18n'))

function m(k) {
  return template(`genshin.profile.${k}`)
}

const genshin = new GenshinKit()
genshin.loginWithCookie(cookie)

genshin.gerUserRoles(uid).then((data) => {
  const Filter = new util.CharactersFilter(data)
  const character = Filter.name('迪卢克')

  // console.log(character)
  character.reliquaries.unshift(character.weapon)
  const config = {
    pretty: 1,
    ...character,
  }

  const html = pug.renderFile(
    path.resolve(__dirname, '../public/character.pug'),
    config
  )

  writeFileSync(path.resolve(__dirname, '../public/character.dev.html'), html)
})
