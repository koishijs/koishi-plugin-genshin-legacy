const { template, segment, Time } = require('koishi-utils')
const { handleError } = require('../utils/handleError')
const { getGenshinApp } = require('../modules/database')

/**
 * @param {import('koishi-core').Context} ctx
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
      if (!genshin?.selfUid?.includes('' + uid)) {
        return template('genshin.dailynote.no_permission', uid)
      }

      try {
        const {
          current_resin,
          max_resin,
          resin_recovery_time,
          finished_task_num,
          total_task_num,
          // is_extra_task_reward_received,
          remain_resin_discount_num,
          resin_discount_num_limit,
          current_expedition_num,
          max_expedition_num,
          expeditions,
        } = await genshin.getDailyNote(uid)

        return [
          `${segment.quote(session.messageId)}〓玩家 ${uid} 的实时便笺〓`,
          `原粹树脂：${current_resin}/${max_resin} (${
            resin_recovery_time > 0
              ? `${Time.formatTime(resin_recovery_time * 1000)} 后回满`
              : '已完全恢复'
          })`,
          `每日委托：已完成 ${finished_task_num}/${total_task_num} 个`,
          `周常副本：半价领取奖励机会 ${remain_resin_discount_num}/${resin_discount_num_limit} 次`,
          `〓探索派遣〓`,
          `已派出 ${current_expedition_num}/${max_expedition_num} 人`,
          expeditions
            .map(
              ({ avatar_side_icon, status, remained_time }) =>
                `  ${
                  avatar_side_icon.split('_').pop().split('.')[0]
                } - ${template(
                  `genshin.dailynote.status_${status.toLocaleLowerCase()}`
                )}${
                  remained_time > 0
                    ? ` (${Time.formatTime(remained_time * 1000)} 后结束)`
                    : ''
                }`
            )
            .join('\n'),
        ].join('\n')
      } catch (e) {
        handleError(e)
      }
    })
}

module.exports = {
  name: 'genshin/dailynote',
  apply,
}
