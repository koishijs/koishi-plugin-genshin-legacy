const path = require('path')
const { readFileSync } = require('fs')
const { segment, template } = require('koishi-utils')
const { insertCookie } = require('../modules/database')

const howToDonate = readFileSync(
  path.resolve(__dirname, '../assets/how-to-donate.png')
)

/**
 * @param {import('koishi-core').Context} ctx
 * @param {{genshin: import('genshin-kit').GenshinKit}} arg1
 */
function apply(ctx) {
  ctx
    .private()
    .command('genshin.donate [cookie:text]', '捐赠米游社账号')
    .alias('捐赠米游社账号', '捐赠原神账号')
    .usage('输入“米游社账号捐赠指南”查看教程')
    .check(({ session, options }, cookie) => {
      if (!cookie || options.help) return session.execute('genshin.donate.how')
    })
    .action(async ({ session }, cookie) => {
      return insertCookie(session, cookie)
    })

  ctx
    .command('genshin.donate.delete', '取消捐赠米游社账号')
    .alias('取消捐赠米游社账号', '取消捐赠原神账号')
    .option('user', '-u <user> 指定捐赠者', { authority: 2 })
    .usage('输入“米游社账号捐赠指南”查看教程')
    .action(async ({ session, options }) => {
      return '该功能暂未实装，请联系 bot 管理员进行操作！'
    })

  ctx
    .command('genshin.donate.how', 'internal command', { hidden: true })
    .alias('米游社账号捐赠指南', '原神账号捐赠指南')
    .action(() => {
      return segment.image(howToDonate) + template('genshin.donate.help_extra')
    })
}

module.exports = {
  name: 'genshin/donate',
  apply,
}
