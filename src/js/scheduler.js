;(function(window, $) {

    var $document = $(document);

    var PopupSchedulerView = airlink.view.common.promo.popup.PopupSchedulerBaseView.extend({

        el: '#targetPopupArea',

        verticalGapBetweenPopups: 13,

        initialize: function(options) {
            this.constructor.__super__.initialize.call(this, options);
        },

        _showPopup: function(sequenceId, $popup) {
            $popup.show();
            this._publishShowedMessage(sequenceId, $popup);
            var that = this;
            _.defer(function() {
                that._adjust();
            });
        },

        _hidePopup: function(sequenceId, $popup) {
            var that = this;
            $popup.fadeOut(300, function() {
                that._publishHidMessage(sequenceId, $popup);
                that._adjust();
            });
        },

        // adjust layout of visible pop-ups
        _adjust: function() {
            var $visiblePopups = this.$popups.filter(':visible');
            $visiblePopups = $($visiblePopups.get().reverse());
            var currentHeight = 0;
            _.each($visiblePopups, function(popup, i) {
                var $popup = $(popup);
                $popup.stop(false, true).animate({
                    'bottom': currentHeight
                }, {
                  duration: 200,
                  easing: 'linear'
                });
                currentHeight += $popup.outerHeight() + this.verticalGapBetweenPopups;
            }, this);
        },

        _isBanish: function(key) {
            return !!$.cookie(key);
        },

        _addBanish: function(key) {
            $.cookie(key, 1, {path: '/'});
        }

    });

    skygate.util.namespace('airlink.view.common.promo.popup.pc').PopupSchedulerView = PopupSchedulerView;

})(window, jQuery);
