const { Session } = require('koishi-core')
const { GenshinKit } = require('genshin-kit')

const colName = 'hoyolab-cookies'

/**
 * @param {Session} session
 * @param {string} cookie
 */
async function insertCookie(session, cookie) {
  const { ltoken, ltuid } = getCookieObj(cookie)
  if (!ltoken || !ltuid) return '操作失败：提供的 cookie 不正确。'

  // check cookie, get roles
  let roles = []
  try {
    roles = await getBindingRoles(`ltoken=${ltoken}; ltuid=${ltuid}`)
  } catch (e) {
    return '操作失败：用户信息验证失败。'
  }

  if (roles.length < 1) {
    return '操作失败：该账号未绑定原神角色。'
  }

  // 操作数据库
  try {
    // 是否已经保存过
    const already = await session.database.mongo.db
      .collection(colName)
      .find({ ltuid })
      .limit(1)
      .toArray()
    if (already.length) {
      // 已保存过，刷新信息
      await session.database.mongo.db.collection(colName).updateOne(
        { ltuid },
        {
          $set: {
            owner: `${session.platform}:${session.userId}`,
            ltoken,
            game_uid: roles.map(({ game_uid }) => game_uid),
          },
        }
      )
    } else {
      // 未保存过，新增一行
      await session.database.mongo.db.collection(colName).insertOne({
        owner: `${session.platform}:${session.userId}`,
        ltuid,
        ltoken,
        game_uid: roles.map(({ game_uid }) => game_uid),
        last_disabled: '',
      })
    }

    // 成功！
    return `${
      already.length ? '成功刷新账号信息！' : '成功添加账号信息！'
    }已绑定原神游戏角色：\n${roles
      .map(
        ({ level, nickname, game_uid, region_name }) =>
          `Lv.${level} ${nickname} (${region_name}-${game_uid})`
      )
      .join('\n')}`
  } catch (e) {
    // 数据库错误
    session.logger('genshin').warn('保存 cookie 时发生数据库异常', e)
    return '保存失败：数据库异常，请联系 bot 管理员。'
  }
}

/**
 * @param {Session} session
 * @param {number} uid
 * @returns {GenshinKit}
 */
async function getGenshinApp(session, uid) {
  const [self, common] = await Promise.all([
    session.database.mongo.db
      .collection(colName)
      .find({ game_uid: { $in: ['' + uid] } })
      .limit(1)
      .toArray(),
    session.database.mongo.db
      .collection(colName)
      .find({ last_disabled: { $ne: getFormatedToday() } })
      .limit(1)
      .toArray(),
  ])

  let data
  if (self.length) {
    // 本人账号
    data = self[0]
  } else if (common.length) {
    // 公共账号
    data = common[0]
  } else {
    // cookie 库耗尽
    return false
  }
  const { ltoken, ltuid } = data
  return new GenshinKit().setCookie(`ltoken=${ltoken}; ltuid=${ltuid}`)
}

/**
 * @param {Session} session
 * @param {string} cookie
 */
async function disableCookie(session, cookie) {
  const { ltoken, ltuid } = getCookieObj(cookie)
  await session.database.mongo.db
    .collection('hoyolab-cookies')
    .updateOne(
      { ltuid, ltoken },
      { $set: { last_disabled: getFormatedToday() } }
    )
  return true
}

async function getBindingRoles(cookie) {
  const g = new GenshinKit()
  g.setCookie(cookie)
  const { data } = await g.request(
    'get',
    'https://api-takumi.mihoyo.com/binding/api/getUserGameRolesByCookie'
  )
  return data?.list
}

function getCookieObj(str) {
  const obj = {}
  str.split(';').forEach((item) => {
    if (!item) return
    const s = item.split('=')
    const key = s?.[0].trim()
    const val = s?.[1].trim() || ''
    if (!key) return
    obj[key] = val
  })
  return obj
}

function getFormatedToday() {
  const now = new Date()
  const timezoneCN = 8
  now.setHours(now.getHours() + timezoneCN)
  return now.toISOString().split('T')[0]
}

module.exports = {
  getGenshinApp,
  insertCookie,
  disableCookie,
}
