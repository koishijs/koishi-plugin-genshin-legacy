const pug = require('pug')
const path = require('path')
const { writeFileSync } = require('fs')

const { uid, cookie } = require('./secret')
const { GenshinKit } = require('genshin-kit')
const { template } = require('koishi-utils')

template.set('genshin', require('../i18n'))

function m(k) {
  return template(`genshin.profile.${k}`)
}

const genshin = new GenshinKit()
genshin.loginWithCookie(cookie)
genshin.getUserInfo(uid).then((data) => {
  let _stats = Object.assign({}, data.stats)
  data.stats = []
  for (key in _stats) {
    data.stats.push({ desc: m('stats.' + key), count: _stats[key] })
  }
  const options = {
    ui: {
      title: m('ui.title'),
    },
    uid,
    ...data,
  }
  console.log(options)
  const html = pug.renderFile(
    path.resolve(__dirname, '../public/profile.pug'),
    options
  )
  writeFileSync(path.resolve(__dirname, '../public/profile.dev.html'), html)
})
