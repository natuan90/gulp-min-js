(function(window, $) {
    var format = skygate.util.format;

    var ns = airlink.model.common.ui_integration_multi_search_form;

    var CityHotelModalView = Backbone.View.extend({
        events: {
            'click .place': 'showCityModal',
            'click .recommendOption': 'onSelectOption',
            'click .btn-close-01': 'hideModal',
            'click .js-btn-set': 'clearInput',
            'keyup .place': 'showOrHideClearanceButton'
        },

        initialize: function (options) {
            this.$modalCity = this.$el.find('.modal-city-popular');

            this.initRecommendHotelCityTable(options.optionData);
            var that = this;
            $('body').mouseup(function(e) {
                var container = that.$modalCity;
                if (!container.is(e.target) && container.has(e.target).length === 0) {
                    container.hide();
                }
            });
        },

        initRecommendHotelCityTable: function (optionData) {
            var recommendHotelCityTableTemplate = _.template($('#recommnedHotelCityTableTemplate').html());
            this.$el.find('.recommendHotelCityTable').html(recommendHotelCityTableTemplate({
                hotelCities: optionData.hotelCities || []
            }));
        },

        onSelectOption: function (e) {
            var $target = $(e.currentTarget);
            var regionCode = $target.data('regionCode');
            var cityName = $target.data('cityName');
            var input = $(e.currentTarget).closest('.input-text-base').find('input.place');
            input.val(cityName);
            input.attr('data-regionId', regionCode);
            input.attr('data-suggestLabel', cityName);
            this.hideModal();
            $(e.currentTarget).closest('.input-text-base').find('.err-text-01').hide();
            input.trigger('keyup');

            // Close current modal
            $(e.currentTarget).closest('.input-text-base').find('.modal-city-popular').hide();
        },

        clearInput: function (e) {
            var input = $(e.currentTarget).closest('.input-text-base').find('input.place');
            input.val('');
            input.attr('data-cityCode', '');
            input.attr('data-suggestLabel', '');
            input.trigger('click');
            input.focus();
            $(e.currentTarget).hide();
        },

        showCityModal: function (e) {
            var currentData = $(e.currentTarget).attr('data-citycode');
            if (currentData) {
                // Reset back-ground color before set again
                $('.str-search .list-area-01 > li').removeClass('selected');

                $('*[data-three-letter="' + currentData + '"]').closest('.str-search .list-area-01 > li').addClass('selected');
            } else {
                $('.str-search .list-area-01 > li').removeClass('selected');
            }
                $(e.currentTarget).closest('.input-text-base').find('.modal-city-popular').show();
                $(e.currentTarget).closest('.input-text-base').find('.err-text-01').hide();
        },

        hideModal: function () {
            this.$el.find('.set-departure').hide();
        },

        showOrHideClearanceButton: function (e){
            var text = $(e.currentTarget).val();
            if (text.length > 0){
                $(e.currentTarget).closest('.input-text-base').find('.js-btn-set').show();
            } else {
                $(e.currentTarget).closest('.input-text-base').find('.js-btn-set').hide();
            }
        }
    });

    ns.CityHotelModalView = CityHotelModalView

})(window, jQuery);
