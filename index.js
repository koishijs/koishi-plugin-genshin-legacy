const { createCanvas, loadImage, registerFont } = require('canvas')
const { genshinKit } = require('genshin-kit')
const { segment } = require('koishi-utils')
const genshin = new genshinKit()
const path = require('path')

// 设定字体
registerFont(path.resolve(__dirname, './static/SourceHanSansCN-Medium.ttf'), {
  family: 'SourceHanSans',
  weight: 'medium',
})

/**
 * @command genshin
 */
const commandGenshin = (koishi, options) => {
  function _msg(msgKey, ...args) {
    function handleArgs(message, ...args) {
      args.forEach(function(elem, index) {
        var rgx = new RegExp('\\$' + (index + 1), 'g')
        message = message.replace(rgx, elem)
      })

      return message
    }
    let allMsg = {
      command_description: '获取《原神》玩家信息',
      not_registered:
        '您还没有注册您的《原神》用户信息，请艾特我输入“genshin <游戏内uid>”进行注册~',
      successfully_registered: '您的《原神》信息注册成功~',
      info_regestered: '您的《原神》uid已注册为：$1',
      invalid_cn_uid: '您输入的不是合法的《原神》国服uid~',
      // failed: '出现了亿点问题……',
      fetch_data_failed:
        '出现了亿点问题……（可能原因：玩家uid注册错误或玩家未公开米游社资料。）',
    }
    if (allMsg[msgKey]) {
      let finalMsg = handleArgs(allMsg[msgKey], ...args)
      return finalMsg
    } else {
      let showArgs = ''
      if (args.length > 0) {
        showArgs += ': ' + args.join(', ')
      }
      return `<plugin-genshin-${msgKey}${showArgs}>`
    }
  }
  genshin.loginWithCookie(options.cookie)

  // 注册
  koishi
    .command(`genshin <uid> ${_msg('command_description')}`)
    .alias('原神')
    .userFields(['genshin_uid'])
    .example('@我 genshin 100000001')
    .action(async ({ session }, uid) => {
      const userData = session.user
      if (
        uid &&
        typeof uid === 'number' &&
        uid > 100000000 &&
        (String(uid)[0] === '1' || String(uid)[0] === '5')
      ) {
        await session.database.setUser(session.platform, session.userId, {
          genshin_uid: uid,
        })
        return '您的《原神》信息注册成功~'
      } else if (uid) {
        return _msg('invalid_cn_uid')
      } else {
        return userData.genshin_uid
          ? `您的《原神》uid已注册为：${userData.genshin_uid}`
          : _msg('not_registered')
      }
    })

  // 五星角色
  koishi
    .command('genshin.5star 显示您的 5★ 角色')
    // .shortcut(/原神[五5]星/)
    .userFields(['genshin_uid'])
    .action(async ({ session }) => {
      const userData = session.user
      let uid = userData.genshin_uid
      if (!uid) return _msg('not_registered')
      const chara = await genshin.getAllCharacters(uid)
      if (!chara) return _msg('fetch_data_failed')
      const fiveStar = chara.rarity(5) || []
      if (fiveStar.length > 0) {
        let card = await getCard(fiveStar)
        return `玩家 ${uid} 一共有 ${
          fiveStar.length
        } 个 5★ 角色${segment('image', { file: 'base64://' + card })}` // [CQ:image,file=base64://${card}]
      }
      return `玩家 ${uid} 木有 5★ 角色 :(`
    })

  // 深境螺旋
  koishi
    .command('genshin.abyss 显示您当前的深境螺旋关卡')
    // .shortcut(/(原神深渊|深境螺旋)/)
    .userFields(['genshin_uid'])
    .action(async ({ session }) => {
      const userData = session.user
      let uid = userData.genshin_uid
      if (!uid) return _msg('not_registered')
      const info = await genshin.getUserInfo(uid)
      if (info.data && info.data.stats && info.data.stats.spiral_abyss) {
        let abyss = info.data.stats.spiral_abyss
        let msg = '您目前的深渊层数是' + abyss + '\n'

        // 获取当期剩余天数
        let now = new Date()
        // let serverNow = new Date(now.getTime() - 4 * 60 * 1000)
        let year = now.getFullYear()
        let month = now.getMonth()
        let day = now.getDate()
        let nextMonth = month + 1
        let dayAfterMonth = new Date(year, nextMonth, 0)
        let dayOfMonth = dayAfterMonth.getDate()
        let dayLeft = 15 - day
        if (dayLeft < 0) dayLeft = dayOfMonth - day

        if (abyss !== '12-3') {
          msg += `本期深渊还没有通关！${
            dayLeft === 0 ? '今天就要结算了' : '还有' + dayLeft + '天就要结算了'
          }，请加油哦！`
        } else {
          msg += `本期深渊已经通关了！下一期刷新${
            dayLeft === 0 ? '就在今天凌晨4点' : '还有' + dayLeft + '天'
          }~`
        }
        // ${segment.quote(session.messageId)}
        return `${segment('quote', { id: session.messageId })}${msg}`
      } else {
        return `${segment('quote', {
          id: session.messageId,
        })}${_msg('fetch_data_failed')}`
      }
    })
}

async function getCard(allCharas) {
  const total = allCharas.length

  // 创建canvas
  let width = 400
  let height = 120 * (total + 1) + 40
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')

  // utils
  function fontSize(px) {
    ctx.font = `${px}px SourceHanSans`
  }
  function centerTextX(str) {
    return width / 2 - ctx.measureText(str).width / 2
  }
  async function singleCard(chara, index) {
    // 变量
    let { image: avatar, name, level, element, fetter } = chara
    // 计算距离顶部的高度
    let baseX = 20
    let baseY = (index + 1) * 120 + 20
    // 绘制圆角矩形
    ctx.lineJoin = 'round'
    ctx.fillStyle = '#fff2db'
    ctx.fillRect(baseX, baseY, 360, 100)
    // 绘制头图
    let avatarImg = await loadImage(avatar)
    ctx.drawImage(avatarImg, baseX + 10, baseY + 20, 70, 70)
    // 填写名字
    fontSize(38)
    ctx.fillStyle = '#000'
    ctx.fillText(name, baseX + 90, baseY + 45)
    // 填写等级
    fontSize(28)
    ctx.fillStyle = '#444'
    ctx.fillText(level + '级', baseX + 90, baseY + 90)
  }

  // 填个底色
  ctx.fillStyle = '#f4f4f4'
  ctx.fillRect(0, 0, width, height)

  // 绘制顶部
  ctx.lineJoin = 'round'
  ctx.fillStyle = '#fff'
  ctx.fillRect(50, 10, 300, 80)
  ctx.fillRect(80, 95, 240, 30)
  fontSize(40)
  ctx.fillStyle = '#000'
  ctx.fillText('全部 5 星角色', centerTextX('全部 5 星角色'), 65)
  fontSize(18)
  ctx.fillStyle = '#222'
  ctx.fillText(
    `共有 ${total} 个5★角色`,
    centerTextX(`共有 ${total} 个5★角色`),
    120
  )

  // 开始给爷递归
  async function makeAllCards(index) {
    await singleCard(allCharas[index], index)
    if (index + 1 < total) await makeAllCards(index + 1)
  }
  await makeAllCards(0)

  return canvas.toBuffer().toString('base64')
}

module.exports = {
  name: 'genshin',
  apply: commandGenshin,
}
