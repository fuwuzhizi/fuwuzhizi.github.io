// 加载导航栏和尾部栏
$(document).ready(function () {
  $('#navbar-placeholder').load('/navbar.html', function () {
    var type = $("#navbar-placeholder").attr('type');
    if (type) {
      if (type == '其它') {
        $(".nav-link:contains('" + type + "')").attr({
          "class": "nav-link dropdown-toggle active",
        })
      } else {
        $(".nav-link:contains('" + type + "')").attr({
          "class": "nav-link active",
          "href": "#"
        })
      }
    }
  });
  $('#copyright-placeholder').load('/copyright.html');
});