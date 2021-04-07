# koishi-plugin-genshin

**原神四季**（_Genshin Impact for Koishi_ → ~~征名启事~~）是一个为[koishi](https://github.com/koishijs/koishi)设计的查询原神国服玩家数据的插件。

## 特色功能

喜欢玩《原神》？想和沙雕群友一起凹数据？懒得下载米游社？那么本插件将会是您的不二之选！来给您的群聊安排一只能查询原神数据的 koishi 机械姬吧~

为您的机械姬安装本插件，玩家们无需打开米游社，向 koishi bot 发送指令，一键炫耀您的五星角色、五星武器和深渊数据！

## 安装方法

```bash
# Via yarn
yarn add koishi-plugin-genshin
# Or via npm
npm install koishi-plugin-genshin
```

## 使用指南

具体用法请使用`help genshin`查看（~~作者只是懒得写文档~~）

## 系统需求

需要最新版 koishi v3，并配置数据库。

另外还需要安装 Chromium 用于生成图片。

## 配置项目

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

关于自定义输出排版，可以使用 koishi 的 template 语法，由于字符串太多，[《请您读源码.jpg》](./i18n.js)。

## 注意事项

一个米游社账号一天内只能查询 30 个玩家数据，目前还没有考虑负载均衡的设计，请自行处理频率控制！

~~【广告】如果你喜欢本插件，欢迎给作者打钱或者捐赠米游社账号。~~

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
