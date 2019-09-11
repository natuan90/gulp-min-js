(function (window, $) {
    var format = skygate.util.format;
    var AirSuggestionView = Backbone.View.extend({
        initialize: function (options) {
            this.template = _.template($('#airSuggestionItem').html());
            _.each(this.$el.find('.js-air-auto-complete'), function(el){
                this.setupAutoComplete($(el), options.suggestion || {});
            }, this);
        },
        setupAutoComplete: function(element, options) {
            this._setupAirSuggest($(element), options);
            this._renderItem($(element));
        },
        _setupAutocomplete: function(element, option) {
            option.disabled = true;
            element.autocomplete(option);
            element.one('focus', function() {
                element.autocomplete('option', 'disabled', false);
            });
        },
        _setupAirSuggest: function(el, options) {
            var that = this;
            this._setupAutocomplete($(el), {
                source: function(request, response) {
                    var q = $.trim(request.term);
                    if (q.length < 2) {
                        return;
                    }
                    var convertInput = that._convertInput(q);
                    var suggestData = skygate.air.util.search(convertInput, 10, _.has(options, 'searchDomestic') ? options.searchDomestic : null, _.has(options, 'exceptList') ? options.exceptList : []);
                    return response(suggestData);
                },
                autoFocus: true,
                delay: 0,
                select: function(ev, ui) {
                    var target = $(ev.currentTarget);
                    var targetList = target.find('.ui-state-focus');
                    var cityCode = targetList.data('citycode');
                    var label = targetList.data('suggestlabel');

                    var input = $(this);
                    input.attr('data-cityCode', cityCode);
                    input.attr('data-suggestLabel', label);
                    input.val(label);
                    return false;
                },
                appendTo: $(el).closest('.input-text-base').find('.sgt-dep'),
                position: {
                    within: $(this).closest('.input-text-base').find('.sgt-dep')
                },
                open: function(event, ui){
                    var autocomplete = $(event.target).closest('.input-text-base').find('.js-city-suggest-modal');

                    $(autocomplete).addClass('show').addClass('ui-autocomplete');
                    // $(autocomplete).attr('style', 'overflow:auto;');
                    $(autocomplete).find('ul.ui-autocomplete').addClass('list-suggest-01');
                    $(autocomplete).find('ul.list-suggest-01').attr('style', '');
                    $(autocomplete).find('ul.list-suggest-group').attr('style', '');

                    var modal = $(event.target).closest('.input-text-base').find('.modal-city-popular');
                    if (modal && $(modal).is(':visible')) {
                        modal.hide();
                    }
                    $(event.target).closest('.input-text-base').find('.err-text-01').hide();
                },
                close: function(event, ui){
                    var input = $(event.target).closest('.input-text-base');
                    $(input).find('.js-city-suggest-modal').removeClass('show');
                },
                response: function(event, ui){
                    $('span.ui-helper-hidden-accessible').addClass('none');
                }
            });
        },
        _renderItem: function(el) {
            var that = this;
            $(el).data("ui-autocomplete")._renderItem = function (ul, item) {
                searchMask = that._convertInput(this.element.val());
                var itemInfo = that.createAutoSuggestionCityName(item.threeLetter, item.domesticThreeLetter, item.name, item.countryName, searchMask);
                item.value = itemInfo.cityCountryName;
                var childrenInfo = [];
                if (!_.isEmpty(item.children)) {
                    childrenInfo = _.map(item.children, function(children) {
                        return that.createAutoSuggestionCityName(children.threeLetter, children.domesticThreeLetter, children.name, children.countryName, searchMask);
                    });
                }
                var li = that.template({item:itemInfo, children: childrenInfo});
                $(li).data('item.autocomplete', item);
                var list = $(li).appendTo(ul);
                return list;
            };
        },
        createAutoSuggestionCityName: function (cityCode, domesticCityCode, cityName, countryName, keyword) {
            var cityCodes = domesticCityCode ? format('（{0}, {1}）', cityCode, domesticCityCode) : format('（{0}）', cityCode);
            var cityCountryName = format('{0}, {1}', cityName, countryName);
            return {
                cityCode: cityCode,
                cityCountryName: cityCountryName,
                cityCountryNameWithKeyword: format('{0}{1}', cityCodes, cityCountryName).replace(new RegExp(keyword, 'gm'), format('<b>{0}</b>', keyword))
            }
        },
        _removeSpecialCharacters: function(value) {
            var characters = value.match(/[\u3041-\u3096\u30A1-\u30FAa-zA-Z0-9\u3400-\u9FFF]/g);
            return _.isEmpty(characters) ? '' : characters.join('');
        },
        _convertHiraToKana: function(value) {
            return value.replace(/[ぁ-ゔ]/g, function (s) {
                return String.fromCharCode(s.charCodeAt(0) + 0x60);
            }).replace(/(ウ゛)/g, 'ヴ').replace(/ゕ/g, 'ヵ').replace(/ゖ/g, 'ヶ');
        },
        _convertInput: function(input) {
            var validCharacters = this._removeSpecialCharacters(input);
            return validCharacters ? this._convertHiraToKana(validCharacters).toUpperCase() : '';
        },
        _escapeRegex: function (str, delimiter) {
            return (str + '').replace(new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\' + (delimiter || '') + '-]', 'g'), '\\$&');
        },
    });
    var ns = skygate.util.namespace('airlink.view.ui_integration_multi_search_form.components');
    ns.AirSuggestionView = AirSuggestionView;

})(window, jQuery);