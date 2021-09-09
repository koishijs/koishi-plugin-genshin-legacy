const { template } = require('koishi-utils')

module.exports.errorMap = {
  '-10001': '米游社协议异常，请更新 genshin-kit。',
  10001: '登录状态异常，请检查 cookie。',
  10101: '当前账号查询人数达到上限。',
  10102: '被查询者米游社信息未公开。',
}

module.exports.getErrMsg = function(err) {
  return template(
    'genshin.failed',
    errorMap[err.code] || err.message || template('genshin.error_unknown')
  )
}
