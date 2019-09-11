<!--
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
//_/
//_/  --- JavaScript 移植版 ( Update: 2018/12/11 ) ---
//_/
//_/ CopyRight(C) K.Tsunoda(AddinBox) 2001 All Rights Reserved.
//_/ ( AddinBox  http://addinbox.sakura.ne.jp/index.htm )
//_/ (   旧サイト  http://www.h3.dion.ne.jp/~sakatsu/index.htm )
//_/
//_/ この祝日判定コードは『Excel:kt関数アドイン』で使用している
//_/ ＶＢＡマクロを[JavaScript]に移植したものです。
//_/
//_/ この関数では以下の祝日変更までサポートしています。
//_/    (a) 2019年施行の「天皇誕生日の変更」 12/23⇒2/23 (補：2019年には[天皇誕生日]はありません)
//_/    (b) 2019年の徳仁親王の即位日(5/1) および
//_/       祝日に挟まれて「国民の休日」となる 4/30(平成天皇の退位日) ＆ 5/2 の２休日
//_/    (c) 2019年の「即位の礼 正殿の儀 (10/22) 」
//_/    (d) 2020年施行の「体育の日の改名」⇒スポーツの日
//_/    (e) 五輪特措法による2020年の「祝日移動」 
//_/       海の日：7/20(3rd Mon)⇒7/23, スポーツの日:10/12(2nd Mon)⇒7/24, 山の日：8/11⇒8/10
//_/
//_/ (*1)このコードを引用するに当たっては、必ずこのコメントも
//_/     一緒に引用する事とします。
//_/ (*2)他サイト上で本マクロを直接引用する事は、ご遠慮願います。
//_/     【 http://addinbox.sakura.ne.jp/holiday_logic.htm 】
//_/     へのリンクによる紹介で対応して下さい。
//_/ (*3)[ktHolidayName]という関数名そのものは、各自の環境に
//_/     おける命名規則に沿って変更しても構いません。
//_/
//_/  --- 引数 制限事項 ---
//_/  ktHolidayName にはスラッシュ区切の日付フォーマット(YYYY/M/D)で渡す。
//_/  ハイフン区切の日付フォーマット(YYYY-MM-DD)は不可。
//_/  ( 理由 )
//_/  YYYY-MM-DDは[new Date]の際に UTC に変換される(実行地域での時差が反映される)為、
//_/  ktHolidayName内の日付定数(時刻=0:0:0)と一致しない。
//_/  日本では[+9:00]の時刻が付く。アメリカ西海岸では[-8:00]で前日の日付になる。
//_/
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
//
// 2008/10/29 変数のvar指定が無く、広域変数扱いになっていたのを修正しました。
//
// 2014/5/29 「山の日」の祝日法改正
//
// 2015/7/11  JavaScript1.3 以降では[1970/1/1]以前も扱えるため、日付範囲の制限を解除
//
// 2018/2/15 「天皇誕生日の変更」の祝日法改正
//
// 2018/6/21 [体育の日⇒スポーツの日 改名] ＆ [五輪特措法による祝日移動] 改正の修正
//
// 2018/12/8 2019年の即位関連休日の修正 
//
// 2018/12/11 先頭コメントに引数制限事項を追記 


var MONDAY = 1;    // [ 日(0), 月(1), … 土(6) ]
var TUESDAY = 2;
var WEDNESDAY = 3;

var cstImplementTheLawOfHoliday = new Date("1948/7/20");   // 祝日法施行
var cstAkihitoKekkon = new Date("1959/4/10");              // 明仁親王の結婚の儀
var cstShowaTaiso = new Date("1989/2/24");                 // 昭和天皇大喪の礼
var cstNaruhitoKekkon = new Date("1993/6/9");              // 徳仁親王の結婚の儀
var cstSokuireiSeiden = new Date("1990/11/12");            // 即位礼正殿の儀(平成天皇)
var cstImplementTransferHoliday = new Date("1973/4/12");   // 振替休日施行

var cstTaii_Heisei = new Date("2019/4/30");               // 祝日ではなく「国民の休日」です
var cstSokui_Naruhito = new Date ("2019/5/1");            // 即位の日(徳仁親王)
var cst2019GW_May2nd = new Date("2019/5/2");              // 祝日ではなく「国民の休日」です
var cstSokuireiSeiden_Naruhito = new Date("2019/10/22");  // 即位礼正殿の儀(徳仁親王)

// [prmDate]には "yyyy/m/d"形式の日付文字列を渡す
function ktHolidayName(prmDate)
{
  var YesterDay;
  var HolidayName_ret;
  var MyDate = new Date(prmDate);
  var HolidayName = prvHolidayChk(MyDate);

  // ----- 振替休日の判定 (振替休日施行日:1973/4/12) -----
  // [ 対象日≠祝日/休日 ＆ 対象日＝月曜日 ]のみ、前日(＝日曜日)を祝日判定する。
  // 前日(＝日曜日)が祝日の場合は”振替休日”となる。
  // 尚、５月６日の扱いを
  //     「火曜 or 水曜(みどりの日(5/4) or 憲法記念日(5/3)の振替休日)」⇒５月ブロック内で判定済
  //     「月曜(こどもの日(5/5)の振替休日」⇒ここの判定処理で判定
  // とする事により、ここでの判定対象は『対象日が月曜日』のみ となります。
  if (HolidayName == "") {
      if (MyDate.getDay() == MONDAY) {
          if (MyDate.getTime() >= cstImplementTransferHoliday.getTime()) {
              YesterDay = new Date(MyDate.getFullYear(),
                                    MyDate.getMonth(),(MyDate.getDate()-1));
              HolidayName = prvHolidayChk(YesterDay);
              if (HolidayName != "") {
                  HolidayName_ret = "振替休日";
              } else {
                  HolidayName_ret = "";
              }
          } else {
              HolidayName_ret = "";
          }
      } else {
          HolidayName_ret = "";
      }
  } else {
      HolidayName_ret = HolidayName;
  }

  return HolidayName_ret;
}

//===============================================================

function prvHolidayChk(MyDate)
{
  var MyYear = MyDate.getFullYear();
  var MyMonth = MyDate.getMonth() + 1;    // MyMonth:1～12
  var MyDay = MyDate.getDate();
  var NumberOfWeek;
  var MyAutumnEquinox;

  var Result = "";

  if (MyDate.getTime() < cstImplementTheLawOfHoliday.getTime()) {
    return ""; // 祝日法施行(1948/7/20)以前
  } else;

  switch (MyMonth) {
// １月 //
  case 1:
      if (MyDay == 1) {
          Result = "元日";
      } else {
          if (MyYear >= 2000) {
              NumberOfWeek = Math.floor((MyDay - 1) / 7) + 1;
              if ((NumberOfWeek == 2) && (MyDate.getDay() == MONDAY)) {    // 2nd Monday
                  Result = "成人の日";
              } else;
          } else {
              if (MyDay == 15) {
                  Result = "成人の日";
              } else;
          }
      }
      break;

// ２月 //
  case 2:
      if (MyDay == 11) {
          if (MyYear >= 1967) {
              Result = "建国記念の日";
          } else;
      } else {
          if (MyDay == 23) {
              if (MyYear >= 2020) {
                  Result = "天皇誕生日";
              } else;
          } else {
              if (MyDate.getTime() == cstShowaTaiso.getTime()) {
                  Result = "昭和天皇の大喪の礼";
              } else;
          }
      }
      break;

// ３月 //
  case 3:
      if (MyDay == prvDayOfSpringEquinox(MyYear)) {  // 1948～2150以外は[99]
          Result = "春分の日";                      // が返るので､必ず≠になる
      } else;
      break;

// ４月 //
  case 4:
      if (MyDay == 29) {
          if (MyYear >= 2007) {
              Result = "昭和の日";
          } else {
              if (MyYear >= 1989) {
                  Result = "みどりの日";
              } else {
                Result = "天皇誕生日";
              }
          }
      } else {
          if (MyDate.getTime() == cstTaii_Heisei.getTime()) {  // (2019/4/30)
              Result = "国民の休日";    // 祝日に挟まれた国民の休日(平成天皇の退位日)
          } else {
              if (MyDate.getTime() == cstAkihitoKekkon.getTime()) {    // (1959/4/10)
                  Result = "皇太子明仁親王の結婚の儀";
              } else;
          }
      }
      break;

// ５月 //
  case 5:
      switch ( MyDay ) {
        case 3:  // ５月３日
          Result = "憲法記念日";
          break;
        case 4:  // ５月４日
          if (MyYear >= 2007) {
              Result = "みどりの日";
          } else {
              if (MyYear >= 1986) {
                  if (MyDate.getDay() > MONDAY) {  // 火曜 以降(火～土)
                  // 5/4が日曜日は『只の日曜』､月曜日は『憲法記念日の振替休日』(～2006年)
                      Result = "国民の休日";
                  } else;
              } else;
          }
          break;
        case 5:  // ５月５日
          Result = "こどもの日";
          break;
        case 6:  // ５月６日
          if (MyYear >= 2007) {
              if ((MyDate.getDay() == TUESDAY) || (MyDate.getDay() == WEDNESDAY)) {
                  Result = "振替休日";    // [5/3,5/4が日曜]ケースのみ、ここで判定
              } else;
          } else;
          break;
        default:  // その他
          if (MyYear == 2019) {
              if (MyDate.getTime() == cstSokui_Naruhito.getTime()) {  // (2019/5/1)
                  Result = "即位の日";      // 徳仁親王の即位の日
              } else {
                  if (MyDate.getTime() == cst2019GW_May2nd.getTime()) {  // (2019/5/2)
                      Result = "国民の休日";    // 祝日に挟まれた国民の休日
                  } else;
              }
          } else;
      }
      break;

// ６月 //
  case 6:
      if (MyDate.getTime() == cstNaruhitoKekkon.getTime()) {
          Result = "皇太子徳仁親王の結婚の儀";
      } else;
      break;

// ７月 //
  case 7:
      NumberOfWeek = Math.floor((MyDay - 1) / 7) + 1;
      if (MyYear >= 2021) {
          if ((NumberOfWeek == 3) && (MyDate.getDay() == MONDAY)) {  // 3rd Monday
              Result = "海の日";
          } else;
      } else {
          if (MyYear == 2020) {
              // 2020年はオリンピック特措法により
              //「海の日」が 7/23 / 「スポーツの日」が 7/24 に移動
              if (MyDay == 23) {
                  Result = "海の日";
              } else {
                  if (MyDay == 24) {
                      Result = "スポーツの日";
                  } else;
              }
          } else {
              if (MyYear >= 2003) {
                  if ((NumberOfWeek == 3) && (MyDate.getDay() == MONDAY)) {  // 3rd Monday
                      Result = "海の日";
                  } else;
              } else {
                  if (MyYear >= 1996) {
                      if (MyDay == 20) {
                          Result = "海の日";
                      } else;
                  } else;
              }
          }
      }
      break;

// ８月 //
  case 8:
      if (MyYear >= 2021) {
          if (MyDay == 11) {
              Result = "山の日";
          } else;
      } else {
          if (MyYear == 2020) {
              // 2020年はオリンピック特措法により「山の日」が 8/10 に移動
              if (MyDay == 10) {
                  Result = "山の日";
              } else;
          } else {
              if (MyYear >= 2016) {
                  if (MyDay == 11) {
                      Result = "山の日";
                  } else;
              } else;
          }
      }
      break;

// ９月 //
  case 9:
      //第３月曜日(15～21)と秋分日(22～24)が重なる事はない
      MyAutumnEquinox = prvDayOfAutumnEquinox(MyYear);
      if (MyDay == MyAutumnEquinox) {    // 1948～2150以外は[99]
          Result = "秋分の日";          // が返るので､必ず≠になる
      } else {
          if (MyYear >= 2003) {
              NumberOfWeek = Math.floor((MyDay - 1) / 7) + 1;
              if ((NumberOfWeek == 3) && (MyDate.getDay() == MONDAY)) {    // 3rd Monday
                  Result = "敬老の日";
              } else {
                  if (MyDate.getDay() == TUESDAY) {
                      if (MyDay == (MyAutumnEquinox - 1)) {
                          Result = "国民の休日";    // 火曜日＆[秋分日の前日]
                      } else;
                  } else;
              }
          } else {
              if (MyYear >= 1966) {
                  if (MyDay == 15) {
                      Result = "敬老の日";
                  } else;
              } else;
          }
      }
      break;

// １０月 //
  case 10:
      NumberOfWeek = Math.floor(( MyDay - 1) / 7) + 1;
      if (MyYear >= 2021) {
          if ((NumberOfWeek == 2) && (MyDate.getDay() == MONDAY)) {  // 2nd Monday
              Result = "スポーツの日";  // 2020年より改名
          } else;
      } else {
          if (MyYear == 2020) {
              // 2020年はオリンピック特措法により「スポーツの日」が 7/24 に移動
          } else {
              if (MyYear >= 2000) {
                  if ((NumberOfWeek == 2) && (MyDate.getDay() == MONDAY)) {    // 2nd Monday
                      Result = "体育の日";
                  } else {
                      if (MyDate.getTime() == cstSokuireiSeiden_Naruhito.getTime()) {  // (2019/10/22)
                          Result = "即位礼正殿の儀";      // 徳仁親王
                      } else;
                  }
              } else {
                  if (MyYear >= 1966) {
                      if (MyDay == 10) {
                          Result = "体育の日";
                      } else;
                  } else;
              }
          }
      }
      break;

// １１月 //
  case 11:
      if (MyDay == 3) {
          Result = "文化の日";
      } else {
          if (MyDay == 23) {
              Result = "勤労感謝の日";
          } else {
              if (MyDate.getTime() == cstSokuireiSeiden.getTime()) {
                  Result = "即位礼正殿の儀";    // 平成天応
              } else;
          }
      }
      break;

// １２月 //
  case 12:
      if (MyDay == 23) {
          if ((MyYear >= 1989) && (MyYear <= 2018)) {
              Result = "天皇誕生日";  // 平成天皇
          } else;
      } else;
      break;
  }

  return Result;
}

//===================================================================
// 春分/秋分日の略算式は
// 『海上保安庁水路部 暦計算研究会編 新こよみ便利帳』
// で紹介されている式です。
function prvDayOfSpringEquinox(MyYear)
{
  var SpringEquinox_ret;

  if (MyYear <= 1947) {
      SpringEquinox_ret = 99;    //祝日法施行前
  } else {
      if (MyYear <= 1979) {
          // Math.floor 関数は[VBAのInt関数]に相当
          SpringEquinox_ret = Math.floor(20.8357 + 
            (0.242194 * (MyYear - 1980)) - Math.floor((MyYear - 1980) / 4));
      } else {
          if (MyYear <= 2099) {
              SpringEquinox_ret = Math.floor(20.8431 + 
                (0.242194 * (MyYear - 1980)) - Math.floor((MyYear - 1980) / 4));
          } else {
              if (MyYear <= 2150) {
                  SpringEquinox_ret = Math.floor(21.851 + 
                    (0.242194 * (MyYear - 1980)) - Math.floor((MyYear - 1980) / 4));
              } else {
                  SpringEquinox_ret = 99;    //2151年以降は略算式が無いので不明
              }
          }
      }
  }
  return SpringEquinox_ret;
}

//=====================================================================
function prvDayOfAutumnEquinox(MyYear)
{
  var AutumnEquinox_ret;

  if (MyYear <= 1947) {
      AutumnEquinox_ret = 99; //祝日法施行前
  } else {
      if (MyYear <= 1979) {
          // Math.floor 関数は[VBAのInt関数]に相当
          AutumnEquinox_ret = Math.floor(23.2588 + 
            (0.242194 * (MyYear - 1980)) - Math.floor((MyYear - 1980) / 4));
      } else {
          if (MyYear <= 2099) {
              AutumnEquinox_ret = Math.floor(23.2488 + 
                (0.242194 * (MyYear - 1980)) - Math.floor((MyYear - 1980) / 4));
          } else {
              if (MyYear <= 2150) {
                  AutumnEquinox_ret = Math.floor(24.2488 + 
                    (0.242194 * (MyYear - 1980)) - Math.floor((MyYear - 1980) / 4));
              } else {
                  AutumnEquinox_ret = 99;    //2151年以降は略算式が無いので不明
              }
          }
      }
  }
  return AutumnEquinox_ret;
}

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
//_/ CopyRight(C) K.Tsunoda(AddinBox) 2001 All Rights Reserved.
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/

-->
