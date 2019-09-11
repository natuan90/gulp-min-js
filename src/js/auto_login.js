// Compressed from json2.js. This is not necessary when supporting for IE 7 is disabled.
if(typeof JSON!=='object'){JSON={}}(function(){'use strict';function f(n){return n<10?'0'+n:n}if(typeof Date.prototype.toJSON!=='function'){Date.prototype.toJSON=function(key){return isFinite(this.valueOf())?this.getUTCFullYear()+'-'+f(this.getUTCMonth()+1)+'-'+f(this.getUTCDate())+'T'+f(this.getUTCHours())+':'+f(this.getUTCMinutes())+':'+f(this.getUTCSeconds())+'Z':null};String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(key){return this.valueOf()}}var cx=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,escapable=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,gap,indent,meta={'\b':'\\b','\t':'\\t','\n':'\\n','\f':'\\f','\r':'\\r','"':'\\"','\\':'\\\\'},rep;function quote(string){escapable.lastIndex=0;return escapable.test(string)?'"'+string.replace(escapable,function(a){var c=meta[a];return typeof c==='string'?c:'\\u'+('0000'+a.charCodeAt(0).toString(16)).slice(-4)})+'"':'"'+string+'"'}function str(key,holder){var i,k,v,length,mind=gap,partial,value=holder[key];if(value&&typeof value==='object'&&typeof value.toJSON==='function'){value=value.toJSON(key)}if(typeof rep==='function'){value=rep.call(holder,key,value)}switch(typeof value){case'string':return quote(value);case'number':return isFinite(value)?String(value):'null';case'boolean':case'null':return String(value);case'object':if(!value){return'null'}gap+=indent;partial=[];if(Object.prototype.toString.apply(value)==='[object Array]'){length=value.length;for(i=0;i<length;i+=1){partial[i]=str(i,value)||'null'}v=partial.length===0?'[]':gap?'[\n'+gap+partial.join(',\n'+gap)+'\n'+mind+']':'['+partial.join(',')+']';gap=mind;return v}if(rep&&typeof rep==='object'){length=rep.length;for(i=0;i<length;i+=1){if(typeof rep[i]==='string'){k=rep[i];v=str(k,value);if(v){partial.push(quote(k)+(gap?': ':':')+v)}}}}else{for(k in value){if(Object.prototype.hasOwnProperty.call(value,k)){v=str(k,value);if(v){partial.push(quote(k)+(gap?': ':':')+v)}}}}v=partial.length===0?'{}':gap?'{\n'+gap+partial.join(',\n'+gap)+'\n'+mind+'}':'{'+partial.join(',')+'}';gap=mind;return v}}if(typeof JSON.stringify!=='function'){JSON.stringify=function(value,replacer,space){var i;gap='';indent='';if(typeof space==='number'){for(i=0;i<space;i+=1){indent+=' '}}else if(typeof space==='string'){indent=space}rep=replacer;if(replacer&&typeof replacer!=='function'&&(typeof replacer!=='object'||typeof replacer.length!=='number')){throw new Error('JSON.stringify');}return str('',{'':value})}}if(typeof JSON.parse!=='function'){JSON.parse=function(text,reviver){var j;function walk(holder,key){var k,v,value=holder[key];if(value&&typeof value==='object'){for(k in value){if(Object.prototype.hasOwnProperty.call(value,k)){v=walk(value,k);if(v!==undefined){value[k]=v}else{delete value[k]}}}}return reviver.call(holder,key,value)}text=String(text);cx.lastIndex=0;if(cx.test(text)){text=text.replace(cx,function(a){return'\\u'+('0000'+a.charCodeAt(0).toString(16)).slice(-4)})}if(/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,'@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,']').replace(/(?:^|:|,)(?:\s*\[)+/g,''))){j=eval('('+text+')');return typeof reviver==='function'?walk({'':j},''):j}throw new SyntaxError('JSON.parse');}}}());

// Base64
!function(t){"use strict";var r,e=t.Base64,n="2.1.8";"undefined"!=typeof module&&module.exports&&(r=require("buffer").Buffer);var o="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",c=function(t){for(var r={},e=0,n=t.length;n>e;e++)r[t.charAt(e)]=e;return r}(o),u=String.fromCharCode,a=function(t){if(t.length<2){var r=t.charCodeAt(0);return 128>r?t:2048>r?u(192|r>>>6)+u(128|63&r):u(224|r>>>12&15)+u(128|r>>>6&63)+u(128|63&r)}var r=65536+1024*(t.charCodeAt(0)-55296)+(t.charCodeAt(1)-56320);return u(240|r>>>18&7)+u(128|r>>>12&63)+u(128|r>>>6&63)+u(128|63&r)},i=/[\uD800-\uDBFF][\uDC00-\uDFFFF]|[^\x00-\x7F]/g,f=function(t){return t.replace(i,a)},h=function(t){var r=[0,2,1][t.length%3],e=t.charCodeAt(0)<<16|(t.length>1?t.charCodeAt(1):0)<<8|(t.length>2?t.charCodeAt(2):0),n=[o.charAt(e>>>18),o.charAt(e>>>12&63),r>=2?"=":o.charAt(e>>>6&63),r>=1?"=":o.charAt(63&e)];return n.join("")},d=t.btoa?function(r){return t.btoa(r)}:function(t){return t.replace(/[\s\S]{1,3}/g,h)},s=r?function(t){return(t.constructor===r.constructor?t:new r(t)).toString("base64")}:function(t){return d(f(t))},g=function(t,r){return r?s(String(t)).replace(/[+\/]/g,function(t){return"+"==t?"-":"_"}).replace(/=/g,""):s(String(t))},A=function(t){return g(t,!0)},l=new RegExp(["[À-ß][-¿]","[à-ï][-¿]{2}","[ð-÷][-¿]{3}"].join("|"),"g"),p=function(t){switch(t.length){case 4:var r=(7&t.charCodeAt(0))<<18|(63&t.charCodeAt(1))<<12|(63&t.charCodeAt(2))<<6|63&t.charCodeAt(3),e=r-65536;return u((e>>>10)+55296)+u((1023&e)+56320);case 3:return u((15&t.charCodeAt(0))<<12|(63&t.charCodeAt(1))<<6|63&t.charCodeAt(2));default:return u((31&t.charCodeAt(0))<<6|63&t.charCodeAt(1))}},C=function(t){return t.replace(l,p)},b=function(t){var r=t.length,e=r%4,n=(r>0?c[t.charAt(0)]<<18:0)|(r>1?c[t.charAt(1)]<<12:0)|(r>2?c[t.charAt(2)]<<6:0)|(r>3?c[t.charAt(3)]:0),o=[u(n>>>16),u(n>>>8&255),u(255&n)];return o.length-=[0,0,2,1][e],o.join("")},B=t.atob?function(r){return t.atob(r)}:function(t){return t.replace(/[\s\S]{1,4}/g,b)},S=r?function(t){return(t.constructor===r.constructor?t:new r(t,"base64")).toString()}:function(t){return C(B(t))},v=function(t){return S(String(t).replace(/[-_]/g,function(t){return"-"==t?"+":"/"}).replace(/[^A-Za-z0-9\+\/]/g,""))},y=function(){var r=t.Base64;return t.Base64=e,r};if(t.Base64={VERSION:n,atob:B,btoa:d,fromBase64:v,toBase64:g,utob:f,encode:g,encodeURI:A,btou:C,decode:v,noConflict:y},"function"==typeof Object.defineProperty){var j=function(t){return{value:t,enumerable:!1,writable:!0,configurable:!0}};t.Base64.extendString=function(){Object.defineProperty(String.prototype,"fromBase64",j(function(){return v(this)})),Object.defineProperty(String.prototype,"toBase64",j(function(t){return g(this,t)})),Object.defineProperty(String.prototype,"toBase64URI",j(function(){return g(this,!0)}))}}t.Meteor&&(Base64=t.Base64)}(this);

(function($) {
    var $document = $(document);
    var initializedAutoLogin = (function(window, $) {
        var $window = $(window);
        var $document = $(document);
        var REDIRECT_AUTH_CHECK = '/common/redirect_auth_check?';
        var REDIRECT_MYPAGE_CHECK = '/common/redirect_mypage_check?';
        var REDIRECT_MYPAGE_LOGIN = '/common/auth/login_mypage';

        var isAuOne = function() {
            var AUTRAVEL_HOST = 'autravel.auone';
            var result = false;
            var host = location.host;

            if (host.indexOf(AUTRAVEL_HOST) != -1) {
                result = true;
            }
            return result;
        };

        var createRedirectAuthPathWithPrefix = function (actionUrl, queryParams, allowAutoLogin, method, prefix, redirectPath) {
            if (!actionUrl || !queryParams) {
                return;
            }

            if (!allowAutoLogin) {
                allowAutoLogin = 0;
            }

            if (!method) {
                method = 'POST';
            }

            if(!redirectPath){
                redirectPath = REDIRECT_AUTH_CHECK;
            }

            var dict = {
                'action' : actionUrl,
                'method' : method
            };

            $.extend(true, dict, queryParams);
            var str_json = JSON.stringify(dict);
            var rq_data = Base64.encode(str_json);
            var prefixPath = !prefix ? '' : prefix;
            var url = 'https://' + location.host + prefixPath + redirectPath;
            var params = $.param({rq:rq_data, allowAutoLogin:allowAutoLogin});
            var redirectURL = url + params;

            return redirectURL;
        };
        var createRedirectAuthPath = function(actionUrl, queryParams, allowAutoLogin, method, redirectPath) {
            return createRedirectAuthPathWithPrefix(actionUrl, queryParams, allowAutoLogin, method, '', redirectPath);
        }

        var ua = navigator.userAgent;
        var isiPhone = !!ua.match(/iPhone/i);
        var isAndroid = !!ua.match(/android/i);
        var isWindowsPhone = !!ua.match(/Windows Phone/i);
        var isChrome = !!ua.match(/Chrome/i) || !!ua.match(/CrMo/) || !!ua.match(/CriOS/);
        var isAndroidDefaultBrowser = isAndroid && !!ua.match(/Safari/i) && !isChrome;
        var isSmartPhone = !!(isiPhone || isWindowsPhone
                || (isAndroidDefaultBrowser && ua.match(/Mobile/) && !ua.match(/SC-01C/))
                || (isAndroid && isChrome && ua.match(/Mobile/)) || ua.match(/Fennec/i) || ua
                .match(/Opera Mobi/i));

        var needCorsProxy = !isSmartPhone && !(typeof history.pushState === 'function') && location.protocol !== 'https:';
        var callAuthApi;
        if (!needCorsProxy) {
            callAuthApi = function(ajaxOption) {
                if (location.protocol !== 'https:') {
                    ajaxOption.crossDomain = true;
                    ajaxOption.xhrFields = { withCredentials: true };
                }
                return $.ajax(ajaxOption);
            };
        } else {
            var isIE7 = typeof window.addEventListener == 'undefined' && typeof document.querySelectorAll == 'undefined';
            var targetOrigin = 'https://' + location.host;
            var iframeId = 'authCorsProxyIFrame';
            var AuthCorsProxyManager = (function() {
                var guid = function() {
                    var s4 = function() {
                        return Math.floor((1 + Math.random()) * 0x10000)
                            .toString(16)
                            .substring(1);
                    }
                    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                        s4() + '-' + s4() + s4() + s4();
                };

                var isCorsReady = false;
                $document.on('corsReadyEvent', function() {
                    isCorsReady = true;
                });

                return {

                    queue: [],

                    deferredMap: {},

                    executeTimer: false,

                    TIMER_WAIT: 200,

                    flush: function() {
                        var func;
                        while(func = this.queue.shift()) {
                            func();
                        }
                    },

                    timer: function() {
                        var that = this;
                        setTimeout(function() {
                            if (that.isReady()) {
                                that.flush();
                            } else {
                                that.timer();
                            }
                        }, this.TIMER_WAIT);
                    },

                    isReady: function() {
                        return isCorsReady;
                    },

                    execute: function(data) {
                        var dfd = this.deferredMap[data.id];
                        delete this.deferredMap[data.id]
                        if (data.status) {
                            dfd.resolve(data.response);
                        } else {
                            dfd.reject();
                        }
                    },

                    enqueue: function(ajaxOption) {
                        var dfd = $.Deferred();
                        if (isIE7) {
                            dfd.reject();
                            return dfd.promise();
                        }
                        var id = guid();
                        var func = function() {
                            document.getElementById(iframeId).contentWindow.postMessage(JSON.stringify({
                                ajaxOption: ajaxOption,
                                id: id
                            }), targetOrigin);
                        };
                        this.deferredMap[id] = dfd;
                        if (!this.isReady()) {
                            this.queue.push(func);
                            if (!this.executeTimer) {
                                this.executeTimer = true;
                                this.timer();
                            }
                        } else {
                            func();
                        }
                        return dfd.promise();
                    }
                };
            })();

            callAuthApi = function(var_args) {
                return AuthCorsProxyManager.enqueue.apply(AuthCorsProxyManager, arguments);
            };

            $(function() {
                if (!$('#' + iframeId).length) {
                    $(window).on('message', function(postMessageEvent) {
                        var origin = postMessageEvent.originalEvent.origin;
                        if (origin.indexOf(targetOrigin) === -1) {
                            return;
                        }
                        var dataString = postMessageEvent.originalEvent.data;
                        if (dataString === 'corsReady') {
                            $document.trigger('corsReadyEvent');
                        } else if (dataString) {
                            var data = $.parseJSON(dataString);
                            if (data.id) {
                                AuthCorsProxyManager.execute(data);
                            }
                        }
                    });
                    var proxyUrl = targetOrigin + '/common/cors_proxy';
                    $('body').append('<iframe id="' + iframeId + '" src="' + proxyUrl + '" style="display: none;"></iframe>');
                }
            });
        }

        var ymdStringToObject = function(ymdString) {
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
        };

        skygate = window.skygate || {};
        skygate.util = window.skygate.util || {};
        skygate.util.isAuOne = window.skygate.util.isAuOne || isAuOne;
        skygate.util.createRedirectAuthPath = window.skygate.util.createRedirectAuthPath || createRedirectAuthPath;
        skygate.util.createRedirectAuthPathWithPrefix = window.skygate.util.createRedirectAuthPathWithPrefix || createRedirectAuthPathWithPrefix;
        skygate.util.callAuthApi = window.skygate.util.callAuthApi || callAuthApi;
        skygate.util.date = window.skygate.util.date || {};
        skygate.util.date.ymdStringToObject = window.skygate.util.date.ymdStringToObject || ymdStringToObject;
        skygate.util.redirectAuthCheckUrl = window.skygate.util.redirectAuthCheckUrl || REDIRECT_AUTH_CHECK;
        skygate.util.redirectMypageCheckUrl = window.skygate.util.redirectMypageCheckUrl || REDIRECT_MYPAGE_CHECK;
        skygate.util.redirectMypageLoginUrl = window.skygate.util.redirectMypageLoginUrl || REDIRECT_MYPAGE_LOGIN;

        var trackLoginStatus = function(status) {
            if (window.ga && !skygate.util.isAuOne()) {
                window.ga('set', 'dimension1', status);
                window.ga('set', 'nonInteraction', true);
                window.ga('send', 'event');
            }
        };

        var autoLogin = function(opts) {
            var $document = $(document),
                $this = $(this),
                $strHeader = $('#str-header');

            var AUTO_LOGIN = '0',
                NOMAL_LOGIN = '1',
                LOADING_WAIT_MSEC = 2000,
                API_AUTH_CHECK = 'https://' + location.host + '/common/api/authentication/authCheck',
                API_LOGOUT = 'https://' + location.host + '/common/api/authentication/logout';

            var defaults = {
                loginUrl : 'https://' + location.host + '/common/login?',
                logoutButton : null,
                showBoxButton : null,
                closeButton : null,
                loginButton : null,

                onAutoLogin : function(data) {
                    $strHeader.addClass('login');

                    this._renderPoint(data.point);
                    this._renderCoupon(data.couponNumber,data.couponExpiration);
                    this._renderMenuItem(true, data.memberExistedSites);
                },
                onNormalLogin : function(data) {
                    this.onAutoLogin(data);
                    this.renderPointInfo(data);
                },
                onTempLogin : function(data) {
                    $strHeader.addClass('login');
                    this._renderMenuItem(false, data.memberExistedSites);
                },
                onLoginError : function() {
                    $strHeader.removeClass('login');
                },
                preAuthticate : function(data) {
                },
                onAuthticationSuccessed : function(data) {
                },
                onCloseMenuBox : function(event) {
                },
                onDocumentClick : function(event) {
                },
                onOpenMenuBox : function() {
                },
                preLogout : function() {
                    this._renderPoint('');
                },
                postLogout : function() {
                },
                renderPointInfo : function(data) {
                    this._renderPoint(data.point);
                    this._renderCoupon(data.couponNumber,data.couponExpiration);
                },
                _renderPoint : function (point) {
                    if (!point && point != 0) {
                        $('.header-point', '.header-logo').hide();
                    } else {
                        $('.point.user_accumulated_points', '.header-logo').text(point + 'P');
                        $('.text-l.user_accumulated_points', '.navSlide').text(point);
                        $('.header-point','.header-logo').children('#loadingWrap').hide();
                        $('li.point').find('#loadingWrap').css('display','none');
                        if (point.length >= 9 ) {
                            $('.user_accumulated_points' + '.point', '.header-logo').addClass('text-s');
                        }
                        $('.header-point','.header-logo').children('p').show();
                        $('.header-point', '.header-logo').show();
                    }
                },
                _renderCoupon : function (couponNumber,couponExpiration) {
                    var number = 0;
                    if (couponNumber) {
                        number = couponNumber;
                    }
                    $('#mypage-coupon').find('.coupon-num').text(number);
                    $('#mypage-coupon').show();
                },
                _renderReservationItemCount : function (reservationItemCount) {
                    var count = 0;
                    if (reservationItemCount) {
                        count = reservationItemCount;
                    }
                    $('.text-info','.reserve','navSlide').children('b').text(count);
                },
                _renderPackageDiscount: function() {
                    $('.sethotel', '#str-header,.navSlide').show();
                },

                // MUST BE synchronized with promo/cross_sell.js
                _hasCrossSellApplicablePeriods: function(airItineraries) {
                    if (!airItineraries || !airItineraries.length) {
                        return false;
                    }

                    var AIR_ITINERARY_TYPE = {
                        ONEWAY: 0,
                        ROUNDTRIP: 1,
                        MULTIPLE_DESTINATION: 2
                    };

                    var now = new Date().getTime();
                    var hasSome = false;
                    $.each(airItineraries, function(index, air) {
                        if (now <= skygate.util.date.ymdStringToObject(air.startDate).getTime() && (
                            air.itineraryType === AIR_ITINERARY_TYPE.ONEWAY ||
                            (air.itineraryType === AIR_ITINERARY_TYPE.ROUNDTRIP || air.itineraryType === AIR_ITINERARY_TYPE.MULTIPLE_DESTINATION) && air.startDate < air.endDate
                        )) {
                            hasSome = true;
                            return false;
                        }
                    });
                    return hasSome;
                },

                _renderMenuItem: function(isLogin, sites) {
                    if (isLogin || $.inArray('AT', sites) !== -1) {
                        $('.at-menu-item').show();
                        $('.ea-menu-item').hide();
                    } else if ($.inArray('EA', sites) !== -1) {
                        $('.ea-menu-item').show();
                        $('.at-menu-item').hide();
                    }
                }
            };

            return this.each(function(i, val) {
                var $this = $(val);

                var isInitialized = $this.attr('data-initialized');
                //case sync header with login box
                var isReload = $this.attr('data-reload');
                if (isInitialized && !isReload) {
                    return true;
                } else {
                    $this.attr('data-initialized', 1);
                }
                var options = $.extend(defaults, opts);
                var ajaxOption = {
                    url: API_AUTH_CHECK,
                    cache : false,
                    type: 'POST',
                    dataType: 'json'
                };
                var promise = callAuthApi(ajaxOption);
                promise.done(function(data) {
                    if(!data.status.success){
                        options.onLoginError();
                        setTimeout(function(){
                            options.preAuthticate({login : false});
                        }, LOADING_WAIT_MSEC);
                        trackLoginStatus('not');
                    } else if (data.loginType === AUTO_LOGIN) {
                        options.onAutoLogin(data);
                        options.preAuthticate({login : true});
                        options.onAuthticationSuccessed(data);
                        trackLoginStatus('auto');
                    } else if (data.loginType ===  NOMAL_LOGIN) {
                        options.onNormalLogin(data);
                        options.preAuthticate({login: true});
                        options.onAuthticationSuccessed(data);
                        trackLoginStatus('normal');
                    } else if (data.memberExistedSites && data.memberExistedSites.length > 0) {
                        options.onTempLogin(data)
                        options.preAuthticate({login: true});
                    } else {
                        options.onLoginError();
                        setTimeout(function() {
                            options.preAuthticate({login : false});
                        }, LOADING_WAIT_MSEC);
                        trackLoginStatus('not');
                    }
                    window.jQuery(document).trigger('AutoLoginCompleted', data);
                }).fail(function() {
                    options.onLoginError();
                    setTimeout(function() {
                        options.preAuthticate({login : false});
                    }, LOADING_WAIT_MSEC);
                    window.jQuery(document).trigger('AutoLoginFailed');
                });

                //even is already add when reload case
                if (isReload) {
                    return true;
                }

                //Box Close
                $document.click(function(event) {
                    options.onDocumentClick(event);
                });

                if (options.closeButton) {
                    options.closeButton.click(function (event) {
                        options.onCloseMenuBox(event);
                    });
                }

                if (options.showBoxButton) {
                    options.showBoxButton.click(function(ev) {
                        ev.preventDefault();
                        options.onOpenMenuBox.apply(ev.currentTarget);
                    });
                }

                //ログアウト処理
                options.logoutButton.click(function(ev) {
                    ev.preventDefault();
                    options.preLogout();
                    $('.header-point', '.header-logo').hide();

                    var actionUrl = options.logoutButton.attr('data-action-url');
                    if (actionUrl) {
                        options.postLogout();
                    } else {
                        var ajaxOption = {
                            url: API_LOGOUT,
                            cache : false,
                            type: 'POST',
                            dataType: 'json'
                        };
                        var promise = callAuthApi(ajaxOption);
                        promise.always(function() {
                            options.postLogout();
                            window.jQuery(document).trigger('AutoLoginLogout');
                        });
                    }
                });

                options.loginButton.click(function(ev) {
                    ev.preventDefault();
                    location.href = options.loginUrl + $.param({ redirect: location.href});
                });

                //表示情報更新処理
                if (options.refreshButton != null) {
                    options.refreshButton.click(function(ev) {
                        $('li.point').find('.text-info').css('display','none');
                        $('li.point').find('#loadingWrap').css('display','inline-block');
                        var ajaxOption = {
                            url: API_AUTH_CHECK,
                            cache : false,
                            type: 'POST',
                            data: {
                                "pointRefresh": 1
                            },
                            dataType: 'json'
                        };
                        var promise = callAuthApi(ajaxOption);
                        promise.done(function(data) {
                            options._renderPoint(data.point);
                            $('li.point').find('.text-info').css('display','inline');
                            $('li.point').find('.text-s').css('display','block');
                            $('li.point').find('#loadingWrap').css('display','none');
                        });
                    });
                }
                return true;
            });
        };
        jQuery.fn.autoLogin = autoLogin;
        $.fn.autoLogin = autoLogin;
    });


    skygate = window.skygate || {};
    skygate.util = window.skygate.util || {};
    var isReady = false;
    skygate.util.autoLoginReady = function(callback) {
        if (isReady) {
            callback();
        } else {
            $document.bind('AutoLoginInitialized', function() {
                callback();
            });
        }
    };

    if (jQuery.fn.on && jQuery.Deferred) {
        initializedAutoLogin(window, jQuery);
        isReady = true;
    } else {
        // jquery 1.5未満対応...
        $.getScript('//s.skygate.co.jp/js/lib/jquery_pc.js', function() {
            var usableJQuery = jQuery.noConflict();
            window.jQuery = $;
            initializedAutoLogin(window, usableJQuery);
            isReady = true;
            $document.trigger('AutoLoginInitialized');
        });
    }

    $(function(){
        $(".global-tab-menu li").click(function(){
            var num = $(".global-tab-menu li").index(this);
            $(".global-tab-items").removeClass('active');
            $(".global-tab-items").eq(num).addClass('active');
            $(".global-tab-menu li").removeClass('active');
            $(this).addClass('active');
        });
    });

})(jQuery);