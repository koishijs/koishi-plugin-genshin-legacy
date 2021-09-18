const { template, segment, Time } = require('koishi-utils')
const { isValidCnUid, CharactersFilter } = require('genshin-kit').util
const { dateFormat, getTimeLeft } = require('../utils/dateFormat')
const { handleError } = require('./handleError')
const { getGenshinApp } = require('../modules/database')

/**
 * @param {import('koishi-core').Context} ctx
 * @param {{genshin: import('genshin-kit').GenshinKit}} arg1
 */
function apply(ctx) {
  ctx
    .command('genshin.abyss', template('genshin.cmd_abyss_desc'), {
      minInterval: Time.second * 15,
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
      const genshin = await getGenshinApp(session, uid)
      if (!genshin) {
        return template('genshin.donate.daily_runout')
      }

      const type = options.previous ? 'prev' : 'cur'

      Promise.all([
        genshin.getAbyss(uid, type === 'cur' ? 1 : 2, true),
        genshin.getUserInfo(uid, true),
      ]).then(
        (data) => {
          // 变量
          const [abyssInfo, basicInfo] = data
          const Filter = new CharactersFilter(basicInfo.avatars || [])
          const {
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

          const startTimeStr = dateFormat(
            'yyyy年M月d日 hh:mm:ss',
            new Date(start_time * 1000)
          )
          const endTimeStr = dateFormat(
            'yyyy年M月d日 hh:mm:ss',
            new Date(end_time * 1000)
          )

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
              endTimeStr,
              getTimeLeft(end_time * 1000)
            )
          } else {
            msg += template('genshin.abyss_prev_time', startTimeStr, endTimeStr)
          }

          // 发送
          session.send(segment('quote', { id: session.messageId }) + msg)
        },
        (err) => {
          handleError(session, genshin, err)
        }
      )
    })
}

module.exports = {
  name: 'genshin/abyss',
  apply,
}
