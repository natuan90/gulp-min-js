(function(window, $) {
    // 全体の方針としてModelからHTMLへのbindingはやめた。View -> Modelの片方向のみ。
    // Modelが薄くなるが、、煩雑になってしまうので。。あとで綺麗にできたらやる。
    var format = skygate.util.format;
    var startsWith = skygate.util.startsWith;

    var getFormKey = (function() {
        var formKey = 0;
        return function() {
            return formKey++;
        };
    })();

    var FormContainerModel = Backbone.Model.extend({

        defaults: {
            prefix: ''
        },

        initialize: function(option) {
            var prefix = getFormKey() + '_';
            if (option.saveKeyPrefix) {
              prefix = option.saveKeyPrefix + '_' + prefix;
            }
            this.set('prefix', prefix);
        },

        getTabIndexKey: function() {
            return this.createContainerId() + '_' + location.host + location.pathname;
        },

        saveTabIndex: function(tabIndex) {
            var storage = window.sessionStorage;
            if (!storage) return false;
            try {
                storage.setItem(this.getTabIndexKey(), tabIndex);
            } catch (e) {
                return false;
            }
            return true;
        },

        getSavedTabIndex: function(containerId) {
            var storage = window.sessionStorage;
            if (!storage) return;
            try {
                return +storage.getItem(this.getTabIndexKey());
            } catch (e) {
                return;
            }
        },

        createContainerId: function() {
            return this.get('prefix') + 'msf';
        }
    });

    // FIXME? とりあえずModelに属性をもたせるのはやめておく。ビジネスロジックの集合体として作る
    var MultiSearchFormBaseModel = Backbone.Model.extend({

        errorMessage: {
            required: '{0}が指定されていません。',
            invalidDate: '{0}は存在しない日付です。'
        },

        getSearchConditionKey: function(id) {
            return id + '_' + location.host + location.pathname;
        },

        saveCondition: function (containerId, condition) {
            var storage = window.sessionStorage;
            if (!storage) return false;
            var airStorageKeys = [
                "0_msf_air_www.skygate.co.jp/",
                "0_msf_air_www.skygate.co.jp/hotel/",
                "0_msf_air_www.skygate.co.jp/dp/"
            ];

            var dpStorageKeys = [
                "0_msf_a+h_www.skygate.co.jp/",
                "0_msf_a+h_www.skygate.co.jp/hotel/",
                "0_msf_a+h_www.skygate.co.jp/dp/"
            ];
            var currentCondititonKey=this.getSearchConditionKey(containerId);
            try {
                //Case search from AIR tabs
                if (airStorageKeys.includes(currentCondititonKey)) {
                    airStorageKeys.forEach(function (airStorageKey) {
                        if (airStorageKey !== currentCondititonKey) {
                            var airSaved = storage.getItem(airStorageKey) ? storage.getItem(airStorageKey) : '{}';
                            var airSavedJson = JSON.parse(airSaved);
                            airSavedJson.arrival = condition.arrival;
                            airSavedJson.searchKind = condition.searchKind;
                            airSavedJson.departureKind = condition.departureKind;
                            airSavedJson.departure = condition.departure;
                            airSavedJson.destinations = condition.destinations;
                            airSavedJson.fromDate = condition.fromDate;
                            airSavedJson.toDates = condition.toDates;
                            airSavedJson.adultNum = condition.adultNum;
                            airSavedJson.minorAges = condition.minorAges;
                            storage.setItem(airStorageKey, JSON.stringify(airSavedJson));
                        }
                    });
                    //Update case difference type (A+H)
                    dpStorageKeys.forEach(function (dpStorageKey) {
                        var dpSaved = storage.getItem(dpStorageKey) ? storage.getItem(dpStorageKey) : '{}';
                        var dpSavedJson = JSON.parse(dpSaved);
                        dpSavedJson.arrival = condition.arrival;
                        dpSavedJson.departure = condition.departure;
                        dpSavedJson.destination = condition.destinations[0];
                        dpSavedJson.fromDate = condition.fromDate;
                        dpSavedJson.arrivalLabel = condition.arrivalLabel;
                        dpSavedJson.departureLabel = condition.departureLabel;
                        dpSavedJson.destinationLabel = condition.destinationLabel;
                        dpSavedJson.toDate = condition.toDates && condition.toDates.length > 0 ? condition.toDates[condition.toDates.length - 1] : '';
                        if (!dpSavedJson.toDate) {
                            var fromDate = new Date(condition.fromDate);
                            fromDate.setDate(fromDate.getDate() + 3);
                            dpSavedJson.toDate = function (current) {
                                var currentMonth = current.getMonth() + 1; // getMonth() is zero-based
                                var currentDate = current.getDate();

                                return [current.getFullYear(),
                                    (currentMonth > 9 ? '' : '0') + currentMonth,
                                    (currentDate > 9 ? '' : '0') + currentDate
                                ].join('/');
                            }(fromDate);
                        }
                        dpSavedJson.roomSettings = [];
                        var roomSetting = new Object;
                        roomSetting.adultNum = condition.adultNum;
                        roomSetting.minorAges = condition.minorAges ? condition.minorAges.map(Number) : [];
                        dpSavedJson.roomSettings.push(roomSetting);
                        storage.setItem(dpStorageKey, JSON.stringify(dpSavedJson));
                    });
                }

                //Case search from A+H tabs
                if (dpStorageKeys.includes(currentCondititonKey)) {
                    dpStorageKeys.forEach(function (dpStorageKey) {
                        if (dpStorageKey !== currentCondititonKey) {
                            var dpSaved = storage.getItem(dpStorageKey) ? storage.getItem(dpStorageKey) : '{}';
                            var dpSavedJson = JSON.parse(dpSaved);
                            dpSavedJson.arrival = condition.arrival;
                            dpSavedJson.arrivalLabel = condition.arrivalLabel;
                            dpSavedJson.departure = condition.departure;
                            dpSavedJson.departureLabel = condition.departureLabel;
                            dpSavedJson.destination = condition.destination;
                            dpSavedJson.destinationLabel = condition.destinationLabel;
                            dpSavedJson.fromDate = condition.fromDate;
                            dpSavedJson.toDate = condition.toDate;
                            dpSavedJson.roomSettings = condition.roomSettings;
                            storage.setItem(dpStorageKey, JSON.stringify(dpSavedJson));
                        }
                    })
                    //Update case difference type (AIR)
                    airStorageKeys.forEach(function (airStorageKey) {
                        var airSaved = storage.getItem(airStorageKey) ? storage.getItem(airStorageKey) : '{}';
                        var airSavedJson = JSON.parse(airSaved);
                        airSavedJson.searchKind = airSaved.searchKind ? airSaved.searchKind : 0;
                        airSavedJson.arrival = condition.arrival;
                        airSavedJson.departure = condition.departure;
                        airSavedJson.destinations = [];
                        airSavedJson.destinations.push(condition.destination);
                        airSavedJson.fromDate = condition.fromDate;
                        airSavedJson.toDates = [];
                        airSavedJson.toDates.push(condition.toDate);
                        //convert roomSetting to adultNum and minorAges
                        airSavedJson.adultNum = condition.roomSettings.map(function (x) {
                            return x.adultNum;
                        }).reduce(function (x, y) {
                            return x + y;
                        });
                        airSavedJson.minorAges = condition.roomSettings.map(function (x) {
                            return x.minorAges
                        }).reduce(function (x, y) {
                            return x.concat(y);
                        });
                        storage.setItem(airStorageKey, JSON.stringify(airSavedJson));
                    });
                }
                storage.setItem(currentCondititonKey, JSON.stringify(condition));
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
        },

        normalizeDateString: function(dateString) {
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
            var arrDate =  [ymd[0], month];
            if (day){
                arrDate.push(day);
            }
            return arrDate.join('/').replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s) {
                return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
            });
        }
    });

    var ns = skygate.util.namespace('airlink.model.common.ui_integration_multi_search_form');
    ns.FormContainerModel = FormContainerModel;
    ns.MultiSearchFormBaseModel = MultiSearchFormBaseModel;
})(window, jQuery);
