$(function () {
/*
原則s.側が正、リリースする際は下記を同期する
docs/js/pc/history/history.js
trunk/pc/js/history.js
*/
    'use strict';
    var $document = $(document);
    var urlTour = '/tour';
    var urlSupport = '/common';
    var urlAbhotel = '/hotel';

    // idは#付きで。
    var getUnderScoreTemplateString = function(id) {
        var str = $(id).html() || '';
        str = str.split('\r\n').join('\n');
        str = str.split('\r').join('\n');
        return _.map(str.split('\n'), function(s){ return $.trim(s);}).join('');
    };

    // FIXME common.jsを読み込むようになったら不要
    var objectToQueryParameters = function(obj, separator) {
        var sep = separator ? separator : ',';
        var params = _.reduce(_.keys(obj), function(memo, key) {
            if (_.isArray(memo[key])) {
                memo[key] = memo[key].join(sep);
            }
            return memo;
        }, $.extend(true, {}, obj));
        return $.param(params);
    };

    var HistoryModel,
        HistoryView,
        // 閲覧履歴の表示用
        HistoryDetailModel,
        HistoryDetailCollection,
        HistoryDetailView,
        // 検索条件履歴の表示用
        HistorySearchModel,
        HistorySearchCollection,
        HistorySearchView,
        // AIR検索条件履歴の表示用
        HistorySearchAirModel,
        HistorySearchAirCollection,
        HistorySearchAirView,
        // 海外ホテル用
        HistoryAbhotelModel,
        // 海外ホテル閲覧履歴の表示用
        HistoryDetailAbhotelModel,
        HistoryDetailAbhotelCollection,
        HistoryDetailAbhotelView,
        // 海外ホテル検索条件履歴の表示用
        HistorySearchAbhotelModel,
        HistorySearchAbhotelCollection,
        HistorySearchAbhotelView;
    var mapUsePicture = [];

    HistoryModel = Backbone.Model.extend({
        _formatMoney: function(num) {
            var str = (num + '').replace(/,/g, '');
            while(str != (str = str.replace(/^(-?\d+)(\d{3})/, '$1,$2')));
            return str;
        },
        _formatNoneLabel: function(str) {
            return !!str ? str : '指定なし';
        }
    });

    HistoryDetailModel = HistoryModel.extend({
        parse : function (tour) {
            return {
                lbl_icon : tour.lbl_icon,
                link : 'javascript:void(0)',
                clicklink : urlTour + '/detail?' + this._formatParams(tour),
                cty : tour.dest_city_name,
                airport : tour.dep_city_name + '発',
                day : tour.trip_days + '日間',
                ex : this._formatTourStartDate(tour.tour_start_date),
                htl_name : '【ホテル】' + tour.htl_name,
                carrier_name : '【航空会社】' + tour.carrier_name,
                options : this._formatOptions(tour),
                room_num : '【部屋】' + tour.room_num + '部屋',
                pax_num : '【人数】' + this._formatPaxNum(tour),
                adult_fee : this._formatMoney(tour.adult_tour_fee - tour.adult_discount_fee),
                baseLogParams : this._formatBaseLogParams(tour),
                cty_code : tour.dest_city_cd,
                picture_num : tour.picture_num
            };
        },
        _formatParams : function (tour) {
            return _([
                'tourCd=' + tour.tour_cd,
                'flight=' + tour.air_seq_id,
                'hotelSeqId=' + tour.land_htl_seq_id,
                'pickup=' + tour.land_transfer_seq_id,
                'fromDate=' + tour.tour_start_date,
                'rooms=' + encodeURIComponent(tour.assignment_of_rooms),
                'option=' + tour.option_param
            ]).join('&');
        },
        _formatTourStartDate : function (s) {
            return _([
                s.length >= 6 ? +(s.substr(4,2)) + '月' : '指定なし',
                s.length === 8 ? +(s.substr(6,2)) + '日' : '指定なし'
            ]).compact().join('');
        },
        _formatOptions : function (tour) {
            return _([
                '【送迎】',
                !!tour.transfer_kind_name ? tour.transfer_kind_name : '指定なし'
            ]).compact().join('');
        },
        _formatPaxNum : function (tour) {
            // 人数
            return _([
                parseInt(tour.adult_num) > 0 ? '大人' + tour.adult_num + '名' : '',
                parseInt(tour.child_num) > 0 ? '子供' + tour.child_num + '名' : '',
                parseInt(tour.child_no_bed_num) > 0 ? 'ベッド利用なし子供' + tour.child_no_bed_num + '名' : '',
                parseInt(tour.infant_num) > 0 ? '幼児' + tour.infant_num + '名' : ''
            ]).compact().join('、');
        },
        _formatBaseLogParams: function (tour) {
            var ret = {};
            ret.item01 = tour.dest_city_cd;
            ret.item02 = tour.dep_city_cd;
            ret.item03 = tour.tour_cd;
            return ret;
        }
    });

    HistorySearchModel = HistoryModel.extend({
        parse : function (tour) {
            return {
                lbl_icon : tour.lbl_icon,
                link : 'javascript:void(0)',
                clicklink : urlTour + '/list?' + this._formatParams(tour),
                cty : this._formatCity(tour),
                airport : this._formatAirport(tour),
                day : tour.lbl_day,
                ex : tour.lbl_ex,
                htl_name : '【ホテル】 ' + this._formatNoneLabel(tour.htl_name),
                htl_grade : '【ホテルグレード】 ' + this._formatHtlGrade(tour),
                carrier_name : '【航空会社】 ' + this._formatNoneLabel(tour.lbl_flt_carrier),
                options : this._formatOptions(tour),
                pax_num : '【人数】 ' + this._formatPaxNum(tour),
                price : '【予算】 ' + this._formatMoney(tour),
                baseLogParams : this._formatBaseLogParams(tour),
                cty_code : tour.priority_cty_cd,
                picture_num : tour.picture_num
            };
        },
        _formatParams : function (tour) {
            var keys = ['from_date', 'dep', 'area', 'cty', 'min_date', 'max_date', 'min_price', 'max_price',
                        'number_room', 'travelers', 'tour_tags', 'min_htl_gd', 'max_htl_gd', 'htl_area', 'htl_cd',
                        'htl_chr', 'rom_chr', 'flt_carrier', 'flt_class', 'flt_time_go', 'flt_time_rtn', 'flt_chr',
                        'trf_type', 'opt'];
            return _.chain(keys)
                        .map(function (key) { return key + '=' + encodeURIComponent(decodeURIComponent(tour[key])); })
                        .join('&')
                        .value();
        },
        _formatAirport : function (tour) {
            var tmpList = tour.lbl_dep.split( '（' );
            return (tmpList.length > 1 ? tmpList[0] : tour.lbl_dep) + '発';
        },
        _formatCity : function (tour) {
            if ( !!tour.lbl_cty || !!tour.lbl_area )
                return tour.lbl_cty.split( ',' ).length > 0 ? tour.lbl_cty : tour.lbl_area;
            else
                return '';
        },
        _formatOptions : function (tour) {
            return _([
                '【往路】',
                !!tour.lbl_flt_time_go ? tour.lbl_flt_time_go : '指定なし',
                '　',
                '【復路】',
                !!tour.lbl_flt_time_rtn ? tour.lbl_flt_time_rtn : '指定なし'
            ]).compact().join('');
        },
        _formatPaxNum : function (tour) {
            // 人数
            return _([
                parseInt(tour.adult_num) > 0 ? '大人' + tour.adult_num + '名' : '',
                parseInt(tour.child_num) > 0 ? '子供' + tour.child_num + '名' : '',
                parseInt(tour.child_no_bed_num) > 0 ? 'ベッド利用なし子供' + tour.child_no_bed_num + '名' : '',
                parseInt(tour.infant_num) > 0 ? '幼児' + tour.infant_num + '名' : ''
            ]).compact().join('、');
        },
        _formatHtlGrade : function (tour) {
            if ( !(parseInt(tour.min_htl_gd) > 0) && !(parseInt(tour.max_htl_gd) > 0) ) return '指定なし';
            // ホテルグレード
            return _([
                parseInt(tour.min_htl_gd) > 0 ? '★★★★★'.slice(-1*tour.min_htl_gd) : '指定なし',
                '～',
                parseInt(tour.max_htl_gd) > 0 ? '★★★★★'.slice(-1*tour.max_htl_gd) : '指定なし'
            ]).compact().join('');
        },
        _formatMoney : function (tour) {
            // 金額
            return _([
                parseInt(tour.min_price) > 0 ? this._formatMoney(tour.min_price) + '円' : '指定なし',
                '～',
                parseInt(tour.max_price) > 0 ? this._formatMoney(tour.max_price) + '円' : '指定なし'
            ]).compact().join('');
        },
        _formatBaseLogParams : function (tour) {
            var ret = {};
            var tmpList = tour.cty.split( ',' );
            if (!!tour.cty) {
                ret.item01 = tmpList.length > 1 ? _.sortBy(tmpList, function(s){ return s.charCodeAt(); }).join('_') : tour.cty;
            } else {
                ret.item01 = tour.area;
            }
            ret.item02 = tour.dep;
            return ret;
        }
    });

    HistoryDetailCollection = Backbone.Collection.extend({
        url : urlTour + '/history/get_tour_history_list?num=3',
        model : HistoryDetailModel,
        parse : function (resp) {
            return resp.tour_history_list;
        }
    });

    HistorySearchCollection = Backbone.Collection.extend({
        url : urlSupport + '/history/get_abtour_auto_history_search',
        model : HistorySearchModel,
        parse : function (resp) {
            return resp.history_list;
        }
    });

    HistoryView = Backbone.View.extend({
        _formatLongString : function (str, padLen, padStr) {
            if (str.length > padLen) {
                return str.substring(0, padLen - 1) + padStr;
            }
            return str;
        },
        _hasElements : function($elems) {
            return _.any($elems, function($elem) { return $elem.size(); });
        },
        _sendLog : function (eventName, params) {
             if (!window.baselog||!eventName) return;
             var sendParams = $.extend(true, {}, params, {event: eventName}, {
                 dispId: window.baselog.params.dispId,
                 dispPath: window.baselog.params.dispPath,
                 referer: window.baselog.params.referer
             });
             window.baselog.params = sendParams;
             window.baselog.submit(eventName);
        },
        _getPicturePath : function (cityCd, max_num) {
            if (!cityCd || !max_num) {
                cityCd = 'xxx';
                max_num = 10;
            }
            if (!!max_num && max_num > 0) {
                var use_num = _.random(0, max_num - 1);
                return [
                    '//s.skygate.co.jp', // ドメイン
                    '/images/recommend_auto/', // ここからディレクトリ
                    cityCd.toLowerCase(),
                    '/',
                    cityCd.toLowerCase(), // ここからファイル名
                    '_',
                    this._getFileNumber(cityCd.toLowerCase(), max_num),
                    '.jpg'
                ].join('');
            }
            // デフォルトイメージ
            return '//s.skygate.co.jp/images/common/noimage_op.jpg';
        },
        _delegateDefaultImageLoading : function($image) {
            var triedToGetAlternativeImage = false;
            var that = this;
            $image.load(function() {
                $(this).show();
            }).error(function() {
                if (triedToGetAlternativeImage) {
                    return;
                }
                var defaultPicturePath = that._getPicturePath();
                $(this).attr('src', defaultPicturePath).show();
                triedToGetAlternativeImage = true;
            });
        },
        _getFileNumber : function (cityCd, max_num) {
            var useFileNoList = [];
            var retFileNo;
            // 使用済み一覧から、都市コードに一致したものを取得
            useFileNoList = _.filter(mapUsePicture, function(v){ return v.indexOf(cityCd) !== -1; });
            // 都市の最大ファイル数をオーバーした場合、使用済み一覧をリセット
            if( useFileNoList.length >= max_num ) {
                mapUsePicture = _.reject(mapUsePicture, function(v){ return v.indexOf(cityCd) !== -1; });
                useFileNoList = _.range(0);
            }

            // 都市別の利用ファイルNo一覧を取得
            useFileNoList = _.map(useFileNoList, function(str){ return Number(str.substr(str.length-2,2)); });
            retFileNo = ('0' + _.first(_.shuffle(_.difference(_.range(max_num), useFileNoList)))).slice(-2);
            // 利用ファイルの追加（都市別のファイルNo一覧から、利用ファイルNo一覧を除外したリストをシャッフルした１件目を利用）
            mapUsePicture.push(cityCd + retFileNo);

            return retFileNo;
        },
        _formatBaseLogParamsAGCD : function (params, strAGCDparams) {
            return $.extend(true, {}, params, {item04: strAGCDparams});
        },
        _showDefaultCommon : function (target, eventName) {
            var $target = $(target);
            var urlForDefaultBanner = $target.attr('historyDefaultLoad') || $target.attr('data-history-default-load'); // note: jQuery.data() is not available on jQuery ver.1.4.2 used in A/O top at 20140919
            if (!urlForDefaultBanner) {
                $target.remove();
            }
            if ( $target.hasClass("recommendBox") ) {
                $target.removeClass("recommendBox");
                $target.addClass("bannerBox");
            }

            var that = this;
            $.ajax({
                url: urlForDefaultBanner,
                dataType: 'text',
                success: function(data) {
                    var html = data.replace(/<SCRIPT.*<\/SCRIPT>/g,'');
                    $target.html(html);
                    that._sendLog(eventName, that._formatBaseLogParamsAGCD({}, $target.attr('historyAgentCode') || $target.attr('data-history-agent-code'))); // note: jQuery.data() is not available on jQuery ver.1.4.2 used in A/O top at 20140919
                },
                error: function() {
                    $target.remove();
                }
            });
        }
    });

    HistoryDetailView = HistoryView.extend({
        initialize: function () {
            var $elems = this._getElements();
            if (!this._hasElements($elems)) {
                return;
            }

            var that = this;
            var optionAjax =  {
                cache : false,
                timeout : 10000,
                success : function () {
                    that.render();
                },
                error : function () {
                    that._showDefaults(that._getElements());
                }
            };
            var originAjax = Backbone.ajax;
            Backbone.ajax = function (options) {
                var success = options.success;
                var error = options.error;
                //work around options.success call 2 times.
                delete options.success;
                delete options.error;
                var promise = skygate.util.callAuthApi(options);
                success && promise.done(success);
                error && promise.fail(error);
                return promise;
            };
            this.collection.fetch(optionAjax);
            Backbone.ajax = originAjax;
        },
        render: function () {
            var that, models, json, $elm, $elms, i;
            that = this;
            models = this.collection.models;
            $elms = this._getElements();
            if ($elms.length > 0) {
                for (i = 0; i < $elms.length; i++) {
                    $elm = $elms[i];
                    if (models[i] && $elm.length > 0) {
                       json = models[i].toJSON();
                       json.clicklink = json.clicklink + '&AgentCode=' + $elm.attr('historyAgentCode');
                       json.img = this._getPicturePath(json.cty_code, json.picture_num);
                       $elm.html(_.template(getUnderScoreTemplateString('#historyAbtourDetailTemplate'), json));

                       // try to show alternative(default) image if necessary
                       that._delegateDefaultImageLoading($elm.find('.targetImage'));

                       json.baseLogParams = this._formatBaseLogParamsAGCD(json.baseLogParams, $elm.attr('historyAgentCode'));
                       this._sendLoadLog(json.baseLogParams); // ロード時のbaselog出力を実行
                       (function (e, p, clicklink) {
                           // クリック時のanalytics/baselog出力を登録
                           e.click(function () {
                               setTimeout(function(){ window.location.href = clicklink; }, 200);
                               var item_param = 'UMP_item_' + p.item01;
                               ga('send','event','recommend','click',item_param);
                               that._sendClickLog(p);
                           });
                       })($elm, json.baseLogParams, json.clicklink);
                    } else if ( $elm.length > 0 ) {
                        this._showDefault($elm);
                    }
                }
            }
        },
        _getElements : function() {
            return _([$('#historyAbtourDetail1'),
                      $('#historyAbtourDetail2'),
                      $('#historyAbtourDetail3')]).compact();
        },
        _showDefaults : function ($elms) {
            var i;
            if ($elms.length > 0) {
                for (i = 0; i < $elms.length; i++) {
                    if ($elms[i].length > 0) {
                        this._showDefault($elms[i]);
                    }
                }
            }
        },
        _showDefault : function (target) {
            this._showDefaultCommon(target,'RECOMMEND_DETAIL_ABTOUR_LOAD');
        },
        _sendLoadLog : function (params) {
             this._sendLog('RECOMMEND_DETAIL_ABTOUR_LOAD', params);
        },
        _sendClickLog : function (params) {
             this._sendLog('RECOMMEND_DETAIL_ABTOUR_CLICK', params);
        }
    });

    HistorySearchView = HistoryView.extend({
        initialize: function () {
            var $elems = this._getElements();
            if (!this._hasElements($elems)) {
                return;
            }

            var that = this;
            var originAjax = Backbone.ajax;
            var optionAjax = {
                cache : false,
                timeout : 10000,
                success : function () {
                    that.render();
                },
                error : function () {
                    that._showDefaults(that._getElements());
                }
            };
            Backbone.ajax = function (options) {
                var success = options.success;
                var error = options.error;
                //work around options.success call 2 times.
                delete options.success;
                delete options.error;
                var promise = skygate.util.callAuthApi(options);
                success && promise.done(success);
                error && promise.fail(error);
                return promise;
            };
            this.collection.fetch(optionAjax);
            Backbone.ajax = originAjax;
        },
        render: function () {
            var that, models, json, $elm, $elms, i;
            that = this;
            models = this.collection.models;
            $elms = this._getElements();
            if ($elms.length > 0) {
                for (i = 0; i < $elms.length; i++) {
                    $elm = $elms[i];
                    if (models[i] && $elm.length > 0) {
                       json = models[i].toJSON();
                       json.clicklink = json.clicklink + '&AgentCode=' + $elm.attr('historyAgentCode');
                       json.img = this._getPicturePath(json.cty_code, json.picture_num);
                       $elm.html(_.template(getUnderScoreTemplateString('#historyAbtourSearchTemplate'), json));

                       // try to show alternative(default) image if necessary
                       that._delegateDefaultImageLoading($elm.find('.targetImage'));

                       json.baseLogParams = this._formatBaseLogParamsAGCD(json.baseLogParams, $elm.attr('historyAgentCode'));
                       this._sendLoadLog(json.baseLogParams); // ロード時のbaselog出力を実行
                       (function (e, p, clicklink) {
                           // クリック時のanalytics/baselog出力を登録
                           e.click(function () {
                               setTimeout(function(){ window.location.href = clicklink; }, 200);
                               var item_param = 'UMP_search_' + p.item01;
                               ga('send','event','recommend','click',item_param);
                               that._sendClickLog(p);
                           });
                       })($elm, json.baseLogParams, json.clicklink);
                    } else if ( $elm.length > 0 ) {
                        this._showDefault($elm);
                    }
                }
            }
        },
        _getElements : function() {
            return _([$('#historyAbtourSearch1'),
                      $('#historyAbtourSearch2'),
                      $('#historyAbtourSearch3')]).compact();
        },
        _showDefaults : function ($elms) {
            var i;
            if ($elms.length > 0) {
                for (i = 0; i < $elms.length; i++) {
                    if ($elms[i].length > 0) {
                        this._showDefault($elms[i]);
                    }
                }
            }
        },
        _showDefault : function (target) {
            this._showDefaultCommon(target,'RECOMMEND_SEARCH_ABTOUR_LOAD');
        },
        _sendLoadLog : function (params) {
             this._sendLog('RECOMMEND_SEARCH_ABTOUR_LOAD', params);
        },
        _sendClickLog : function (params) {
             this._sendLog('RECOMMEND_SEARCH_ABTOUR_CLICK', params);
        }
    });

    HistorySearchAirModel = HistoryModel.extend({
        parse : function (air) {

            var lbl_detail1, lbl_detail2;
            if (air.lbl_search_kind.substr(0,1) == "0"){  //国内発
                lbl_detail1 = '【航空会社】 ' + air.lbl_carriers;
                lbl_detail2 = '【出発時間帯】 ' + air.lbl_dep_time;
            } else if (air.lbl_search_kind.substr(0,1) == "1"){  //海外発
                lbl_detail1 = '【座席クラス】 ' + air.lbl_seat_class;
                lbl_detail2 = '【直行・経由】 ' + air.lbl_direct;
            }

            var ret =  {
                searchKind : air.searchKind,
                fromDate : air.fromDate,
                toDates : air.toDates,
                departure : air.departure,
                destinations : air.destinations,
                arrival : air.arrival,
                adultNum : air.adultNum,
                minorAges : air.minorAges,
                only_pex_flg  : '',
                seat_check_flg  : '',
                direct : air.direct,
                openFix : air.openFix,
                carriers : air.carriers,
                omitLcc : air.omitLcc,
                seatClass : air.seatClass,
                depTimes : air.depTimes,
                lbl_icon : air.lbl_icon,
                lbl_search_kind_alt : air.lbl_search_kind_alt,
                lbl_search_kind_pic : '/recommend/images/' + air.lbl_search_kind_picture + '.png',
                lbl_dep_day :  '【出発日】 ' + air.lbl_dep_day,
                lbl_dest_dep_day :  !_.isEmpty(air.lbl_dest_dep_day) ? '【現地出発日】 ' + air.lbl_dest_dep_day : '',
                lbl_pax_num : '【人数】 ' + air.lbl_person_num,
                lbl_detail1 : lbl_detail1,
                lbl_detail2 : lbl_detail2,
                lbl_cty_code : air.priority_cty_cd,
                lbl_picture_num : air.picture_num,
                baseLogParams : this._formatBaseLogParams(air),
                lbl_departure: air.lbl_departure,
                lbl_destinations: air.lbl_destinations
            };
            if (air.departure !== air.arrival) {
                ret.lbl_cty = air.lbl_departure + air.lbl_arrow + air.lbl_destinations + air.lbl_arrival;
            } else {
                ret.lbl_cty = air.lbl_departure + air.lbl_arrow + air.lbl_destinations;
            }
            return ret;
        },
        _formatBaseLogParams : function (air) {
            var ret = {};
            ret.item01 = !!air.destinations ? air.destinations : '';
            ret.item02 = !!air.departure ? air.departure : '';
            return ret;
        }
    });

    HistorySearchAirCollection = Backbone.Collection.extend({
        url : urlSupport + '/history/get_air_auto_history_search',
        model : HistorySearchAirModel,
        parse : function (resp) {
            return resp.history_list;
        }
    });

    HistorySearchAirView = HistoryView.extend({
        EVENT_HISTORY_RENDER_COMPLETED: 'history:abroad_air:renderCompleted',
        initialize: function () {
            var $elems = this._getElements();
            if (!this._hasElements($elems)) {
                return;
            }

            var that = this;
            this.collection.fetch({
                cache : false,
                timeout : 10000,
                success : function () {
                    that.render();
                    $document.trigger(that.EVENT_HISTORY_RENDER_COMPLETED, that.collection.models.length);
                },
                error : function () {
                    that._showDefaults(that._getElements());
                    $document.trigger(that.EVENT_HISTORY_RENDER_COMPLETED, 0);
                }
            });
        },
        render: function () {
            var that, models, json, $elm, $elms, i;
            that = this;
            models = this.collection.models;
            $elms = this._getElements();
            if ($elms.length > 0) {
                for (i = 0; i < $elms.length; i++) {
                    $elm = $elms[i];
                    if (models[i] && $elm.length > 0) {
                        json = models[i].toJSON();
                        json.AgentCode = $elm.attr('historyAgentCode');
                        json.img = this._getPicturePath(json.lbl_cty_code, json.lbl_picture_num);
                        json.parameters = this._convertQueryParameters(json);
                        $elm.html(_.template(getUnderScoreTemplateString('#historyAirSearchTemplate'), json));

                        // try to show alternative(default) image if necessary
                        that._delegateDefaultImageLoading($elm.find('.targetImage'));

                        json.baseLogParams = this._formatBaseLogParamsAGCD(json.baseLogParams, $elm.attr('historyAgentCode'));
                        this._sendLoadLog(json.baseLogParams); // ロード時のbaselog出力を実行
                        (function (e, p) {
                            // クリック時のbaselog出力を登録
                            e.click(function () {
                                that._sendClickLog(p);
                                $(this).delay(200).queue(function() {
                                    location.href = $(this).find('input[name=airSearch]').val();
                                    $(this).dequeue();
                                });
                            });
                        })($elm, json.baseLogParams);
                    } else if ( $elm.length > 0 ) {
                        this._showDefault($elm);
                    }
                }
            }
        },

        _convertQueryParameters: function(json) {
            var query = _.pick(json, 'searchKind', 'fromDate', 'toDates', 'departure',
                'destinations', 'arrival', 'adultNum', 'minorAges', 'direct',
                'openFix', 'carriers', 'omitLcc', 'seatClass', 'depTimes', 'AgentCode')
            var params = _.reduce(query, function(params, value, key) {
                if (value) {
                    params[key] = value;
                }
                return params;
            }, {})
            return objectToQueryParameters(params);
        },

        _getElements : function() {
            return _([$('#historyAirSearch1'),
                      $('#historyAirSearch2'),
                      $('#historyAirSearch3')]).compact();
        },
        _showDefaults : function ($elms) {
            var i;
            if ($elms.length > 0) {
                for (i = 0; i < $elms.length; i++) {
                    if ($elms[i].length > 0) {
                        this._showDefault($elms[i]);
                    }
                }
            }
        },
        _showDefault : function (target) {
            this._showDefaultCommon(target,'RECOMMEND_SEARCH_AIR_LOAD');
        },
        _sendLoadLog : function (params) {
             this._sendLog('RECOMMEND_SEARCH_AIR_LOAD', params);
        },
        _sendClickLog : function (params) {
             this._sendLog('RECOMMEND_SEARCH_AIR_CLICK', params);
        }
    });


    HistoryAbhotelModel = HistoryModel.extend({

        _ymdToDateObject: function(ymd) {
            return new Date(parseInt(ymd.substring(0, 4), 10), parseInt(ymd.substring(4, 6), 10) - 1, parseInt(ymd.substring(6, 8), 10));
        },

        _dateObjectToYmd: function(dateObject) {
            var yyyy = ('0000' + dateObject.getFullYear()).slice(-4);
            var mm = ('00' + (dateObject.getMonth() + 1)).slice(-2);
            var dd = ('00' + dateObject.getDate()).slice(-2);
            return yyyy + mm + dd;
        },

        _getNumberOfStay: function(value) {
            if (!value.checkin || !value.checkout) {
                return 0;
            }
            if (value.number_of_stay) {
                return value.number_of_stay;
            }
            var checkin = this._ymdToDateObject(value.checkin);
            var checkout = this._ymdToDateObject(value.checkout);
            return Math.floor((checkout.getTime() - checkin.getTime()) / (1000 * 60 * 60 * 24));
        },

        _getCommonParams: function(value) {

            var params = {};

            if (value.checkin && value.checkout) {

                var now = new Date();
                var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                var checkin = this._ymdToDateObject(value.checkin);

                // shift check in/out date +1 week if check in date is past
                if (today.getTime() > checkin.getTime()) {

                    var checkout = this._ymdToDateObject(value.checkout);
                    var numberOfStay = value.number_of_stay || Math.floor((checkout.getTime() - checkin.getTime()) / (1000 * 60 * 60 * 24));

                    checkin = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7);
                    var checkout = new Date(checkin.getFullYear(), checkin.getMonth(), checkin.getDate() + numberOfStay);

                    params.checkin = this._dateObjectToYmd(checkin);
                    params.checkout = this._dateObjectToYmd(checkout);

                } else {
                    params.checkin = value.checkin;
                    params.checkout = value.checkout;
                }
            }

            if (!_.isEmpty(value.rooms)) {
                params.rooms = this._decodeRooms(value.rooms)
            }

            return params;
        },

        _decodeRooms: function(rooms) {
            var roomStrList = [];
            _.each(rooms, function(room) {
                var roomAssignment = [];
                roomAssignment.push(room.adult);
                _.each(room.childAges, function(childAge) {
                    roomAssignment.push(childAge);
                });
                roomStrList.push(roomAssignment.join(','));
            });
            return roomStrList.join(':');
        }

    });


    HistoryDetailAbhotelModel = HistoryAbhotelModel.extend({

        parse: function (abhotel) {
            var value = abhotel.value;
            var attributes = {
                hotelName : value.label_name_jp || value.label_name_en,
                img : value.image_path || '',
                area : value.label_region_jp || value.label_region_en,
                hotelCode : value.hotel_code,
                commonQuery : $.param(this._getCommonParams(value), true),
                baseLogParams : this._formatBaseLogParams(value),
                cityCode : value.city_code,
                cityName : value.city_name,
                pictureNum : value.picture_num
            };

            if (value.checkin && value.checkout) {
                attributes.checkinMonth = parseInt(value.checkin.substring(4, 6), 10);
                attributes.checkinDate = parseInt(value.checkin.substring(6, 8), 10);
                attributes.numberOfStay = this._getNumberOfStay(value);
                attributes.formattedPrice = value.price && value.price.average && this._formatMoney(value.price.average) || '';
            }

            return attributes;
        },

        getDetailUrl: function (agentCode) {
            var commonQuery = this.get('commonQuery');
            var url = urlAbhotel + '/HTLITM/' + this.get('hotelCode') + '/?';
            if (commonQuery) {
                url += commonQuery + '&AgentCode=' + agentCode;
            } else {
                url += 'AgentCode=' + agentCode;
            }
            return url;
        },

        _formatBaseLogParams: function (value) {
            return {
                item01: value.city_code || value.region_id,
                item03: value.hotel_code
            }
        }

    });


    HistorySearchAbhotelModel = HistoryAbhotelModel.extend({

        parse: function (abhotel) {
            var value = abhotel.value;
            var attributes = {
                regionId : value.region_id,
                regionName : value.region_name,
                commonQuery : $.param($.extend(this._getCommonParams(value), this._getFilterParams(value)), true),
                baseLogParams : this._formatBaseLogParams(value),
                cityCode : value.city_code,
                cityName : value.city_name,
                pictureNum : value.picture_num
            };

            if (value.checkin && value.checkout) {
                attributes.checkinMonth = parseInt(value.checkin.substring(4, 6), 10);
                attributes.checkinDate = parseInt(value.checkin.substring(6, 8), 10);
                attributes.numberOfStay = value.number_of_stay;

                if (!_.isEmpty(value.grade)) {
                    attributes.minGrade = _.min(value.grade),
                    attributes.maxGrade = _.max(value.grade)
                }

            } else {
                var peopleCount = this._countPeople(value.rooms);
                attributes.adultNum = peopleCount.adults;
                attributes.childNum = peopleCount.children;
            }

            return attributes;
        },

        getListUrl: function (agentCode) {
            var commonQuery = this.get('commonQuery');
            var url = urlAbhotel + '/LIST/' + this.get('regionId') + '/?';
            if (commonQuery) {
                url += commonQuery + '&AgentCode=' + agentCode;
            } else {
                url += 'AgentCode=' + agentCode;
            }
            return url;
        },

        _getFilterParams: function(value) {
            var params = {};

            var filterRegionId = _.union(value.filter_area || [], value.filter_landmark || []);
            if (!_.isEmpty(filterRegionId)) {
                params.filterRegionId = filterRegionId;
            }
            if (value.hotel_name) {
                params.hotelName = value.hotel_name;
            }
            if (!_.isEmpty(value.grade)) {
                params.grade = value.grade;
            }
            if (!_.isEmpty(value.facility)) {
                params.facility = value.facility;
            }
            if (value.min_price) {
                params.minPrice = value.min_price;
            }
            if (value.max_price) {
                params.maxPrice = value.max_price;
            }

            return params;
        },

        _countPeople: function(rooms) {
            var adults = 0;
            var children = 0;
            _.each(rooms, function(room) {
                adults += room.adult;
                children += _.size(room.childAges);
            });
            return {
                adults: adults,
                children: children
            };
        },

        _formatBaseLogParams: function (value) {
            return {
                item01: value.city_code || value.region_id
            }
        }

    });


    HistoryDetailAbhotelCollection = Backbone.Collection.extend({
        model: HistoryDetailAbhotelModel,
        parse: function (resp) {
            return resp.result.result_list;
        }
    });


    HistorySearchAbhotelCollection = Backbone.Collection.extend({
        model: HistorySearchAbhotelModel,
        parse: function (resp) {
            return resp.result.result_list;
        }
    });


    HistoryDetailAbhotelView = HistoryView.extend({

        initialize: function () {
            this.$elements = this._getElements();
            if (!this._hasElements(this.$elements)) {
                return;
            }

            this.historyAbhotelDetailTemplate = _.template(getUnderScoreTemplateString('#historyAbhotelDetailTemplate'));

            var that = this;
            this.collection.url = urlAbhotel + '/bookmarks/get_abhotel_history_list?num=' + this.$elements.length;
            this.collection.fetch({
                cache : false,
                timeout : 10000,
                success : function () {
                    that.render();
                },
                error : function () {
                    that._showDefaults();
                }
            });
        },

        render: function () {
            var models = this.collection.models;
            var that = this;
            _.each(this.$elements, function($elem, i) {
                if (models[i] && $elem.size()) {
                   var json = models[i].toJSON();
                   if (!json.img) {
                       json.img = that._getPicturePath(json.cityCode, json.pictureNum);
                   }
                   var html = that.historyAbhotelDetailTemplate({ param: json });
                   $elem.html(html);
                   var $image = $elem.find('.targetImage')

                   // try to show alternative(default) image if necessary
                   that._delegateDefaultImageLoading($image);

                   // arrange image size preserving aspect ratio
                   $image.load($.proxy(that._fitHotelImage));

                   var agentCode = $elem.attr('data-history-agent-code'); // note: jQuery.data() is not available on jQuery ver.1.4.2 used in A/O top at 20140919
                   json.baseLogParams = that._formatBaseLogParamsAGCD(json.baseLogParams, agentCode);
                   that._sendLoadLog(json.baseLogParams);

                   // send baselog request on clicked
                   var targetUrl = models[i].getDetailUrl(agentCode);
                   $elem.find('.targetLink').click(function(ev) {
                       _.delay(function() {
                           window.location.href = targetUrl;
                       }, 200);
                       var itemParam = 'HO_item_' + json.baseLogParams.item01;
                       ga('send', 'event', 'recommend', 'click', itemParam);
                       that._sendClickLog(json.baseLogParams);
                   });

                } else if ($elem.length > 0) {
                    that._showDefault($elem);
                }
            });
        },

        _fitHotelImage: function(ev) {
            var $image = $(ev.currentTarget);
            var containerWidth = $image.attr('data-width'); // note: jQuery.data() is not available on jQuery ver.1.4.2 used in A/O top at 20140919
            var containerHeight = $image.attr('data-height');
            var width = containerWidth;
            var height = containerHeight;

            if (width * containerHeight > height * containerWidth) { // horizontally long
                var multiplier = containerWidth / width;
                width = containerWidth;
                height = height * multiplier;
            } else if (width * containerHeight < height * containerWidth) { // vertically long
                var multiplier = containerHeight / height;
                height = containerHeight;
                width = width * multiplier;

                // align the image to center
                $image.css('padding-left', (containerWidth - width) / 2);
            }

            $image.attr({
                width: width,
                height: height
            }).show();
        },

        _getElements: function() {
            return _.reduce([$('#historyAbhotelDetail1'), $('#historyAbhotelDetail2'), $('#historyAbhotelDetail3')], function(memo, $target){
                if ($target.size()) memo.push($target);
                return memo;
            }, []);
        },

        _showDefaults: function () {
            var that = this;
            _.each(this.$elements, function($elem) {
                if ($elem.size()) {
                    that._showDefault($elem);
                }
            });
        },

        _showDefault: function ($target) {
            this._showDefaultCommon($target,'RECOMMEND_DETAIL_ABHOTEL_LOAD');
        },

        _sendLoadLog: function (params) {
             this._sendLog('RECOMMEND_DETAIL_ABHOTEL_LOAD', params);
        },

        _sendClickLog: function (params) {
             this._sendLog('RECOMMEND_DETAIL_ABHOTEL_CLICK', params);
        }

    });


    HistorySearchAbhotelView = HistoryView.extend({

        initialize: function () {
            this.$elements = this._getElements();
            if (!this._hasElements(this.$elements)) {
                return;
            }

            this.historyAbhotelSearchTemplate = _.template(getUnderScoreTemplateString('#historyAbhotelSearchTemplate'));

            var that = this;
            this.collection.url = urlAbhotel + '/bookmarks/get_abhotel_auto_history_search?num=' + this.$elements.length;
            this.collection.fetch({
                cache : false,
                timeout : 10000,
                success : function () {
                    that.render();
                },
                error : function () {
                    that._showDefaults();
                }
            });
        },

        render: function () {
            var models = this.collection.models;
            var that = this;
            _.each(this.$elements, function($elem, i) {
                if (models[i] && $elem.length > 0) {
                   var json = models[i].toJSON();
                   json.img = that._getPicturePath(json.cityCode, json.pictureNum);
                   var html = that.historyAbhotelSearchTemplate({ param: json });
                   $elem.html(html);

                   // try to show alternative(default) image if necessary
                   that._delegateDefaultImageLoading($elem.find('.targetImage'));

                   var agentCode = $elem.attr('data-history-agent-code'); // note: jQuery.data() is not available on jQuery ver.1.4.2 used in A/O top at 20140919
                   json.baseLogParams = that._formatBaseLogParamsAGCD(json.baseLogParams, agentCode);
                   that._sendLoadLog(json.baseLogParams);

                   // send baselog request on clicked
                   var targetUrl = models[i].getListUrl(agentCode);
                   $elem.find('.targetLink').click(function(ev) {
                       _.delay(function() {
                           window.location.href = targetUrl;
                       }, 200);
                       var itemParam = 'HO_search_' + json.baseLogParams.item01;
                       ga('send', 'event', 'recommend', 'click', itemParam);
                       that._sendClickLog(json.baseLogParams);
                   });

                } else if ($elem.length > 0) {
                    that._showDefault($elem);
                }
            });
        },

        _getElements: function() {
            return _.reduce([$('#historyAbhotelSearch1'), $('#historyAbhotelSearch2'), $('#historyAbhotelSearch3')], function(memo, $target){
                if ($target.size()) memo.push($target);
                return memo;
            }, []);
        },

        _showDefaults: function() {
            var that = this;
            _.each(this.$elements, function($elem) {
                if ($elem.size()) {
                    that._showDefault($elem);
                }
            });
        },

        _showDefault: function ($target) {
            this._showDefaultCommon($target,'RECOMMEND_SEARCH_ABHOTEL_LOAD');
        },

        _sendLoadLog: function (params) {
             this._sendLog('RECOMMEND_SEARCH_ABHOTEL_LOAD', params);
        },

        _sendClickLog: function (params) {
             this._sendLog('RECOMMEND_SEARCH_ABHOTEL_CLICK', params);
        }

    });


    new HistoryDetailView({
        collection: new HistoryDetailCollection()
    });

    new HistorySearchView({
        collection: new HistorySearchCollection()
    });

    new HistorySearchAirView({
        collection: new HistorySearchAirCollection()
    });

    new HistoryDetailAbhotelView({
        collection: new HistoryDetailAbhotelCollection()
    });

    new HistorySearchAbhotelView({
        collection: new HistorySearchAbhotelCollection()
    });

    $document.on("authentication:postLogout", function () {
        location.reload(true);
    });
});
