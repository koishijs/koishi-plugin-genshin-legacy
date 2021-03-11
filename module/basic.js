const ppt = require('puppeteer')
const path = require('path')
const { segment } = require('koishi-utils')

module.exports = async ({ uid, userInfo }) => {
  let screenshot

  const browser = await ppt.launch({
    args: [
      '--no-sandbox',
      '--disable-infobars ', // don't show information bar
      '--lang=zh-CN',
      '--disable-dev-shm-usage',
    ],
    defaultViewport: { width: 800, height: 600 },
    headless: 1,
  })
  const page = await browser.newPage()
  await page.goto('file:///' + path.resolve(__dirname, '../public/index.html'))

  try {
    await page.evaluate(
      (userInfo, uid) => {
        return Basic({ uid, userInfo })
        // return awaitImages()
      },
      userInfo,
      uid
    )
    screenshot = await page.screenshot({
      fullPage: true,
    })
  } catch (err) {
    await browser.close()
    return `错误：${err}`
  }

  await browser.close()
  return segment('image', { file: 'base64://' + screenshot.toString('base64') })
}
