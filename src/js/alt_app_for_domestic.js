(function(window, $) {
    var msf = airlink.view.sp.multi_search_form;

    $(function() {
        new msf.AirFormView();

        new msf.CalendarView();
        new msf.AirFormRouterForLp();

        if (!Backbone.History.started) {
            Backbone.history.start({
                pushState: false,
                root: window.location.pathname
            });
        }
    });
})(window, jQuery);
