const { template, segment, Time } = require('koishi-utils')
const {
  isValidCnUid,
  CharactersFilter,
  activedConstellations,
} = require('genshin-kit').util
const { handleError } = require('./handleError')
const { getGenshinApp } = require('../modules/database')

/**
 * @param {import('koishi-core').Context} ctx
 * @param {{genshin: import('genshin-kit').GenshinKit}} arg1
 */
function apply(ctx) {
  ctx
    .command(
      'genshin.character <name>',
      template('genshin.cmd_character_desc'),
      {
        minInterval: Time.second * 15,
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
      const genshin = await getGenshinApp(session, uid)
      if (!genshin) {
        return template('genshin.donate.daily_runout')
      }

      try {
        const allCharacters = await genshin.getAllCharacters(uid, true)
        const Filter = new CharactersFilter(allCharacters)
        const character = Filter.name(name)

        if (!character) return template('genshin.no_character', uid, name)

        // 截图
        if (ctx.app.puppeteer) {
          const image = await require('../modules/renderCharacter')({
            uid,
            character,
            ctx,
          })
          return segment.quote(session.messageId) + image
        }

        // 文字版
        return [
          template('genshin.has_character', uid, character.name),
          template('genshin.character_basic', {
            icon: segment('image', { url: character.icon }),
            image: segment('image', { url: character.image }),
            name: character.name,
            rarity: character.rarity,
            constellation: activedConstellations(character),
            level: character.level,
            fetter: character.fetter,
          }),
          template('genshin.character_weapon', {
            name: character.weapon.name,
            rarity: character.weapon.rarity,
            type_name: character.weapon.type_name,
            level: character.weapon.level,
            affix_level: character.weapon.affix_level,
          }),
          template(
            'genshin.character_reliquaries',
            reliquariesFmt(character.reliquaries)
          ),
        ].join('\n')
      } catch (err) {
        handleError(session, genshin, err)
      }
    })

  function reliquariesFmt(reliquaries) {
    if (reliquaries.length < 1) return '无'
    let msg = ''
    reliquaries.forEach((item) => {
      msg += `${item.pos_name}：${item.name} (${item.rarity}★)\n`
    })
    return msg.trim()
  }
}

module.exports = {
  name: 'genshin/character',
  apply,
}
