;(function(window, $) {

    var $document = $(document);

    var BookmarksCountView = Backbone.View.extend({

        toApiResponseType: {
            saved_search: 'saved_search',
            search: 'search_history'
        },

        initialize : function(options) {
            _.bindAll(this, 'getCount', 'renderCount', 'transmitCount');

            this.model = new airlink.model.common.bookmarks.BookmarksCount(null, {
                service: options.target
            });

            $document.on('bookmarks:updateCount', this.getCount);
            $document.on('bookmarks:updateCountCompleted bookmarks:updateCountFailed', this.renderCount);
            $document.on('bookmarks:requireCount', this.transmitCount);

            if (options.updateCount) {
                $document.trigger('bookmarks:updateCount');
            }
        },

        getCount: function(ev, data) {
            this.model.getCount(data && data.types);
        },

        renderCount: function(ev, counts) {
            if (!counts) {
                return;
            }

            var $targets = $('.targetBookmarksCount, .targetBookmarksToggle');
            if (!$targets.length) {
                return;
            }

            var that = this;
            $targets.each(function() {
                var $target = $(this);
                var targetTypes = _.map($target.data('type').split(','), function(type) {
                    return that.toApiResponseType[$.trim(type)];
                });

                var targetCounts = _.values(_.pick(counts, targetTypes));
                if (_.isEmpty(targetCounts)) {
                    return;
                }

                var sum = _.reduce(targetCounts, function(n, count) { return n + count; }, 0);

                if ($target.hasClass('targetBookmarksCount')) {
                    $target.text(sum);
                }
                if ($target.hasClass('targetBookmarksToggle')) {
                    var activeClass = $target.data('activeClass');
                    $target.toggleClass(activeClass, sum > 0);
                }
            });
        },

        transmitCount: function(ev, callback) {
            if (!_.isFunction(callback)) {
                return;
            }

            var counts = {};
            var toType = _.invert(this.toApiResponseType);
            _.each(this.model.toJSON(), function(value, key) {
                counts[toType[key]] = value;
            });

            callback(counts);
        }

    });

    skygate.util.namespace('airlink.view.air.bookmarks').BookmarksCountView = BookmarksCountView;

})(window, jQuery);