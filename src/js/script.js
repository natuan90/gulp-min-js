$(window).load(function () {
  'use strict';

  /*
   * 高さ揃え tile.js
   */
  var numCol2 = 2,
      numCol3 = 3,
      numCol4 = 4,
      numCol5 = 5,
      $col2 = $('.js_col02'),
      $col3 = $('.js_col03'),
      $col4 = $('.js_col04'),
      $col5 = $('.js_col05'),
      $colAll = $('.js_colAll'),
      col = '.col';

  // 2カラム
  $col2.each(function () {
    $(this).find(col).tile(numCol2);
  });
  // 3カラム
  $col3.each(function () {
    $(this).find(col).tile(numCol3);
  });
  // 4カラム
  $col4.each(function () {
    $(this).find(col).tile(numCol4);
  });
  // 5カラム
  $col5.each(function () {
    $(this).find(col).tile(numCol5);
  });
  // 全カラム
  $colAll.each(function () {
    $(this).find(col).tile();
  });
});

/*
 * 販売促進ポップアップ
 */
$(function () {
  new airlink.view.common.promo.popup.pc.PopupSchedulerView().begin();
});