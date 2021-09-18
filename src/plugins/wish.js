const { GenshinGachaKit, util } = require('genshin-gacha-kit')
const { Logger } = require('koishi-core')
const logger = new Logger('genshin')
logger.log = logger.info

const gachaTypeNameToId = {
  角色: 301,
  武器: 302,
  常驻: 200,
}
const gachaAppTypeToTypeName = {
  character: '角色',
  weapon: '武器',
  permanent: '常驻',
  novice: '新手',
}

/**
 * @param {import('koishi-core').Context} ctx
 * @param {*} pOptions
 */
function apply(ctx, pOptions) {
  ctx
    .command('genshin.wish')
    .alias('原神抽卡')
    .option('number', '-n <number:posint>', { fallback: 1 })
    // .option('name','-n <pool> 选定抽卡时的卡池名称')
    .option('type', '-t <type> 选定抽卡时的卡池类别(角色/武器/常驻)', {
      fallback: '角色',
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
    logger.info('wish', options)

    if (options['list-all']) {
      const index = await util.getGachaIndex()
      const poolIds = index.map((i) => i.gacha_id)

      const queue = []
      poolIds.forEach((id) => queue.push(util.getGachaData(id)))
      let pools = await Promise.all(queue)
      pools = pools.map((i) => util.poolStructureConverter(i))

      return [
        `当前可用的卡池共有 ${pools.length} 个：`,
        pools
          .map((i) => {
            return `${i.name} (${i.upSSR.map((i) => i.name).join('、')} UP)`
          })
          .join('\n'),
      ].join('\n')
    }

    if (options.list) {
      if (!gachaTypeNameToId[options.list])
        return '没有这个类型的卡池：' + options.list
      let pool = await util.getOfficialGachaPool(
        gachaTypeNameToId[options.list]
      )
      pool = util.poolStructureConverter(pool)
      return [
        `${pool.name}`,
        `${gachaAppTypeToTypeName[pool.type]}池`,
        `5星 UP：${pool.upSSR.map((i) => i.name).join('、') || '无'}`,
        `4星 UP：${pool.upSR.map((i) => i.name).join('、') || '无'}`,
      ].join('\n')
    }
  }

  async function action({ session, options }) {
    const gacha = new GenshinGachaKit()
    let genshin_gacha = session.user.genshin_gacha
    console.log('1111', genshin_gacha)
    const { counter, result } = genshin_gacha
    console.log('2222', { counter, result })

    if (counter?.total !== undefined && result?.r !== undefined) {
      gacha.setCounter(counter)
      gacha.setResult(result)
    }

    let number = options.number
    number = Math.min(90, number)
    number = Math.max(1, number)

    let pool = await util.getOfficialGachaPool(gachaTypeNameToId[options.type])
    if (!pool) return `无法拉取 ${options.type} 的卡池信息。`
    pool = util.poolStructureConverter(pool)

    gacha.setGachaPool(pool)

    const items = gacha.multiWish(number)

    const savedData = {
      counter: gacha.getCounter(),
      result: gacha.getResult(),
    }
    console.log('保存数据', savedData)
    genshin_gacha = savedData
    await session.user._update()
    console.log('数据库中的数据', session.user.genshin_gacha)

    return `抽到了 ${items
      .map((i) => `${i.name}(${i.rarity}星)x${i.count}`)
      .join('、')}`
  }

  ctx
    .command('genshin.backpack')
    .option('reset', '-R')
    .userFields(['genshin_gacha'])
    .action(async ({ session, options }) => {
      let genshin_gacha = session.user.genshin_gacha
      if (!genshin_gacha) return '您还未抽过卡。'

      if (options.reset) {
        const gacha = new GenshinGachaKit()
        gacha.clearCounter().clearResult()
        genshin_gacha = {
          counter: gacha.getCounter(),
          result: gacha.getResult(),
        }
        await session.user._update()
        return '已重置背包。'
      }

      const { counter, result } = Object.assign({}, genshin_gacha)
      console.log(JSON.stringify({ counter, result }))
      return [
        `您共抽了 ${counter.total} 次卡`,
        `五星角色：${result.ssr
          .filter((i) => i.type === 'character')
          .map((i) => i.name)
          .join('、') || '无'}`,
        `五星武器：${result.ssr
          .filter((i) => i.type === 'weapon')
          .map((i) => i.name)
          .join('、') || '无'}`,
        `距离上一次五星 ${counter.lastSSR} 抽，您现在${
          counter.ensureSSR === 1 ? '有' : '没有'
        }大保底。`,
      ].join('\n')
    })

  ctx
    .command('arr')
    .userFields(['arr_test'])
    .action(async ({ session }) => {
      const arr = session.user.arr_test || []
      arr.push({ length: { foo: { bar: [arr.length] } } })
      session.user.arr_test = arr
      await session.user._update()
      return JSON.stringify(arr)
    })
}

module.exports = {
  name: 'genshin/wish',
  apply,
}
