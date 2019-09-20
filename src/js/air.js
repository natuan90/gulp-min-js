(function(window, $) {
    var uuid = skygate.util.uuid;
    var format = skygate.util.format;
    var computeDate = skygate.util.date.computeDate;
    var toYmdString = skygate.util.date.toYmdString;
    var ymdStringToObject = skygate.util.date.ymdStringToObject;
    var ymdStringToObjectWithSeparator = skygate.util.date.ymdStringToObjectWithSeparator;
    var objectToQueryParameters = skygate.util.objectToQueryParameters;

    var msf = airlink.model.common.multi_search_form;
    var MultiSearchFormBaseModel = msf.MultiSearchFormBaseModel;

    var AirFormModel = MultiSearchFormBaseModel.extend({

        ABLE_TO_BUYING_NEXT_DAY_TIME: 18,

        DEFAULT_INTERVAL: 3,

        googleAnalyticsSetting: {
            categoryPrefix: 'AO_searchpanel_',
            target: {
                single: [
                    'departure', 'arrival', 'fromDate', 'totalNum', 'direct', 'carriers',
                    'seatClass', 'AgentCode', 'searchKind'
                ],
                multi: [
                    'destinations', 'toDates', 'depTimes'
                ]
            }
        },

        defaults: {
            from: null,
            to: null,
            domesticAirports: null,
            directions: null,
            directionsOverseas: null,
            reverseDirections: null,
            reverseDirectionsOverseas: null
        },

        setup: function(isAbroad) {
            var attrs = this.attributes;

            if (isAbroad) {
                attrs.from = this.getAbroadDefaultFrom();
            } else {
                attrs.from = new Date().getHours() >= this.ABLE_TO_BUYING_NEXT_DAY_TIME ?
                    computeDate(new Date(), 1): new Date();
            }
            attrs.to = computeDate(attrs.from, this.DEFAULT_INTERVAL);

            attrs.domesticAirports = window.domesticAirportList || [];
            attrs.directions = window.directions || [];
            attrs.directionsOverseas = window.directionsOverSeas || [];
            attrs.reverseDirections = this.createReverseDirections(attrs.directions);
            attrs.reverseDirectionsOverseas = this.createReverseDirections(attrs.directionsOverseas);
        },

        hasEffectiveChildForDirection: function(direction) {
            var areas = direction.areas;
            if (!areas || areas.length === 0) {
                return false;
            }
            return !!_.find(areas, function(area) {
                if ($.trim(area.code)) {
                    return this.hasEffectiveChildForArea(area)
                }
                return false;
            }, this);
        },

        hasEffectiveChildForArea: function(area) {
          var cities = area.cities;
          if (!cities || cities.length === 0) {
              return false;
          }
          if ($.trim(area.code)) {
              return _.find(cities, function(city) {
                return $.trim(city.code);
              })
          }
          return false;
        },

        getDefaultFromAndToDate: function() {
            return {
                from: toYmdString(this.attributes.from, '/'),
                to: toYmdString(this.attributes.to, '/')
            };
        },

        getAbroadDefaultFrom: function() {
            return computeDate(new Date(), 2);
        },

        getDefaultToDate: function(from) {
            return toYmdString(computeDate(from, this.DEFAULT_INTERVAL), '/');
        },

        getToDate: function(fromDate) {
            var from = ymdStringToObjectWithSeparator(fromDate, '/');
            return this.getDefaultToDate(from);
        },

        createReverseDirections: function(directions) {
            var reverseDirections = {};
            _.each(directions, function(direction, directionIndex) {
                if (!direction.code) return;
                _.each(direction.areas, function(area, areaIndex) {
                    if (!area.code) return;
                    _.each(area.cities, function(port) {
                        if (!port.code || reverseDirections[port.code]) return;
                        reverseDirections[port.code] = {
                            countryIndex: areaIndex,
                            areaIndex: directionIndex,
                            portName: port.name
                        };
                    });
                });
            });
            return reverseDirections;
        },

        getAirportLabel: function(code) {
            var info = this.get('reverseDirectionsOverseas')[code];
            if (info) {
                return info.portName;
            }
        },

        findAreaOrCountry: function(directions, name) {
            var target;
            _.some(directions, function(area) {
                if (area.name === name) {
                    target = {
                      areaIndex: area.code
                    };
                    return true;
                }
                return _.some(area.areas, function(country) {
                    if (country.name === name) {
                      target = {
                          areaIndex: area.code,
                          countryIndex: country.code
                      };
                      return true;
                    }
                    return false;
                });
            });
            return target;
        },

        getInputValueToData: function(inputValue, isAbroad) {
            var reverseDirections = isAbroad ?
                this.get('reverseDirectionsOverseas') : this.get('reverseDirections');
            var data, portCode;
            if (inputValue.length > 2) {
                portCode = inputValue.substring(0, 3).toUpperCase();
                data = reverseDirections[portCode];
            }

            if (data) {
                return {
                    data: data,
                    portCode: portCode
                };
            }

            var hitData = _.filter(airSuggestList, function(text) {
                return text.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1;
            });
            if (hitData.length == 1) {
                portCode = hitData[0].substring(0, 3);
                return {
                    data: reverseDirections[portCode],
                    portCode: portCode
                };
            }
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

        validateAbroadFromDate: function(fromDate) {
            var date = ymdStringToObjectWithSeparator(fromDate);
            var limitDate = this.getAbroadDefaultFrom();
            return date.getTime() >= limitDate.getTime();
        },

        validateOneway: function(searchCondition, isAbroad) {
            // FIXME いけてないvalidation
            var errors = [];
            if (!searchCondition.departure) {
                errors.push(format(this.errorMessage.required, '出発地'));
            }

            var destinations = searchCondition.destinations;
            if (destinations.length !== 1 || !destinations[0] || destinations[0].match(/[^A-Za-z]+/)) {
                errors.push(format(this.errorMessage.required, '目的地'));
            }

            var fromDate = searchCondition.fromDate;
            if (!fromDate) {
                errors.push(format(this.errorMessage.required, '出発日'));
            } else if (!this.validDate(fromDate)) {
                errors.push(format(this.errorMessage.invalidDate, '出発日'));
            } else if(isAbroad && !this.validateAbroadFromDate(fromDate)) {
                errors.push(format(
                    '海外発の最短出発日は{0}です。',
                    toYmdString(this.getAbroadDefaultFrom(), '/')
                ));
            }
            return errors;
        },

        validateRoundtrip: function(searchCondition, isAbroad) {
            var errors = [];
            if (!searchCondition.departure) {
                errors.push(format(this.errorMessage.required, '出発地'));
            }

            var destinations = searchCondition.destinations;
            if (destinations.length !== 1 || !destinations[0] || destinations[0].match(/[^A-Za-z]+/)) {
                errors.push(format(this.errorMessage.required, '目的地'));
            }
            if (!searchCondition.arrival) {
                errors.push(format(this.errorMessage.required, '帰国到着地'));
            }

            var dateInvalid = false;
            var fromDate = searchCondition.fromDate;
            var toDates = searchCondition.toDates;
            if (!fromDate) {
                errors.push(format(this.errorMessage.required, '出発日'));
                dateInvalid = true;
            } else if (!this.validDate(fromDate)) {
                errors.push(format(this.errorMessage.invalidDate, '出発日'));
                dateInvalid = true;
            }
            if (toDates.length !== 1 || !toDates[0]) {
                errors.push(format(this.errorMessage.required, '現地出発日'));
                dateInvalid = true;
            } else if (!this.validDate(toDates[0])) {
                errors.push(format(this.errorMessage.invalidDate, '現地出発日'));
                dateInvalid = true;
            }

            if (!dateInvalid) {
                var from = ymdStringToObjectWithSeparator(fromDate);
                var to = ymdStringToObjectWithSeparator(toDates[0]);
                if (from > to) {
                    errors.push('出発日の指定が不正です。');
                    dateInvalid = true;
                }
            }
            if (!dateInvalid &&  isAbroad && !this.validateAbroadFromDate(searchCondition.fromDate)) {
                errors.push(format(
                    '海外発の最短出発日は{0}です。',
                    toYmdString(this.getAbroadDefaultFrom(), '/')
                ));
            }
            return errors;
        },

        validateStopoverOrOpenjaw: function(searchCondition, openjawInfos, isAbroad) {
            // FIXME strict validation.
            var errors = [];
            if (!searchCondition.departure) {
                errors.push(format(this.errorMessage.required, '出発地'));
            }

            var destinations = searchCondition.destinations;
            if (destinations.length < 1 || _.filter(destinations, function(dest) { return !dest || dest.match(/[^A-Za-z]+/);}).length > 0) {
                errors.push(format(this.errorMessage.required, '目的地'));
            }
            if (!searchCondition.arrival) {
                errors.push(format(this.errorMessage.required, '帰国到着地'));
            }

            var fromDate = searchCondition.fromDate;
            var toDates = searchCondition.toDates;
            var dateInvalid = false;
            if (!fromDate) {
                errors.push(format(this.errorMessage.required, '出発日'));
                dateInvalid = true;
            } else if (!this.validDate(fromDate)) {
                errors.push(format(this.errorMessage.invalidDate, '出発日'));
                dateInvalid = true;
            }

            var toDatesRequiredResult = _.every(toDates, function(toDate, index) {
                var isOpenjaw = openjawInfos[index];
                if (!isOpenjaw && !toDate) {
                    dateInvalid = true;
                    errors.push(format(this.errorMessage.required, '移動日'));
                    return false;
                }
                return true;
            }, this);
            if (toDatesRequiredResult) {
                _.every(toDates, function(toDate, index) {
                    var isOpenjaw = openjawInfos[index];
                    if (!isOpenjaw && !this.validDate(toDate)) {
                        dateInvalid = true;
                        errors.push(format(this.errorMessage.invalidDate, '移動日'));
                        return false;
                    }
                    return true;
                }, this);
            }

            if (!dateInvalid) {
                var filteredToDates = _.filter(toDates, function(date) {
                    return !!date;
                });
                _.reduce(filteredToDates, function(prevDate, toDate) {
                    if (!dateInvalid && prevDate > toDate) {
                        dateInvalid = true;
                        errors.push('出発日を確認してください。');
                    }
                    return toDate;
                }, fromDate, this);
            }


            if (!dateInvalid && !this.validateAbroadFromDate(searchCondition.fromDate)) {
                errors.push(format(
                    '周遊の最短出発日は{0}です。',
                    toYmdString(this.getAbroadDefaultFrom(), '/')
                ));
            }

            // TODO 移動日...
            return errors;
        },

        _getTotalNum: function(adultNum, minorAges) {
            var ages = minorAges || [];
            var childNum = _.filter(ages, function(age) {
                return age >= 2;
            }).length;
            var infantNum = ages.length - childNum;
            return [adultNum, childNum, infantNum].join(',');
        },

        _createGACallback: function(timeout) {
            var dfd = $.Deferred();
            var func = function() {
                dfd.resolve();
            };
            setTimeout(func, timeout || 1000);

            return {
              callback: func,
              promise: dfd.promise()
            };
        },

        sendDataToGoogleAnalytics: function(searchCondition) {
            var dfd = $.Deferred();
            var promise = dfd.promise();
            if (!window.ga) {
                dfd.resolve();
                return promise;
            }

            var eventCategory = this.googleAnalyticsSetting.categoryPrefix + location.pathname;
            var promises = _.reduce(this.googleAnalyticsSetting.target.single, function(promises, target) {
                var value;
                if (target === 'totalNum') {
                    value = this._getTotalNum(searchCondition.adultNum, searchCondition.minorAges);
                } else {
                    value = searchCondition[target];
                }

                if (value != null && value !== '') {
                    var info = this._createGACallback();
                    ga('send','event', eventCategory, target, value, {
                      hitCallback: info.callback
                    });
                    promises.push(info.promise);
                }
                return promises;
            }, [], this);

            promises = _.reduce(this.googleAnalyticsSetting.target.multi, function(promises, target) {
                var value = searchCondition[target] || [];
                if (value.length) {
                    var info = this._createGACallback();
                    ga('send','event', eventCategory, target, value.join(','), {
                      hitCallback: info.callback
                    });
                    promises.push(info.promise);
                }
                return promises;
            }, promises, this);

            $.when.apply($, promises).done(function() {
                dfd.resolve();
            }).fail(function() {
                dfd.resolve();
            });
            return promise;
        },

        executeSearch: function (params) {
            var that = this;
            $.ajax(that.getUrl('/air/list_for_cache', params), {
                type: 'GET',
                cache: false
            }).then(function(data) {
                var query = {};
                if (typeof uuid == 'function') {
                    query = _.extend({}, params, _.pick(data, 'saleSiteCode', 'order', 'page', 'cacheKeyCode'), {'serviceWorkerKey': uuid()});
                } else {
                    query = _.extend({}, params, _.pick(data, 'saleSiteCode', 'order', 'page', 'cacheKeyCode'));
                }
                that.set('redirectUrl', that.getUrl('/air/list', query));
            }, function(error) {
                that.set('redirectUrl', '/air/error');
            });

        },

        getUrl: function (path, params) {
            return format('{0}?{1}', path, objectToQueryParameters(params));
        }
    });

    msf.AirFormModel = AirFormModel;

})(window, jQuery);
