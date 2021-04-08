const pug = require('pug')
const path = require('path')

const html = pug.renderFile(path.resolve(__dirname, '../public/profile.pug'), {
  pretty: 1,
  uid: 100000001,
  basic_stats: [
    { count: 123, desc: '神瞳' },
    { count: 123, desc: '神瞳' },
  ],
  character_list: [
    {
      name: 'name',
      icon: 'http://icon.com',
      level: 50,
      fetter: 8,
      rarity: 4,
    },
  ],
})
console.log(html)
