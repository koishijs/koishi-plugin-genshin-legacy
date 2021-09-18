const pug = require('pug')
const { segment, template } = require('koishi-utils')
const path = require('path')

module.exports = async ({ uid, character, ctx }) => {
  let screenshot

  const options = {
    uid,
    ...character,
  }
  const html = pug.renderFile(
    path.resolve(__dirname, '../view/character.pug'),
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
  return (
    template('genshin.has_character', uid, character.name) +
    segment.image(screenshot)
  )
}
