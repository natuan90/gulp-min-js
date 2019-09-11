(function(window, $) {
    var format = skygate.util.format;
    skygate.air = window.skygate.air || {};
    skygate.air.util = (function(suggestSupportingData){
        var countrySuggestionList = suggestSupportingData.countrySuggestionList;
        var citySuggestionList = suggestSupportingData.citySuggestionList;
        var relationship = suggestSupportingData.relationship;
        var relationshipCountries = relationship.countries;
        var relationshipCities = relationship.cities;
        function createSuggestionDataSearcher(suggestionList, dataMapper) {
            function searchExecutor(suggestionList, candidateWordSelector, dataMapper) {
                return _.chain(suggestionList).filter(function (suggestionData) {
                    return _.any([suggestionData.threeLetter || ''], candidateWordSelector) || _.any(suggestionData.candidateWords, candidateWordSelector);
                }).map(dataMapper).value();
            }
            function matchStartWithSearch(inputWord) {
                function isStartWithCandidateWord(candidateWord) {
                    return candidateWord.indexOf(inputWord) === 0;
                }
                return searchExecutor(suggestionList, isStartWithCandidateWord, dataMapper);
            }
            function includeSearch(inputWord) {
                function isIncludeCandidateWord(candidateWord) {
                    return candidateWord.indexOf(inputWord) > 0;
                }
                return searchExecutor(suggestionList, isIncludeCandidateWord, dataMapper);
            }

            return {
                startWithWordSearch: matchStartWithSearch,
                includeWordSearch: includeSearch
            }
        }

        function createSuggestionDataBuilder(countryRelationShipInfo, cityRelationShipInfo) {
            function getCityByCountryCodeList(countryCodes) {
                var cityCodes = [];
                _.each(countryCodes, function (countryCode) {
                    Array.prototype.push.call(cityCodes, getCityByCountryCode(countryCode));
                });
                return cityCodes;
            }
            function getCityByCountryCode(countryCode) {
                var countryInfo = countryRelationShipInfo[countryCode];
                return countryInfo ? countryInfo.cities : [];
            }
            function createCitySuggestion(cityCode) {
                var cityInfo = cityRelationShipInfo[cityCode];
                if (!cityInfo) {
                    return;
                }
                return {
                    name: cityInfo.name,
                    threeLetter: cityCode,
                    katakana: cityInfo.katakana,
                    countryName: cityInfo.countryName,
                    domesticThreeLetter: cityInfo.domesticThreeLetter,
                    children: _.map(cityInfo.childCityCodes, createCitySuggestion)
                }
            }
            function getCitySuggestionList(cityCodes) {
                return _.map(cityCodes, createCitySuggestion);
            }
            return {
                getCityByCountryCodeList: getCityByCountryCodeList,
                getCityByCountryCode: getCityByCountryCode,
                getCitySuggestionList: getCitySuggestionList,
                getCitySuggestion: createCitySuggestion
            }
        }

        function isThreeCharactersCityCode(input) {
            return /^[A-Z]{3}$/g.test(input) && relationshipCities[input];
        }

        var countrySuggestionSearcher = createSuggestionDataSearcher(countrySuggestionList, function countryCodeMapper(countrySuggestionData) {
            return countrySuggestionData.countryCode;
        });

        var citySuggestionSearcher = createSuggestionDataSearcher(citySuggestionList, function cityThreeLettersCodeMapper(citySuggestionData) {
            return citySuggestionData.threeLetter;
        });

        var suggestionDataBuilder = createSuggestionDataBuilder(relationshipCountries, relationshipCities);

        function searchStartWithWord(inputWord) {
            var countryCodes = countrySuggestionSearcher.startWithWordSearch(inputWord);
            var cityCodes = _.flatten(suggestionDataBuilder.getCityByCountryCodeList(countryCodes));
            if (isThreeCharactersCityCode(inputWord)) {
                cityCodes = _.union(cityCodes, [inputWord]);
            }
            return _.union(cityCodes, citySuggestionSearcher.startWithWordSearch(inputWord));
        }

        function searchIncludeWord(inputWord) {
            var countryCodes = countrySuggestionSearcher.includeWordSearch(inputWord);
            var cityCodes = _.flatten(suggestionDataBuilder.getCityByCountryCodeList(countryCodes));
            return _.union(cityCodes, citySuggestionSearcher.includeWordSearch(inputWord));
        }

        return {
            search: function(inputWord, numberOfItems, searchDomestic, exceptList){
                var firstOrderCityCodes = searchStartWithWord(inputWord);
                var firstFilteredOrderCityCodes = _.filter(firstOrderCityCodes, function(cityCode){
                    var code = this.getCityCodeByDomesticOrAbroad(cityCode, searchDomestic);
                    if (code){
                        return code;
                    }
                }, this);

                var firstOrderSuggestionList = _.sortBy(suggestionDataBuilder.getCitySuggestionList(_.difference(firstFilteredOrderCityCodes, exceptList)), 'katakana');
                var firstOrderLength = firstOrderSuggestionList.length;
                if (firstOrderLength >= numberOfItems) {
                    return firstOrderSuggestionList.slice(0, numberOfItems);
                }

                var secondOrderCityCodes = _.difference(searchIncludeWord(inputWord), firstOrderCityCodes, exceptList);
                var secondFilteredOrderCityCodes = _.filter(secondOrderCityCodes, function(cityCode){
                    var code = this.getCityCodeByDomesticOrAbroad(cityCode, searchDomestic);
                    if (code){
                        return code;
                    }
                }, this);

                var secondOrderSuggestionList = _.sortBy(suggestionDataBuilder.getCitySuggestionList(secondFilteredOrderCityCodes), 'katakana').slice(0, numberOfItems - firstOrderLength);
                return  _.union(firstOrderSuggestionList, secondOrderSuggestionList);
            },
            isJapanCity: function (cityCode) {
                return relationshipCities[cityCode] ? relationshipCities[cityCode].countryCode === 'JP' : null;
            },
            getCityInfo: function (cityCode) {
                return suggestionDataBuilder.getCitySuggestion(cityCode);
            },
            getCityCodeByDomesticOrAbroad: function(cityCode, searchDomestic){
                // abroad: false, domestic: true, both: none
                if (!_.isBoolean(searchDomestic)) {
                    return cityCode;
                } else {
                    var isJapanCity = this.isJapanCity(cityCode);
                    if (_.isBoolean(isJapanCity)){
                        if (searchDomestic === isJapanCity) {
                            return cityCode;
                        }
                    }
                    return;
                }
            }
        }
    })(window.suggestSupportingData || {});
})(window, jQuery);