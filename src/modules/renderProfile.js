const pug = require('pug')
const { segment, template } = require('koishi-utils')
const path = require('path')
const { activedConstellations } = require('genshin-kit').util

function m(k) {
  return template(`genshin.profile.${k}`)
}

module.exports = async ({ uid, userInfo, allCharacters, ctx }) => {
  let screenshot

  let _stats = Object.assign({}, userInfo.stats)
  userInfo.stats = []
  for (key in _stats) {
    userInfo.stats.push({ desc: m('stats.' + key), count: _stats[key] })
  }

  allCharacters.forEach((item) => {
    item.activedConstellations = activedConstellations(item)
  })

  userInfo.avatars = allCharacters

  const options = {
    ui: {
      title: m('ui.title'),
    },
    uid,
    ...userInfo,
  }
  const html = pug.renderFile(
    path.resolve(__dirname, '../view/profile.pug'),
    options
  )

  const page = await ctx.app.puppeteer.page();

  try {
    await page.goto(
      'file:///' + path.resolve(__dirname, '../view/index.html')
    )
    await page.setContent(html)
    const { width, height } = await page.evaluate(() => {
      const ele = document.body;
      return {
        width: ele.scrollWidth,
        height: ele.scrollHeight,
      };
    });
    await page.setViewport({
      width: Math.ceil(width + 14),
      height: Math.ceil(height + 14),
    });
    screenshot = await page.screenshot({
      fullPage: true,
      type: 'jpeg',
    })
  } catch (err) {
    await page.close()
    return `错误：${err}`
  }

  await page.close()
  return segment.image(screenshot)
}
