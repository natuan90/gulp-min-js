(function(window, $) {

    var $document = $(document);

    var BookmarksCount = Backbone.Model.extend({

        // FIXME: use centralized definitions
        ALL_TYPES: [
            'saved_search',
            'favorite',
            'detail_history',
            'search_history'
        ],

        API_URL: {
            abroad_air: '/common/bookmarks/get_abair_regist_num',
            dp: '/common/bookmarks/get_dp_regist_num',
            abroad_hotel: '/common/bookmarks/get_abhotel_regist_num',
            domestic_hotel: '/common/bookmarks/get_domhotel_regist_num',
            domestic_air: '/common/bookmarks/get_domair_regist_num'
        },

        initialize: function(attributes, options) {
            this.url = this.API_URL[options.service];
            this.prefixEventName = 'bookmarks';
            // isEventNameIncludeServiceName is optional value (true / false / undefined)
            if (options.isEventNameIncludeServiceName === true) {
                this.prefixEventName += ':' + options.service;
            }
        },

        // we do not care about consistency of concurrent request
        getCount: function(types) {
            var data = {};
            if (types && types.length > 0) {
                data['types'] = types.join(',');
            }

            var that = this;
            this.fetch({
                data: data,
                cache: false,
                success: function() {
                    $document.trigger(that.prefixEventName + ':updateCountCompleted', that.toJSON());
                },
                error: function() {
                    that.set(that._emptyResponse());
                    $document.trigger(that.prefixEventName + ':updateCountFailed', that.toJSON());
                }
            });
        },

        parse: function(response) {
            return response.status ? response.response : this._emptyResponse();
        },

        _emptyResponse: function() {
            return _.reduce(this.ALL_TYPES, function(d, type) {
                d[type] = 0;
                return d;
            }, {});
        }

    });

    skygate.util.namespace('airlink.model.common.bookmarks').BookmarksCount = BookmarksCount;

})(window, jQuery);
