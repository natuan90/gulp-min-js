(function(window, $) {
    function getUrlParameter(name) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        var results = regex.exec(location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    };

    $(document).ready(function() {			
		if (getUrlParameter('AgentCode') != null && getUrlParameter('AgentCode') == 'MTCTJ'){
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.text = '! function(e, t, n, r, a, c, s) {\r\n '+               
                'e.TrackerObject = a, e[a] = e[a] || function() {\r\n'   +
                '(e[a].q = e[a].q || []).push(arguments)\r\n' +
                '}, e[a].l = 1 * new Date, c = t.createElement(n),\r\n' +
                's = t.getElementsByTagName(n)[0], c.async = 1, c.src = r + \"?_t=\" + e[a].l, s.parentNode.insertBefore(c, s)\r\n' +
                '}\r\n' +
                '(window, document, \"script\", \"https:\/\/script-ad.mobadme.jp\/js\/tracker.js\", \"trk\");\r\n' +
                'trk(\"configure\", \"domain\", \".skygate.co.jp\");\r\n' +
                'trk(\"set\", \"41273\");\r\n'
            document.body.appendChild(script);
        }
    });
    
})(window, jQuery);