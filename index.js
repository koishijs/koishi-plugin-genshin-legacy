/**
 * @name koishi-plugin-genshin
 * @desc Genshin Impact plugin for Koishijs
 *
 * @author Koishijs(机智的小鱼君) <dragon-fish@qq.com>
 * @license Apache-2.0
 */
// Koishi
const { segment, template, Time } = require('koishi-core')

// GenshinKit
const { GenshinKit } = require('genshin-kit')
const { CharactersFilter, isValidCnUid } = require('genshin-kit').util
const { activedConstellations } = require('genshin-kit').util
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
Date.prototype.format = function (fmt) {
  var o = {
    'M+': this.getMonth() + 1, //月份
    'd+': this.getDate(), //日
    'h+': this.getHours(), //小时
    'm+': this.getMinutes(), //分
    's+': this.getSeconds(), //秒
    'q+': Math.floor((this.getMonth() + 3) / 3), //季度
    S: this.getMilliseconds() //毫秒
  }
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(
      RegExp.$1,
      (this.getFullYear() + '').substr(4 - RegExp.$1.length)
    )
  }
  for (var k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length == 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length)
      )
    }
  }
  return fmt
}

/**
 * @command genshin
 * @param {import('koishi-core').Context} ctx
 */
const apply = (ctx, pOptions) => {
  pOptions = {
    cookie: '',
    donateMin: 5,
    donateMax: 25,
    wish: {
      enable: false,
      officialPools: true,
      customPools: []
    },
    ...pOptions
  }

  genshin.loginWithCookie(pOptions.cookie)
  template.set('genshin', { ...require('./i18n'), ...pOptions.i18n })

  // 注册
  ctx
    .command('genshin [uid:posint]', template('genshin.cmd_genshin_desc'), {
      minInterval: Time.hour
    })
    .alias('原神')
    .userFields(['genshin_uid'])
    .example('@我 genshin 100000001')
    .check(({ session }, uid) => {
      const userFileds = session.user
      if (!uid) {
        const reply = userFileds.genshin_uid
          ? template('genshin.info_regestered', userFileds.genshin_uid)
          : template('genshin.not_registered')
        return segment('quote', { id: session.messageId }) + reply
      } else if (!isValidCnUid(uid)) {
        return (
          segment('quote', { id: session.messageId }) +
          template('genshin.invalid_cn_uid')
        )
      }
    })
    .action(async ({ session }, uid) => {
      const userFileds = session.user
      userFileds.genshin_uid = uid
      try {
        await session.user._update()
      } catch (err) {
        return (
          segment('quote', { id: session.messageId }) +
          template('genshin.faild', err.message)
        )
      }
      return (
        segment('quote', { id: session.messageId }) +
        template('genshin.successfully_registered')
      )
    })

  ctx
    .command('genshin.profile', template('genshin.cmd_profile_desc'), {
      minInterval: Time.second * 30
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
          genshin.getAllCharacters(uid, true)
        ])

        // 截图
        if (ctx.app.puppeteer) {
          let image = await require('./module/renderProfile')({
            uid,
            userInfo,
            allCharacters,
            ctx,
          })
          return segment('quote', { id: session.messageId }) + image
        }

        // 文字版
        return '截图失败：未安装koishi-plugin-puppeteer'
      } catch (err) {
        return (
          segment('quote', { id: session.messageId }) +
          template(
            'genshin.failed',
            err.message || template('genshin.error_unknown')
          )
        )
      }
    })

  ctx
    .command(
      'genshin.character <name>',
      template('genshin.cmd_character_desc'),
      {
        minInterval: Time.second * 15
      }
    )
    .option('uid', `-u <uid:posint> ${template('genshin.cmd_specify_uid')}`)
    .example('genshin.character 旅行者')
    .userFields(['genshin_uid'])
    .check(({ session, options }) => {
      let uid = options.uid || session.user.genshin_uid
      if (!uid) return template('genshin.not_registered')
      if (!isValidCnUid(uid)) return template('genshin.invalid_cn_uid')
    })
    .action(async ({ session, options }, name = '旅行者') => {
      let uid = options.uid || session.user.genshin_uid
      try {
        const allCharacters = await genshin.getAllCharacters(uid, true)
        const Filter = new CharactersFilter(allCharacters)
        const character = Filter.name(name)

        if (!character) return template('genshin.no_character', uid, name)

        // 截图
        if (ctx.app.puppeteer) {
          const image = await require('./module/renderCharacter')({
            uid,
            character,
            ctx,
          })
          return segment('quote', { id: session.messageId }) + image
        }

        // 文字版
        function reliquariesFmt(reliquaries) {
          if (reliquaries.length < 1) return '无'
          let msg = ''
          reliquaries.forEach((item) => {
            msg += `${item.pos_name}：${item.name} (${item.rarity}★)\n`
          })
          return msg.trim()
        }

        return [
          template('genshin.has_character', uid, character.name),
          template('genshin.character_basic', {
            icon: segment('image', { url: character.icon }),
            image: segment('image', { url: character.image }),
            name: character.name,
            rarity: character.rarity,
            constellation: activedConstellations(character),
            level: character.level,
            fetter: character.fetter
          }),
          template('genshin.character_weapon', {
            name: character.weapon.name,
            rarity: character.weapon.rarity,
            type_name: character.weapon.type_name,
            level: character.weapon.level,
            affix_level: character.weapon.affix_level
          }),
          template(
            'genshin.character_reliquaries',
            reliquariesFmt(character.reliquaries)
          )
        ].join('\n')
      } catch (err) {
        return (
          segment('quote', { id: session.messageId }) +
          template(
            'genshin.failed',
            err.message || template('genshin.error_unknown')
          )
        )
      }
    })

  // 深境螺旋
  ctx
    .command('genshin.abyss', template('genshin.cmd_abyss_desc'), {
      minInterval: Time.second * 15
    })
    // .shortcut(/(原神深渊|深境螺旋)/)
    .option('uid', `-u <uid:posint> ${template('genshin.cmd_specify_uid')}`)
    .option('previous', '-p 查询上一期的数据', { type: 'boolean' })
    .userFields(['genshin_uid'])
    .check(({ session, options }) => {
      let uid = options.uid || session.user.genshin_uid
      if (!uid) return template('genshin.not_registered')
      if (!isValidCnUid(uid)) return template('genshin.invalid_cn_uid')
    })
    .action(async ({ session, options }) => {
      let uid = options.uid || session.user.genshin_uid

      const type = options.previous ? 'prev' : 'cur'

      Promise.all([
        genshin.getAbyss(uid, type === 'cur' ? 1 : 2, true),
        genshin.getUserInfo(uid, true)
      ]).then(
        (data) => {
          // 变量
          let [abyssInfo, basicInfo] = data
          let Filter = new CharactersFilter(basicInfo.avatars || [])
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
            energy_skill_rank
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
            return `${Filter.id(top.avatar_id).name || top.avatar_id} ${top.value
              }`
          }

          // 格式化信息
          let msg = ''
          if (!is_unlock) {
            msg += template(`genshin.abyss_${type}_not_active`, uid)
          } else {
            msg += [
              template(`genshin.abyss_${type}_is_active`, uid),
              template('genshin.abyss_basic_data', {
                max_floor,
                total_win_times,
                total_battle_times,
                total_star
              }),
              template('genshin.abyss_top_stats', {
                damage_rank: formatedCharacterValue(damage_rank),
                take_damage_rank: formatedCharacterValue(take_damage_rank),
                reveal_rank: formatedCharacterValue(reveal_rank),
                energy_skill_rank: formatedCharacterValue(energy_skill_rank)
              })
            ].join('\n')
          }

          // 时间信息
          msg += '\n\n'
          if (type === 'cur') {
            msg += template(
              'genshin.abyss_cur_time',
              formatedTime(end_time),
              getTimeLeft(end_time)
            )
          } else {
            msg += template(
              'genshin.abyss_prev_time',
              formatedTime(start_time),
              formatedTime(end_time)
            )
          }

          // 发送
          session.send(segment('quote', { id: session.messageId }) + msg)
        },
        (err) => {
          session.send(
            segment('quote', { id: session.messageId }) +
            template('genshin.failed', err.message || '出现未知问题')
          )
        }
      )
    })

  // Load wish plugin
  if (pOptions.wish.enable) {
    ctx.plugin(require('./plugin/wish'), pOptions)
  }
}

module.exports = {
  name: 'genshin',
  apply
}
