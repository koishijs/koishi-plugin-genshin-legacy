const ppt = require('puppeteer')
const path = require('path')
const { segment, template } = require('koishi-utils')

module.exports = async ({ uid, userInfo }) => {
  let screenshot

  try {
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
    await page.setContent(html)
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
