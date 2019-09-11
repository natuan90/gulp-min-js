// jquery, underscore.jsの後に読み込む
(function(window, $) {
    var $document = $(document);
    skygate = window.skygate || {};

    // テンプレートの値埋め込みをデフォルトエスケープに設定
    // _.template()を使う時にこの設定は必ず入れる
    // <%= value %>: 値の埋め込み + htmlエスケープ
    // <%- value %>: 値の埋め込み
    if (_) {
        _.templateSettings = {
            evaluate: /<%([\s\S]+?)%>/g,
            interpolate: /<%-([\s\S]+?)%>/g,
            escape: /<%=([\s\S]+?)%>/g
        };
    }

    // common event
    skygate.event = {
        TRACK_PAGE_VIEW: 'trackPageView'
    };

    // for Google Analytics
    $document.on(skygate.event.TRACK_PAGE_VIEW, function(ev, pageName) {
        if (typeof _gaq !== 'undefined') {
            _gaq.push(['_trackPageview', pageName]);
        }
    });

    // ユーザエージェント判定
    // hifiveのh5.env.jsから持ってきている
    skygate.env = (function(ua) {
        var isiPhone = !!ua.match(/iPhone/i);
        var isiPad = !!ua.match(/iPad/i);
        var isiOS = isiPhone || isiPad;
        var isAndroid = !!ua.match(/android/i);
        var isWindowsPhone = !!ua.match(/Windows Phone/i);
        var isIE = !!ua.match(/MSIE/) || !!ua.match(/Trident/);
        var isEdge = !!ua.match(/Edge/);
        var isFirefox = !!ua.match(/Firefox/i);
        var isChrome = !!ua.match(/Chrome/i) || !!ua.match(/CrMo/) || !!ua.match(/CriOS/);
        var isSafari = !isAndroid && !!ua.match(/Safari/i) && !isChrome;
        var isWebkit = !!ua.match(/Webkit/i);
        var isOpera = !!ua.match(/Opera/i);
        var isAndroidDefaultBrowser = isAndroid && !!ua.match(/Safari/i) && !isChrome;
        var isSmartPhone = !!(isiPhone || isWindowsPhone
                || (isAndroidDefaultBrowser && ua.match(/Mobile/) && !ua.match(/SC-01C/))
                || (isAndroid && isChrome && ua.match(/Mobile/)) || ua.match(/Fennec/i) || ua
                .match(/Opera Mobi/i));
        var isTablet = !!(isiPad || (isAndroidDefaultBrowser && !ua.match(/Mobile/))
                || (isAndroid && isChrome && !ua.match(/Mobile/)) || ua.match(/SC-01C/)
                || ua.match(/Fennec/i) || ua.match(/Opera Tablet/i));
        var isDesktop = !isSmartPhone && !isTablet;
        var osVersion = null;
        var osVersionFull = null;

        var getiOSVersion = function(pre, post) {
            return $.trim(ua.substring(ua.indexOf(pre) + pre.length, ua.indexOf(post))).split('_');
        };

        var getVersion = function(target, end, ignoreCase) {
            var r = ignoreCase === false ? new RegExp(target + end) : new RegExp(target + end, 'i');
            return $.trim(ua.match(r));
        };

        var spaceSplit = function(target, ignoreCase) {
            var v = getVersion(target, '[^;)]*', ignoreCase).split(' ');
            if (v.length === 1)
                return '';
            return v[v.length - 1];
        };

        var slashSplit = function(target, ignoreCase) {
            var v = getVersion(target, '[^;) ]*', ignoreCase).split('/');
            if (v.length === 1)
                return '';
            return v[v.length - 1];
        };

        var colonSplit = function(target, ignoreCase) {
            var v = getVersion(target, '[^;)]*', ignoreCase).split(':');
            if (v.length === 1)
                return '';
            return v[v.length - 1];
        };

        var getMainVersion = function(target) {
            return parseInt(target.split('.')[0]);
        };

        if (isiPhone) {
            var s = getiOSVersion('iPhone OS', 'like');
            osVersion = parseInt(s[0]);
            osVersionFull = s.join('.');
        } else if (isiPad) {
            var s = getiOSVersion('CPU OS', 'like');
            osVersion = parseInt(s[0]);
            osVersionFull = s.join('.');
        } else if (isAndroid && isFirefox) {
            // FennecはAndroidのバージョンを取得することができない。
        } else if (isAndroid) {
            var s = spaceSplit('Android');
            osVersion = getMainVersion(s);
            osVersionFull = s;
        } else if (isWindowsPhone) {
            var s = spaceSplit('Windows Phone OS');
            if (!s) {
                s = spaceSplit('Windows Phone');
            }
            osVersion = getMainVersion(s);
            osVersionFull = s;
        }

        // Operaのuaに'MSIE'が入っているとき用に、isIE && isOperaならisIEをfalseにする
        if (isIE && isOpera) {
            isIE = false;
        }

        var browserVersion = null;
        var browserVersionFull = null;

        if (isiOS || (isAndroid && isAndroidDefaultBrowser)) {
            browserVersion = osVersion;
            browserVersionFull = osVersionFull;
        } else {
            var version = null;
            if (isIE) {
                version = spaceSplit('MSIE', false) || colonSplit('rv', false);
            } else if (isChrome) {
                version = slashSplit('Chrome', false);
                if (!version) {
                    version = slashSplit('CrMo', false);
                }
            } else if (isSafari) {
                version = slashSplit('Version');
            } else if (isFirefox) {
                version = slashSplit('Firefox');
            } else if (isOpera) {
                version = slashSplit('Version');
                if (!version) {
                    version = slashSplit('Opera');
                }
                if (!version) {
                    version = spaceSplit('Opera');
                }
            }
            if (version) {
                browserVersion = getMainVersion(version);
                browserVersionFull = version;
            }
        }

        return {
            osVersion: osVersion,
            osVersionFull: osVersionFull,
            browserVersion: browserVersion,
            browserVersionFull: browserVersionFull,
            isiPhone: isiPhone,
            isiPad: isiPad,
            isiOS: isiOS,
            isAndroid: isAndroid,
            isWindowsPhone: isWindowsPhone,
            isIE: isIE,
            isEdge: isEdge,
            isFirefox: isFirefox,
            isChrome: isChrome,
            isSafari: isSafari,
            isOpera: isOpera,
            isAndroidDefaultBrowser: isAndroidDefaultBrowser,
            isSmartPhone: isSmartPhone,
            isTablet: isTablet,
            isDesktop: isDesktop,
            isWebkit: isWebkit
        };
    })(navigator.userAgent);

    // ユーティリティ
    skygate.util = $.extend(true, {

        __path_filter__: null,

        __static_path_filter__: null,

        __dayOfTheWeeks__: ['日', '月', '火', '水', '木', '金', '土'],

        __is_auone__: null,

        __is_arukikata__: null,

        __is_vanilla__: null,

        // 文字列が指定されたprefixで始まるかどうかを返す
        startsWith: function(str, prefix) {
            return str.lastIndexOf(prefix, 0) === 0;
        },

        uuid: function() {
            var uuid = "", i, random;
            for (i = 0; i < 32; i++) {
                random = Math.random() * 16 | 0;
                if (i == 8 || i == 12 || i == 16 || i == 20) {
                    uuid += "-";
                }
                uuid += (i == 12 ? 4 : (i == 16 ? (random & 3 | 8) : random)).toString(16);
            }
            return uuid;
        },

        //　文字列が指定されたsuffixで終わるかどうかを返す
        endsWith: function(str, suffix) {
            var sub = str.length - suffix.length;
            return (sub >= 0) && (str.lastIndexOf(suffix) === sub);
        },

        format: function (str, var_args) {
            if (str == null) {
                return '';
            }
            var args = arguments;
            return str.replace(/\{(\d+)\}/g, function(m, c) {
                var rep = args[parseInt(c, 10) + 1];
                if (typeof rep === 'undefined') {
                    return 'undefined';
                }
                return rep;
            });
        },

        namespace: function(namespace) {
            var createNamespace = function(names, parentObj) {
                var name = names.shift();
                if (parentObj[name] === undefined) {
                    parentObj[name] = {};
                }
                if (names.length === 0) return parentObj[name];
                return createNamespace(names, parentObj[name]);
            };
            return createNamespace(namespace.split('.'), window);
        },

        capitalize: function(text) {
            return text.charAt(0).toUpperCase() + text.substring(1);
        },

        moveTo: function(element, height) {
            var getElementScreenPosition = function(elem) {
                var html = document.documentElement;
                var rect = elem.getBoundingClientRect();
                var left = rect.left - html.clientLeft;
                var top = rect.top - html.clientTop;
                return {left:left, top:top};
            };
            var getElementPosition = function(elem) {
                // スクロール幅を取得
                var html = document.documentElement;
                var body = document.body;
                var scrollLeft = (body.scrollLeft || html.scrollLeft);
                var scrollTop  = (body.scrollTop || html.scrollTop);

                // 画面内座標を取得
                var pos = getElementScreenPosition(elem);

                // スクロール幅を加算
                var left = pos.left + scrollLeft;
                var top  = pos.top + scrollTop;
                return {left:left, top:top};
            };
            var move = getElementPosition(element).top;
            if (height) {
                move += height;
            }
            window.scrollTo(0, move);
        },

        isAuOne: function() {
            if (this.__is_auone__ === null) {
                this.__is_auone__ = $('#__is_auone__').length > 0;
            }
            return this.__is_auone__ || location.host.indexOf('autravel.auone.jp') !== -1;
        },

        isArukikata: function() {
            if (this.__is_arukikata__ === null) {
                this.__is_arukikata__ = $('#__is_arukikata__').length > 0;
            }
            return this.__is_arukikata__ || location.host.indexOf('arukikata.com') !== -1;
        },

        isVanilla: function() {
            if (this.__is_vanilla__ === null) {
                this.__is_vanilla__ = $('#__is_vanilla__').length > 0;
            }
            return this.__is_vanilla__ || location.host.indexOf('vanilla-air') !== -1;
        },

        getLocalMessages: function(messages) {
            var extendNotOverrideFn = function() {
                var options, name, src, copy, copyIsArray, clone,
                    target = arguments[0] || {},
                    i = 1,
                    length = arguments.length,
                    deep = false;

                // Handle a deep copy situation
                if ( typeof target === "boolean" ) {
                    deep = target;

                    // Skip the boolean and the target
                    target = arguments[ i ] || {};
                    i++;
                }

                // Handle case when target is a string or something (possible in deep copy)
                if ( typeof target !== "object" && !jQuery.isFunction(target) ) {
                    target = {};
                }

                if ( i === length ) {
                    target = this;
                    i--;
                }

                for ( ; i < length; i++ ) {
                    // Only deal with non-null/undefined values
                    if ( (options = arguments[ i ]) != null ) {
                        // Extend the base object
                        for ( name in options ) {
                            // not override when key already in target object
                            src = target[ name ];
                            copy = options[ name ];

                            // Prevent never-ending loop
                            if ( target === copy ) {
                                continue;
                            }

                            // Recurse if we're merging plain objects or arrays
                            if ( deep && copy && ( $.isPlainObject(copy) ||
                                (copyIsArray = $.isArray(copy)) ) ) {

                                if ( copyIsArray ) {
                                    copyIsArray = false;
                                    clone = src && $.isArray(src) ? src : [];

                                } else {
                                    clone = src && $.isPlainObject(src) ? src : {};
                                }

                                // Never move original objects, clone them
                                target[ name ] = extendNotOverrideFn( deep, clone, copy );

                            // Don't bring in undefined values
                            } else if ( copy !== undefined && !(name in target)) {
                                target[ name ] = copy;
                            }
                        }
                    }
                }

                // Return the modified object
                return target;
            };
            return this.isAuOne() ? extendNotOverrideFn(true, messages.au, messages.sg) :
                                    extendNotOverrideFn(true, messages.sg, messages.au);
        },

        getLocation: function(path) {
            if (this.__path_filter__ === null) {
                this.__path_filter__ = $('#__path_filter__').val() || '';
            }
            return this.__path_filter__ + path;
        },

        toSecure : function(path) {
            return 'https://' + location.host + path;
        },

        getStaticPath: function(path) {
            if (this.__static_path_filter__ === null) {
                this.__static_path_filter__ = $('#__static_path_filter__').val();
            }
            return this.__static_path_filter__ + path;
        },

        objectToQueryStringForPeppercorn: function(object) {
            var convertObject = function(obj, name, memo) {
                memo.push('_s=' + name + ':map');
                memo.push(convert(obj, []));
                memo.push('_e=' + name + ':map');
            };

            var convertArray = function(array, name, memo) {
                memo.push('_s=' + name + ':seq');
                if (array.length > 0) {
                    var head = array[0];
                    if ($.isArray(head)) {
                        convertArray(array, name, memo);
                    } else if ($.isPlainObject(head)) {
                        _.each(array, function(item) {
                            convertObject(item, name + '_member', memo);
                        });
                    } else if (!$.isFunction(head)) {
                        _.each(array, function(item) {
                            memo.push('a=' + item);
                        });
                    }
                }
                memo.push('_e=' + name + ':seq');
            };

            var convert = function(obj, memo) {
                for (var prop in obj) {
                    if (!obj.hasOwnProperty(prop)) continue;
                    var target = obj[prop];
                    if ($.isArray(target)) {
                        convertArray(target, prop, memo);
                    } else if ($.isPlainObject(target)) {
                        convertObject(target, prop, memo);
                    } else if (!$.isFunction(target)) {
                        memo.push(prop + '=' + target);
                    }
                }
                return memo;
            };
            return _.flatten(convert(object, [])).join('&');
        },

        objectToQueryObject: function(obj, separator) {
            var sep = separator ? separator : ',';
            var params = _.reduce(_.keys(obj), function(memo, key) {
                if (_.isArray(memo[key])) {
                    memo[key] = memo[key].join(sep);
                }
                if (_.isEmpty(memo[key]) && !_.isNumber(memo[key]))
                    delete memo[key];
                return memo;
            }, $.extend(true, {}, obj));
            return params;
        },

        objectToQueryParameters: function(obj, separator) {
            var params = skygate.util.objectToQueryObject(obj, separator);
            return $.param(params);
        },

        escapeSelector: function(selector) {
            return selector.replace(/[ !"#$%&'()*+,.\/:;<=>?@\[\\\]^`{|}~]/g, '\\$&');
        },

        escapeHTML: function(str) {
            return str.replace(/\&/g, '&amp;').replace( /</g, '&lt;').replace(/>/g, '&gt;')
                     .replace(/\"/g, '&quot;').replace(/\'/g, '&#39;');
        },

        formatMoney: function(num) {
            var str = (num + '').replace(/,/g, '');
            while(str != (str = str.replace(/^(-?\d+)(\d{3})/, '$1,$2')));
            return str;
        },

        formatTime: function(time) {
            return time.substring(0, 2) + ':' + time.substring(2, 4);
        },

        formatTimePeriod: function(time) {
        	switch (time.length) {
    		case 4:
    			return this.formatTime(time);
    		case 9:
    			var strDiv = time.split('-');
    			return this.formatTime(strDiv[0]) + '〜' + this.formatTime(strDiv[1]);
    		default:
    			return '';
        	}
        },

        formatYmdToMd: function(src, opts) {
            var md = '';
            if (opts && opts.zeroSuppress) {
                md = Number(src.substring(4, 6)) + '/' + Number(src.substring(6, 8));
            } else {
                md = [src.substring(4, 6), src.substring(6, 8)].join('/');
            }
            if (opts && opts.withDayOfTheWeek) {
                md += '(' + this.formatYmdToDay(src) + ')';
            }
            return md;
        },

        formatYmdToDay: function(src) {
            var date = new Date(Number(src.substring(0, 4)), Number(src.substring(4, 6)) - 1, Number(src.substring(6, 8)));
            return this.__dayOfTheWeeks__[date.getDay()];
        },

        formatYmd: function(src, opts) {
            var y = opts.zeroSuppress ? Number(src.substring(0, 4)): src.substring(0, 4);
            var m = opts.zeroSuppress ? Number(src.substring(4, 6)): src.substring(4, 6);
            var d = opts.zeroSuppress ? Number(src.substring(6, 8)): src.substring(6, 8);
            var ymd = opts.slash ? this.format('{0}/{1}/{2}', y, m, d) : this.format('{0}年{1}月{2}日', y, m, d);
            if (opts.withDayOfTheWeek) {
                ymd += '(' + this.formatYmdToDay(src) + ')';
            }
            return ymd;
        },

        strToSlashYmd: function(year, month, day, withDayOfTheWeek) {
            var ymd = this.format('{0}/{1}/{2}', year, month, day);
            if (withDayOfTheWeek) {
                month = parseInt(month, 10) - 1;
                ymd += '(' + this.__dayOfTheWeeks__[new Date(year, month, day).getDay()] + ')';
            }
            return ymd;
        },

        open_window: function(url, windowName, option) {
            var opt = {
                width: 400,
                height: 450,
                status: 'no',
                scrollbars: 'no',
                directories: 'no',
                menubar: 'no',
                resizable: 'no',
                toolbar: 0
            };
            $.extend(opt, option);
            var win = window.open(url, windowName,
                this.format('width={0},height={1},status={2},scrollbars={3},directories={4},menubar={5},resizable={6},toolbar={7}',
                    opt.width, opt.height, opt.status, opt.scrollbars, opt.directories, opt.menubar, opt.resizable, opt.toolbar));
            win.focus();
        },

        // TODO very easy...
        loadScript: function(src, appendBody) {
            var dfd = $.Deferred();
            $.ajax({
                url: src,
                cache: false,
                dataType: 'script',
                converters: {
                    'text script': function(text) {
                        return text;
                    }
                }
            }).done(function(responseText) {
                $.globalEval(responseText);
                dfd.resolve();
            }).fail(function() {
                dfd.reject(src);
            });
            return dfd.promise();
        },

        // 送迎区分の数値を文言を変換
        pickupConv : function(num) {
            return {
                1: '往復混載送迎付',
                2: '往復混載送迎付（立寄りなし）',
                3: '往復混載送迎・観光付',
                5: '往復混載送迎付（説明会なし）',
                6: '往復混載送迎付（観光なし）',
                7: '片道送迎付',
                8: '往復専用車送迎付（ホテル直行）',
                9: '送迎なし',
               10: '往復リムジン送迎付（ホテル直行）'
            }[num];
        },

        // BaseLogへの送信
        sendBaseLog: function(eventName, params, sync) {
            if (!window.baselog||!eventName) return;
            var sendParams = $.extend(true, {}, params, {
                event: eventName,
                dispId: window.baselog.params.dispId,
                dispPath: window.baselog.params.dispPath,
                referer: window.baselog.params.referer
            });
            window.baselog.params = sendParams;
            window.baselog.submit(eventName, !!sync);
        },

        date: {

            addDays : function(src, days) {
                var dest = new Date();
                dest.setTime(src.getTime() + days * 24 * 60 * 60 * 1000);
                return dest;
            },

            toYmdhmString: function (dateObject) {
                return [
                    dateObject.getFullYear(),
                    ('0' + (dateObject.getMonth() + 1)).slice(-2),
                    ('0' + dateObject.getDate()).slice(-2),
                    ('0' + dateObject.getHours()).slice(-2),
                    ('0' + dateObject.getMinutes()).slice(-2)
                ].join('');
            },

            toYmdhmsString: function (dateObject) {
                return [
                    skygate.util.date.toYmdhmString(dateObject),
                    ('0' + dateObject.getMinutes()).slice(-2)
                ].join('');
            },

            toYmdString : function(dateObject, sep) {
                var _sep = sep || '';
                var year = dateObject.getFullYear();
                var month = dateObject.getMonth() + 1;
                var day = dateObject.getDate();
                return [
                    year,
                    (month < 10) ? '0' + month : month,
                    (day < 10) ? '0' + day : day
                ].join(_sep);
            },

            toYmdStringWithDayOfTheWeek: function(dateObject, sep) {
                var ymdString = skygate.util.date.toYmdString(dateObject, sep);
                ymdString += '(' + skygate.util.date.getDayOfWeekLabel(dateObject) + ')';
                return ymdString;
            },

            toYmString : function(dateObject, sep) {
                var _sep = sep || '';
                var year = dateObject.getFullYear();
                var month = dateObject.getMonth() + 1;
                return [
                    year,
                    (month < 10) ? '0' + month : month
                ].join(_sep);
            },

            getDayOfWeekLabel : function(dateObject) {
                return skygate.util.__dayOfTheWeeks__[dateObject.getDay()];
            },

            ymStringToObject : function(ymString) {
                if (!ymString || ymString.length < 6) {
                    return null;
                }
                return this.ymdStringToObject(ymString + '01');
            },

            ymdStringToObject : function(ymdString) {
                if (!ymdString) {
                    return null;
                } else if (ymdString.length === 6) {
                    return this.ymStringToObject(ymdString);
                } else if (ymdString.length !== 8) {
                    return null;
                }
                var year = ymdString.substring(0, 4);
                var month = ymdString.substring(4, 6);
                var day = ymdString.substring(6, 8);
                return new Date(year,
                    (parseInt(month, 10) - 1), parseInt(day, 10));
            },

            ymdhmStringToObject: function (ymdhmString) {
                if (!ymdhmString) {
                    return null;
                } else if (ymdhmString.length <= 8) {
                    return skygate.util.date.ymdStringToObject(ymdhmString);
                } else if (ymdhmString.length !== 12) {
                    return null;
                }
                var convertedDate = skygate.util.date.ymdStringToObject(ymdhmString.substring(0, 8));
                convertedDate.setHours(parseInt(ymdhmString.substring(8, 10), 10));
                convertedDate.setMinutes(parseInt(ymdhmString.substring(10, 12), 10));
                return convertedDate;
            },

            ymdStringToObjectWithSeparator: function(ymdString, separator) {
                var _separator = separator ? separator : '/';
                return ymdString ? skygate.util.date.ymdStringToObject(ymdString.split(_separator).join('')) : null;
            },

            computeDate: function(date, addDay) {
                var ret = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                ret.setTime(ret.getTime() + (addDay * 86400000));
                return ret;
            },

            diffDate: function(dt1, dt2) {
                var diff = dt1 - dt2;
                var diffDay = diff / 86400000;
                return diffDay;
            },

            addHours: function (date, addHours) {
                var ret = new Date(date.getTime());
                ret.setHours(date.getHours() + addHours);
                return ret;
            },

            isToday: function(date) {
                if (!this.today) {
                    var now = new Date();
                    this.today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                }
                if (!_.isDate(date))date = this.ymdStringToObject(date);
                return this.today.getTime() === date.getTime() ? true : false;
            },

            isSameDate: function(date1, date2) {
                if (!(date1 && date2)) {
                    return false;
                }
                return date1.toDateString() === date2.toDateString();
            }
        },

        jpyToNumber: function(value, isNegative) {
            if (isNegative) {
                return Number(value.replace(/-|－|,|円/g, ''));
            } else {
                return Number(value.replace(/,|円/g, ''));
            }
        },

        numberToJpy: function(num, toNegative) {
            if (toNegative) {
                return '－' + skygate.util.formatMoney(num) + '円';
            } else {
                return skygate.util.formatMoney(num) + '円';
            }
        },

        creditcard: {
            formatCardNumber: function(cardNumber) {
                if (!cardNumber) {
                    return '';
                } else {
                    cardNumber = cardNumber.replace(/[０-９]/g, function(s) {
                        return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
                    });
                    return cardNumber.replace(/[\s-－ー]/g, '');
                }
            }
        }
    }, skygate.util || {});

    // TODO ロガー.
    // 本来はリモートへログを送るために使われる。今はコンソールに出力。
    skygate.Logger = (function() {

        var logLevel = {
            ERROR: 9,
            WARN: 8,
            INFO: 7,
            DEBUG: 6,
            TRACE: 5,
            ALL: 0
        };

        function Logger(name, level) {
            // nameがnull/undefinedならエラー。今は空文字は許している。
            if (name == null) {
                throw new Error('skygate.Logger is required "name".');
            }
            this.name = name;
            this.level = level ? level : logLevel.WARN;
        }

        Logger.prototype = {
            LEVEL: logLevel,

            setLevel: function(level) {
                this.level = level;
            },

            error: function(msg) {
                this._output(msg, this.LEVEL.ERROR);
            },

            warn: function(msg) {
                this._output(msg, this.LEVEL.WARN);
            },

            info: function(msg) {
                this._output(msg, this.LEVEL.INFO);
            },

            debug: function(msg) {
                this._output(msg, this.LEVEL.DEBUG);
            },

            trace: function(msg) {
                this._output(msg, this.LEVEL.TRACE);
            },

            _output: function(msg, level) {
                if (this.level <= level && this.level !== logLevel.ALL) {
                    return;
                }
                if (window.console) console.log(msg);
            }
        };
        return Logger;
    })();
})(window, jQuery);





