const { GenshinKit } = require('genshin-kit')
async function checkCookie(cookie, uid) {
  const App = new GenshinKit()
  try {
    await App.loginWithCookie(cookie).getUserInfo(uid)
    return true
  } catch (err) {
    return err
  }
}
module.exports = checkCookie
