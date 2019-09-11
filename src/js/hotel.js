(function(window, $) {
    var format = skygate.util.format;
    var computeDate = skygate.util.date.computeDate;
    var toYmdString = skygate.util.date.toYmdString;
    var ymdStringToObject = skygate.util.date.ymdStringToObject;
    var ymdStringToObjectWithSeparator = skygate.util.date.ymdStringToObjectWithSeparator;
    var diffDate = skygate.util.date.diffDate;

    var msf = airlink.model.common.ui_integration_multi_search_form;
    var MultiSearchFormBaseModel = msf.MultiSearchFormBaseModel;

    var HotelFormModexMixin = {

        AUTO_COMPLETE_URL: '/hotel/api/auto_complete',

        suggest: function(text) {
            var promise = $.ajax(this.AUTO_COMPLETE_URL, {
                type: 'get',
                dataType: 'json',
                cache: false,
                data: $.param({
                    q: text,
                    field: this._getAutoCompleteField()
                })
            });
            // jquery autocompleteはBackbone.Modelと組み合わせづらいので、、promiseを返す
            return promise;
        },

        roomSettingsToRooms: function(roomSettings) {
            return _.reduce(roomSettings, function(memo, roomSetting) {
                var adultNum = roomSetting.adultNum;
                var minorAges = roomSetting.minorAges;
                if (minorAges && minorAges.length > 0) {
                    minorAges.unshift(adultNum);
                    memo.push(minorAges.join(','));
                } else {
                    memo.push(adultNum);
                }
                return memo;
            }, []).join(':');
        }
    };

    var HotelFormModel = MultiSearchFormBaseModel.extend({

        DEFAULT_INTERVAL: 2,

        MIN_GRADE: 1,

        MAX_GRADE: 5,

        autoCompleteField: 'region,landmark,airport,hotel',

        defaults: {
            checkin: null,
            checkout: null,
            stayNum: null
        },

        initialize: function(attributes) {
            var checkin = computeDate(new Date(), 1);
            var checkout = computeDate(checkin, this.DEFAULT_INTERVAL);

            this.set('checkin', checkin, {silent: true});
            this.set('checkout', checkout, {silent: true});
            this.setStayNum(true);
        },

        getCheckinString: function() {
            return toYmdString(this.get('checkin'), '/');
        },

        getCheckoutString: function() {
            return toYmdString(this.get('checkout'), '/');
        },

        _getAutoCompleteField: function() {
            return this.autoCompleteField;
        },

        setDate: function(attrName, dateText) {
            var date = ymdStringToObjectWithSeparator(this.normalizeDateString(dateText));
            this.set(attrName, date);

            var checkout = this.get('checkout');
            if (attrName === 'checkin' && date >= checkout) {
                this.set('checkout', computeDate(date, 1));
            }
            this.setStayNum();
        },

        setStayNum: function(needSilent) {
            var stayNum;
            var checkin = this.get('checkin');
            var checkout = this.get('checkout');
            try {
                stayNum = diffDate(this.get('checkout'), this.get('checkin'));
            } catch (e) {}
            if (!checkin || !checkout || !_.isNumber(stayNum) || stayNum < 1) {
                stayNum = '-';
            }
            this.set('stayNum', stayNum, {silent: needSilent});
        },

        validDate: function(text) {
            if (!text) return false;
            try {
                var d = text.split('/');
                var date = new Date(d[0], +d[1] - 1, d[2]);
                if (date == null ||
                    date.getFullYear() != d[0] ||
                    date.getMonth() + 1 != d[1] ||
                    date.getDate() != d[2]) {
                    return false;
                }
                return true;
            } catch (error) {
                return false;
            }
        },

        validate: function(searchCondition) {
            var errors = [];

            var dateInvalid = false;
            var dateCheckIn = 'チェックイン';
            var dateCheckOut = 'チェックアウト';
            var checkin = searchCondition.checkin;
            var checkout = searchCondition.checkout;
            var checkinDate = ymdStringToObjectWithSeparator(checkin);
            var checkoutDate = ymdStringToObjectWithSeparator(checkout);
            if (!checkin || !checkout) {
                if(!checkin){
                    errors.push({
                        'message': format(this.errorMessage.required, dateCheckIn),
                        'type': '.error-checkin'
                    });
                }
                if(!checkout){
                    errors.push({
                        'message': format(this.errorMessage.required, dateCheckOut),
                        'type': '.error-checkout'
                    });
                }

                dateInvalid = true;
            } else if (!this.validDate(checkin) || !this.validDate(checkout)) {
                if(!this.validDate(checkin)){
                    errors.push({
                        'message': format(this.errorMessage.invalidDate, dateCheckIn),
                        'type': '.error-checkin'
                    });
                }
                if(!this.validDate(checkout)){
                    errors.push({
                        'message': format(this.errorMessage.invalidDate, dateCheckOut),
                        'type': '.error-checkout'
                    });
                }
                dateInvalid = true;
            }
            if (!dateInvalid) {
                var today = computeDate(new Date(), 0);
                if (today > checkinDate || today >checkoutDate)  {
                    if(today > checkinDate){
                        errors.push({
                            'message': 'チェックインは今日以降の日付を指定してください。',
                            'type': '.error-checkin'
                        });
                    }
                    if(today > checkoutDate){
                        errors.push({
                            'message': 'チェックアウトは今日以降の日付を指定してください。',
                            'type': '.error-checkout'
                        });
                    }
                    dateInvalid = true;
                }
            }
            if (!dateInvalid) {
                if (checkinDate > checkoutDate) {
                    errors.push({
                            'message': 'チェックイン・チェックアウトの指定が不正です。',
                            'type': '.error-checkin'
                        });
                    dateInvalid = true;
                }
            }
            return errors;
        },

        createQueryParameter: function(searchCondition) {
            var roomSettings = searchCondition.roomSettings;
            var minGrade = searchCondition.minGrade;
            var maxGrade = searchCondition.maxGrade;
            var facilities = searchCondition.facilities;
            delete searchCondition.roomSettings;
            delete searchCondition.minGrade;
            delete searchCondition.maxGrade;
            delete searchCondition.facilities;
            delete searchCondition.suggestLabel;

            searchCondition.rooms = this.roomSettingsToRooms(roomSettings);

            var params = $.param(searchCondition);
            if (minGrade || maxGrade) {
                var grades;
                if (minGrade && maxGrade) {
                    if (minGrade === maxGrade) {
                        grades = [minGrade];
                    } else {
                        var start = maxGrade > minGrade ? minGrade : maxGrade;
                        var last = maxGrade > minGrade ? maxGrade + 1 : minGrade + 1;
                        grades = _.range(start, last);
                    }
                } else {
                    grades = _.range(minGrade || this.MIN_GRADE, (maxGrade || this.MAX_GRADE) + 1);
                }
                params += _.reduce(grades, function(memo, grade) {
                    memo += '&grade=' + grade;
                    return memo;
                }, '');
            }

            if (facilities) {
                params += _.reduce(facilities, function(memo, facility) {
                    memo += '&facility=' + facility;
                    return memo;
                }, '');
            }
            return params;
        }
    });

    _.extend(HotelFormModel.prototype, HotelFormModexMixin);
    msf.HotelFormModel = HotelFormModel;
    msf.HotelFormModexMixin = HotelFormModexMixin;

})(window, jQuery);