(function(window) {
   if (window.ump_cities && window.ump_cities.length > 0) return;
   var Cities = function(departure, arrive) {
       this.departure = departure;
       this.arrive = arrive;
   };
   window.ump_cities = new Array(
   new Cities("TYO" , new Array("SEL" ,"PUS" ,"CJU" ,"TAE" ,"SHA" ,"BJS" ,"TPE" ,"HKG" ,"BKK" ,"SIN" ,"DPS" ,"JKT" ,"RGN" ,"SGN" ,"HAN" ,"PQC" ,"DEL" ,"CMB" ,"TAS" ,"LAX" ,"LAS" ,"NYC" ,"CHI" ,"SEA" ,"HNL" ,"GUM" ,"SPN" ,"ROR" ,"SYD" ,"CNS" ,"OOL" ,"CEB" ,"LGK" ,"PEN" ,"DXB" ,"KOA" ,"DAD" ,"DLC" ,"MFM" ,"REP" ,"LON" ,"PAR" ,"BCN" ,"VIE" ,"HKT" ,"KHH" ,"HEL" ,"KUL" ,"BWN" ,"PNH" ,"PER" ,"BNE" ,"MEL" ,"MLE" ,"SFO" ,"NOU" ,"AUH" ,"RMQ" ,"CTU" ,"TAO" ,"WUH" ,"HGH" ,"BKI" ,"NHA" ,"ORL" ,"SJC" ,"MSP" ,"ATL" ,"DTT" ,"KTM" ,"BOS" ,"WAS" ,"DEN" ,"MIL" ,"NAP" ,"ROM" ,"FLR" ,"MAD" ,"NAN" ,"USM" ,"OGG" ,"CUN" ,"MNL" ,"PDX" ,"CNX" ,"CAN" ,"SHE" ,"SIA" ,"CAS" ,"XMN" ,"FRA" ,"MUC" ,"PRG" ,"ZRH" ,"BRU" ,"CPH" ,"MIA" ,"HOU" ,"YYC" ,"VCE" ,"YTO" ,"YVR" ,"YMQ" ,"DBV" ,"ZAG","CHC","AKL")),
   new Cities("NRT" , new Array("SEL" ,"PUS" ,"CJU" ,"TAE" ,"SHA" ,"BJS" ,"TPE" ,"HKG" ,"BKK" ,"SIN" ,"DPS" ,"JKT" ,"RGN" ,"SGN" ,"HAN" ,"PQC" ,"DEL" ,"CMB" ,"TAS" ,"LAX" ,"LAS" ,"NYC" ,"CHI" ,"SEA" ,"HNL" ,"GUM" ,"SPN" ,"ROR" ,"SYD" ,"CNS" ,"OOL" ,"CEB" ,"LGK" ,"DXB" ,"DAD" ,"DLC" ,"MFM" ,"REP" ,"LON" ,"PAR" ,"BCN" ,"HKT" ,"KHH" ,"HEL" ,"KUL" ,"BWN" ,"PNH" ,"PER" ,"BNE" ,"MEL" ,"MLE" ,"SFO" ,"NOU" ,"AUH" ,"RMQ" ,"CTU" ,"TAO" ,"XMN" ,"WUH" ,"HGH" ,"CAN" ,"SHE" ,"ATL" ,"DTT" ,"KTM" ,"SJC" ,"BOS" ,"WAS" ,"BKI" ,"NHA" ,"DEN","CHC","AKL")),
   new Cities("HND" , new Array("SEL" ,"CJU" ,"SHA" ,"BJS" ,"TPE" ,"HKG" ,"BKK" ,"SIN" ,"DPS" ,"JKT" ,"SGN" ,"HAN" ,"LAX" ,"NYC" ,"CHI" ,"SFO" ,"HNL" ,"SYD" ,"CEB" ,"LAS" ,"DXB" ,"KOA" ,"DAD" ,"MFM" ,"REP" ,"LON" ,"PAR" ,"BCN" ,"VIE" ,"HKT" ,"KHH" ,"HEL" ,"KUL" ,"PER" ,"BNE" ,"MEL" ,"MSP" ,"KTM" ,"BOS" ,"WAS","CHC","AKL")),
   new Cities("OSA" , new Array("SEL" ,"PUS" ,"CJU" ,"TAE" ,"SHA" ,"BJS" ,"TPE" ,"HKG" ,"BKK" ,"SIN" ,"DPS" ,"RGN" ,"SGN" ,"HAN" ,"PQC" ,"CMB" ,"DEL" ,"LAX" ,"NYC" ,"SEA" ,"SFO" ,"PDX" ,"CHI" ,"ATL" ,"DEN" ,"HNL" ,"KOA" ,"GUM" ,"SPN" ,"CNS" ,"PER" ,"MEL" ,"CEB" ,"LGK" ,"PEN" ,"MNL" ,"DXB" ,"REP" ,"DAD" ,"KHH" ,"MFM" ,"LAS" ,"YTO" ,"YVR" ,"HKT" ,"SYD" ,"PAR" ,"BCN" ,"VIE" ,"LON" ,"HEL" ,"MIL" ,"ROM" ,"KUL" ,"MLE" ,"BKI" ,"NHA" ,"DLC" ,"TAO" ,"CTU" ,"XMN" ,"OGG" ,"WUH" ,"HGH" ,"CAN" ,"SHE" ,"SIA" ,"LIH")),
   new Cities("NGO" , new Array("SEL" ,"PUS" ,"CJU" ,"TPE" ,"HKG" ,"BKK" ,"SIN" ,"DPS" ,"JKT" ,"SGN" ,"HAN" ,"PQC" ,"LAX" ,"LAS" ,"NYC" ,"DTT" ,"HNL" ,"GUM" ,"CEB" ,"LGK" ,"KHH" ,"PEN" ,"MNL" ,"DXB" ,"DAD" ,"HKT" ,"SYD" ,"PER" ,"MEL" ,"DLC" ,"BCN" ,"OOL" ,"HEL" ,"KUL" ,"NHA")),
   new Cities("FUK" , new Array("SEL" ,"PUS" ,"CJU" ,"TAE" ,"TPE" ,"HKG" ,"BKK" ,"SIN" ,"DPS" ,"SGN" ,"HAN" ,"PQC" ,"LAX" ,"LAS" ,"NYC" ,"HNL" ,"GUM" ,"SPN" ,"CEB" ,"DAD" ,"KHH" ,"MFM" ,"HKT" ,"SYD" ,"PER" ,"MEL" ,"KUL")),
   new Cities("SPK" , new Array("SEL" ,"PUS" ,"TPE" ,"BKK" ,"SIN" ,"SGN" ,"HNL" ,"GUM" ,"CEB" ,"MNL" ,"HAN" ,"NHA" ,"DAD" ,"HKT" ,"BKI" ,"RGN" ,"CNX")),
   new Cities("SDJ" , new Array("SEL" ,"TPE")),
   new Cities("HNA" , new Array("TPE")),
   new Cities("IBR" , new Array("TPE" ,"SEL")),
   new Cities("HIJ" , new Array("SEL" ,"TPE" ,"SIN")),
   new Cities("OKJ" , new Array("SEL" ,"TPE")),
   new Cities("FSZ" , new Array("SEL")),
   new Cities("KMJ" , new Array("SEL" ,"TAE")),
   new Cities("KKJ" , new Array("SEL" ,"PUS" ,"TPE")),
   new Cities("OIT" , new Array("SEL" ,"PUS")),
   new Cities("YGJ" , new Array("SEL")),
   new Cities("TAK" , new Array("SEL")),
   new Cities("MYJ" , new Array("TPE")),
   new Cities("HSG" , new Array("SEL" ,"PUS" ,"TPE")),
   new Cities("KMI" , new Array("SEL")),
   new Cities("UBJ" , new Array("SEL")),
   new Cities("KOJ" , new Array("SEL")),
   new Cities("OKA" , new Array("TPE" ,"SEL"))
);
})(window);
