(function(window, $) {
    var CrossSellModel = Backbone.Model.extend({

        AIR_ITINERARY_TYPE: {
            ONE_WAY: 0,
            ROUND_TRIP: 1,
            MULTIPLE_DESTINATION: 2
        },

        CROSS_SELL_TYPE: {
            SEL: 'SEL1',
            TPE: 'SEL1',
            HNL: 'HNL1',
            DPS: 'HNL1'
        },

        LIST_URL_FORMAT: '/hotel/list?{0}',

        DETAIL_URL_FORMAT: '/hotel/HTLITM/{0}/?{1}',

        FORM_NAME: 'smartCrossSell',

        url: '/hotel/api/cs/list',

        idAttribute: 'itineraryNumber',

        initialize: function() {
            var properties = ['type', 'profile', 'encodedRooms', 'checkin', 'checkout', 'numberOfNights', 'queryParams', 'isApplicable', '_firstArrivalDate', '_secondDepartureDate'];
            _.each(properties, function(prop) {
                this[prop] = _.memoize(this[prop]);
            }, this);
        },

        type: function () {
            return this.CROSS_SELL_TYPE[this.get('cityCode')];
        },

        profile: function() {
            var type = this.type();
            var seatClass = this.get('seatClass');
            var totalPassengers = this.get('numberOfPax');

            if (type === 'SEL1') {
                if (seatClass === 'C' || seatClass === 'F') {
                    return 'PREMIUM';
                } else if (seatClass === 'Y' || seatClass === 'P') {
                    return totalPassengers >= 4 ? 'LEISURE' : 'BUSINESS';
                }
            } else if (type === 'HNL1') {
                if (seatClass === 'C' || seatClass === 'F') {
                    return 'PREMIUM';
                } else if (seatClass === 'Y' || seatClass === 'P') {
                    return totalPassengers >= 2 ? 'LEISURE' : 'BUSINESS';
                }
            }
        },

        encodedRooms: function() {
            var psnTotal = this.get('numberOfPax');
            var infTotal = this.get('numberOfInfants');
            if (psnTotal <= 3) return psnTotal.toString();
            if (psnTotal === 4) return infTotal >= 1 ? '4' : '2:2';
            if (psnTotal === 5) return '2:3';
            if (psnTotal === 6) return '3:3';
            if (psnTotal === 7) return '2:2:3';
            if (psnTotal === 8) return '2:2:2:2';
            if (psnTotal === 9) return '3:3:3';
            return '';
        },

        checkin: function() {
            if (this.get('itineraryType') === this.AIR_ITINERARY_TYPE.ONE_WAY) {
                return this._firstArrivalDate();
            } else if (_.contains([this.AIR_ITINERARY_TYPE.ROUND_TRIP, this.AIR_ITINERARY_TYPE.MULTIPLE_DESTINATION], this.get('itineraryType')) &&
                this._firstArrivalDate() < this._secondDepartureDate()) {
                return this._firstArrivalDate();
            }
        },

        checkout: function() {
            if (this.get('itineraryType') === this.AIR_ITINERARY_TYPE.ONE_WAY) {
                // one day after first arrival
                return skygate.util.date.toYmdString(skygate.util.date.computeDate(skygate.util.date.ymdStringToObject(this._firstArrivalDate()), 1));
            } else if (_.contains([this.AIR_ITINERARY_TYPE.ROUND_TRIP, this.AIR_ITINERARY_TYPE.MULTIPLE_DESTINATION], this.get('itineraryType')) &&
                this._firstArrivalDate() < this._secondDepartureDate()) {
                return this._secondDepartureDate();
            }
        },

        numberOfNights: function() {
            return skygate.util.date.diffDate(
                skygate.util.date.ymdStringToObject(this.checkout()),
                skygate.util.date.ymdStringToObject(this.checkin()));
        },

        queryParams: function() {
            return {
                checkin: this.checkin(),
                checkout: this.checkout(),
                ctyCd: this.get('cityCode'),
                seatClass: this.get('seatClass'),
                rooms: this.encodedRooms()
            };
        },

        isApplicable: function(useItineraryBound) {

            // fail safe for release procedure
            // please remove this check after release
            if (!useItineraryBound && !this.get('firstArrivalDateTime')) // firstArrivalDateTime is "required" after release
               return false;

            var notPast = new Date().getTime() <= skygate.util.date.ymdhmStringToObject(this.get('startDate')).getTime();
            var stayable = this.get('itineraryType') === this.AIR_ITINERARY_TYPE.ONE_WAY ||
                useItineraryBound && this.get('startDate') < this.get('endDate') ||
                !useItineraryBound && this._firstArrivalDate() < this._secondDepartureDate();
            return notPast && stayable && !this.get('isOverseas');
        },

        fetchHotelData: function() {
            if (this.get('apiResponse')) {
                _.defer(_.bind(this._triggerFetched, this));
            } else if (!this.fetchRrequestFired) {
                this.fetchRrequestFired = true;
                var that = this;
                this.fetch({
                    data: this.queryParams()
                }).fail(function() {
                    that.set('apiResponse', {});
                }).always(function() {
                    that._triggerFetched();
                });
            }
        },

        parse: function(response) {
            return {
                apiResponse: response.result
            }
        },

        hotelListUrl: function() {
            var query = $.extend(true, {}, this.queryParams(), {
                form: this.FORM_NAME,
                AgentCode: this.get('agentCodeForList')
            });
            return skygate.util.format(this.LIST_URL_FORMAT, $.param(query, true));
        },

        hotelDetailUrl: function(hotelCode) {
            var query = $.extend(true, {}, this.queryParams(), {
                crossSellType: this.type(),
                profile: this.profile(),
                form: this.FORM_NAME,
                AgentCode: this.get('agentCodeForDetail')
            });
            return skygate.util.format(this.DETAIL_URL_FORMAT, hotelCode, $.param(query, true));
        },

        _triggerFetched: function() {
            this.trigger('CrossSell:Fetched', this.get('itineraryNumber'));
        },

        _firstArrivalDate: function() {
            return this.get('firstArrivalDateTime').substring(0, 8);
        },

        _secondDepartureDate: function() {
            return this.get('secondDepartureDateTime').substring(0, 8);
        }

    });

    var CrossSellCollection = Backbone.Collection.extend({

        model: CrossSellModel,

        applicableItems: function(useItineraryBound) {
            return _.filter(this.models, function(model) {
                return model.isApplicable(!!useItineraryBound);
            });
        }

    });

    skygate.util.namespace('airlink.model.hotel.crosssell').CrossSellModel = CrossSellModel;
    skygate.util.namespace('airlink.model.hotel.crosssell').CrossSellCollection = CrossSellCollection;
})(window, jQuery);
