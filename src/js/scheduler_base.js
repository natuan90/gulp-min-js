;(function(window, $) {

    var $document = $(document);

    var PopupSchedulerBaseView = Backbone.View.extend({

        initialize: function(options) {
            _.bindAll(this, 'begin', '_begin', 'skip', 'hidePopup');

            options = options || {};
            this.id = options.id;
            this.$popups = this.$('.targetPopup');
            this.popups = this._makeProcedure();
            this.sequence = 0;
            this.once = !!options.once;

            this.newSequenceEventName = 'Popup:New';
            if (this.id) {
                this.newSequenceEventName += ':' + this.id;
            }
            $document.on(this.newSequenceEventName, this._begin);
            $document.on('Popup:Skip', this.skip);
            $document.on('Popup:Hide', this.hidePopup);
        },

        _makeProcedure: function() {
            var popups = [];
            var popupViews = this._namespace('airlink.view.common.promo.popup.views');
            this.$popups.each(function() {
                var $popup = $(this);
                var name = $popup.data('name');
                var PopupView = popupViews[name];
                if (!PopupView) {
                    return true;
                }
                var view = new PopupView({
                    el: $popup,
                    name: name
                });
                popups.push({
                    $popup: $popup,
                    view: view,
                    deltaBefore: $popup.data('deltaBefore') || 0,
                    deltaAfter: $popup.data('deltaAfter') || 0,
                    expire: $popup.data('expire'),
                    group: $popup.data('group'),
                    banishGroup: $popup.data('banishGroup'),
                    openTag: $popup.data('openTag')
                });
            });
            return popups;
        },

        begin: function(data) {
            $document.trigger(this.newSequenceEventName, data);
        },

        _begin: function(ev, data) {
            if (this.once && this.sequence > 0) {
                return;
            }

            this.sequence++;
            this.sequenceId = (this.id || 's') + this.sequence;
            this.popupIndex = void 0;
            _.each(this.popups, function(popup, popupIndex) {
                popup.$popup.html('').hide();
                popup.view.fetch(this.sequenceId, popupIndex, data);
            }, this);

            this.$el.show();

            this.poppedGroups = [];
            var that = this;
            _.defer(function() {
                that.deltaAfter = 0;
                that.previousPopupAt = new Date().getTime();
                that._reservePopup(that.sequenceId, 0);
            });
        },

        _reservePopup: function(sequenceId, popupIndex) {
            this.popupIndex = popupIndex;
            if (popupIndex >= this.popups.length) {
                return;
            }

            var popup = this.popups[popupIndex];

            if (popup.view.get(sequenceId) === '' ||                         // the popup content had resulted in empty
                popup.group && _.contains(this.poppedGroups, popup.group) || // a representative of this group had already been popped up
                !!popup.banishGroup && this._isBanish(popup.banishGroup)) {
                this._reservePopup(sequenceId, popupIndex + 1);
                return;
            }

            // compute time to wait for next popup
            var scheduledDeltaAfter = this.deltaAfter;
            var scheduledDeltaBefore = popup.deltaBefore;
            var timeAfterPreviousPopup = new Date().getTime() - this.previousPopupAt;
            var computationalDelta = scheduledDeltaAfter + scheduledDeltaBefore - timeAfterPreviousPopup;
            var delta = Math.max(computationalDelta, 0);

            var that = this;
            _.delay(function() {
                popup.view.get(sequenceId, function(innerHTML) {
                    if (that._isCurrentSequence(sequenceId) && that._isCurrentPopup(popupIndex)) {
                        that._addPopup(sequenceId, popupIndex, innerHTML);
                    }
                });
                that.sendTag(popup.openTag);
            }, delta);
        },

        _addPopup: function(sequenceId, popupIndex, innerHTML) {
            var popup = this.popups[popupIndex];
            if (!innerHTML) {
                this._reservePopup(sequenceId, popupIndex + 1);
                return;
            }

            popup.$popup.hide().html(innerHTML).removeData('removing');
            this._showPopup(sequenceId, popup.$popup);

            if (popup.expire) {
                var that = this;
                _.delay(function() {
                    that._isCurrentSequence(sequenceId) && that._hidePopup(sequenceId, popup.$popup);
                }, popup.expire);
            }

            this.deltaAfter = popup.deltaAfter;
            this.previousPopupAt = new Date().getTime();
            popup.group && this.poppedGroups.push(popup.group);
            this._reservePopup(sequenceId, popupIndex + 1);
        },

        skip: function(ev, data) {
            if (this._isCurrentSequence(data.sequenceId) && this._isCurrentPopup(data.popupIndex)) {
                this._reservePopup(this.sequenceId, this.popupIndex + 1);
            }
        },

        hidePopup: function(ev, popupElement) {
            var $popup = $(popupElement);
            if (!this._isOwnerOf($popup) || $popup.data('removing')) {
                return;
            }

            this._hidePopup(this.sequenceId, $popup);
            $popup.data('removing', true);

            var banishGroup = $popup.data('banishGroup');
            if (!!banishGroup) {
                this._addBanish(banishGroup);
            }

            this.sendTag($popup.data('closeTag'));
        },

        _isCurrentSequence: function(sequenceId) {
            return sequenceId === this.sequenceId;
        },

        _isCurrentPopup: function(popupIndex) {
            return popupIndex === this.popupIndex;
        },

        _publishShowedMessage: function(sequenceId, $popup) {
            this._isCurrentSequence(sequenceId) && $document.trigger('Popup:Showed', $popup[0]);
        },

        _publishHidMessage: function(sequenceId, $popup) {
            (!sequenceId || this._isCurrentSequence(sequenceId)) && $document.trigger('Popup:Hid', $popup[0]);
        },

        _isOwnerOf: function($popup) {
            return _.some(this.popups, function(popup) {
                return $popup.is(popup.$popup);
            });
        },

        // return the item located at the destination of given path if exists, otherwise an empty object will be returned
        _namespace: function(path) {
            var currentLocation = window;
            _.some(path.split('.'), function(domain) {
                currentLocation = currentLocation[domain];
                return !currentLocation;
            });
            return currentLocation || {};
        },

        _isBanish: function(key) {
            throw new Error('override me');
        },

        _addBanish: function(key) {
            throw new Error('override me');
        }

    });

    var SendTagMixIn = {

        sendTag: function(tag) {
            if (!tag) {
                return;
            }

            if (tag.type === 2) {
                this.googleAnalytics(tag.data);
            }
        },

        googleAnalytics: function(dataList) {
            if(!_.isEmpty(dataList) && _.isArray(dataList)) {
                ga.apply(null, dataList);
            }
        }

    };

    Cocktail.mixin(PopupSchedulerBaseView, SendTagMixIn);

    skygate.util.namespace('airlink.view.common.promo.popup').PopupSchedulerBaseView = PopupSchedulerBaseView;

})(window, jQuery);