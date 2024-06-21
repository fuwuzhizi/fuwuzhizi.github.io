window.live2d_settings = Array();

// 提示消息选项
live2d_settings['showCopyMessage'] = true;         // 显示 复制内容 提示
live2d_settings['showWelcomeMessage'] = true;         // 显示进入面页欢迎词

//看板娘样式设置
live2d_settings['waifuSize'] = '280x250';    // 看板娘大小，例如 '280x250', '600x535'
live2d_settings['waifuTipsSize'] = '250x70';     // 提示框大小，例如 '250x70', '570x150'
live2d_settings['waifuFontSize'] = '12px';       // 提示框字体，例如 '12px', '30px'
live2d_settings['waifuMinWidth'] = '768px';      // 面页小于 指定宽度 隐藏看板娘，例如 'disable'(禁用), '768px'
live2d_settings['waifuEdgeSide'] = 'left:0';     // 看板娘贴边方向，例如 'left:0'(靠左 0px), 'right:30'(靠右 30px)
live2d_settings['waifuDraggable'] = 'disable';    // 拖拽样式，例如 'disable'(禁用), 'axis-x'(只能水平拖拽), 'unlimited'(自由拖拽)
live2d_settings['waifuDraggableRevert'] = true;         // 松开鼠标还原拖拽位置，可选 true(真), false(假)

/****************************************************************************************************/

String.prototype.render = function (context) {
  var tokenReg = /(\\)?\{([^\{\}\\]+)(\\)?\}/g;

  return this.replace(tokenReg, function (word, slash1, token, slash2) {
    if (slash1 || slash2) { return word.replace('\\', ''); }

    var variables = token.replace(/\s/g, '').split('.');
    var currentObject = context;
    var i, length, variable;

    for (i = 0, length = variables.length; i < length; ++i) {
      variable = variables[i];
      currentObject = currentObject[variable];
      if (currentObject === undefined || currentObject === null) return '';
    }
    return currentObject;
  });
};

function empty (obj) { return typeof obj == "undefined" || obj == null || obj == "" ? true : false }
function getRandText (text) { return Array.isArray(text) ? text[Math.floor(Math.random() * text.length + 1) - 1] : text }

function showMessage (text, timeout, flag) {
  if (flag || sessionStorage.getItem('waifu-text') === '' || sessionStorage.getItem('waifu-text') === null) {
    if (Array.isArray(text)) text = text[Math.floor(Math.random() * text.length + 1) - 1];

    if (flag) sessionStorage.setItem('waifu-text', text);

    $('.waifu-tips').stop();
    $('.waifu-tips').html(text).fadeTo(200, 1);
    if (timeout === undefined) timeout = 5000;
    hideMessage(timeout);
  }
}

function hideMessage (timeout) {
  $('.waifu-tips').stop().css('opacity', 1);
  if (timeout === undefined) timeout = 5000;
  window.setTimeout(function () { sessionStorage.removeItem('waifu-text') }, timeout);
  $('.waifu-tips').delay(timeout).fadeTo(200, 0);
}

function initModel (waifuPath, type) {
  /* 判断 JQuery */
  if (typeof ($.ajax) != 'function') typeof (jQuery.ajax) == 'function' ? window.$ = jQuery : console.log('[Error] JQuery is not defined.');

  /* 加载看板娘样式 */
  live2d_settings.waifuSize = live2d_settings.waifuSize.split('x');
  live2d_settings.waifuTipsSize = live2d_settings.waifuTipsSize.split('x');
  live2d_settings.waifuEdgeSide = live2d_settings.waifuEdgeSide.split(':');

  $("#live2d").attr("width", live2d_settings.waifuSize[0]);
  $("#live2d").attr("height", live2d_settings.waifuSize[1]);
  $(".waifu-tips").width(live2d_settings.waifuTipsSize[0]);
  $(".waifu-tips").height(live2d_settings.waifuTipsSize[1]);
  $(".waifu-tips").css("top", live2d_settings.waifuToolTop);
  $(".waifu-tips").css("font-size", live2d_settings.waifuFontSize);

  if (live2d_settings.waifuEdgeSide[0] == 'left') $(".waifu").css("left", live2d_settings.waifuEdgeSide[1] + 'px');
  else if (live2d_settings.waifuEdgeSide[0] == 'right') $(".waifu").css("right", live2d_settings.waifuEdgeSide[1] + 'px');

  window.waifuResize = function () { $(window).width() <= Number(live2d_settings.waifuMinWidth.replace('px', '')) ? $(".waifu").hide() : $(".waifu").show(); };
  if (live2d_settings.waifuMinWidth != 'disable') { waifuResize(); $(window).resize(function () { waifuResize() }); }

  try {
    if (live2d_settings.waifuDraggable == 'axis-x') $(".waifu").draggable({ axis: "x", revert: live2d_settings.waifuDraggableRevert });
    else if (live2d_settings.waifuDraggable == 'unlimited') $(".waifu").draggable({ revert: live2d_settings.waifuDraggableRevert });
    else $(".waifu").css("transition", 'all .3s ease-in-out');
  } catch (err) { console.log('[Error] JQuery UI is not defined.') }

  if (typeof (waifuPath) == "object") loadTipsMessage(waifuPath); else {
    $.ajax({
      cache: true,
      url: waifuPath == '' ? live2d_settings.tipsMessage : (waifuPath.substr(waifuPath.length - 15) == 'waifu-tips.json' ? waifuPath : waifuPath + 'waifu-tips.json'),
      dataType: "json",
      success: function (result) { loadTipsMessage(result); }
    });
  }

  if (waifuPath === undefined) waifuPath = '';
  loadlive2d('live2d', '/assets/koharu/koharu.model.json');
}

function loadTipsMessage (result) {
  window.waifu_tips = result;

  $.each(result.mouseover, function (index, tips) {
    $(document).on("mouseover", tips.selector, function () {
      var text = getRandText(tips.text);
      text = text.render({ text: $(this).text() });
      showMessage(text, 3000);
    });
  });
  $.each(result.click, function (index, tips) {
    $(document).on("click", tips.selector, function () {
      var text = getRandText(tips.text);
      text = text.render({ text: $(this).text() });
      showMessage(text, 3000, true);
    });
  });
  $.each(result.seasons, function (index, tips) {
    var now = new Date();
    var after = tips.date.split('-')[0];
    var before = tips.date.split('-')[1] || after;

    if ((after.split('/')[0] <= now.getMonth() + 1 && now.getMonth() + 1 <= before.split('/')[0]) &&
      (after.split('/')[1] <= now.getDate() && now.getDate() <= before.split('/')[1])) {
      var text = getRandText(tips.text);
      text = text.render({ year: now.getFullYear() });
      showMessage(text, 6000, true);
    }
  });

  if (live2d_settings.showCopyMessage) {
    $(document).on('copy', function () {
      showMessage(getRandText(result.waifu.copy_message), 5000, true);
    });
  }

  window.showWelcomeMessage = function (result) {
    var text;
    var now = (new Date()).getHours();
    if (now > 23 || now <= 5) text = getRandText(result.waifu.hour_tips['t23-5']);
    else if (now > 5 && now <= 7) text = getRandText(result.waifu.hour_tips['t5-7']);
    else if (now > 7 && now <= 11) text = getRandText(result.waifu.hour_tips['t7-11']);
    else if (now > 11 && now <= 14) text = getRandText(result.waifu.hour_tips['t11-14']);
    else if (now > 14 && now <= 17) text = getRandText(result.waifu.hour_tips['t14-17']);
    else if (now > 17 && now <= 19) text = getRandText(result.waifu.hour_tips['t17-19']);
    else if (now > 19 && now <= 21) text = getRandText(result.waifu.hour_tips['t19-21']);
    else if (now > 21 && now <= 23) text = getRandText(result.waifu.hour_tips['t21-23']);
    else text = getRandText(result.waifu.hour_tips.default);
    showMessage(text, 6000);
  }; if (live2d_settings.showWelcomeMessage) showWelcomeMessage(result);
}
