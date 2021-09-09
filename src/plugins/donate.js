const { template, segment } = require('koishi-utils')
const { readFileSync } = require('fs')
const path = require('path')
const {} = require('genshin-kit').util
const { GenshinKit } = require('genshin-kit')
const { Tables } = require('koishi-core')

const howToDonate = readFileSync(
  path.resolve(__dirname, '../assets/how-to-donate.jpg')
)

/**
 * @param {import('koishi-core').Context} ctx
 * @param {{genshin: import('genshin-kit').GenshinKit}} arg1
 */
function apply(ctx, { genshin }) {
  ctx
    .private()
    .command('genshin.donate [input:text]', '捐赠米游社账号')
    .alias('捐赠米游社账号')
    .check(({ session }, input) => {
      if (!input) return session.execute('genshin.donate -h')
    })
    .action(async ({ session }, input) => {
      const s = input.trim().split(/\r?\n/)
      if (s.length < 2 || isNaN(s[0])) return '输入的内容不正确'
      const { ltoken, ltuid } = parseCookie(s[1])
      if (!ltoken || !ltuid) return '输入的 cookie 不正确'
      return cookieDonate({
        session,
        uid,
        ltoken,
        ltuid,
      })
    })

  ctx
    .command('genshin.donate.how', 'internal command')
    .action(({ session }) => {
      return `
${segment.image(howToDonate)}
〓额外说明〓
捐赠账号后，您依然可以正常使用该账号进行游戏。
捐赠时填写的原神UID最好是该账号绑定的UID。
如果不放心，建议捐赠小号。
〓您可能会用到的〓
米游社网页版: https://bbs.mihoyo.com/ys/
输入到控制台的代码: alert(document.cookie)
`
    })

  // On add
  // ltoken=xxxxx; ltuid=xxxxxx;
  async function cookieDonate({ session, uid, ltoken, ltuid }) {
    const cookie = `ltoken=${ltoken}; ltuid=${ltuid}`

    const g = new GenshinKit()
    g.setCookie(cookie)
    try {
      await g.getUserInfo(uid)
    } catch (e) {
      if (e.code === -10001) {
        return session.send('保存失败：米游社协议异常，请联系 bot 管理员。')
      }
      return session.send('验证失败：无效的 cookie 或 UID。')
    }
    try {
      await ctx.database.mongo.db.collection('hoyolab-cookies').insertOne({
        uid,
        ltuid,
        ltoken,
        lastDisabled: '',
        invalid: '',
      })
    } catch (e) {
      ctx.logger('genshin').warn('保存 cookie 时发生错误', e)
      return session.send('保存失败：数据库错误，请联系 bot 管理员。')
    }
    return session.send('保存成功！')
  }

  async function getCookie(uid) {
    const [self, common] = await Promise.all([
      ctx.database.mongo.db.collection('hoyolab-cookies').find({ uid }),
      ctx.database.mongo.db
        .collection('hoyolab-cookies')
        .find({ lastDisabled: { $not: '2021-09-09' } }),
    ])
  }
}

function parseCookie(str) {
  const obj = {}
  str.split(';').forEach((item) => {
    if (!item) return
    const s = item.split('=')
    const key = s?.[0].trim()
    const val = s?.[1].trim()
    obj[key] = val
  })
  return obj
}

Tables.extend('hoyolab-cookies', { primary: 'id' })

module.exports = {
  name: 'genshin/donate',
  apply,
}
