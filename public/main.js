$app = $('#app')
$app.html('')

function addMainTitle(uid) {
  $app.prepend($('<h1>', { text: `用户 ${uid} 的玩家信息` }))
}

/**
 * @function normalData 神瞳数量等
 * @param {Object} data
 */
function makeNormalDataList(data) {
  function generateOne(times, desc) {
    return $('<div>', { class: 'item' }).append(
      $('<div>', { class: 'times', text: times }),
      $('<div>', { class: 'desc', text: desc })
    )
  }

  data = data || {
    active_day_number: 0,
    achievement_number: 0,
    win_rate: 0,
    anemoculus_number: 0,
    geoculus_number: 0,
    avatar_number: 0,
    way_point_number: 0,
    domain_number: 0,
    spiral_abyss: '1-1',
    precious_chest_number: 0,
    luxurious_chest_number: 0,
    exquisite_chest_number: 0,
    common_chest_number: 0,
  }

  function eventName(key) {
    let names = {
      active_day_number: '活跃天数',
      achievement_number: '达成成就',
      win_rate: '?',
      anemoculus_number: '风神瞳',
      geoculus_number: '岩神瞳',
      avatar_number: '获得角色数',
      way_point_number: '解锁传送点',
      domain_number: '解锁秘境',
      spiral_abyss: '深境螺旋',
      precious_chest_number: '珍贵宝箱',
      luxurious_chest_number: '华丽宝箱',
      exquisite_chest_number: '精致宝箱',
      common_chest_number: '普通宝箱',
    }
    return names?.[key] || key
  }

  let $dataList = $('<div>', { class: 'normalDataList' })

  $.each(data, (name, value) => {
    $dataList.append(generateOne(value, eventName(name)))
  })

  $app.append(
    $('<div>', { class: 'contentBox' }).append(
      $('<div>', { class: 'title', text: '基本信息' }),
      $('<div>', {}).append($dataList)
    )
  )
}

function singleCharacterCard(chara) {
  let { rarity, image: avatar, name, level, element, fetter } = chara
  const $card = $('<div>', { class: `charaCard rarity-${rarity}` })
  $card.append(
    $('<img>', { src: avatar, alt: `${name}头像.png` }),
    $('<div>', { class: 'charaName', text: name }),
    $('<div>', { class: 'charaLevel', text: `${level}级` }),
    $('<div>', { class: 'charaFetter', text: `好感 ${fetter}` })
  )
  return $card
}

function makeCharactersList(charas) {
  const $container = $('<div>', { class: 'charasList' })

  $.each(charas, (index, item) => {
    $container.append(singleCharacterCard(item))
  })

  $app.append(
    $('<div>', { class: 'contentBox' }).append(
      $('<div>', { class: 'title', text: '角色列表' }),
      $('<div>', {}).append($container)
    )
  )
}

function Profile({ uid, userInfo }) {
  addMainTitle(uid)
  makeNormalDataList(userInfo.stats)
  makeCharactersList(userInfo.avatars)
  return awaitImages()
}

function awaitImages() {
  let images = $('img')
  let promises = []

  function loadImage(img) {
    return new Promise(function(resolve, reject) {
      if (img.complete) {
        resolve(img)
      }
      img.onload = function() {
        resolve(img)
      }
      img.onerror = function(e) {
        resolve(img)
      }
    })
  }

  for (let i = 0; i < images.length; i++) {
    promises.push(loadImage(images[i]))
  }

  return Promise.all(promises)
}
