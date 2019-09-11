(function(window, $) {

    var _depDateBase = {

        maxSelectableMonthLater : 11,

        selectedDaysLaterChoiseBorderHour : 16,

        dateStartsFrom : function() {
            // FIXME もうちょっとスムーズに。。
            var daysLater = ((new Date()).getHours() >= this.selectedDaysLaterChoiseBorderHour) ? 2 : 1;
            var now = new Date();
            now.setHours(0);
            now.setMinutes(0);
            now.setSeconds(0);
            var firstDatetime = now.getTime() + daysLater * 24 * 60 * 60 * 1000;
            return new Date(firstDatetime);
        },

        maxSelectableDate : function() {
            var now = new Date()
            now.setMonth(now.getMonth() + this.maxSelectableMonthLater);
            return now;
        },

        eachSelectableDates : function(callback) {
            var firstDate = this.dateStartsFrom();
            firstDate.setDate(1);
            for (var i = 0; i <= this.maxSelectableMonthLater; i++) {
                callback(firstDate);
                firstDate.setMonth(firstDate.getMonth() + 1);
            }
        }

    };

    skygate.util.namespace('skygate.view.pc.searchform.component')._depDateBase = _depDateBase;

})(window, jQuery);
