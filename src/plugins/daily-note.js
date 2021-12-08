const { template, segment, Time } = require('koishi-utils')
const { handleError } = require('../utils/handleError')
const { getGenshinApp } = require('../modules/database')

/**
 * @param {import('koishi-core').Context} ctx
 * @param {{genshin: import('genshin-kit').GenshinKit}} arg1
 */
function apply(ctx) {
  ctx
    .command('genshin.dailynote', template('genshin.commands.dailynote'), {
      minInterval: Time.second * 15,
    })
    .alias('genshin.note')
    .userFields(['genshin_uid'])
    .check(({ session }) => {
      let uid = session.user.genshin_uid
      if (!uid) return template('genshin.not_registered')
    })
    .action(async ({ session }) => {
      let uid = session.user.genshin_uid
      const genshin = await getGenshinApp(session, uid)
      if (!genshin?.selfUid?.includes(uid)) {
        return template('genshin.dailynote.no_permission')
      }

      try {
        const {
          current_resin,
          max_resin,
          resin_recovery_time,
          finished_task_num,
          totoal_task_num,
          is_extra_task_reward_received,
          remain_resin_discount_num,
          resin_discount_num_limit,
          current_expedition_num,
          max_expedition_num,
          expeditions,
        } = await genshin.getDailyNote(uid)

        return [
          `〓玩家 ${uid} 的实时便笺〓`,
          `原粹树脂：${current_resin}/${max_resin} (${
            resin_recovery_time > 0
              ? '还剩 ' + Time.formatTime(resin_recovery_time * 1000)
              : '已完全恢复'
          })`,
          `每日委托：${finished_task_num}/${totoal_task_num} (每日委托${
            finished_task_num - totoal_task_num > 0 ? '未' : '已'
          }完成)`,
          `周常副本：${remain_resin_discount_num}/${resin_discount_num_limit} (消耗减半机会${
            is_extra_task_reward_received ? '已' : '未'
          }耗尽)`,
          `探索派遣：${current_expedition_num}/${max_expedition_num}`,
          expeditions
            .map(
              ({ avatar_side_icon, status, remained_time }) =>
                `  ${
                  avatar_side_icon.split('_').pop().split('.')[0]
                } - ${status} (${remained_time > 1 ? 'seconds' : 'second'} left)`
            )
            .join('\n'),
        ].join('\n')
      } catch (e) {
        handleError(e)
      }
    })
}

module.exports = {
  name: 'genshin/abyss',
  apply,
}
