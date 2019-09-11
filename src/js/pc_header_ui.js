//--------------------------------------------------------------------------------------------------
// pc_header_ui.js
//--------------------------------------------------------------------------------------------------
;(function(window, $) {
    $(function() {
        var $strHeader = $('#str-header');
        var isIE7 = typeof window.addEventListener == 'undefined' && typeof document.querySelectorAll == 'undefined';
        if (isIE7 && location.protocol !== 'https:') {
            $strHeader.find('.utility-inner').hide();
            return;
        }
        var RESIZE_WAIT_MSEC = 200,
            RESIZE_CHANGE_PIX = 1055;

        var $menuLoginMember = $('#menuLoginMember'),
            $headerUtilityDetail = $('.header-utility-detail'),
            $logoutLoading = $strHeader.find('li.header-loading'),
            $utilityDetailItemMember = $('.utility-detail-item.member');

        var $headerUtilityDetailLogin = $headerUtilityDetail.children('.login'),
            $headerUtilityDetailMember = $('#header-nav-member'),
            $hideLoading = $strHeader.find('li.hideLoading'),
            $allowAutoLogin = $strHeader.hasClass('mypage-header') ? 1 : 0;

        var resizeWindow = function() {
            if ($(window).width() >= RESIZE_CHANGE_PIX) {
                $utilityDetailItemMember.css('left', '').css('right', 0);
            } else if ($menuLoginMember[0]) {
                var left = 0;
                if ($strHeader.find('.history')[0]) {
                    left = $menuLoginMember.offset().left - ($utilityDetailItemMember.outerWidth() - $menuLoginMember.width());
                } else {
                    left = $menuLoginMember.offset().left;
                }
                $utilityDetailItemMember.css('left', left);
            }
        };

        var opts = {
            logoutButton : $('#logout-header'),
            showBoxButton : $('#menuLoginMember'),
            loginButton : $strHeader.find('.login').children('a'),

            onAuthticationSuccessed : function(data) {
                if ($utilityDetailItemMember[0]) {
                    var resizedTimer = false;
                    $(window).resize(function() {
                        if (resizedTimer !== false) {
                            clearTimeout(resizedTimer);
                        }
                        resizedTimer = setTimeout(function() {
                            resizeWindow();
                        }, RESIZE_WAIT_MSEC);
                    });
                }

                var setMemberMail = function() {
                    $('#input_member_mail').children('input').val(data.mailAddress);
                    try {
                        $('#member_pass').children('input').attr('type', 'text').val('').attr('type', 'password');
                    } catch (e) {}
                };

                if ($('#input_member_mail').children('input').length) {
                    setMemberMail();
                } else {
                    $(document).bind('setLoginId', function() {
                        setMemberMail();
                    });
                }
            },

            preAuthticate : function(status) {
                $strHeader.find('li.header-loading').hide();
                if (status.login) {
                    $hideLoading.hide();
                    $menuLoginMember.show();
                } else {
                    $hideLoading.show();
                    $menuLoginMember.hide();
                }
            },

            onDocumentClick : function(event) {
                if (!$(event.target).closest('.header-utility-btn-list').length) {
                    $headerUtilityDetailMember.hide();
                }
            },

            //ログアウト Box表示
            onOpenMenuBox : function() {
                $headerUtilityDetailMember.toggle();
            },

            preLogout : function() {
                $('.ea-menu-item').hide();
                $('#header-mypage-top').show();
                $logoutLoading.show();
                $hideLoading.hide();
                $strHeader.removeClass('login');
                $headerUtilityDetailMember.hide();
            },

            //ログアウト
            postLogout : function() {
                var logout_btn = $('#logout-header');
                var moveTo = logout_btn.attr('data-move-to');
                if (moveTo) {
                    $menuLoginMember.hide();
                    location.href = moveTo;
                    return;
                }

                var actionUrl = logout_btn.attr('data-action-url');
                if (actionUrl) {
                    $menuLoginMember.hide();
                    exeSkygProcMyPageAction(null, 'logout', '99999', './action/SkygBasketActionMyTopReq', actionUrl);
                } else {
					$hideLoading.show();
                    $menuLoginMember.hide();
                    $logoutLoading.hide();
                }
                $(document).trigger("authentication:postLogout");
            }
        };

        function initialize() {
            skygate.util.autoLoginReady(function () {
                $menuLoginMember.autoLogin(opts);
            });
        };

        initialize();

        $(document).bind('headerRefreshed', function() {
             initialize();
        });

        // - Hambuger Menu helper functions
        // functions is Extracted from skygserve module
        var addHiddenIfNeeded = function( form, key, value ) {
            var element = form.elements[key];
            if (element != undefined && element != null) {
                element.value = value;
            } else {
                var input = document.createElement('input');
                input.type = 'hidden';
                input.name = key;
                input.value = value;
                form.appendChild(input);
            }
        };

        var appendInput = function( form, key, value ) {
            if (form != null) {
                form.append($('<input>', {
                    'name': key,
                    'value': value,
                    'type': 'hidden'
                }));
            }
        };

        var exeSkygProcMyPageAction = function(event, mission, dispNo, action, actionUrl) {
            if (actionUrl == null || actionUrl == undefined || actionUrl == "") {
                return;
            }
            if (event) {
                event.preventDefault();
            }
            var url = "https://" + actionUrl;
            if (action != "") {
                var act = action.substring(1,action.length);
                url += act;
            }

            var newForm = $('<form>', {
                'action': url,
                'method':'POST'
            });

            if (mission != "" ) {
                appendInput(newForm, 'event', mission);
            }
            if (dispNo != "" ){
                appendInput(newForm, 'dispNo', dispNo);
                if (dispNo == '11500'){
                    appendInput(newForm, 'S1', 'faq_history');
                    appendInput(newForm, 'DISP_NO', dispNo);
                }
            }

            $('body').append(newForm);
        	newForm.submit();
        };

        var exeRedirectAuthAction = function(event, actionUrl, action, data, allowAutoLogin, method, redirectPath) {
            if (actionUrl == null || actionUrl == undefined || actionUrl == ""){
                return;
            }

            if (event) {
                event.preventDefault();
            }

            if (!allowAutoLogin) {
                allowAutoLogin = 0;
            }

            var targetUrl = "https://" + actionUrl;
            if (action != "") {
                var act = action.substring(1,action.length);
                targetUrl += act;
            }

            if(!redirectPath){
                redirectPath = skygate.util.redirectAuthCheckUrl;
            }
            var requestUrl = skygate.util.createRedirectAuthPath(targetUrl, data, allowAutoLogin, method, redirectPath);
            location.href = requestUrl;
        };

        var redirectToMyPageTop = function(event, actionUrl) {
            if (skygate.util.isAuOne()) {
                event.preventDefault();
                location.href = skygate.util.redirectMypageLoginUrl;
            } else {
                exeRedirectAuthAction(event, actionUrl, './SkygateServlet', {S1: 'mytop', DISP_NO:'1100600'}, $allowAutoLogin);
            }
        };

        var redirectToMyPageSelection = function(event, actionUrl) {
            if (skygate.util.isAuOne()) {
                event.preventDefault();
                location.href = skygate.util.redirectMypageLoginUrl;
            } else {
                exeRedirectAuthAction(event, actionUrl, './SkygateServlet', {S1: 'mytop', DISP_NO:'1100600'}, $allowAutoLogin, null, skygate.util.redirectMypageCheckUrl);
            }
        };

        $("#mypage-reserve").click(function(event){
            var actionUrl = $(this).children('a').attr('action-data');
            redirectToMyPageTop(event, actionUrl);
        });

        $("#mypage-coupon").click(function(event){
            if (skygate.util.isAuOne()) {
                event.preventDefault();
                location.href = "/common/coupon_list";
            } else {
                var actionUrl = location.host;
                exeRedirectAuthAction(event, actionUrl, './common/coupon_list', {}, 1, 'GET');
            }
        });

        $("#mypage-edit-info").click(function(event){
            var actionUrl = $(this).children('a').attr('action-data');
            if (skygate.util.isAuOne()) {
                exeSkygProcMyPageAction(event, 'next', '81500', './action/SkygMemberActionMyPagePersonal', actionUrl);
            } else {
                exeRedirectAuthAction(event, actionUrl, './action/SkygMemberActionMyPagePersonal', {event: 'next', dispNo: '81500'}, $allowAutoLogin);
            }
        });

        $("#mypage-edit-email").click(function(event){
            var actionUrl = $(this).children('a').attr('action-data');
            if (skygate.util.isAuOne()) {
                exeSkygProcMyPageAction(event, 'next', '81500', './action/SkygActionMemberMailAdrReq', actionUrl);
            } else {
                exeRedirectAuthAction(event, actionUrl, './action/SkygActionMemberMailAdrReq', {event: 'next', dispNo: '81500'}, $allowAutoLogin);
            }
        });

        $("#mypage-notice-history").click(function(event){
            var actionUrl = $(this).children('a').attr('action-data');
            if (skygate.util.isAuOne()) {
                exeSkygProcMyPageAction(event, '', '11500', './SkygateServlet', actionUrl);
            } else {
                exeRedirectAuthAction(event, actionUrl, './SkygateServlet', {dispNo: '11500', S1: 'faq_history', DISP_NO:'11500'}, $allowAutoLogin);
            }
        });

        $("#mypage-reserve-share").click(function(event){
            if (skygate.util.isAuOne()) {

            } else {
                var actionUrl = location.host;
                exeRedirectAuthAction(event, actionUrl, './mypage/sharetrip/list', {}, $allowAutoLogin);
            }
        });

        $("#mypage-edit-notice").click(function(event){
            var actionUrl = $(this).children('a').attr('action-data');
            if (skygate.util.isAuOne()) {

            } else {
                exeRedirectAuthAction(event, actionUrl, './action/SkygActionMemberMailMagazineReq', {dispNo: '81500'}, $allowAutoLogin);
            }
        });


	$("#mypage-receipt-print").click(function(event){
	    var actionUrl = $(this).children('a').attr('action-data');
            if (skygate.util.isAuOne()) {

            } else {
		exeRedirectAuthAction(event, actionUrl, './action/SkygActionMemberReceiptList', {event: 'next', dispNo: '81500'}, $allowAutoLogin);
            }
        });

        $("#nav-slide-logout").click(function(event){
            var actionUrl = $(this).children('a').attr('action-data');
            exeSkygProcMyPageAction(event, 'logout', '', '', actionUrl);
        });
    });
})(window, jQuery);
