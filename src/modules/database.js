const { Context, Database, Tables, Session } = require('koishi-core')

function getToday() {
  const now = new Date().toISOString()
  return now.split('T')[0]
}

function isToday(date) {
  return date === getToday()
}

const COLLECTION = 'hoyolab-cookies'

/**
 *
 * @param {Context} koishi
 */
function addCookie(koishi, { uid, platform, userId, limit }) {
  koishi.database.create(COLLECTION, {
    enable: true,
    uid,
    owner: `${platform}:${userId}`,
    lastdate: getToday(),
    limit,
    usage: []
  })
}

/**
 *
 * @param {Context} koishi
 */
function removeCookie(koishi, { platform, userId }) {
  koishi.database.remove(COLLECTION, { owner: `${platform}:${userId}` })
}
