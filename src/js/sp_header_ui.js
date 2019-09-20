//--------------------------------------------------------------------------------------------------
// sp_header_ui.js
//--------------------------------------------------------------------------------------------------
;(function(window, $) {
    $(function() {
		var $strHeader = $('#str-header'),
            $menuLoginMember = $('#menuLoginMember'),
            $headerUtilityDetail = $('.header-utility-detail'),
            $logoutLoading = $strHeader.find('li.header-loading'),
            $allowAutoLogin = $strHeader.hasClass('mypage-header') ? 1 : 0;

        var $hideLoading = $strHeader.find('li.hideLoading');

        var opts = {
            logoutButton : $('#logout-header'),
            showBoxButton : $strHeader.find('.modal-full-trigger'),
            closeButton : $('.header-modal .modal-close'),
            loginButton : $strHeader.find('.login').children('button'),

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

            //ログイン用　メアドセット
            onAuthticationSuccessed : function(data) {
                var inputMemberMail = $('#input_member_mail').children('input');
                if (inputMemberMail.length) {
                    inputMemberMail.val(data.mailAddress);
                    $('#member_pass').find('input').attr('type', 'text').val('').attr('type', 'password');
                }
            },

            //Box Close
            onCloseMenuBox : function(event) {
                $('.header-modal.modal-full').fadeOut('fast');
                $('.hideMainDiv').removeClass('hideMainDiv').show();
				$('.js-slick-slider').slick('refresh');
            },

            //menu Box表示
            onOpenMenuBox : function() {
                var $showButton = $(this);
                $showButton.blur();
                var targetId = $($showButton).attr('data-target');
                if (typeof(targetId) == 'undefined' || !targetId || targetId == null) {
                    return false;
                }
                var nowModalSyncer = $($showButton).parents('#str-header').parent().find('.' + targetId);
                $('#str-header,.strHeader,#str-footer,.site_footer,.str-hdg-lv1, .topicPath,.str-contents,.mainContainer,#main,.main,.main_content,#business,.nav-global,.strMainContent, .chatplusview-app, #flipdesk').filter(':visible').addClass('hideMainDiv').hide();
                $(nowModalSyncer).siblings().filter(':visible').addClass('hideMainDiv').hide();
                $(window).scrollTop(0);

                if (nowModalSyncer == null) {
                    return false;
                }
                $(nowModalSyncer).fadeIn('fast');
            },

            preLogout : function() {
                $('.at-menu-item').hide();
                $('.ea-menu-item').hide();
                $logoutLoading.show();
                $hideLoading.hide();
                $strHeader.removeClass('login');
            },

            //ログアウト
            postLogout : function() {
				var logout_btn = $('#logout-header');
                var moveTo = logout_btn.attr('data-move-to');
                if (moveTo) {
                    $menuLoginMember.hide();
                    location.href = moveTo;
				} else {
					var actionUrl = logout_btn.attr('data-action-url');
					if (actionUrl) {
						$menuLoginMember.hide();
						exeSkygProcMyPageAction(null, 'logout', '99999', './action/SkygBasketActionMyTopReq', actionUrl);
					} else {
						$hideLoading.show();
						$menuLoginMember.hide();
						$logoutLoading.hide();
					}
				}
				//trigger event to notify to tour
				$(document).trigger("authentication:postLogout");
			}
		};

        function initialize() {
            skygate.util.autoLoginReady(function() {
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
            if (element != null) {
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
			if (!actionUrl) {
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

			var newForm = jQuery('<form>', {
                'action': url,
                'method':'POST'
			});

            if (mission != "") {
                appendInput(newForm, 'event', mission);
            }
            if (dispNo != "") {
                appendInput(newForm, 'dispNo', dispNo);
                if (dispNo == '11500') {
                    appendInput(newForm, 'S1', 'faq_history');
                    appendInput(newForm, 'DISP_NO', dispNo);
                }
            }

            $('body').append(newForm);
			newForm.submit();
		};

		var exeRedirectAuthAction = function(event, actionUrl, action, data, allowAutoLogin, method, redirectPath) {
            if (actionUrl == null || actionUrl == undefined || actionUrl == "") {
                return;
            }

			if (event) {
                event.preventDefault();
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

        var exeRedirectAuMemberAction = function(event, actionUrl, action, data) {
            if (actionUrl == null || actionUrl == undefined || actionUrl == "") {
                return;
            }

			if (event) {
                event.preventDefault();
            }

            var targetUrl = "https://" + actionUrl;
            if (action != "") {
                var act = action.substring(1,action.length);
                targetUrl += act;
            }
            targetUrl += '?' + $.param(data);

            var loginUrl = 'https://' + location.host + '/common/auth/mypage?providerCode=00002';
            location.href = loginUrl + "&loginUrl=" + encodeURIComponent(targetUrl);
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
			}
			else{
				var actionUrl = location.host;
				exeRedirectAuthAction(event, actionUrl, './common/coupon_list', {}, 1, 'GET');
			}
		});

		$("#mypage-edit-info").click(function(event){
			var actionUrl = $(this).children('a').attr('action-data');
			if (skygate.util.isAuOne()) {
				exeRedirectAuMemberAction(event, actionUrl, './action/SkygMemberActionMyPagePersonal', {event: 'next', dispNo: '81500'});
			}
			else{
				exeRedirectAuthAction(event, actionUrl, './action/SkygMemberActionMyPagePersonal', {event: 'next', dispNo: '81500'}, $allowAutoLogin);
			}
		});

		$("#mypage-edit-email").click(function(event){
			var actionUrl = $(this).children('a').attr('action-data');
			if (skygate.util.isAuOne()) {
				exeRedirectAuMemberAction(event, actionUrl, './action/SkygActionMemberMailAdrReq', {event: 'next', dispNo: '81500'});
			}
			else{
				exeRedirectAuthAction(event, actionUrl, './action/SkygActionMemberMailAdrReq', {event: 'next', dispNo: '81500'}, $allowAutoLogin);
			}
		});

		$("#mypage-notice-history").click(function(event){
			var actionUrl = $(this).children('a').attr('action-data');
			if (skygate.util.isAuOne()) {
				exeRedirectAuMemberAction(event, actionUrl, './SkygateServlet', {dispNo: '11500', S1: 'faq_history', DISP_NO:'11500'});
			}
			else {
				exeRedirectAuthAction(event, actionUrl, './SkygateServlet', {dispNo: '11500', S1: 'faq_history', DISP_NO:'11500'}, $allowAutoLogin);
			}
		});

		$("#mypage-reserve-share").click(function(event){
			if (skygate.util.isAuOne()) {

			}
			else {
                var actionUrl = location.host;
                exeRedirectAuthAction(event, actionUrl, './mypage/sharetrip/list', {}, $allowAutoLogin);
			}
		});

        $("#mypage-edit-notice").click(function(event){
			var actionUrl = $(this).children('a').attr('action-data');
			if (skygate.util.isAuOne()) {

			}
			else {
				exeRedirectAuthAction(event, actionUrl, './action/SkygActionMemberMailMagazineReq', {dispNo: '81500'}, $allowAutoLogin);
			}
		});

		$("#mypage-receipt-print").click(function(event){
			var actionUrl = $(this).children('a').attr('action-data');
			if (skygate.util.isAuOne()) {

			}
			else {
				exeRedirectAuthAction(event, actionUrl, './action/SkygActionMemberReceiptList', {event: 'next', dispNo: '81500'}, $allowAutoLogin);
			}
		});

		$("#nav-slide-logout").click(function(event){
			var actionUrl = $(this).children('a').attr('action-data');
			exeSkygProcMyPageAction(event, 'logout', '', '', actionUrl);
		});

		$("#mypage-flight-history").click(function(event){
			if (skygate.util.isAuOne()) {

			}
			else {
                var actionUrl = location.host;
                exeRedirectAuthAction(event, actionUrl, './mypage/flighthistory/top', {}, $allowAutoLogin);
			}
		});

    });
})(window, jQuery);

