// 海外旅行特集用カルーセル
$(document).ready(function() {
  $("#slide-plural").owlCarousel({
    itemsCustom : [[0, 2]],
    autoPlay: 3000,
    pagination : true,
    navigation : false,
    navigationText : ["&nbsp;","&nbsp;"]
  });
});