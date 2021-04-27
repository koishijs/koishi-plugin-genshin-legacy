const { GenshinGachaKit } = require('genshin-gacha-kit')

function apply(koishi, pOptions) {
  koishi
    .command('genshin.wish')
    .option('number', '-n <number:posint>')
    .option('pool', '-p <name:string> 选定抽卡时的卡池名字')
    .option('type', '-t <type> 选定抽卡时的卡池类别')
    .option('list-all', '-L 查看全部卡池')
    .option('list', '-l 查看本群生效的卡池')
    .option('add', '-a <name> 为本群添加卡池', { authority: 2 })
    .option('remove', '-r <name> 为本群移除卡池', { authority: 2 })
    .channelFields(['genshin_gacha_pool'])
    .userFields(['genshin_gacha'])
    .check(check)
    .action(action)

  function check({ session, options }) {
    koishi.logger('genshin').info('gacha', options)

    const pool = pOptions?.gachaPool || []
    const poolNum = pool?.length
    const channelPools = session.channel.genshin_gacha_pool || []
    session.user.genshin_gacha = session.user.genshin_gacha || {
      counter: {},
      result: {},
    }

    if (poolNum < 1) {
      return '当前没有可用的卡池数据，请联系 bot 管理员。'
    }

    if (options['list-all']) {
      return [
        `当前可用的卡池共有 ${poolNum} 个：`,
        pool.map(i => `${i.name} (UP: ${i.upSSR.join('、')})`).join('\n'),
      ].join('\n')
    }

    if (channelPools.length < 1) {
      return '群组未设定卡池，请联系 bot 管理员开启。'
    }

    if (options.list) {
      return [
        `本群共有 ${channelPools.length} 个可用卡池：`,
        pool.map(i => `${i.name} (UP: ${i.upSSR.join('、')})`).join('\n'),
      ]
    }
  }

  function action({ session, options }) {
    const gacha = new GenshinGachaKit()
    const { counter, result } = session.user.genshin_gacha
    const channelPools = session.channel.genshin_gacha_pool

    // if ()

    gacha.setCounter(counter)
    gacha.setResult(result)
    gacha.setGachaPool(pool)

    return '在整了在整了……'
  }
}

module.exports = {
  name: 'genshin-wish',
  apply,
}
