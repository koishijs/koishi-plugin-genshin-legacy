const { template, segment } = require('koishi-utils')
const { disableCookie } = require('../modules/database')

const errorMap = {
  '-10001': '米游社协议异常，请更新 genshin-kit。',
  10001: '登录状态异常，请检查 cookie。',
  10101: '当前账号查询人数达到上限。',
  10102: '被查询者米游社信息未公开。',
}

function getErrMsg(err) {
  return template(
    'genshin.failed',
    errorMap[err.code] || err.message || template('genshin.error_unknown'),
    err.code
  )
}

/**
 * @param {import('koishi-core').Session} session
 * @param {import('genshin-kit').GenshinKit} genshin
 * @param {*} err
 */
async function handleError(session, genshin, err) {
  // 10001 - cookie 异常
  // 10101 - 次数耗尽
  if ([10001, 10101].includes(err.code)) {
    await session.send(template('genshin.donate.current_runout'))
    await disableCookie(session, genshin.cookie)
    return
  }
  return session.send(segment.quote(session.messageId) + getErrMsg(err))
}

module.exports = {
  errorMap,
  getErrMsg,
  handleError,
}
