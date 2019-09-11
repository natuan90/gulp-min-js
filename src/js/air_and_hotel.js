(function(window, $) {
    var format = skygate.util.format;
    var computeDate = skygate.util.date.computeDate;
    var toYmdString = skygate.util.date.toYmdString;
    var ymdStringToObject = skygate.util.date.ymdStringToObject;
    var ymdStringToObjectWithSeparator = skygate.util.date.ymdStringToObjectWithSeparator;
    var objectToQueryParameters = skygate.util.objectToQueryParameters;
    var escapeHTML = skygate.util.escapeHTML;

    var msf = airlink.model.common.ui_integration_multi_search_form;
    var ns = airlink.view.ui_integration_multi_search_form.components;
    var MultiSearchFormBaseView = msf.MultiSearchFormBaseView;
    var AirAndHotelFormModel = msf.AirAndHotelFormModel;
    var AirFormView = msf.AirFormView;
    var HotelViewMixin = msf.HotelViewMixin;
    var AirSuggestionView = ns.AirSuggestionView;
    var CityModalView = msf.CityModalView;
    var CityHotelModalView = msf.CityHotelModalView;
    var datepickerSettings = msf.datepickerSettings;
    var escapeRegex = msf.escapeRegex;


    var AirAndHotelFormView = AirFormView.extend({
        roomSettingText: '大人{0}名、子供・幼児{1}名',

        DEFAULT_ROOMS: [
            {
                adultNum: 1
            }
        ],

        events: {
            'click .search': 'searchAirAndHotel',
            // 'change .abroadArea': 'changeAbroadArea',
            // 'change .abroadCountry': 'changeAbroadCountry',
            // 'change .abroadPort': 'changeAbroadPort',
            // 'change .departureDomestic': 'changeDepartureDomestic',
            'change .destinationDomestic': 'changeDestinationDomestic',
            'click  .date-picker': 'showDatepicker',

            'change .fromDate, .toDate': 'changeDate',
            'change .checkin, .checkout': 'changeHotelDate',

            'change .airAutocompleteTarget': 'clearPlaceholder',
            'focus .hotelDpAutocompleteTarget': 'clearHotelAutocomplete',
            // 'blur .abroadInput': 'syncArrival',
            // 'click .changeToInput': 'changeToInput',
            // 'click .changeToSelect': 'changeToSelect',
            'change .anotherSchedule': 'showOrHideHotelDate',

            //Auto complete
            'click .clear-text-target-hotel-dp': 'clearTextTargetHotelDp',
            'keyup .hotelDpAutocompleteTarget': 'showClearInputHotelDp',
            'keyup .departureDomestic, .destinationDomestic': 'showClearInputDp',

            // room settings
            'change .roomNum': 'changeRoomDP',
            'change .childNum': 'changeChild',
            'click .input-set-number': 'openModalRoomContent',
            'click .close-modal': 'closeModalRoomContent',

            // Child detail
            'click .btn-minus-adult': 'decreaseAdult',
            'click .btn-plus-adult': 'increaseAdult',
            'click .btn-minus-child': 'decreaseChild',
            'click .btn-plus-child': 'increaseChild',

            // optional condition
            'click .optionalCondition': 'showOrHideOptionalCondition',
            // modal
            'click .targetAreaSuggestModalClose': 'closeModal',
            'click .searchFromModal': 'searchFromModal',
            'keyup .js-set-city': 'showRecommendOrSuggest',
            'click .ui-menu-item': 'selectSuggestCityInputManual'
        },

        initialize: function(option) {
            _.bindAll(this, 'searchAirAndHotel', 'showDatepicker',
                'showOrHideOptionalCondition', 'clearPlaceholder',
                'changeDate', 'searchFromModal');

            this.model = new AirAndHotelFormModel();
            this.model.setup();
            this.template = _.template(this.$el.find('.suggestTemplate').html());

            $('body').mouseup(function(e) {
                var container = $("section.airAndHotelFormContainer div.modal-room-content");
                if (!container.is(e.target) && container.has(e.target).length === 0) {
                    container.hide();
                }
            });

            var defaultDate = this.model.getDefaultFromAndToDate();
            this.$el.find('.fromDate').val(defaultDate.from);
            this.model.setDate('checkin', defaultDate.from);
            this.$el.find('.toDate').val(defaultDate.to);
            this.model.setDate('checkout', defaultDate.to);
            this.setStayNum(this.model);

            // initialize radio, checkbox, select.
            this._clearParameter();

            // initialize air autocomplete
            //todo
            // this.setupAutocomplete(this.$el.find('.airAutocompleteTarget'), {
            //     source: airSuggestList
            // });

            // initialize hotel autocomplete
            this._setupHotelDPSuggest();

            // initialize domestic airport
            _.each(this.$el.find('.selectDomesticAirport'), function(select) {
                $(select).html(this._getDomesticAirports());
            }, this);

            // initialize abroad area
            _.each(this.$el.find('.abroadArea'), function(select) {
                $(select).html(this._getAreas());
            }, this);

            // load condition
            var initialParameter = this.getInitialParameter();
            if (initialParameter) {
                initialParameter = this._convertInitialParameter(initialParameter);
            }
            var savedCondition = this.model.getSavedCondition(this.getContainerId());
            var condition = savedCondition ? savedCondition : initialParameter;
            if (condition) {
                 if(!condition.AgentCode){
                    condition.AgentCode=initialParameter.AgentCode;
                    }
                var that = this;
                _.defer(function() {
                    that.restoreCondition(condition);
                    that._setupDatepicker(that.model.get('from'));
                    that._setupHotelDatepicker();
                    if (!condition.checkin && !condition.checkout) {
                        that._syncHotelDate();
                    }
                });
            } else {
                this._setupDatepicker(this.model.get('from'));
                that.model.setDate('checkout', that.model.get('checkout'));
                this._setupHotelDatepicker();
                this._syncHotelDate();
            }



            var recommendCityList = window.airRecommendCityList || {};

            _.each(this.$el.find('.departure'), function(el, index) {
                new CityModalView({
                    el: el,
                    optionData: {
                        recommendCityList: recommendCityList.departure || {},
                        isDeparture: true
                    }
                });
            });

            _.each(this.$el.find('.arrival'), function(el, index) {
                new CityModalView({
                    el: el,
                    optionData:{
                        recommendCityList: {
                            domestic: [],
                            abroad: recommendCityList.destination.abroad || {}
                        },
                        isDeparture: false
                    }
                });
             });

            var recommendHotelCityList = window.hotelRecommendCityList;
            if (recommendHotelCityList) {
                _.each(this.$el.find('.search-hotel'), function (el, index) {
                    new CityHotelModalView({
                        el: el,
                        optionData: {
                            hotelCities: recommendHotelCityList.hotelCities || {}
                        }
                    });
                });
            }
            this.listenTo(this.model, 'change:stayNum', this.setStayNum);
        },

        showHideModalPopularCities: function(hideCityModal) {
            if (hideCityModal) {
                this.$el.find('.js-set-hotel-modal').hide();
                return;
            }
            var $input  = this.$el.find('.hotelAutocompleteTarget');
            var dataRegionId = $input.data('regionid');
            if ($input.val() && $input.val().length && !dataRegionId) {
                this.$el.find('.js-set-hotel-modal').hide();
            } else {
                this.$el.find('.js-set-hotel-modal').show();
            }
        },


        _setupHotelDPSuggest: function() {
            var that = this;
            this.setupAutocomplete($('.hotelDpAutocompleteTarget'), {
                source: function(request, response) {
                    var q = $.trim(request.term);
                    if (q.length < 2) {
                        return;
                    }
                    var promise = that.model.suggest(q);
                    promise.done(function(data) {
                        var suggestData = that.createSuggestData(data.result);
                        return response(suggestData);
                    });
                },
                select: function(ev, ui) {
                    var target = $(ev.currentTarget);
                    var targetList = target.find('.ui-state-focus').parent();
                    var regionId = targetList.data('regionid');
                    var hotelCode = targetList.data('hotelcode');
                    var label = targetList.data('suggestlabel');

                    var input = $(this);
                    input.attr('data-regionId', regionId);
                    input.attr('data-hotelCode', hotelCode);
                    input.attr('data-suggestLabel', label);
                },
                appendTo: '.sgt-dep-dp',
                position: {
                    within: $(this).closest('.input-text-base').find('.sgt-dep')
                },
                open: function(event, ui){
                    var input = $(event.target).closest('.input-text-base');
                    $(input).find('.set-hotel').addClass('show').addClass('ui-autocomplete');
                    $(input).find('ul.ui-autocomplete').addClass('list-suggest-01');
                    $(input).find('ul.list-suggest-01').attr('style', '');
                    $(input).find('.set-departure').hide();
                },
                close: function(event, ui){
                    var input = $(event.target).closest('.input-text-base');
                    $(input).find('.set-hotel').removeClass('show');
                },
                response: function(event, ui){
                    $('span.ui-helper-hidden-accessible').addClass('none');
                }
            });
            $('.hotelDpAutocompleteTarget').data("ui-autocomplete")._renderItem = function(ul, item){
                var searchMask = this.element.val();
                var regEx = new RegExp(escapeRegex(searchMask), 'ig');
                var replaceMask = '<span>$&</span>';
                var html = item.label.replace(regEx, replaceMask);

                if (_.isObject(item.value)) {
                    var data = item.value;
                    item.value = item.label;

                    html = '<span class="val">' + html + '</span>';

                    if (data.categoryFirstClass) {
                        html += '<span class="' + data.categoryFirstClass + '">'+data.type+'</span>';
                    }

                    var list = $('<li></li>')
                        .data('item.autocomplete', item)
                        .append($('<a></a>').html(html))
                        .appendTo(ul);

                    if (data.isCategoryLast && data.needMarkupLast) {
                        list.addClass('last-item');
                    }
                    if (data.hotelCode) {
                        list.attr('data-hotelCode', data.hotelCode);
                    } else {
                        list.attr('data-regionId', data.regionId);
                    }
                    list.attr('data-suggestLabel', item.label);
                    return list;
                }
                return $('<li></li>')
                    .data('item.autocomplete', item)
                    .append($('<a></a>').html('<span class="val">' + html + '</span>'))
                    .appendTo(ul);
            };
        },

        clearTextTargetHotelDp: function(env){
            this.$el.find('input.hotelDpAutocompleteTarget').val("");
            this.$el.find('input.hotelDpAutocompleteTarget').removeAttr("data-regionId");
            this.$el.find('input.hotelDpAutocompleteTarget').removeAttr("data-suggestLabel");
            this.$el.find('input.hotelDpAutocompleteTarget').removeAttr("data-hotelCode");
            $(env.currentTarget).hide();
            this.showHideModalPopularCities();
        },


        showClearInputHotelDp: function(env){
            var target = $(env.currentTarget);
            var term = target.val();
            var hideCityModal = true;
            var suggestLabel = $(target).attr('data-suggestLabel');
            if (term != "") {
                target.attr('data-suggestLabel', term);
                this.$el.find(".clear-text-target-hotel-dp").show();
                if (term.length < 2 || term === suggestLabel) {
                    return;
                }
            } else {
                hideCityModal = false;
                target.removeAttr('data-regionId');
                target.removeAttr('data-hotelCode');
                target.removeAttr('data-suggestLabel');
                this.$el.find(".clear-text-target-hotel-dp").hide();
            }
            this.showHideModalPopularCities(hideCityModal);
        },

        showClearInputDp: function(env) {
            var target = $(env.currentTarget);
            var $parent = target.closest('.input-text-base');
            if (target.val() != "") {
                $parent.find(".clear-text").show();
                target.attr('data-suggestLabel', target.val());
            } else {
                target.removeAttr('data-cityCode');
                target.removeAttr('data-suggestLabel');
                $parent.find(".clear-text").hide();
                $parent.find(".modal-city-popular").show();
            }
        },

        restoreCondition: function(condition) {
            if (condition.AgentCode) {
                this.$el.find('.AgentCode').val(condition.AgentCode);
            }
            if (condition.fromDate) {
                this.$el.find('.fromDate').val(condition.fromDate);
                this.model.setDate('checkin', condition.fromDate);
            }

            if (condition.toDate) {
                this.$el.find('.toDate').val(condition.toDate);
                this.model.setDate('checkout', condition.toDate);
            }


            if (condition.departure) {
                this.$el.find('.departureDomestic').attr('data-cityCode',condition.departure);
                this.$el.find('.departureDomestic').attr('data-suggestLabel',condition.departureLabel);
                this.$el.find('.departureDomestic').val(condition.departureLabel);
                this._setupDepartureOrDestination(this.$el.find('.departureDomestic').get(0), condition.departure);
                if (!condition.arrival) {
                    this.$el.find('.arrivalDomestic').attr('data-cityCode',condition.departure);
                    this.$el.find('.arrivalDomestic').attr('data-suggestLabel',condition.departureLabel);
                    this.$el.find('.arrivalDomestic').val(condition.departureLabel);
                }
                this.$el.find('.arrival .clear-text').show();
            }

            if (condition.arrival) {
                this.$el.find('.arrivalDomestic').attr('data-cityCode',condition.arrival);
                this.$el.find('.arrivalDomestic').attr('data-suggestLabel',condition.arrivalLabel);
                this.$el.find('.arrivalDomestic').val(condition.arrivalLabel);
                this.$el.find('.arrival .clear-text').show();
            }

            if (condition.destination) {
                this.$el.find('.destinationDomestic').attr('data-cityCode',condition.destination);
                this.$el.find('.destinationDomestic').attr('data-suggestLabel',condition.destinationLabel);
                this.$el.find('.destinationDomestic').val(condition.destinationLabel);
                this._setupDepartureOrDestination(this.$el.find('.destinationDomestic').get(0), condition.destination);
                this.$el.find('.departure .clear-text').show();
            }

            if (condition.roomSettings) {
                this._setupRooms(condition.roomSettings);
            }

            // hotel date
            if (condition.checkin && condition.checkout) {
                this.$el.find('.checkin').val(condition.checkin);
                this.$el.find('.checkout').val(condition.checkout);
                this.model.setDate('checkin', condition.checkin);
                this.model.setDate('checkout', condition.checkout);
                this.$el.find('.anotherSchedule').prop('checked', 'checked').change();
            }

            // optional
            var needOpenOptionalCondition = false;
            var optionalConditionContainer = this.$el.find('.add-condition-container');
            if (condition.suggestLabel && condition.regionId) {
                var input = this.$el.find('.hotelDpAutocompleteTarget');
                input.val(condition.suggestLabel);
                input.attr('data-suggestLabel', condition.suggestLabel);
                input.attr('data-regionId', condition.regionId);
                this.$el.find('.clear-text-target-hotel-dp').show();
                needOpenOptionalCondition = true;
            }
            if (condition.seatClass) {
                optionalConditionContainer.find('.seatClass').val(condition.seatClass);
                needOpenOptionalCondition = true;
            }
            if (condition.carriers) {
                optionalConditionContainer.find('.carriers').val(condition.carriers);
                needOpenOptionalCondition = true;
            }
            if (needOpenOptionalCondition) {
                this._setupOptionalConditionContainer(true);
            }
        },

        _convertInitialParameter: function(initialParameter) {
            var params = $.extend({}, true, initialParameter);

            var fromDate = initialParameter.fromDate;
            if (fromDate && _.isString(fromDate) && fromDate.indexOf('/') === -1) {
                params.fromDate = toYmdString(ymdStringToObject(fromDate), '/');
            } else if (fromDate && _.isNumber(fromDate)) {
                params.fromDate = toYmdString(computeDate(this.model.get('from'), fromDate), '/');
            }

            var addDay = initialParameter.toDate;
            var from = params.fromDate ?
                ymdStringToObjectWithSeparator(params.fromDate, '/') : this.model.get('from');
            if (!addDay) {
                params.toDate = toYmdString(computeDate(from, this.model.DEFAULT_INTERVAL), '/');
            } else {
                params.toDate = toYmdString(computeDate(from, addDay), '/');
            }

            if (initialParameter.rooms) {
                params.roomSettings = initialParameter.rooms;
            }

            return params;
        },

        _setupDestination: function(container, portCode) {
            var data = this.model.get('reverseDirections')[portCode];
            if (!data) return;

            var abroadAreaSelect = container.find('.abroadArea');
            var abroadCountrySelect = container.find('.abroadCountry');
            var abroadPortSelect = container.find('.abroadPort');

            abroadAreaSelect.val(data.areaIndex);
            abroadAreaSelect.change();
            abroadCountrySelect.val(data.countryIndex);
            abroadCountrySelect.change();
            abroadPortSelect.val(portCode);
            abroadPortSelect.change();
        },

        _setupOptionalConditionContainer: function(open) {
            var iconElement = this.$el.find('.optionalCondition').find('span');
            this._showOrHideOptionalIconElment(iconElement, open);
            this._showOrHideOptionalCondition(open);
        },

        _setupDatepicker: function(from) {
            this._datepicker(from, [this.$el.find('.fromDate'), this.$el.find('.toDate')]);
        },

        _setupHotelDatepicker: function() {
            this._hotelDatepicker(this.$el.find('.checkin'), this.$el.find('.checkout'));
        },

        _hotelDatepicker: function(checkinElement, checkoutElement) {
            var that = this;
            var checkinSettings = $.extend(true, {}, datepickerSettings);
            checkinSettings.beforeShow = function(input, inst) {
                var minDate = that.$el.find('.fromDate').val();
                var endDate = ymdStringToObjectWithSeparator(checkoutElement.val());
                var maxDate;
                try {
                    maxDate = toYmdString(computeDate(endDate, -1), '/');
                } catch (e) {
                    maxDate = toYmdString(that.model.get('to'), '/');
                }
                checkinElement.datepicker('option', 'minDate', minDate);
                checkinElement.datepicker('option', 'maxDate', maxDate);

                var container = $(checkinElement).closest('.js-calendar');
                if ($(container).find('#ui-datepicker-div')) {
                    $(container).remove('#ui-datepicker-div');
                }
                $(container).append($("#ui-datepicker-div"));

            };
            $(checkinElement).datepicker(checkinSettings);

            var checkoutSettings = $.extend(true, {}, datepickerSettings);
            checkoutSettings.beforeShow = function(input, inst) {
                var maxDate = that.$el.find('.toDate').val();
                var startDate = ymdStringToObjectWithSeparator(checkinElement.val());
                var minDate;
                try {
                    minDate = toYmdString(computeDate(startDate, 1), '/');
                } catch (e) {
                    minDate = toYmdString(that.model.get('from'), '/');
                }
                checkoutElement.datepicker('option', 'minDate', minDate);
                checkoutElement.datepicker('option', 'maxDate', maxDate);

                var container = $(checkoutElement).closest('.js-calendar');
                if ($(container).find('#ui-datepicker-div')) {
                    $(container).remove('#ui-datepicker-div');
                }
                $(container).append($("#ui-datepicker-div"));

            };
            $(checkoutElement).datepicker(checkoutSettings);
        },

        _createSearchCondition: function() {
            var searchCondition = {
                departure: this._getDeparturePort().value,
                departureLabel: this._getDeparturePort().label,
                arrival: this._getDeparturePort().value, // UI 20181127 Arr=Dep
                arrivalLabel: this._getDeparturePort().label,
                destination: this._getDestination().value,
                destinationLabel: this._getDestination().label,
                fromDate: this.$el.find('.fromDate').val(),
                toDate: this.$el.find('.toDate').val(),
                AgentCode: this.$el.find('.AgentCode').val()
            };

            var roomNum = +this.$el.find('.roomNum').val();
            var roomContents = this.$el.find('.roomContent');
            searchCondition.roomSettings = _.reduce(_.range(0, roomNum), function(memo, num) {
                var roomContent = $(roomContents.get(num));
                var adultNum = +parseInt(roomContent.find('.adultNum').html());
                var childNum = +parseInt(roomContent.find('.childNum').html());
                var minorAges = [];
                if (childNum > 0) {
                    var childAgeSelects = roomContent.find('.childAge');
                    minorAges = _.reduce(_.range(0, childNum), function(ages, num) {
                        var childAgeSelect = $(childAgeSelects.get(num));
                        ages.push(+childAgeSelect.val());
                        return ages;
                    }, minorAges);
                }
                memo.push({
                    adultNum: adultNum,
                    minorAges: minorAges
                });
                return memo;
            }, []);

            var anotherSchedule = this.$el.find('.anotherSchedule');
            if (anotherSchedule.is(':checked')) {
                searchCondition.checkin = this.$el.find('.checkin').val();
                searchCondition.checkout = this.$el.find('.checkout').val();
            }

            var hotelAreaInput = this.$el.find('.hotelDpAutocompleteTarget');
            var hotelAreaInputValue = hotelAreaInput.val();
            if (hotelAreaInputValue.length > 0 && hotelAreaInputValue !== '都市・地域・空港名などを入力してください') {
                searchCondition.needHotelArea = true;
                var regionId = hotelAreaInput.data('regionid');
                var suggestLabel = hotelAreaInput.attr('data-suggestLabel');
                if (suggestLabel && regionId)  {
                    searchCondition.regionId = regionId;
                    searchCondition.suggestLabel = suggestLabel;
                }
            }

            var seatClass = this.$el.find('.seatClass').val();
            if (seatClass) {
                searchCondition.seatClass = seatClass;
            }

            // キャリアは複数指定可能ではあるがやっていない.
            var carriers = this.$el.find('.carriers').val();
            if (carriers) {
                searchCondition.carriers = carriers;
            }
            return searchCondition;
        },

        setStayNum: function(model) {
            var stayNumText = '{0}泊';
            if(this.model.get('stayNum') === "-"){
                this.$el.find('.day-count').html("");
                return;
            }
            this.$el.find('.day-count').html(format(stayNumText, this.model.get('stayNum')));
        },

        changeDate: function(ev) {
            var target = $(ev.currentTarget);
            var targetDate = target.val();
            targetDate = this.model.normalizeDateString(targetDate);
            target.val(targetDate);
            var targetDateObject;
            try {
                targetDateObject = ymdStringToObjectWithSeparator(targetDate);
            } catch (e) {}
            if (!targetDateObject) {
                return;
            }
            var toDateElement = this.$el.find('.toDate');
            if (target.get(0) !== toDateElement.get(0)) {
                var toDate = ymdStringToObjectWithSeparator(toDateElement.val());
                if (targetDateObject >= toDate) {
                    toDateElement.val(
                        toYmdString(computeDate(targetDateObject, 1), '/')
                    );
                }
                this.scrollTo($('#ui-datepicker-div'));
                _.defer(function() {
                    toDateElement.focus();
                });

            }
            this._syncHotelDate();
        },

        _checkHotelDestinationHotelDp: function() {
            var target = this.$el.find('.hotelDpAutocompleteTarget');
            var q = $.trim(target.val());
            if (q.length === 0 || q ==='都市・地域・空港名などを入力してください。') {
                return this.hotelSuggestErrorMessage;
            } else if (q.length < 2) {
                return '都市・ランドマーク・空港名・空港コード・ホテル名を正しく入力してください。';
            }
        },

        _getSuggestDataHotelDp: function(searchCondition) {
            var errorMessage = this._checkHotelDestinationHotelDp();
            var errors = [];
            if (errorMessage) {
                errors.push({
                    'message': errorMessage,
                    'type': '.error-hotel-dp-target'
                });
                this._handleErrorMessage(errors);
                return;
            }
            var q = this.$el.find('.hotelDpAutocompleteTarget').val();
            var promise = this.model.suggest(q);
            var that = this;
            promise.done(function(data) {
                if (!_.flatten(data.result).length) {
                    var errorMessage = '都市・ランドマーク・空港名・空港コード・ホテル名を正しく入力してください。';
                    errors.push({
                        'message': errorMessage,
                        'type': '.error-hotel-dp-target'
                    });
                    that._handleErrorMessage(errors);
                    return;
                }
                that._showSuggestModal(data.result);
            });
        },

        changeRoomDP: function(ev) {
            var roomNum = +$(ev.currentTarget).val();
            var roomContents = this.$el.find('.roomContent');
            var errorMessage = '';
            _.each(_.range(0, 4), function(num) {
                var content = $(roomContents.get(num));
                var errorDom = content.find('.err-text-01');
                if(errorDom.hasClass('error-roomsetting')){
                    errorMessage = errorDom.html();
                }
            });
            _.each(_.range(0, 4), function(num) {
                var content = $(roomContents.get(num));
                var errorDom = content.find('.err-text-01');
                if(num === (roomNum - 1)){
                    errorDom.addClass('error-roomsetting');
                    errorDom.html(errorMessage);
                    errorDom.show();
                } else {
                    errorDom.removeClass('error-roomsetting');
                    errorDom.hide();
                }
                if (num >= roomNum) {
                    content.hide();
                } else {
                    content.show();
                    content.css('display', 'inline-block');
                }
            });
        },


        setHotelDayModel: function(){
            var checkinDate = this.model.normalizeDateString(this.$el.find('.checkin').val());
            var checkoutDate = this.model.normalizeDateString(this.$el.find('.checkout').val());
            this.model.setDate('checkin', checkinDate);
            this.model.setDate('checkout', checkoutDate);
        },

        changeHotelDate: function(ev) {
            var target = $(ev.currentTarget);
            var targetDate = target.val();
            targetDate = this.model.normalizeDateString(targetDate);
            target.val(targetDate);
            var targetDateObject;
            try {
                targetDateObject = ymdStringToObjectWithSeparator(targetDate);
            } catch (e) {}
            if (!targetDateObject) {
                return;
            }
            var checkoutElement = this.$('.checkout');
            if (target.get(0) !== checkoutElement.get(0)) {
                var toDate = ymdStringToObjectWithSeparator(checkoutElement.val());
                if (targetDateObject >= toDate) {
                    checkoutElement.val(
                        toYmdString(computeDate(targetDateObject, 1), '/')
                    );
                }
                _.defer(function() {
                    checkoutElement.focus();
                });
            }
            this.setHotelDayModel();
        },

        _syncHotelDate: function() {
            this.$el.find('.checkin').datepicker('setDate', this.$el.find('.fromDate').val());
            this.$el.find('.checkout').datepicker('setDate', this.$el.find('.toDate').val());
            this.setHotelDayModel();
        },

        showOrHideHotelDate: function(ev) {
            var target = $(ev.currentTarget);
            var hotelScheduleContainer = this.$el.find('.hotelScheduleContainer');
            if (target.is(':checked')) {
                hotelScheduleContainer.show();
            } else {
                hotelScheduleContainer.hide();
            }
        },

        searchAirAndHotel: function() {
            var searchCondition = this._createSearchCondition();
            this.$("[class^='err-text']").hide();
            var errors = this.model.validate(searchCondition);

            if (errors.length) {
                this._handleErrorMessage(errors);
                return false;
            }

            if (searchCondition.needHotelArea && (!searchCondition.regionId || !searchCondition.suggestLabel)) {
                this._getSuggestDataHotelDp(searchCondition);
            } else {
                this._search(searchCondition);
            }
        },

        _search: function(searchCondition) {
            this.model.saveCondition(this.getContainerId(), searchCondition);
            this.saveTabIndex();
            var paramString = this.model.createQueryParameter(searchCondition);
            var url = '/dp/list?' + paramString;
            location.href = url;
        },

        searchFromModal: function(ev) {
            var modal = this.$el.find('.targetAreaSuggestModal');
            var target = modal.find('input[name=modalSuggestTarget]:checked');
            var input = this.$el.find('.hotelDpAutocompleteTarget');
            var label = target.data('suggestlabel');
            input.attr('data-regionId', target.data('regionid'));
            input.attr('data-suggestLabel', label);
            modal.hide();
            this.searchAirAndHotel();
        },

        showRecommendOrSuggest: function(ev) {
            var text = $(ev.currentTarget).val();
            if (text == '') {
                $('.str-search .list-area-01 > li').css({"background-color":"#fff"});
            }
            this._displayAutoTab(ev);
        },

        _displayAutoTab: function(ev, isTypeManual) {
            var el = isTypeManual ? ev : ev.currentTarget;
            var keyCode = ev.keyCode;
            var type = isTypeManual ? 'click' : ev.type;

            if ( (type === 'keyup' || type === 'click') && !keyCode) {
                var journeyCity = $(el).closest('.input-text-base').parent();
                var destinationCity = $(journeyCity).find('input.destinationDomestic');
                destinationCity.trigger('click');
                destinationCity.focus();
                var isDestinationDomestic = $(el).closest('.input-text-base').hasClass('arrival');
                if (isDestinationDomestic) {
                    $('.fromDate').focus();
                    this.scrollTo($('#ui-datepicker-div'));
                }
            }
        },

        selectSuggestCityInputManual: function(ev) {
            var parentElSelected = $(ev.currentTarget).closest('.js-city-suggest-modal').parent();
            var chilInputField = $(parentElSelected).find('input.js-set-city')[0];
            this._displayAutoTab(chilInputField, true);
            $(ev.currentTarget).closest('.input-text-base').find('.modal-city-popular').hide();
        },

        _handleErrorMessage: function(errors) {
            _.each(errors, function(error,index) {
                var err_message = format('<strong>{0}</strong>', escapeHTML(error.message))
                this.$(error.type).html("");
                this.$(error.type).html(err_message).show();
            });
        },

        _hideErrorMessage: function(errors) {
            this.$el.find('.error-alert').hide().empty();
        },

        _getOptionalConditionContainer: function() {
            return this.$el.find('.add-condition-container');
        },

        _getDeparturePort: function() {
            var departure = {};
            departure.value = this.$el.find('.departureDomestic').attr('data-cityCode');
            departure.label = this.$el.find('.departureDomestic').attr('data-suggestLabel');
            return departure;
        },

        _getArrivalPort: function() {
            return this.$el.find('.arrivalDomestic').attr('data-cityCode');
        },

        showOrHideOptionalCondition: function(ev) {
            var iconElement = $(ev.currentTarget).find('span');
            var open = iconElement.hasClass('close');
            this._showOrHideOptionalIconElment(iconElement, open);
            this._showOrHideOptionalCondition(open);
        },

        _showOrHideOptionalIconElment: function(iconElement, open) {
            if (open) {
                iconElement.removeClass('close');
                iconElement.addClass('open');
            } else {
                iconElement.removeClass('open');
                iconElement.addClass('close');
            }
        },

        _showOrHideOptionalCondition: function(open) {
            var optionalCondition = this.$el.find('.add-condition-container');
            if (open) {
                optionalCondition.show();
            } else {
                optionalCondition.hide();
            }
        },

        showDatepicker: function(ev) {
            $(ev.currentTarget).find('input').focus();
            this.scrollTo($('#ui-datepicker-div'));
        },

        clearPlaceholder: function(ev) {
            var target = $(ev.currentTarget);
            if (target.val() === '都市名、都市コードを入力') {
                target.val('');
            }
        },

        _getDomesticAirports: function() {
            if (!this._domesticAirports) {
                var domesticAirports = _.reduce(this.model.get('domesticAirports'), function(options, airport) {
                    options.push(format('<option value="{0}">{1}</option>', airport.code, airport.label));
                    return options;
                }, []);
                this._domesticAirports = domesticAirports.join('');
            }
            return this._domesticAirports;
        },

        _getAreas: function() {
            if (!this.areas) {
                var areas = _.reduce(this.model.get('directions'), function(memo, direction) {
                    memo.push('<option value="' + direction.code + '">' + direction.name + '</option>');
                    return memo;
                }, []);
                areas.unshift('<option value="">方面を選択</option>');
                this._areas = areas.join('');
            }
            return this._areas;
        },

        _getCountries: function(areaCode) {
            if (!this._countries) this._countries = {};

            if (areaCode === '') {
                return {
                    countries: '<option value="">↑方面を選択</option>'
                };
            } else if (!this._countries[areaCode]) {
                var countries = _.reduce(directions[areaCode].areas, function(memo, city) {
                    memo.push('<option value="' + city.code + '">' + city.name + '</option>');
                    return memo;
                }, []);
                countries.unshift('<option value="">↑方面を選択</option>');
                this._countries[areaCode] = countries.join('');
            }
            return {
                countries: this._countries[areaCode],
                noChoice: this._getDirections()[areaCode].areas.length === 1,
                defaultCountry: this._getDirections()[areaCode].defaultArea
            };
        },

        _getPorts: function(areaCode, countryCode) {
            if (!this._ports) this._ports = {};

            if (areaCode === '' || countryCode === '') {
                return {
                    ports: '<option value="">↑方面を選択</option>'
                };
            }
            var key = areaCode + countryCode;
            if (!this._ports[key]) {
                var ports = _.reduce(directions[areaCode].areas[countryCode].cities, function(memo, port) {
                    memo.push('<option value="' + port.code + '">' + port.name + '</option>');
                    return memo;
                }, []);
                ports.unshift('<option value="">↑方面を選択</option>');
                this._ports[key] = ports.join('');
                this._ports[key] = {
                    ports: ports.join(''),
                    noChoice: ports.length == 2,
                    defaultCity: directions[areaCode].areas[countryCode].defaultCity
                };
            }
            return this._ports[key];

        },

        _getDestination: function() {
            //todo
            var destination = {};
            destination.value = this.$el.find('.destinationDomestic').attr('data-cityCode');
            destination.label = this.$el.find('.destinationDomestic').attr('data-suggestLabel');
            return destination;
        },

        _getMinorAges: function(targetContent) {
            var content = targetContent ? targetContent : this.currentContent;
            var childNum = +content.find('.totalChildNum').val();
            if (childNum === 0) {
                return;
            }

            var selects = content.find('.childAge');

            return _.reduce(selects, function(ages, select, index) {
                var $select = $(select);
                if (childNum > index) {
                    ages.push($select.val());
                }
                return ages;
            }, []);
        },

        _clearParameter: function() {
            // select
            var that = this;
            _.defer(function() {
                that.$el.find('select').prop('selectedIndex', 0);
            });

            // checkbox
            this.$el.find('input[type=checkbox]').prop('checked', false);
        }
    });
    _.extend(AirAndHotelFormView.prototype, HotelViewMixin);
    msf.AirAndHotelFormView = AirAndHotelFormView;

    $(function() {
        _.each($('.airAndHotelFormContainer'), function(el) {
            new AirAndHotelFormView({
                el: el
            });
        });

        _.each($('.airAndHotelFormContainer').find('.departure'), function(el, index) {
            new AirSuggestionView({
                el: el,
                suggestion: {
                    exceptList: ['KIX', 'ITM']
                }
            });
        });
        _.each($('.airAndHotelFormContainer').find('.arrival'), function(el, index) {
            new AirSuggestionView({
                el: el,
                suggestion: {
                    exceptList: ['KIX', 'ITM']
                }
            });
        });
    });
})(window, jQuery);