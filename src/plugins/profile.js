const { template, segment, Time } = require('koishi-utils')
const { isValidCnUid } = require('@genshin-kit/core').util
const { getErrMsg, handleError } = require('../utils/handleError')
const { getGenshinApp } = require('../modules/database')

/**
 * @param {import('koishi-core').Context} ctx
 */
function apply(ctx) {
  ctx
    .command('genshin.profile', template('genshin.commands.profile'), {
      minInterval: Time.second * 30,
    })
    .userFields(['genshin_uid'])
    .option('uid', `-u <uid:posint> ${template('genshin.commands.options_specify_uid')}`)
    .check(({ session, options }) => {
      let uid = options.uid || session.user.genshin_uid
      if (!uid) return template('genshin.not_registered')
      if (!isValidCnUid(uid)) return template('genshin.invalid_cn_uid')
    })
    .action(async ({ session, options }) => {
      let uid = options.uid || session.user.genshin_uid
      const genshin = await getGenshinApp(session, uid)
      if (!genshin) {
        return template('genshin.donate.daily_runout')
      }

      try {
        const [userInfo, allCharacters] = await Promise.all([
          genshin.getUserInfo(uid, true),
          genshin.getAllCharacters(uid, true),
        ])

        // 截图
        if (ctx.app.puppeteer) {
          let image = await require('../modules/renderProfile')({
            uid,
            userInfo,
            allCharacters,
            ctx,
          })
          return segment.quote(session.messageId) + image
        }

        // 文字版
        return '截图失败：未安装 koishi-plugin-puppeteer，请联系 bot 管理员。'
      } catch (err) {
        handleError(session, genshin, err)
      }
    })
}

module.exports = {
  name: 'genshin/profile',
  apply,
}
