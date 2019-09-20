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
            invalidDate: '{0}は存在しない日付です。',
            samePlace: '出発地とは異なる場所を選択してください。'
        },

        getSearchConditionKey: function(id) {
            return id + '_' + location.host + location.pathname;
        },

        saveCondition: function (containerId, condition) {
            var storage = window.sessionStorage;
            if (!storage) return false;
            var keyDPDP = '_AnH_sp.skygate.co.jp/dp/';
            var currentCondititonKey = this.getSearchConditionKey(containerId);
            try {
                storage.setItem(currentCondititonKey, JSON.stringify(condition));
                if ('spairform_sp.skygate.co.jp/' === currentCondititonKey) {
                    var dpStorageSp = storage.getItem(keyDPDP) ? storage.getItem(keyDPDP) : '{}';
                    var dpStorageSpJson = JSON.parse(dpStorageSp);
                    dpStorageSpJson.AgentCode = 'SPHPA';
                    if (!dpStorageSpJson.arrival) {
                        dpStorageSpJson.arrival = condition.arrival ? condition.arrival : condition.departure;
                    }
                    dpStorageSpJson.departure = condition.departure;
                    dpStorageSpJson.destination = condition.destinations && condition.destinations.length > 0 ? condition.destinations[0] : '';
                    dpStorageSpJson.fromDate = condition.fromDate ? condition.fromDate.replace(/\//g, '') : '';
                    //Case search from one way (condition.toDates === undefind), need set toDate by fromDate + 3 (function getInitToDate)
                    dpStorageSpJson.toDate = condition.toDates && condition.toDates.length > 0 ? condition.toDates[condition.toDates.length - 1].replace(/\//g, '') : this.getToDate(dpStorageSpJson.fromDate).replace(/\//g, '');
                    var minorAgesString = condition.minorAges ? (',') + (condition.minorAges.join()) : '';
                    dpStorageSpJson.rooms = condition.adultNum + minorAgesString;
                    storage.setItem(keyDPDP, JSON.stringify(dpStorageSpJson));
                }
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
            return [ymd[0], month, day].join('/').replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s) {
                return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
            });
        }
    });

    var ns = skygate.util.namespace('airlink.model.common.multi_search_form');
    ns.FormContainerModel = FormContainerModel;
    ns.MultiSearchFormBaseModel = MultiSearchFormBaseModel;
})(window, jQuery);
