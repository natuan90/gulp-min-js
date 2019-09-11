;(function(window, $) {

    var $document = $(document);
    var format = skygate.util.format;
    var toYmdString = skygate.util.date.toYmdString;
    var ymdStringToObject = skygate.util.date.ymdStringToObject;
    var ymdStringToObjectWithSeparator = skygate.util.date.ymdStringToObjectWithSeparator;
    var computeDate = skygate.util.date.computeDate;
    var diffDate = skygate.util.date.diffDate;
    var today = computeDate(new Date(), 0);

    var DestinationModel = Backbone.Model.extend({

        reverseLookup: {},

        defaults: {
            destination: '' // must be initialized
        },

        initialize: function() {
            this.directions = window.directions;
        },

        getAreas: function() {
            return this.directions;
        },

        getCountries: function(directionIndex) {
            return this.directions[directionIndex].areas;
        },

        getDefaultCountry: function(directionIndex) {
            var direction = this.directions[directionIndex];
            return direction.areas.length === 1 ? direction.areas[0].code : direction.defaultArea;
        },

        getCities: function(directionIndex, areaIndex) {
            return this.directions[directionIndex].areas[areaIndex].cities;
        },

        getDefaultCity: function(directionIndex, areaIndex) {
            var area = this.directions[directionIndex].areas[areaIndex];
            return area.cities.length === 1 ? area.cities[0].code : area.defaultCity;
        },

        getCorrespondingCountry: function() {
            var lookup = this._reverseLookup(this.get('destination'));
            return this.directions[lookup.directionIndex].areas[lookup.areaIndex];
        },

        getCorrespondingArea: function() {
            var lookup = this._reverseLookup(this.get('destination'));
            return this.directions[lookup.directionIndex];
        },

        _reverseLookup: function(destination) {
            if (this.reverseLookup[destination]) {
                return this.reverseLookup[destination];
            }

            var that = this;
            _.each(this.directions, function(direction) {
                _.each(direction.areas, function(area) {
                    _.each(area.cities, function(city) {
                        if (!that.reverseLookup[destination] && destination === city.code) {
                            that.reverseLookup[destination] = {
                                directionIndex: Number(direction.code),
                                areaIndex: Number(area.code)
                            }
                        }
                    });
                });
            });

            return this.reverseLookup[destination] || {};
        }

    });
    skygate.util.namespace('airlink.model.common.multi_search_form.dp').DestinationModel = DestinationModel;

    var DateModel = Backbone.Model.extend({

        ABLE_TO_BUYING_NEXT_DAY_TIME: 18,

        defaults: {
            'fromDate': null,
            'toDate': null,
            'checkin': null,
            'checkout': null
        },

        initialize: function() {
            var today = new Date();
            this.minDate = computeDate(today, 2);
        },

        setDate: function(name, value) {
            var targetDate = this._normalizeDateString(value);
            this.attributes[name] = targetDate.split('/').join('');
            this._adjust(name);
        },

        _normalizeDateString: function(dateString) {
            if (!dateString) {
                return dateString;
            }
            dateString = _.reduce(['・', '／', '･'], function(text, target) {
                return text.split(target).join('/');
            }, dateString);
            if (dateString.indexOf('/') === -1) {
                return dateString;
            }
            var ymd = dateString.split('/');
            var month = ymd[1];
            var day = ymd[2];
            if (month && month.length === 1) {
                month = '0' + month;
            }
            if (day && day.length === 1) {
                day = '0' + day;
            }
            return [ymd[0], month, day].join('/').replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s) {
                return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
            });
        },

        _adjust: function(name) {
            var fromDate = this.getDateObject('fromDate');
            var toDate = this.getDateObject('toDate');
            var checkin = this.getDateObject('checkin');
            var checkout = this.getDateObject('checkout');
            if (name === 'fromDate') {
                if (fromDate) {
                    if (toDate && toDate <= fromDate) {
                        toDate = computeDate(fromDate, 1);
                        this.set('toDate', toYmdString(toDate));
                    }
                    if (checkin && computeDate(checkin, 1) < fromDate) {
                        checkin = fromDate;
                        this.set('checkin', toYmdString(checkin));
                        if (checkout && checkout < checkin) {
                            checkout =  computeDate(checkin, 1);
                            this.set('checkout', toYmdString(checkout));
                        }
                    }
                }
            } else if (name === 'toDate') {
                if (fromDate && toDate && checkout && fromDate < toDate && toDate < checkout) {
                    checkout = toDate;
                    this.set('checkout', toYmdString(checkout));
                    if (checkin && checkout <= checkin) {
                        checkin = computeDate(checkout, -1);
                        this.set('checkin', toYmdString(checkin));
                    }
                }
            } else if (name === 'checkin') {
                if (toDate && checkin && checkout && checkin < toDate && checkout <= checkin) {
                    checkout = computeDate(checkin, 1);
                    this.set('checkout', toYmdString(checkout));
                }
            } else if (name === 'checkout') {
                if (fromDate && checkin && checkout && fromDate < checkout && checkout <= checkin) {
                    checkin = computeDate(checkout, -1);
                    this.set('checkin', toYmdString(checkin));
                }
            }
        },

        getDateObject: function(key) {
            var target = this.get(key);
            try {
                return ymdStringToObject(target);
            } catch (e) {
                return null;
            }
        },

        getNumberOfStay: function() {
            var checkin = this.getDateObject('checkin');
            var checkout = this.getDateObject('checkout');
            var diffDays = checkin && checkout ? diffDate(checkout, checkin) : 0;
            return 0 < diffDays ? diffDays : null;
        },

        getWithSeparator: function(key) {
            var dateObject = this.getDateObject(key);
            return dateObject ? toYmdString(dateObject, '/') : this.get(key);
        },

        getCalendarMinDate: function() {
            var minDate = this.ABLE_TO_BUYING_NEXT_DAY_TIME <= new Date().getHours() ? computeDate(new Date(), 1): new Date();
            return new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
        },

        getCalendarMaxDate: function() {
            return new Date(new Date().getFullYear() + 1, 11, 31);
        },

        isSameDate: function(date1, date2) {
            return date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth() && date1.getDate() === date2.getDate();
        }

    });
    skygate.util.namespace('airlink.model.common.multi_search_form.dp').DateModel = DateModel;

    var CalendarModel = Backbone.Model.extend({

        ABLE_TO_BUYING_NEXT_DAY_TIME: 18,

        DEFAULT_INTERVAL: 3,

        CALENDAR_LIMIT: 360,

        WEEK_RANGE: _.range(1, 7),

        initialize: function() {
            this.from = this.getDefaultFromDate(this.ABLE_TO_BUYING_NEXT_DAY_TIME);
            this.fromWithoutTime = new Date(this.from.getFullYear(), this.from.getMonth(), this.from.getDate());
            this.last = computeDate(new Date(), this.CALENDAR_LIMIT);
            this.lastSunday = this.last.getDay() === 0 ?
                this.last : computeDate(this.last, -1 * this.last.getDay());
        },

        getDefaultFromDate: function(limitHour) {
            return new Date().getHours() >= limitHour ? new Date(): computeDate(new Date(), -1);
        },

        getDefaultToDate: function(from, interval) {
            return computeDate(from, interval);
        },

        getDateWithoutReturn: function(from) {
            return this.getDefaultToDate(from, this.DEFAULT_INTERVAL);
        },

        _checkHoliday: function(date) {
            return !!ktHolidayName(date);
        },

        _createDate: function(date, ng, holiday) {
            return {
                ng: ng,
                day: date.getDate(),
                month: date.getMonth() + 1,
                holiday: holiday,
                ymd: toYmdString(date, '/')
            };
        },

        getCalendarDates: function() {
            var dates = [];
            var isLastWeek = false;
            dates.push(this._createFirstWeek(this.fromWithoutTime));
            var startDate = computeDate(this.fromWithoutTime, 1 + (6 - this.fromWithoutTime.getDay()));
            while (!(isLastWeek = startDate >= this.lastSunday)) {
                dates.push(this._createNormalWeek(startDate));
                startDate = computeDate(startDate, + 7);
            }
            dates.push(this._createLastWeek(this.last));
            return dates;
        },

        _createFirstWeek: function(targetDate) {
            var startDate = targetDate;
            if (targetDate.getDay() !== 0) {
                startDate = computeDate(targetDate, -targetDate.getDay());
            }
            var week = [];
            week.push(this._createDate(startDate, startDate < targetDate));
            return _.reduce(this.WEEK_RANGE, function(week, index) {
                var date = computeDate(startDate, index);
                week.push(this._createDate(date, targetDate > date, this._checkHoliday(date)));
                return week;
            }, week, this);
        },

        _createLastWeek: function(targetDate) {
            var startDate = targetDate;
            if (targetDate.getDay() !== 0) {
                startDate = computeDate(targetDate, -1 * targetDate.getDay());
            }
            var week = [];
            week.push(this._createDate(startDate));
            return _.reduce(this.WEEK_RANGE, function(week, index) {
                var date = computeDate(startDate, index);
                week.push(this._createDate(date, targetDate < date, this._checkHoliday(date)));
                return week;
            }, week, this);
        },

        _createNormalWeek: function(targetDate) {
            var startDate = targetDate;
            var week = [];
            week.push(this._createDate(startDate));
            return _.reduce(this.WEEK_RANGE, function(week, index) {
                var date = computeDate(startDate, index);
                week.push(this._createDate(date, false, this._checkHoliday(date)));
                return week;
            }, week, this);
        }
    });
    skygate.util.namespace('airlink.model.common.multi_search_form.dp').CalendarModel = CalendarModel;

    var RoomModel = Backbone.Model.extend({
        defaults: {
            roomMaxNum : 4,
            rooms : [],
            roomDefault : {
                adult : 1,
                childAges : []
            }
        },

        initialize: function() {
            _.bindAll(this, 'increment', 'decrement', 'setRoomNum', 'getRooms');
        },

        deserialize: function(roomsAsStr) {
            return _.reduce(roomsAsStr.split(':'), function(memo, one) {
                var adultAndChildren = _.map(one.split(','), function(v) {
                    return parseInt(v, 10);
                });
                memo.push({
                    adult: adultAndChildren.shift(),
                    childAges: adultAndChildren || []
                });
                return memo;
            }, []);
        },

        deserializeAndUpdate: function(roomsAsStr) {
            var rooms = this.deserialize(roomsAsStr);
            this.set('rooms', rooms);
            return rooms;
        },

        formatStr: function(roomList) {
            var rooms = [];
            _.each(roomList, function(room){
                var temp = room.adult;
                if (room.childAges.length > 0) {
                    temp += ',' + room.childAges.join(',');
                }
                rooms.push(temp);
            });
            return rooms.join(':');
        },

        increment : function() {
            var rooms = this.get('rooms');
            var roomNum = rooms.length;
            var roomMaxNum = this.get('roomMaxNum');
            if (roomNum < roomMaxNum) {
                rooms[roomNum] = $.extend(true, {}, this.get('roomDefault'));
                this.trigger('change');
            }
        },

        decrement : function() {
            var rooms = this.get('rooms');
            var roomNum = rooms.length;
            if (1 < roomNum) {
                rooms.pop();
                this.trigger('change');
            }
        },

        setRoomNum : function(roomNum) {
            var roomMaxNum = this.get('roomMaxNum');
            if (1 <= roomNum && roomNum <= roomMaxNum) {
                var rooms = this.get('rooms');
                if (rooms.length < roomNum) {
                    var roomDefault = this.get('roomDefault');
                    _.each(_.range(rooms.length, roomNum), function() {
                        rooms.push($.extend(true, {}, roomDefault));
                    });
                } else {
                    rooms.length = roomNum;
                }
                this.trigger('change');
            }
        },

        getRooms : function() {
            return this.formatStr(this.get('rooms'));
        },

        getRoomsAsObject: function() {
            var rooms = this.get('rooms');
            _.each(rooms, function(room) {
                room.adult = parseInt(room.adult, 10);
                if (!_.isEmpty(room.childAges)) {
                    _.each(room.childAges, function(ca, i) {
                        room.childAges[i] = parseInt(ca, 10);
                    });
                }
            });
            return rooms;
        },

        setRooms : function(roomIndex, updateData) {
            var rooms = this.get('rooms');
            rooms[roomIndex] = updateData;
        }
    });
    skygate.util.namespace('airlink.model.common.multi_search_form.dp').RoomModel = RoomModel;

    var FilterCondition = Backbone.Model.extend({

        query : {
            always : ['form', 'searchWait', 'AgentCode', 'tab', 'differentDate', 'differentRegion', 'meta'],
            air : {
                full : ['fromDate', 'toDate', 'departure', 'destination', 'arrival', 'rooms', 'direct', 'openFix', 'carriers', 'omitLcc', 'seatClass', 'airOrder', 'depTimes', 'airPage', 'searchKind'],
                cachekey : ['airCacheKey']
            },
            hotel : {
                full : ['fromDate', 'toDate', 'rooms', 'regionId', 'destination', 'checkin', 'checkout', 'hotelSort', 'hotelPage'],
                cachekey : ['hotelCacheKey']
            },
            selectedItem : {
                clear: {
                    air: 'clearAir',
                    hotel: 'clearHotel'
                },
                cachekey: ['selectedItemKey']
            },
            setBeforeCheck : {
                checkin : {key: 'differentDate'},
                checkout : {key: 'differentDate'},
                regionId : {key: 'differentRegion'}
            }
        },

        getUsableFormParams : function(formValue) {
            var query = this.query;
            var air = query.air.full;
            var hotel = query.hotel.full;
            var keyList = _.union(query.always, air, hotel);
            var params = this._getParams(formValue, keyList);
            return params;
        },

        _getParams: function(formValue, validKeyList) {
            var that = this;
            return _.reduce(validKeyList, function(memo, key){
                if (that._isVaildValue(formValue, key, memo)) {
                    memo[key] = formValue[key];
                    return memo;
                } else {
                    return memo;
                }
            }, {});
        },

        _isVaildValue : function(formValue, key, memo) {
            if (this.query.setBeforeCheck[key]) {
                var setBeforeCheck = this.query.setBeforeCheck[key];
                var value = formValue[setBeforeCheck.key] && formValue[key] ? formValue[key] : null;
            } else {
                var value = formValue[key] ? formValue[key] : null;
            }
            return !_.isUndefined(value) && value !== null && value !== "";
        }
    });
    skygate.util.namespace('airlink.model.common.multi_search_form.dp').FilterCondition = FilterCondition;

    var ValidateCondition = Backbone.Model.extend({

        TRAVELERS_NUMBER_LIMIT: 9,

        errorMessage: {
            required: '{0}が指定されていません。',
            invalid: '{0}の指定が不正です。',
            invalidDate: '{0}は存在しない日付です。',
            pastDate: '{0}が過去日付です。',
            travelersMaxOver: '旅行者の最大人数は{0}名までです。'
        },

        initialize: function() {
            this.roomModel = new RoomModel();
        },

        validate: function(form) {
            var that = this;

            var errors = [];

            var isDateError = this._validateDate(form, errors);

            this._validateCheckinout(form, errors, isDateError);

            if (!form.departure) {
                errors.push(format(this.errorMessage.required, '出発地'));
            }
            if (!form.destination) {
                errors.push(format(this.errorMessage.required, '目的地'));
            }
            if (!form.arrival) {
                errors.push(format(this.errorMessage.required, '帰国到着地'));
            }

            this._validateRooms(form, errors);

            return errors;
        },

        _validateDate: function(form, errors) {
            var errorFlg = false;
            if (!form.fromDate) {
                errors.push(format(this.errorMessage.required, '出発日'));
                errorFlg = true;
            } else if(!this._isValidDate(form.fromDate)) {
                errors.push(format(this.errorMessage.invalidDate, '出発日'));
                errorFlg = true;
            } else if(this._isPastDate(form.fromDate, 0)) {
                errors.push(format(this.errorMessage.pastDate, '出発日'));
                errorFlg = true;
            } else if (!form.toDate) {
                errors.push(format(this.errorMessage.required, '現地出発日'));
                errorFlg = true;
            } else if (!this._isValidDate(form.toDate)) {
                errors.push(format(this.errorMessage.invalidDate, '現地出発日'));
                errorFlg = true;
            } else if (this._isPastDate(form.toDate, 0)) {
                errors.push(format(this.errorMessage.pastDate, '現地出発日'));
                errorFlg = true;
            } else {
                var fromDate = ymdStringToObjectWithSeparator(form.fromDate);
                var toDate = ymdStringToObjectWithSeparator(form.toDate);
                if (toDate <= fromDate) {
                    errors.push(format(this.errorMessage.invalid, '出発日'));
                    errorFlg = true;
                }
            }
            return errorFlg;
        },

        _validateCheckinout: function(form, errors, isDateError) {
            if (form.differentDate) {
                if (!form.checkin) {
                    errors.push(format(this.errorMessage.required, 'チェックイン'));
                } else if(!this._isValidDate(form.checkin)) {
                    errors.push(format(this.errorMessage.invalidDate, 'チェックイン'));
                } else if(this._isPastDate(form.checkin, -1)) {
                    errors.push(format(this.errorMessage.pastDate, 'チェックイン'));
                } else if (!form.checkout) {
                    errors.push(format(this.errorMessage.required, 'チェックアウト'));
                } else if (!this._isValidDate(form.checkout)) {
                    errors.push(format(this.errorMessage.invalidDate, 'チェックアウト'));
                } else if (this._isPastDate(form.checkout, 0)) {
                    errors.push(format(this.errorMessage.pastDate, 'チェックアウト'));
                } else {
                    var checkinDate = ymdStringToObjectWithSeparator(form.checkin);
                    var checkoutDate = ymdStringToObjectWithSeparator(form.checkout);
                    if (checkoutDate <= checkinDate) {
                        errors.push(format(this.errorMessage.invalid, 'チェックイン'));
                    } else if (!isDateError) {
                        var fromDate = ymdStringToObjectWithSeparator(form.fromDate);
                        var toDate = ymdStringToObjectWithSeparator(form.toDate);
                        if (checkinDate < computeDate(fromDate, -1) || toDate < checkoutDate) {
                            errors.push('チェックイン・チェックアウトは、出発日・現地出発日の間からお選びください。');
                        }
                    }
                }
            }
        },

        _isValidDate: function(text) {
            if (!text) return false;
            try {
                if (text.indexOf('/') === -1) {
                    if (text.length === 8) {
                        var d = [text.substring(0, 4), text.substring(4, 6), text.substring(6, 8)];
                    } else {
                        return false;
                    }
                } else {
                    var d = text.split('/');
                }
                var date = new Date(d[0], +d[1] - 1, d[2]);
                if (date === null ||
                    date.getFullYear() !== +d[0] ||
                    date.getMonth() + 1 !== +d[1] ||
                    date.getDate() !== +d[2]) {
                    return false;
                }
                return true;
            } catch (error) {
                return false;
            }
        },

        _isPastDate: function(text, add) {
            if (text.indexOf('/') === -1) {
                if (text.length === 8) {
                    var d = [text.substring(0, 4), text.substring(4, 6), text.substring(6, 8)];
                } else {
                    return false;
                }
            } else {
                var d = text.split('/');
            }
            var date = new Date(d[0], +d[1] - 1, d[2]);
            return date < computeDate(today, add);
        },

        _validateRooms: function(form, errors) {
            var rooms = this.roomModel.deserialize(form.rooms);
            var total = _.reduce(rooms, function(total, room) {
                total += room.adult + room.childAges.length;
                return total;
            }, 0);
            if (this.TRAVELERS_NUMBER_LIMIT < total) {
                errors.push(format(this.errorMessage.travelersMaxOver, this.TRAVELERS_NUMBER_LIMIT));
                return;
            }
            var numberOfAdult = _.reduce(rooms, function(total, room) {
                total += room.adult;
                return total;
            }, 0);
            var numberOfChild = _.reduce(rooms, function(total, room) {
                total += room.childAges.length;
                return total;
            }, 0);
            if (numberOfAdult < numberOfChild) {
                errors.push('子供、幼児人数が大人人数を超えています。')
            }
        }
    });
    skygate.util.namespace('airlink.model.common.multi_search_form.dp').ValidateCondition = ValidateCondition;

    var AirAndHotelFormModel = Backbone.Model.extend({

        DEFAULT_ADD_TODATE: 3,

        getInitialParameter: function(initialParameter) {
            var params = $.extend(true, {}, initialParameter);

            var fromDate = this._getInitialFromDate(initialParameter);
            params.fromDate =  toYmdString(fromDate);
            var addTodate = initialParameter.toDate || this.DEFAULT_ADD_TODATE;
            var todate = computeDate(fromDate, addTodate);
            params.toDate = toYmdString(todate);

            params = $.extend(this._getInitialCheckinOut(initialParameter, fromDate, todate), params);
            var rooms = this._getInitialRooms(initialParameter);
            params.rooms = rooms;

            params.departure = initialParameter.departure || 'TYO';
            params.arrival = initialParameter.arrival || initialParameter.departure;
            return params;
        },

        _getInitialFromDate: function(initialParameter) {
            var fromDate = initialParameter.fromDate;
            if (fromDate) {
                if (_.isString(fromDate)) {
                    if (fromDate.indexOf('/') === -1) {
                        return ymdStringToObject(fromDate);
                    } else {
                        return ymdStringToObjectWithSeparator(fromDate);
                    }
                } else if (_.isNumber(fromDate)) {
                    var today = new Date();
                    return computeDate(today, fromDate);
                }
            }

            var today = new Date();
            return new Date(today.getFullYear(), today.getMonth() + 1, 15);
        },

        _getInitialCheckinOut: function(initialParameter, fromDate, todate) {
            if (initialParameter.checkin && initialParameter.checkout) {
                return {
                    checkin: initialParameter.checkin.replace(/\u002f/g, ''),
                    checkout: initialParameter.checkout.replace(/\u002f/g, '')
                };
            } else {
                return {
                    checkin: toYmdString(fromDate),
                    checkout: toYmdString(todate)
                };
            }
        },

        _getInitialRooms: function(initialParameter) {
            if (initialParameter.rooms) {
                return _.reduce(initialParameter.rooms, function(memo, room){
                    memo.push({
                        adult: room.adultNum,
                        childAges: room.minorAges || []
                    });
                    return memo;
                }, []);
            } else {
                return [{
                    adult: 2,
                    childAges: []
                }];
            }
        },

        getSearchConditionKey: function(id) {
            return id + '_' + location.host + location.pathname;
        },

        saveCondition: function(containerId, condition) {
            var storage = window.sessionStorage;
            if (!storage) return false;
            try {
                storage.setItem(this.getSearchConditionKey(containerId), JSON.stringify(condition));
            } catch (e) {
                return false;
            }
            return true;
        },

        getSavedCondition: function(containerId) {
            var storage = window.sessionStorage;
            if (!storage) return;
            try {
                var jsonString = storage.getItem(this.getSearchConditionKey(containerId));
                if (jsonString) {
                    return $.parseJSON(jsonString);
                }
            } catch (e) {
                return;
            }
        }
    });
    skygate.util.namespace('airlink.model.common.multi_search_form.dp').AirAndHotelFormModel = AirAndHotelFormModel;

})(window, jQuery);
