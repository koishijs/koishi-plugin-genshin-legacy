/**
 * @name koishi-plugin-genshin
 * @desc Genshin Impact plugin for Koishijs
 *
 * @author Koishijs(机智的小鱼君) <dragon-fish@qq.com>
 * @license Apache-2.0
 */
// Koishi
const { segment, template, Time } = require('koishi-core')

// GenshinKit
const { GenshinKit } = require('genshin-kit')
const { isValidCnUid } = require('genshin-kit').util
const genshin = new GenshinKit()

/**
 * @command genshin
 * @param {import('koishi-core').Context} ctx
 */
const apply = (ctx, pOptions) => {
  pOptions = {
    cookie: '',
    donateMin: 5,
    donateMax: 25,
    wish: {
      enable: false,
      officialPools: true,
      customPools: [],
    },
    ...pOptions,
  }

  // Set template
  template.set('genshin', { ...require('./i18n'), ...pOptions.i18n })

  genshin.loginWithCookie(pOptions.cookie)

  // Register
  ctx
    .command('genshin [uid:posint]', template('genshin.cmd_genshin_desc'), {
      minInterval: Time.hour,
    })
    .alias('原神')
    .userFields(['genshin_uid'])
    .example('@我 genshin 100000001')
    .check(({ session }, uid) => {
      const userFileds = session.user
      if (!uid) {
        const reply = userFileds.genshin_uid
          ? template('genshin.info_regestered', userFileds.genshin_uid)
          : template('genshin.not_registered')
        return segment('quote', { id: session.messageId }) + reply
      } else if (!isValidCnUid(uid)) {
        return (
          segment('quote', { id: session.messageId }) +
          template('genshin.invalid_cn_uid')
        )
      }
    })
    .action(async ({ session }, uid) => {
      const userFileds = session.user
      userFileds.genshin_uid = uid
      try {
        await session.user._update()
      } catch (err) {
        return (
          segment('quote', { id: session.messageId }) +
          template('genshin.faild', err.message)
        )
      }
      return (
        segment('quote', { id: session.messageId }) +
        template('genshin.successfully_registered')
      )
    })

  // Abyss
  ctx.plugin(require('./plugins/abyss'), { genshin })

  // Character Card
  ctx.plugin(require('./plugins/character'), { genshin })

  // Profile
  ctx.plugin(require('./plugins/profile'), { genshin })

  // Wish
  if (pOptions.wish.enable) {
    ctx.plugin(require('./plugins/wish'), pOptions)
  }

  // Debug
  ctx.command('genshin.debug', 'DEBUG', { hidden: true }).action(() => {
    const hoyolabVer = genshin._hoyolabVersion()
    return [`hoyolab(cn): ${hoyolabVer}`].join('\n')
  })
}

module.exports = {
  name: 'genshin',
  apply,
}
