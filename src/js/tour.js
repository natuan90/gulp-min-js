(function(window, $) {
    var format = skygate.util.format;
    var computeDate = skygate.util.date.computeDate;
    var toYmdString = skygate.util.date.toYmdString;
    var ymdStringToObject = skygate.util.date.ymdStringToObject;
    var ymdStringToObjectWithSeparator = skygate.util.date.ymdStringToObjectWithSeparator;
    var toYmString = skygate.util.date.toYmString;


    var _Base = skygate.view.pc.searchform.component._depDateBase;

    var ns = airlink.model.common.ui_integration_multi_search_form;
    var MultiSearchFormBaseModel = ns.MultiSearchFormBaseModel;

    var TourFormModel = MultiSearchFormBaseModel.extend(_.extend(_Base, {

        defaults: {
            domesticAirports: null,
            absoluteUmpList: null,
            popCities: null,
        },

        setup: function() {
            var attrs = this.attributes;

            attrs.domesticAirports = window.domesticAirportListForTour || {};
            attrs.absoluteUmpList = window.ump_cities || [];
            attrs.popCities = window.pop_cities || {};
            attrs.areaCities = {
                areas: [],
                city_map: {}
            };
            this._setupAreaCity();
        },
        _setupAreaCity: function (){
            var that = this;
            $.ajax({
                url: '/tour/get_city_code',
                type: 'GET',
                contentType:'application/json; charset=utf-8',
                async : false,
                dataType: 'json',
                data:{},
                success: function (res) {
                    var areaCites = {
                        areas: _.clone(res.areas) || [],
                        city_map: _.clone(res.city_map) || {}
                    };
                    that.set('areaCities', areaCites) ;
                }
            });
        },
        validDate: function(text) {
            if (!text) return false;
            try {
                var d = text.split('/');

                if (d.length === 3) {
                    var date = new Date(d[0], +d[1] - 1, d[2]);
                    if ((d[0] + '').length != 4 || (d[1] + '').length != 2 || (d[2] + '').length != 2) {
                        return false;
                    }

                    if (date == null || date.getFullYear() != d[0] || date.getMonth() + 1 != d[1] ||
                        date.getDate() != d[2]) {
                        return false;
                    }
                    return true;
                } else if (d.length === 2) {
                    var date = new Date(d[0], +d[1] - 1);
                    if ((d[0] + '').length != 4 || (d[1] + '').length != 2) {
                        return false;
                    }

                    if (date == null || date.getFullYear() != d[0] || date.getMonth() + 1 != d[1]) {
                        return false;
                    }
                    return true;
                }

                return false;
            } catch (error) {
                return false;
            }
        },

        validate: function(searchCondition) {
            var errors = [];
            if (!searchCondition.cty || !(_.isArray(searchCondition.cty) && searchCondition.cty.length > 0)) {
                errors.push({
                    cty: format(this.errorMessage.required, '目的地')
                });
            }

            if (!searchCondition.from_date) {
                errors.push({
                    fromDate: format(this.errorMessage.required, '出発日')
                });
            } else if (!this.validDate(searchCondition.from_date)) {
                errors.push({
                    fromDate: format(this.errorMessage.invalidDate, '出発日')
                });
            } else {
                var minDateString = toYmdString(this.dateStartsFrom());
                var fromDate = _.clone(searchCondition.from_date);
                var fromDateString = fromDate.split('/').join('');

                if (fromDateString.length === 6){
                    var yearMonth = toYmString(new Date());
                    if (fromDateString < yearMonth){
                        errors.push({
                            fromDate: '出発日は明日以降の日付を指定してください。'
                        })
                    }
                } else if (fromDateString.length === 8){
                    if (fromDateString < minDateString) {
                        errors.push({
                            fromDate: '出発日は明日以降の日付を指定してください。'
                        })
                    }
                }

            }

            return errors;
        },

        isExistsInAbsoluteUmp: function(departure) {
            return !!_.find(this.get('absoluteUmpList'), function(data) {
                return data.departure === departure;
            });
        },

        isSelectableCityByAbsoluteUmp: function(departure, cityCode) {
            var targetData = _.find(this.get('absoluteUmpList'), function(data) {
                return data.departure === departure;
            });

            if (!targetData) return false;

            return !!_.find(targetData.arrive, function(code) {
                return code === cityCode;
            });
        },

        getAvailableCityCodes: function(departure) {
            return _.find(this.get('absoluteUmpList'), function(data) {
                return data.departure === departure;
            }).arrive;
        },

        getPopularCity: function(departure){
            if (!departure){
                var popularCities = this.get('popCities')['DEFAULT'];
            } else {
                var hasCity = _.has(this.get('popCities'), departure);
                var popularCities = hasCity ? this.get('popCities')[departure] : this.get('popCities')['DEFAULT'];
            }

            return popularCities;
        },

        isDaySelectable : function(yearMonth) {
            return !_.isEmpty(yearMonth);
        },

        eachSelectableDays : function(yearMonth, callback) {
            if (this.isDaySelectable(yearMonth)) {
                var year = +yearMonth.substring(0, 4);
                var month = +yearMonth.substring(4, 6);

                var dateStartsFrom = this.dateStartsFrom();
                var yearStarts = dateStartsFrom.getFullYear(),
                    monthStarts = dateStartsFrom.getMonth() + 1,
                    dayStarts = dateStartsFrom.getDate();

                var lastDay = new Date(year, month, 0).getDate();
                for (var i = 1; i <= lastDay; i++) {
                    if (year == yearStarts && month == monthStarts && i < dayStarts) {
                        // skip before unsuported tour dates...
                        continue;
                    }
                    callback(year, month, i);
                }
            }
        },

    }));

    ns.TourFormModel = TourFormModel;

})(window, jQuery);