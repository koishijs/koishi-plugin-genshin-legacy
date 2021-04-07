/**
 * @name koishi-plugin-genshin
 * @desc Genshin Impact plugin for Koishijs
 *
 * @author Koishijs(机智的小鱼君) <dragon-fish@qq.com>
 * @license Apache-2.0
 */
// Koishi
const { segment, template, Time } = require('koishi-utils')

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
 */
const apply = (koishi, pOptions) => {
  genshin.loginWithCookie(pOptions.cookie)

  template.set('genshin', { ...require('./i18n'), ...pOptions.i18n })

  // 注册
  koishi
    .command('genshin [uid:posint]', template('genshin.cmd_genshin_desc'), {
      minInterval: Time.hour,
    })
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
    .command(
      'genshin.profile',
      '警告：实验功能！' + template('genshin.cmd_profile'),
      {
        minInterval: Time.second * 30,
      }
    )
    .userFields(['genshin_uid'])
    .option('uid', `-u <uid:posint> ${template('genshin.cmd_specify_uid')}`)
    .action(async ({ session, opttions }) => {
      let uid = opttions.uid || session.user.genshin_uid
      if (!uid) return template('genshin.not_registered')

      try {
        const userInfo = await genshin.getUserInfo(uid)
        let profile = require('./module/profile')
        let image = await profile({ uid, userInfo })
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
    .command(
      'genshin.character <name>',
      template('genshin.cmd_character_desc'),
      {
        minInterval: Time.second * 5,
      }
    )
    .option('uid', `-u <uid:posint> ${template('genshin.cmd_specify_uid')}`)
    .example('genshin.character 旅行者')
    .userFields(['genshin_uid'])
    .action(async ({ session, options }, name = '旅行者') => {
      let uid = options.uid || session.user.genshin_uid
      if (!uid) return template('genshin.not_registered')
      if (!util.isValidCnUid(uid)) return template('genshin.invalid_cn_uid')
      try {
        const allCharas = await genshin.getUserRoles(uid)
        const Filter = new util.CharactersFilter(allCharas)
        const chara = Filter.name(name)

        if (!chara) return template('genshin.no_character', uid, name)

        function reliquariesFmt(reliquaries) {
          if (reliquaries.length < 1) return '无'
          let msg = ''
          reliquaries.forEach((item) => {
            msg += `${item.pos_name}：${item.name} (${item.rarity}★)\n`
          })
          return msg.trim()
        }

        const constellations = chara.constellations || []
        let constellationActived = 0
        constellations.forEach(({ is_actived }) =>
          is_actived ? constellationActived++ : null
        )

        return [
          template('genshin.has_character', uid, chara.name),
          template('genshin.character_basic', {
            icon: segment('image', { url: chara.icon }),
            image: segment('image', { url: chara.image }),
            name: chara.name,
            rarity: chara.rarity,
            constellation: constellationActived,
            level: chara.level,
            fetter: chara.fetter,
          }),
          template('genshin.character_weapon', {
            name: chara.weapon.name,
            rarity: chara.weapon.rarity,
            type_name: chara.weapon.type_name,
            level: chara.weapon.level,
            affix_level: chara.weapon.affix_level,
          }),
          template(
            'genshin.character_reliquaries',
            reliquariesFmt(chara.reliquaries)
          ),
        ].join('\n')
      } catch (err) {
        return template(
          'genshin.failed',
          err.message || template('genshin.error_unknown')
        )
      }
    })

  // 深境螺旋
  koishi
    .command('genshin.abyss', template('genshin.cmd_abyss_desc'), {
      minInterval: Time.second * 5,
    })
    // .shortcut(/(原神深渊|深境螺旋)/)
    .option('uid', `-u <uid:posint> ${template('genshin.cmd_specify_uid')}`)
    .option('previous', '-p 查询上一期的数据', { type: 'boolean' })
    .userFields(['genshin_uid'])
    .action(async ({ session, options }) => {
      let uid = options.uid || session.user.genshin_uid
      if (!uid) return template('genshin.not_registered')

      const type = options.previous ? 'prev' : 'cur'

      Promise.all([
        genshin.getAbyss(uid, type === 'cur' ? 1 : 2),
        genshin.getUserInfo(uid),
      ]).then(
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
                total_star,
              }),
              template('genshin.abyss_top_stats', {
                damage_rank: formatedCharacterValue(damage_rank),
                take_damage_rank: formatedCharacterValue(take_damage_rank),
                reveal_rank: formatedCharacterValue(reveal_rank),
                energy_skill_rank: formatedCharacterValue(energy_skill_rank),
              }),
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
