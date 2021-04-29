module.exports = {
  // command descriptions
  cmd_genshin_desc: '《原神 Genshin Impact》功能',
  cmd_profile_desc: '查询玩家基本信息（宝箱、成就、声望）',
  cmd_abyss_desc: '查询原神深境螺旋数据。',
  cmd_character_desc: '查询指定名称的角色的等级与装备信息。',
  cmd_specify_uid: '查询指定 uid 的信息',
  cmd_donate_desc:
    '捐赠您的米游社账号，提高每日查询上限。解锁无限次查询自己信息的特权！',
  // genshin
  info_regestered: '您的《原神》uid已注册为：{0}',
  invalid_cn_uid: '您输入的不是合法的《原神》国服uid~',
  not_registered:
    '您还没有注册您的《原神》用户信息，请艾特我输入“genshin 游戏内uid”进行注册~（注意打空格）',
  successfully_registered: '您的《原神》信息注册成功~',
  // abyss
  abyss_cur_not_active: '玩家 {0} 还没有开启本期深境螺旋。',
  abyss_cur_is_active: '玩家 {0} 的本期深境螺旋数据：',
  abyss_prev_not_active: '玩家 {0} 没有参与上一期深境螺旋。',
  abyss_prev_is_active: '玩家 {0} 的上一期深境螺旋数据：',
  abyss_basic_data:
    '〓基本信息〓\n到达层数：{{ max_floor }}\n战斗次数：{{ total_win_times }}次通关/{{ total_battle_times }}总尝试\n获得渊星：{{ total_star }}',
  abyss_top_stats:
    '〓最佳战绩〓\n最强一击：{{ damage_rank }}\n最高承伤：{{ take_damage_rank }}\n最常出场：{{ reveal_rank }}\n元素爆发：{{ energy_skill_rank }}',
  abyss_cur_time: '本期深境螺旋将于【{0}】结束，还剩 {1}。',
  abyss_prev_time: '上期深境螺旋从 {0} 开始，于 {1} 结束。',
  // characters
  has_character: '玩家 {0} 的 {1}：',
  no_character: '玩家 {0} 似乎没有名为 {1} 的角色。',
  character_basic:
    '{{ icon }}\n{{ name }} {{ rarity }}★ {{ constellation }}命\n等级：{{ level }}级，好感：{{ fetter }}级', // {{ icon }} -> 头像, {{ image }} -> 立绘
  character_weapon:
    '〓武器〓\n{{ name }} ({{ rarity }}★{{ type_name }})\n{{ level }}级 ({{ affix_level }}精炼)',
  character_reliquaries: '〓圣遗物〓\n{0}',
  has_x_star_characters: '玩家 {0} 一共拥有 {1} 个 {2}★ 角色。',
  no_x_star_character: '玩家 {0} 似乎没有 {1}★ 角色。',
  // error messages
  api_request_failed: '请求数据时出现问题（可能原因：米游社验证信息过期）',
  failed: '出现了亿点问题：{0}',
  fetch_data_failed:
    '出现了亿点问题……（可能原因：玩家uid注册错误或玩家未公开米游社资料。）',
  error_unknown: '未知问题',
  // 用于玩家信息截图
  profile: {
    ui: {
      title: '玩家 {0} 的原神信息',
      stats_title: '数据总览',
      avatar_title: '角色列表',
      city_explorations_title: '城市探索'
    },
    stats: {
      active_day_number: '活跃天数',
      achievement_number: '达成成就',
      win_rate: 'win_rate',
      anemoculus_number: '风神瞳',
      geoculus_number: '岩神瞳',
      avatar_number: '获得角色数',
      way_point_number: '解锁传送点',
      domain_number: '解锁秘境',
      spiral_abyss: '深境螺旋',
      precious_chest_number: '珍贵宝箱',
      luxurious_chest_number: '华丽宝箱',
      exquisite_chest_number: '精致宝箱',
      common_chest_number: '普通宝箱'
    }
  },
  // 贡献账号
  donate_daily_runout:
    '今日查询次数已耗尽，明天再来吧！(已查询过的人不受影响)\n想要提高查询上限吗？想要解锁无限次查询自己信息的特权吗？私信我“捐赠原神账号”了解详情。',
  donate_what:
    '原神信息查询功能每一个账号的日查询上限为 30 个玩家，我们的查询用账号都是由玩家们贡献的。如果您向我们捐赠米游社账号就能获取更高的查询上限。\n回复“捐赠米游社账号有什么好处”了解捐赠带来的好处\n回复“如何捐赠米游社账号”来开始捐赠',
  donate_why:
    '我们所有的查询用账号都是玩家们捐赠的，没有他们的无私奉献您就无法享受到免费又好用的查询展示服务，如果您愿意，帮助我们提高查询的上限吧！您将解锁无限次查询自己原神信息的特权！\n回复“捐赠米游社账号问答”获取常见问题的答案\n回复“如何捐赠米游社账号”来开始捐赠！',
  donate_qna:
    'Q: 我的账号需要玩过原神吗？\nA: 不需要玩过原神，只要是米游社账号即可。\nQ: 我有被封号的风险吗？\nA: 基本没有封号风险，如果实在不放心可以捐赠不常用的小号。\nQ: 我的账号会被盗用吗？\nA: 我们保证不会向任何第三方提供您的账号信息。但是望您知悉：任何人通过 cookie 都可以直接登录您的米游社账号，因此我们建议您打开账号的二步验证功能（手机短信验证）降低被盗号的风险。如果您不确定自己在做什么，请不要继续捐赠账号。\nQ: 捐赠账号后，我还能使用这个账号正常玩游戏吗？\nA: 可以，没影响。',
  donate_how:
    '准备工作：(您可能需要一台电脑)\n1. 使用电脑版网页在 https://bbs.mihoyo.com/ys 登录您的账号\n2. 回到 https://bbs.mihoyo.com \n3. 按下键盘上的 F12，在弹出的菜单中选择“控制台/console”\n4. 输入 alert(document.cookie) 然后按回车，此时会弹出一个窗口\n5. 复制您在弹窗里看到的内容\n完成后请回复我“确认捐赠米游社账号”',
  donate_confirm_1: '您确认要捐赠米游社账号吗？',
  donate_confirm_2:
    '您希望自己的账号分享给多少用户使用？(请输入 {0} - {1} 的数字)',
  donate_confirm_3: '请在 60 秒内回复您复制好的米游社 cookie：',
  donate_checking: '正在测试 cookie 可用性，稍等片刻……',
  donate_checked_ok:
    '您的 cookie 保存成功！您已获取无限次查询自己信息的特权，并且您的善举每天能够帮助 {0} 名玩家展示他们的玩家数据！\n理论上您的账号信息可以使用很长一段时间，直到您更改您的密码。如果今后您更改了您的密码，请重新捐赠您的米游社账号。',
  donate_checked_error:
    '哎呀，您提供的 cookie 似乎不可用\n回复“确认捐赠米游社账号”再试一次，或者回复“如何捐赠米游社账号”重新确认 cookie 获取步骤。\n如有疑问，请联系 bot 管理员。',
  donate_donor_list:
    '感谢以下玩家捐赠的查询用账号：\n{0}\n想要提高查询上限吗？想要解锁无限次查询自己信息的特权吗？私信我“捐赠原神账号”了解详情。'
}
