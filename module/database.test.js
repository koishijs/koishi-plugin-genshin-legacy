const { App, observe } = require('koishi-core')
const { cookie, uid } = require('./secret')

const koishi = new App()

function getToday() {
  const now = new Date().toISOString()
  return now.split('T')[0]
}

const cookies = {}
cookies[uid] = {
  cookie,
  enable: true,
  usage: [],
}

koishi.database.create('plugin-genshin', {
  lastdate: getToday(),
  cookies,
})
