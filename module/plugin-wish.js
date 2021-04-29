const { GenshinGachaKit, util } = require('genshin-gacha-kit')
const { Context, Command } = require('koishi-core')

const gachaNameToType = {
  角色: 301,
  武器: 302,
  常驻: 200
}
const gachaAppTypeToName = {
  character: '角色',
  weapon: '武器',
  permanent: '常驻',
  novice: '新手'
}

/**
 *
 * @param {Context} koishi
 * @param {*} pOptions
 */
function apply(koishi, pOptions) {
  koishi
    .command('genshin.wish')
    .option('number', '-n <number:posint>')
    // .option('name','-n <pool> 选定抽卡时的卡池名称')
    .option('type', '-t <type> 选定抽卡时的卡池类别(角色/武器/常驻)', {
      fallback: '角色'
    })
    .option('list-all', '-L 查看全部可用卡池')
    .option('list', '-l <type> 查看相关类型卡池的内容')
    // .option('add', '-a <name> 为本群添加卡池', { authority: 2 })
    // .option('remove', '-r <name> 为本群移除卡池', { authority: 2 })
    // .channelFields(['genshin_gacha_pool'])
    .userFields(['genshin_gacha'])
    .check(check)
    .action(action)

  async function check({ session, options }) {
    koishi.logger('genshin').info('wish', options)

    session.user.genshin_gacha = session.user.genshin_gacha || {
      counter: {},
      result: {}
    }

    if (options['list-all']) {
      const index = await util.getGachaIndex()
      const poolIds = index.map((i) => i.gacha_id)

      const queue = []
      poolIds.forEach((id) => queue.push(util.getGachaData(id)))
      const pools = await Promise.all(queue)
      pools.map((i) => util.poolStructureConverter(i))

      return [
        `当前可用的卡池共有 ${pools.length} 个：`,
        pools
          .map((i) => {
            return `${i.name} (${i.upSSR.join('、')} UP)`
          })
          .join('\n')
      ].join('\n')
    }

    if (options.list && gachaNameToType[options.list]) {
      let pool = await util.getOfficialGachaPool(gachaNameToType[options.list])
      pool = util.poolStructureConverter(pool)
      return [
        `${pool.name}`,
        `${gachaAppTypeToName[pool.type]}池`,
        `5星 UP：${pool.upSSR.join('、')}`,
        `4星 UP：${pool.upSR.join('、')}`
      ].join('\n')
    }
  }

  function action({ session, options }) {
    const gacha = new GenshinGachaKit()
    const { counter, result } = session.user.genshin_gacha

    gacha.setCounter(counter)
    gacha.setResult(result)
    gacha.setGachaPool(pool)

    return '在整了在整了……'
  }
}

module.exports = {
  name: 'genshin-wish',
  apply
}
