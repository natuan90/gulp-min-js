;(function(window, $) {

    var $document = $(document);

    var PopupBaseView = Backbone.View.extend({

        initialize: function(options) {
            _.bindAll(this, '__commit');
            this.fetcher = options.fetcher; // required
            this.timeout = options.timeout || 0;
            this.result = {};
            this.reservedReceiver = {};
        },

        // start asynchronous evaluation of pop-up content with given data
        // where the "sequenceId" is a value that identifies each pop-up sequences
        // NOTE THAT: the fetcher() must call given 'committer' whatever results follow, or the pop-up sequence gets stuck
        fetch: function(sequenceId, popupIndex, data) {
            var committer = _.once(_.partial(this.__commit, sequenceId, popupIndex));
            this.fetcher.call(this, committer, data);
            if (this.timeout) {
                _.delay(committer, this.timeout, '');
            }
        },

        // commit the result of asynchronous evaluation
        // empty or undefined innerHTML means 'skip this pop-up'
        // this function cannot be called directly
        __commit: function(sequenceId, popupIndex, innerHTML) {
            this.result[sequenceId] = innerHTML || '';
            if (this.reservedReceiver[sequenceId]) {
                this.__submitHTML(sequenceId, this.reservedReceiver[sequenceId]);
            } else if (!this.result[sequenceId]) {
                $document.trigger('Popup:Skip', {
                    sequenceId: sequenceId,
                    popupIndex: popupIndex
                });
            }
        },

        // require the pop-up content immediately, or via receiver
        // if the content is not yet prepared, it will be passed to given receiver when it has been fetched
        get: function(sequenceId, receiver) {
            var result = this.result[sequenceId];
            if (!receiver) {

                // result = undefined -> pending
                // result = ''        -> resulted in empty
                return result;
            }

            if (_.isUndefined(result)) { // now waiting for the result
                this.reservedReceiver[sequenceId] = receiver;
            } else {
                this.__submitHTML(sequenceId, receiver);
            }
        },

        __submitHTML: function(sequenceId, receiver) {
            receiver.call(this, this.result[sequenceId]);
            delete this.result[sequenceId];
            delete this.reservedReceiver[sequenceId];
        }

    });

    skygate.util.namespace('airlink.view.common.promo.popup').PopupBaseView = PopupBaseView;


    var BasePopupViewMixin = {

        events: {
            'click .targetClose': 'triggerHideEvent'
        },

        triggerHideEvent: function(ev) {
            var $popup = $(ev.currentTarget).parents('.targetPopup:first');
            $document.trigger('Popup:Hide', $popup[0]);
        }

    };

    skygate.util.namespace('airlink.view.common.promo.popup').BasePopupViewMixin = BasePopupViewMixin;

})(window, jQuery);