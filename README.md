# Genshin for Koishi  `koishi-plugin-genshin`

**原神四季**（_koishi-plugin-genshin_ ~~征名启事~~）是一个为[koishi](https://github.com/koishijs/koishi)设计的查询原神国服玩家数据的插件。

## 安装

```bash
# Via yarn
yarn add koishi-plugin-genshin
# Or via npm
npm install koishi-plugin-genshin
```

## 需求

目前插件需要使用数据库才能正常运行！

## 配置

插件目前需要使用您的网页版米游社的 cookie 来获取玩家信息。

> 使用网页版米游社登录 <https://bbs.mihoyo.com/ys/>，然后在控制台输入 `document.cookie`，返回的结果就是 cookie，一般来说一个 cookie 可以使用一段时间，如果失效了就再次获取一遍。

> **⚠️ 注意 ⚠️**：请妥善保存您的 cookies。<br>绝对不要把你的 cookies 交给任何人！<br>绝对绝对不要把你的 cookies 交给任何人！！<br>绝对绝对绝对不要把你的 cookies 交给任何人！！！

安装插件，详见 [官方指南](https://koishi.js.org/guide/context.html)。

```js
// koishi.config.js
module.exports = {
  plugins: {
    // ...
    genshin: {
      // 本插件的配置项
      cookie: '<您的小饼干>',
    },
    // ...
  },
}
// 当然如果您是 index.js 玩家也可以这样
App.plugin(require('koishi-plugin-genshin'), {
  // 本插件的配置项
  cookie: '<您的小饼干>',
})
```

## 指令

具体用法请使用`help genshin`查看（~~作者只是懒得写文档~~）

---

_For communication and learning only._

**All game data & pictures from query:** &copy;miHoYo

> Copyright 2021 Koishijs/机智的小鱼君
>
> Licensed under the Apache License, Version 2.0 (the "License");<br>
> you may not use this file except in compliance with the License.<br>
> You may obtain a copy of the License at
>
> http://www.apache.org/licenses/LICENSE-2.0
