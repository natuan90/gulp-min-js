$(function(){
  var $dataXml;
    $.ajax({
      url : '/information/infodata.html',
      type : 'get',
      dataType : 'html',
      cache : false,
      success : function(data) {
        $dataHtml = $($.parseHTML(data));

        //TOPページお知らせ4件 お知らせ本文から最新４件を抽出して表示
        var $TopInfoList = ""; //必要要素格納変数
        var $TopLinkDir = ""; //月別のパス生成用変数
        var $TopInfoCnt = 4; //表示件数
        var $TopFlag =""; //TOPページ表示用フラグ

        //#InfoBodyの中の.info_monthを順に検索
        $dataHtml.filter('#InfoBody').children(".info_month").each(function() {
          //全体の中で表示件数になったら抜ける
          if ($TopInfoCnt == 0){
            return false;
          }

          //年月ごとのDIV#ID取得してYYYY/MM.htmlに置換
          $TopLinkDir = $(this).attr("id").replace(/(\d{4})(\d{2})/, "$1/$2.html");

          //.info_bodyの中のお知らせタイトル、本文、ID（ハッシュ用）を整形して必要件数格納
          $(this).find(".info_body").each(function(){
            // data-top属性が"on"だったらTOPページに表示する
            $TopFlag = $(this).attr("data-top");
            if ($TopFlag == "on") {
              $TopInfoList += '<dt><span class="day">' + $(this).find(".information_data").text() + '</span></dt>\n' + '<dd><span><a href="/information/' + $TopLinkDir + '#' + $(this).attr("id") + '" rel="nofollow">' + $(this).find(".head_title").text()+ "</a></span></dd>\n";
              $TopInfoCnt --;
              if ($TopInfoCnt == 0){ //.info_bodyを表示件数分回したら抜ける
                return false;
              }
            }
          });
        });
        $("#top_info").append($TopInfoList);

        var $curl =location.pathname;
        $("#url").append($curl);

        // URLがスラッシュで終わる or /index.html＝INDEX用処理へ
        if ($curl.match(/^\/information\/$|^\/information\/index.html/)){

          //インフォメーションINDEX
          $("#info_body_index").append($dataHtml.filter('#InfoBody')[0].innerHTML);

        // URLに/9999/99.htmlを含む＝月別アーカイブ用処理へ
        } else if ($curl.match(/\/\d{4}\/\d{2}\.html/)){

          $curl = $curl.match(/\/(\d{4})\/(\d{2})\.html/);
          var ym = "#" + $curl[1] + $curl[2];

          $("#page").append($curl[1]+"年"+$curl[2]+"月アーカイブページです");

          //インフォメーション月別
          if($dataHtml.filter('#InfoBody').children(ym).length > 0){
            $("#info_body_page").append($dataHtml.filter('#InfoBody').children(ym));
          } else {
            location.href = "/information/";
          }
        }

        //インフォメーションサイドナビ
        $("#side_nav").append($dataHtml.filter('#InfoNav')[0].innerHTML);

        //ハッシュからスクロール
        if(location.hash && $(location.hash).length){
          var $linkid = location.hash;
          $("html,body").animate({scrollTop:$($linkid).offset().top},200);
        }

      },
      error : function() {
//        alert("データが正常に取得できませんでした") ;
      }
    });
})