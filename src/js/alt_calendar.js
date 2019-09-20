(function(window, $) {
    var $document = $(document);
    var msf = airlink.msf;
    var format = skygate.util.format;
    var toYmdString = skygate.util.date.toYmdString;
    var toYmdStringWithDayOfTheWeek = skygate.util.date.toYmdStringWithDayOfTheWeek;
    var toYmString = skygate.util.date.toYmString;
    var ymdStringToObject = skygate.util.date.ymdStringToObject;
    var ymdStringToObjectWithSeparator = skygate.util.date.ymdStringToObjectWithSeparator;
    var diffDate = skygate.util.date.diffDate;
    var formatDayOfTheWeek = skygate.util.date.formatDayOfTheWeek;
    var computeDate = skygate.util.date.computeDate;
    var formatDayOfTheWeek = function(dateString) {
        return toYmdStringWithDayOfTheWeek(ymdStringToObjectWithSeparator(dateString), '/');
    };


    var AirFormModalBaseView = airlink.view.sp.multi_search_form.AirFormModalBaseView;

    var CalendarModel = Backbone.Model.extend({

        ABLE_TO_BUYING_NEXT_DAY_TIME: 18,

        DEFAULT_INTERVAL: 3,

        CALENDAR_LIMIT: 360,

        initialize: function() {
            this.defaultFromDate = this.getDefaultFromDate(this.ABLE_TO_BUYING_NEXT_DAY_TIME);
            this.from = new Date(this.defaultFromDate.getFullYear(), this.defaultFromDate.getMonth(), this.defaultFromDate.getDate());
            this.limit = computeDate(new Date(), this.CALENDAR_LIMIT);
        },

        getDefaultFromDate: function(limitHour) {
            return new Date().getHours() >= limitHour ? computeDate(new Date(), 1): new Date();
        },

        _checkHoliday: function(date) {
            return !!ktHolidayName(date);
        },

        _createDate: function(date, disable) {
            return {
                exist: true,
                disable: disable,
                saturday: date.getDay() === 6,
                holiday: date.getDay() === 0 || this._checkHoliday(date),
                label: date.getDate(),
                ymd: toYmdString(date, '/')
            };
        },

        _setupEmptyDate: function(week, times) {
            _.times(times, function() {
                week.push({
                    exist: false
                });
            })
        },

        _createMonth: function(startDate, last) {
            var lastDate = this._getMonthEndDate(startDate);
            var month = {
                year: startDate.getFullYear(),
                month: startDate.getMonth() + 1
            };
            var weeks = [];
            var week = [];

            this._setupEmptyDate(week, startDate.getDay());

            var currentDate = startDate;
            while (lastDate >= currentDate) {
                week.push(this._createDate(currentDate, this.from > currentDate || currentDate > this.limit));

                var lastWeekDay = currentDate.getDay() === 6;
                if (lastWeekDay) {
                    weeks.push(week);
                    week = [];
                } else if (lastDate.getTime() == currentDate.getTime() && !lastWeekDay) {
                    this._setupEmptyDate(week, 7 - (currentDate.getDay() + 1));
                    weeks.push(week);
                }
                currentDate = computeDate(currentDate, 1);
                // FIXME super adhoc..
                if (currentDate.getHours() !== 0) {
                    currentDate.setTime(currentDate.getTime() + 1 * 60 * 60 * 1000);
                }
            }
            month.weeks = weeks;
            return month;
        },

        getCalendarMonths: function() {
            var months = [];
            var startDate = new Date(this.from.getFullYear(), this.from.getMonth(), 1);
            var currentYm = toYmString(startDate);
            var lastYm = toYmString(this.limit);
            while (lastYm >= currentYm) {
                months.push(this._createMonth(startDate, lastYm === currentYm));
                startDate = this._getNextMonth(startDate)
                currentYm = toYmString(startDate);
            }
            return months;
        },

        _getMonthEndDate: function(date) {
            return new Date(date.getFullYear(), date.getMonth() + 1, 0);
        },

        _getNextMonth: function(date) {
            return new Date(date.getFullYear(), date.getMonth() + 1, 1);
        }
    });

    var CalendarView = AirFormModalBaseView.extend({

        el: '.modal-calendar',

        templateId: '#calendarTemplate',

        dateLabelFormat: '<span class="date">{0}<strong class="time">{1}</strong></span>',

        dateSelectindElement: '<li>現地出発日<span class="date"><strong class="time">日程を選択</strong></span></li>',

        activateStartClass: 'cl-dep-date',

        activateInClass: 'cl-travel-period',

        activateEndClass: 'cl-rtn-date',

        events: {
            'click .selectable': 'select',
            'click .btn-conversion-01': 'decide',
            'click .box-btn-close-01': 'close'
        },

        initialize: function() {
            _.bindAll(this);

            this.clickCount = 0;
            this.$wrapperCalendar = this.$('.wrapper-calendar');
            this.$fromCalendarTitle = this.$('.fromCalendarTitle');
            this.$toCalendarTitle = this.$('.toCalendarTitle');
            this.$dateBox = this.$('.date-box-01');
            this.template = _.template($(this.templateId).html());
            this.model = new CalendarModel();

            this.createCalendar();

            $document.on('showOnewayOrRoundtripCalendar', this.showOnewayOrRoundtripCalendar);
            $document.on('showStopoverCalendar', this.showStopoverCalendar);
            $document.on('hideCalendar', this.hideCalendar);

        },

        showOnewayOrRoundtripCalendar: function(ev, option) {
            this.originalTop = option.top;
            this.originalFrom = option.from;
            this.originalTo = option.to;
            this.isSingleSelect = !option.to;
            this.hideTargetSelector = option.hideTargetSelector;
            this._clearActivate();

            var from = ymdStringToObjectWithSeparator(option.from);
            this.$fromCalendarTitle.data('from', option.from);
            this.$fromCalendarTitle.html(this._getDateLabel(toYmdStringWithDayOfTheWeek(from, '/')));

            var start = this.$('.selectable[data-value="' + option.from + '"]');
            if (!this.isSingleSelect) {
                this.clickCount = 2;
                var to = ymdStringToObjectWithSeparator(option.to);
                this.$toCalendarTitle.data('to', option.to);
                this.$toCalendarTitle.html(this._getDateLabel(toYmdStringWithDayOfTheWeek(to, '/'), true));
                this.$wrapperCalendar.addClass('round-trip');
                this._activateCalendarDate(start, diffDate(from, to) * -1);
            } else {
                this.clickCount = 1;
                this.$wrapperCalendar.removeClass('round-trip');
                this._activateCalendarDate(start, 0);
            }

            this._show(this.$el);
            this._hide($(this.hideTargetSelector));

            var that = this;
            _.defer(function() {
                var height = that.$('.fixed-area-01').height() + 4;
                skygate.util.moveTo(start.parents('.date-group').get(0), -height);
            });
        },

        showStopoverCalendar: function(ev, option) {
            this.originalTop = option.top;
            this.originalBefore = option.before;
            this.originalFrom = option.from;
            this.isSingleSelect = true;
            this.isStopover = true;
            this.currentDateIndex = option.index;
            this.hideTargetSelector = option.hideTargetSelector;
            this._clearActivate();

            var from = ymdStringToObjectWithSeparator(option.from);
            this.$fromCalendarTitle.data('from', option.from);
            this.$fromCalendarTitle.html(this._getDateLabel(toYmdStringWithDayOfTheWeek(from, '/')));

            var start = this.$('.selectable[data-value="' + option.from + '"]');

            this.clickCount = 1;
            this.$wrapperCalendar.removeClass('round-trip');
            this._activateCalendarDate(start, 0);

            if (option.before) {
                this._unselectableCalendarDate(option.before);
            }

            this._show(this.$el);
            this._hide($(this.hideTargetSelector));

            var that = this;
            _.defer(function() {
                var height = that.$('.fixed-area-01').height() + 4;
                skygate.util.moveTo(start.parents('.date-group').get(0), -height);
            });
        },

        createCalendar: function() {
            var months = this.model.getCalendarMonths();
            var html = this.template({months: months});
            this.$dateBox.html(html);
        },

        decide: function(ev) {
            var params = {
                from: this.$fromCalendarTitle.data('from')
            };
            if (!this.isSingleSelect) {
                if (this.clickCount === 1) {
                  return;
                }
                params.to = this.$toCalendarTitle.data('to');
            } else {
                params.index = this.currentDateIndex;
            }
            $document.trigger('closeCalendar', params);
            this.close();
        },

        hideCalendar: function(ev) {
            if (!this.$el.is(':visible')) return;
            this.$('.selectable').removeClass('unselectable');
            this._show($(this.hideTargetSelector));
            this._hide(this.$el);

            window.scrollTo(0, this.originalTop || 0);
        },

        _activateCalendarDate: function(start, diff) {
            start.addClass(this.activateStartClass);
            if (diff === 0) {
                start.addClass(this.activateEndClass);
                return;
            }

            var selectables = this.$('.selectable');
            var index = selectables.index(start.get(0));
            var lastElement;
            _.times(diff, function() {
                index++;
                var next = $(selectables.get(index));
                next.addClass(this.activateInClass);
                lastElement = next;
            }, this);
            lastElement.removeClass(this.activateInClass).addClass(this.activateEndClass);
        },

        _getDateLabel: function(dateString, isTo) {
            var prefix = isTo ? '現地出発日' : '出発日';
            return format(
                prefix + this.dateLabelFormat,
                dateString.substring(0, 5),
                dateString.substring(5, dateString.length)
            );
        },

        _unselectableCalendarDate: function(targetDate) {
            var selectables = this.$('.selectable');
            var start = $(selectables.get(0));

            var diff = diffDate(
                ymdStringToObjectWithSeparator(start.data('value')),
                ymdStringToObjectWithSeparator(targetDate)
            );

            if (diff === 0) return;

            start.addClass('unselectable');
            var index = 0;
            _.times(diff * -1 - 1, function() {
                index++;
                start = $(selectables.get(index));
                start.addClass('unselectable');
            });
        },

        _clearActivate: function() {
            this.$dateBox.find('.' + this.activateStartClass).removeClass(this.activateStartClass);
            this.$dateBox.find('.' + this.activateInClass).removeClass(this.activateInClass);
            this.$dateBox.find('.' + this.activateEndClass).removeClass(this.activateEndClass);
        },

        select: function(ev) {
            if (!$(ev.currentTarget).hasClass('unselectable')) {
                this.isSingleSelect ? this._selectSingle(ev) : this._selectMultiple(ev);
            }
        },

        _selectSingle: function(ev) {
            this.clickCount += 1;
            if (this.clickCount === 2) {
                this.clickCount = 1;
                this._clearActivate();
            }
            var $target = $(ev.currentTarget);
            var ymd = $target.data('value');

            this.$fromCalendarTitle.data('from', ymd);
            this.$fromCalendarTitle.html(this._getDateLabel(formatDayOfTheWeek(ymd)));
            $target.addClass(this.activateStartClass);
            $target.addClass(this.activateEndClass);
        },

        _selectMultiple: function(ev) {
            this.clickCount += 1;
            if (this.clickCount === 3) {
                this.clickCount = 1;
                this._clearActivate();
                this.$toCalendarTitle.html(this.dateSelectindElement);
            }
            var $target = $(ev.currentTarget);
            var ymd = $target.data('value');

            if (this.clickCount === 1) {
                this.$fromCalendarTitle.data('from', ymd);
                this.$fromCalendarTitle.html(this._getDateLabel(formatDayOfTheWeek(ymd)));
                $target.addClass(this.activateStartClass);
            } else {
                var fromYmd = this.$fromCalendarTitle.data('from');
                if (fromYmd !== ymd) {
                    var from = ymdStringToObjectWithSeparator(fromYmd);
                    var to = ymdStringToObjectWithSeparator(ymd);
                    var diff = diffDate(from, to);
                    var start;
                    var end;
                    if (diff < 0) {
                        start = this.$('.selectable[data-value="' + fromYmd + '"]');
                        diff = diff * -1;
                        this.$toCalendarTitle.data('to', ymd);
                        this.$toCalendarTitle.html(this._getDateLabel(formatDayOfTheWeek(ymd), true));
                    } else {
                        this.$('.selectable[data-value="' + fromYmd + '"]').removeClass(this.activateStartClass);
                        start = this.$('.selectable[data-value="' + ymd + '"]');

                        this.$fromCalendarTitle.data('from', ymd);
                        this.$fromCalendarTitle.html(this._getDateLabel(formatDayOfTheWeek(ymd)));

                        this.$toCalendarTitle.data('to', fromYmd);
                        this.$toCalendarTitle.html(this._getDateLabel(formatDayOfTheWeek(fromYmd), true));
                    }
                    this._activateCalendarDate(start, diff);
                } else {
                    this.$toCalendarTitle.data('to', ymd);
                    this.$toCalendarTitle.html(this._getDateLabel(formatDayOfTheWeek(ymd), true));
                    $target.addClass(this.activateEndClass);
                }
            }
        }
    });

    var ns = skygate.util.namespace('airlink.view.sp.multi_search_form');
    ns.CalendarView = CalendarView;
})(window, jQuery);
