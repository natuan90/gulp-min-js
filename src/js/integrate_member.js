(function (window, $) {
    var getUrlParameters = function () {
        var query = window.location.search.substring(1);
        var params = {};
        var param_value = query.split('&');
        for (var i = 0; i < param_value.length; i++) {
            var parts = param_value[i].split('=', 2);
            params[parts[0]] = parts[1];
        }

        return params;
    };

    var isAuOne = function() {
        var AUTRAVEL_HOST = "autravel.auone";
        var result = false;
        var host = location.host;

        if (host.indexOf(AUTRAVEL_HOST) !== -1) {
            result = true;
        }
        return result;
    };

    function isNumberForIntegrateMember(value){
        if(value == ""){
            return false ;
        }
        return !value.match(/[^0-9]/);
    }

    function saveMemberCookies() {
        // Get parameter from URL
        var params = getUrlParameters();
        var tlst = params["tlst"];
        var ea = params["ea"];
        var at = params["at"];

        if (tlst == undefined)
            return;

        // Check prevent after logout or invalid input tlst .
        var tlst_past = $.cookie("__tlst__");
        if (tlst_past == tlst || !isNumberForIntegrateMember(tlst)) {
            return;
        }
        
        // Caculate expire time
        var date = new Date(parseInt(tlst));
        var expiresTime = date.getTime() + (60 * 60 * 1000);
        date.setTime(expiresTime);

        // Store cookie
        if (ea != undefined) {
            $.cookie("__ea__", "1", { expires: date, path: "/", domain: ".skygate.co.jp", secure: true });
        }
        if (at != undefined) {
            $.cookie("__at__", "1", { expires: date, path: "/", domain: ".skygate.co.jp", secure: true });
        }
        if (tlst != undefined) {
            $.cookie("__tlst__",tlst, { expires: date, path: "/", domain: ".skygate.co.jp" });
        }

    }

    function initialize() {
        $(".redirect-to-airtrip").unbind("click");
        $(".redirect-to-airtrip").click(function (e) {

            e.preventDefault();
            var url = $(this).attr("href");

            var st = $.cookie("__st__");
            var at = $.cookie("__at__");
            var ea = $.cookie("__ea__");


            if (st == undefined && at == undefined && ea == undefined) {
                window.location = url;
                return;
            }

            var tlst = new Date().getTime();

            if (url.indexOf('?') > -1) {
                url = url + "&tlst=" + tlst;
            } else {
                url = url + "?tlst=" + tlst;
            }
            if (at != undefined || st != undefined) {
                url = url + "&at=1";
            }
            if (ea != undefined) {
                url = url + "&ea=1";
            }
            window.location = url;
        });


    }

    // render mypage url (in case of NO auto_login.js)
    function renderMypageUrl() {

        // Skip if there no mypage url
        if (($("#header-mypage-top").length + $("#mypage-top").length) === 0) return;

        // Skip this handle for au travel site
        if (isAuOne()) return;

        // Handle skip re-input password when go to mypage
        var allowAutoLogin = "&allowAutoLogin=0";
        if ($('#str-header').hasClass("mypage-header")) {
            allowAutoLogin = "&allowAutoLogin=1";
        }

        var AT_MYPAGE_URL = "/common/redirect_auth_check?rq=eyJhY3Rpb24iOiJodHRwczovL3d3dy5za3lnYXRlLmNvLmpwL3NreWdzZXJ2L1NreWdhdGVTZXJ2bGV0IiwibWV0aG9kIjoiUE9TVCIsIlMxIjoibXl0b3AiLCJESVNQX05PIjoiMTEwMDYwMCJ9" + allowAutoLogin;
        var SELECTION_PAGE_URL = "/common/select_mypage?rq=eyJhY3Rpb24iOiJodHRwczovL3d3dy5za3lnYXRlLmNvLmpwL3NreWdzZXJ2L1NreWdhdGVTZXJ2bGV0IiwibWV0aG9kIjoiUE9TVCIsIlMxIjoibXl0b3AiLCJESVNQX05PIjoiMTEwMDYwMCJ9" + allowAutoLogin;
        if (location.host.indexOf("sp.skygate.co.jp") !== -1) {
            AT_MYPAGE_URL = "/common/redirect_auth_check?rq=eyJhY3Rpb24iOiJodHRwczovL3NwLnNreWdhdGUuY28uanAvc2t5Z3NlcnYvU2t5Z2F0ZVNlcnZsZXQiLCJtZXRob2QiOiJQT1NUIiwiUzEiOiJteXRvcCIsIkRJU1BfTk8iOiIxMTAwNjAwIn0%3D" + allowAutoLogin;
            SELECTION_PAGE_URL = "/common/select_mypage?rq=eyJhY3Rpb24iOiJodHRwczovL3NwLnNreWdhdGUuY28uanAvc2t5Z3NlcnYvU2t5Z2F0ZVNlcnZsZXQiLCJtZXRob2QiOiJQT1NUIiwiUzEiOiJteXRvcCIsIkRJU1BfTk8iOiIxMTAwNjAwIn0%3D" + allowAutoLogin;
        }

        var st = $.cookie("__st__");
        var at = $.cookie("__at__");
        var ea = $.cookie("__ea__");

        var mypageUrl = AT_MYPAGE_URL;
        if ((st !== undefined || at !== undefined) && ea !== undefined) {
            mypageUrl = SELECTION_PAGE_URL;
        }
        mypageUrl = "https://" + location.host + mypageUrl;

        $("#mypage-top").children("a").attr("href", mypageUrl);
        $("#header-mypage-top").children("a").attr("href", mypageUrl);
    }

    saveMemberCookies();

    $(document).bind("headerRefreshed", function () {
        initialize();
    });

    // Update mypage url after authentication check success
    $(document).bind("AutoLoginCompleted", function () {
        renderMypageUrl();
    });

    // Update mypage url after logout
    $(document).bind("authentication:postLogout", function () {
        renderMypageUrl();
    });

    $(document).ready(function () {
        initialize();

        renderMypageUrl();
    });

})(window, jQuery);


