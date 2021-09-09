const { template, segment, Time } = require('koishi-utils')
const { isValidCnUid } = require('genshin-kit').util

/**
 * @param {import('koishi-core').Context} ctx
 * @param {{genshin: import('genshin-kit').GenshinKit}} arg1
 */
function apply(ctx, { genshin }) {
  ctx
    .command('genshin.profile', template('genshin.cmd_profile_desc'), {
      minInterval: Time.second * 30,
    })
    .userFields(['genshin_uid'])
    .option('uid', `-u <uid:posint> ${template('genshin.cmd_specify_uid')}`)
    .check(({ session, options }) => {
      let uid = options.uid || session.user.genshin_uid
      if (!uid) return template('genshin.not_registered')
      if (!isValidCnUid(uid)) return template('genshin.invalid_cn_uid')
    })
    .action(async ({ session, options }) => {
      let uid = options.uid || session.user.genshin_uid

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
        return '截图失败：未安装 koishi-plugin-puppeteer'
      } catch (err) {
        return (
          segment.quote(session.messageId) +
          template(
            'genshin.failed',
            err.message || template('genshin.error_unknown')
          )
        )
      }
    })
}

module.exports = {
  name: 'genshin/profile',
  apply,
}
