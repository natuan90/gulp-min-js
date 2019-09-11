(function(window) {
   if (window.pop_cities ) return;
   window.pop_cities = {
        'DEFAULT' : new Array(
            ['SEL', 'ソウル'],
			['PUS', 'プサン'],
            ['TPE', '台北'],
            ['HKG', '香港'],
            ['SIN', 'シンガポール'],
            ['HNL', 'ホノルル（オアフ島）'],
            ['GUM', 'グアム'],
            ['BKK', 'バンコク'],
            ['DPS', 'バリ島']
        ),
        'SPK' : new Array(
            ['SEL', 'ソウル'],
            ['PUS', 'プサン'],
            ['BKK', 'バンコク'],
            ['HNL', 'ホノルル（オアフ島）']
        ),
        'KKJ' : new Array(
            ['SEL', 'ソウル'],
            ['PUS', 'プサン'],
            ['TPE', '台北']
        )
   };
})(window);
