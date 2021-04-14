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
Promise.all([genshin.getUserInfo(uid), genshin.getAllCharacters(uid)]).then(
  ([userInfo, allCharacters]) => {
    let _stats = Object.assign({}, userInfo.stats)
    userInfo.stats = []

    for (key in _stats) {
      userInfo.stats.push({ desc: m('stats.' + key), count: _stats[key] })
    }

    allCharacters.forEach((item) => {
      let constellation = 0
      item.constellations.forEach(({ is_actived }) =>
        is_actived ? constellation++ : null
      )
      item.constellation = constellation
    })

    userInfo.avatars = allCharacters

    const options = {
      ui: {
        title: m('ui.title'),
      },
      uid,
      ...userInfo,
    }
    console.log(options)
    const html = pug.renderFile(
      path.resolve(__dirname, '../public/profile.pug'),
      options
    )
    writeFileSync(path.resolve(__dirname, '../public/profile.dev.html'), html)
  }
).catch(console.error)