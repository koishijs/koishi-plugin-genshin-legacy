/** 变量 */
// Koishi
const { segment, template, interpolate, Time } = require('koishi-utils')

// GenshinKit
const { GenshinKit, util } = require('genshin-kit')
const genshin = new GenshinKit()

/**
 * @function getTimeLeft
 */
function getTimeLeft(time) {
  return Time.formatTime(time - Date.now())
}

/**
 * @function Date.format
 */
Date.prototype.format = function(fmt) {
  var o = {
    'M+': this.getMonth() + 1, //月份
    'd+': this.getDate(), //日
    'h+': this.getHours(), //小时
    'm+': this.getMinutes(), //分
    's+': this.getSeconds(), //秒
    'q+': Math.floor((this.getMonth() + 3) / 3), //季度
    S: this.getMilliseconds(), //毫秒
  }
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(
      RegExp.$1,
      (this.getFullYear() + '').substr(4 - RegExp.$1.length)
    )
  }
  for (var k in o)
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length == 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length)
      )
    }
  return fmt
}

/**
 * @command genshin
 */
const apply = (koishi, options) => {
  genshin.loginWithCookie(options.cookie)

  template.set('genshin', {
    abyss_basic_data:
      '〓基本信息〓\n到达层数：{{ max_floor }}\n战斗次数：{{ total_win_times }}次通关/{{ total_battle_times }}总尝试\n获得渊星：{{ total_star }}',
    abyss_top_stats:
      '〓最佳战绩〓\n最强一击：{0}\n最高承伤：{1}\n最常出场：{2}\n元素爆发：{3}',
    api_request_failed: '请求数据时出现问题（可能原因：米游社验证信息过期）',
    command_description: '获取《原神》玩家信息',
    failed: '出现了亿点问题：{0}',
    fetch_data_failed:
      '出现了亿点问题……（可能原因：玩家uid注册错误或玩家未公开米游社资料。）',
    has_x_star_characters: '玩家 {0} 一共拥有 {1} 个 {2}★ 角色{3}',
    info_regestered: '您的《原神》uid已注册为：{0}',
    invalid_cn_uid: '您输入的不是合法的《原神》国服uid~',
    not_registered:
      '您还没有注册您的《原神》用户信息，请艾特我输入“genshin <游戏内uid>”进行注册~',
    no_x_star_character: '玩家 {0} 木有 {1}★ 角色',
    successfully_registered: '您的《原神》信息注册成功~',
    specify_uid: '查询指定 uid 的信息',
  })

  // 注册
  koishi
    .command('genshin [uid:posint]', template('genshin.command_description'))
    .alias('原神')
    .userFields(['genshin_uid'])
    .example('@我 genshin 100000001')
    .action(async ({ session }, uid) => {
      const userData = session.user
      if (util.isValidCnUid(uid)) {
        userData.genshin_uid = uid
        return template('genshin.successfully_registered')
      } else if (uid) {
        return template('genshin.invalid_cn_uid')
      } else {
        return userData.genshin_uid
          ? template('genshin.info_regestered', userData.genshin_uid)
          : template('genshin.not_registered')
      }
    })

  koishi
    .command('genshin.basic', '查询玩家基本信息（宝箱、成就、声望）')
    .userFields(['genshin_uid'])
    .action(async ({ session }) => {
      let uid = session.user.genshin_uid
      if (!uid) return template('not_registered')

      return '功能开发中……'

      try {
        let basic = require('./module/basic')
        let image = await basic({ uid, userInfo })
        return image
      } catch (err) {
        return err
      }
    })

  // 五星角色
  // koishi
  //   .command('genshin.5star 显示您的 5★ 角色')
  //   // .shortcut(/原神[五5]星/)
  //   .userFields(['genshin_uid'])
  //   .action(async ({ session }) => {
  //     const userData = session.user
  //     let uid = userData.genshin_uid
  //     if (!uid) return template('genshin.not_registered')
  //     const chara = await genshin.getAllCharacters(uid)
  //     if (!chara) return template('genshin.fetch_data_failed')
  //     const fiveStar = chara.rarity(5) || []
  //     if (fiveStar.length > 0) {
  //       let card = await getCard(fiveStar)
  //       return _msg(
  //         'has_x_star_characters',
  //         uid,
  //         fiveStar.length,
  //         5,
  //         segment('image', { file: 'base64://' + card })
  //       )
  //     }
  //     return template('genshin.no_x_star_character', uid, 5)
  //   })

  koishi
    .command('genshin.character <name>', '查询指定名称的角色的等级与装备信息')
    .option('uid', `-u <uid:posint> ${template('genshin.specify_uid')}`)
    .example('genshin.character 旅行者')
    .userFields(['genshin_uid'])
    .action(async ({ session, options }, name = '旅行者') => {
      let uid = session.user.genshin_uid || options.uid
      if (!uid) return template('genshin.not_registered')
      if (!util.isValidCnUid(uid)) return template('genshin.invalid_cn_uid')
      try {
        const [userInfo, allCharas] = await Promise.all([
          genshin.getUserInfo(uid),
          genshin.getUserRoles(uid),
        ])
        const Filter = new util.CharactersFilter(allCharas)
        const chara = Filter.name(name)
        const basicFilter = new util.CharactersFilter(userInfo.avatars)

        if (!chara) return `玩家 ${uid} 似乎没有名为 ${name} 的角色。`

        const avatar = basicFilter.name(name).image

        function formatedReliquaries(reliquaries) {
          if (reliquaries.length < 1) return '无'
          let msg = ''
          reliquaries.forEach((item) => {
            msg += `${item.pos_name}：${item.name} (${item.rarity}★)\n`
          })
          return msg.trim()
        }

        return [
          `玩家 ${uid} 的 ${chara.name}：`,
          segment('image', { url: avatar }),
          `${chara.rarity}★ ${chara.name}`,
          `等级：${chara.level}级，好感：${chara.fetter}级`,
          '',
          '〓武器〓',
          `${chara.weapon.name} (${chara.weapon.rarity}★${chara.weapon.type_name})`,
          `${chara.weapon.level}级 (${chara.weapon.affix_level}精炼)`,
          '',
          '〓圣遗物〓',
          formatedReliquaries(chara.reliquaries),
        ].join('\n')
      } catch (err) {
        return template('genshin.failed', err.message || '出现未知问题')
      }
    })

  // 深境螺旋
  koishi
    .command('genshin.abyss 查询当前的深境螺旋信息')
    // .shortcut(/(原神深渊|深境螺旋)/)
    .option('uid', `-u <uid:posint> ${template('genshin.specify_uid')}`)
    .userFields(['genshin_uid'])
    .action(async ({ session }) => {
      let uid = session.user.genshin_uid || options.uid
      if (!uid) return template('genshin.not_registered')
      Promise.all([genshin.getCurAbyss(uid), genshin.getUserInfo(uid)]).then(
        (data) => {
          // 变量
          let [abyssInfo, basicInfo] = data
          let Filter = new util.CharactersFilter(basicInfo.avatars || [])
          let {
            start_time,
            end_time,
            total_battle_times,
            total_win_times,
            max_floor,
            total_star,
            is_unlock,
            reveal_rank,
            damage_rank,
            take_damage_rank,
            energy_skill_rank,
          } = abyssInfo
          start_time *= 1000
          end_time *= 1000

          // 格式化的时间
          function formatedTime(t) {
            return new Date(t).format('yyyy年M月d日 hh:mm:ss')
          }
          // 格式化的顶尖信息
          function formatedCharacterValue(data) {
            if (data.length < 1) return '无'
            let top = data[0]
            return `${Filter.id(top.avatar_id).name || top.avatar_id} ${
              top.value
            }`
          }

          // 计算时间
          let timeLeft = getTimeLeft(end_time)

          // 格式化信息
          let msg = ''
          if (!is_unlock) {
            msg += `玩家 ${uid} 还没有开启本期深境螺旋。`
          } else {
            msg += [
              `玩家 ${uid} 的深境螺旋信息：`,
              interpolate(template('genshin.abyss_basic_data'), {
                max_floor,
                total_win_times,
                total_battle_times,
                total_star,
              }),
              '',
              '〓顶尖数据〓',
              `最强一击：${formatedCharacterValue(damage_rank)}`,
              `最高承伤：${formatedCharacterValue(take_damage_rank)}`,
              `最常出场：${formatedCharacterValue(reveal_rank)}`,
              `元素爆发：${formatedCharacterValue(energy_skill_rank)}`,
            ].join('\n')
          }

          // 当期信息
          msg += `\n\n本期深渊将于【${formatedTime(
            end_time
          )}】结束，还剩${timeLeft}。`

          // 发送
          session.send(msg)
        },
        (err) => {
          session.send(
            template('genshin.failed', err.message || '出现未知问题')
          )
        }
      )
    })
}

module.exports = {
  name: 'genshin',
  apply,
}
