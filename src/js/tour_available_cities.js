(function(window) {
    if (window.tourAvailableCities) {
        return;
    }
    window.tourAvailableCities = [
      {
        label: 'アジア',
        countries: [
          {
            label: '韓国',
            cities: [
              {
                label: 'ソウル',
                code: 'SEL'
              },
              {
                label: 'プサン（釜山）',
                code: 'PUS'
              },
              {
                label: 'チェジュ（済州島）',
                code: 'CJU'
              },
              {
                label: 'テグ（大邱）',
                code: 'TAE'
              }
            ]
          },
          {
            label: '中国',
            cities: [
              {
                label: 'シャンハイ（上海）',
                code: 'SHA'
              },
              {
                label: 'ペキン（北京）',
                code: 'BJS'
              },
              {
                label: 'ダイレン（大連）',
                code: 'DLC'
              },
              {
                label: '台中',
                code: 'RMQ'
              },
              {
                label: '成都',
                code: 'CTU'
              },
        {
                label: '青島',
                code: 'TAO'
              },
        {
                label: '武漢',
                code: 'WUH'
              },
        {
                label: '杭州',
                code: 'HGH'
              },
        {
                label: '広州',
                code: 'CAN'
              },
        {
                label: '瀋陽',
                code: 'SHE'
              },
        {
                label: '西安',
                code: 'SIA'
              },
        {
                label: '厦門',
                code: 'XMN'
              }
            ]
          },
          {
            label: '台湾',
            cities: [
              {
                label: 'タイペイ（台北）',
                code: 'TPE'
              },
              {
                label: 'タカオ（高雄）',
                code: 'KHH'
              }
            ]
          },
          {
            label: '香港・マカオ',
            cities: [
              {
                label: 'ホンコン（香港）',
                code: 'HKG'
              },
              {
                label: 'マカオ',
                code: 'MFM'
              }
            ]
          },
          {
            label: 'タイ',
            cities: [
              {
                label: 'バンコク',
                code: 'BKK'
              },
              {
                label: 'プーケット島',
                code: 'HKT'
              },
              {
                label: 'サムイ島',
                code: 'USM'
              },
              {
                label: 'チェンマイ',
                code: 'CNX'
              }
            ]
          },
          {
            label: 'シンガポール',
            cities: [
              {
                label: 'シンガポール',
                code: 'SIN'
              }
            ]
          },
          {
            label: 'インド',
            cities: [
              {
                label: 'デリー',
                code: 'DEL'
              }
            ]
          },
          {
            label: 'インドネシア',
            cities: [
              {
                label: 'デンパサール（バリ島）',
                code: 'DPS'
              },
              {
                label: 'ジャカルタ',
                code: 'JKT'
              }
            ]
          },
          {
            label: 'ウズベキスタン',
            cities: [
              {
                label: 'タシュケント',
               code: 'TAS'
              }
            ]
          }, 
          {
            label: 'ベトナム',
            cities: [
              {
                label: 'ホーチミン',
                code: 'SGN'
              },
              {
                label: 'ハノイ',
                code: 'HAN'
              },
              {
                label: 'ダナン',
                code: 'DAD'
              },
              {
                label: 'フーコック島',
                code: 'PQC'
              },
              {
                label: 'ニャチャン',
                code: 'NHA'
              }
            ]
          },
          {
            label: 'フィリピン',
            cities: [
              {
                label: 'セブ',
                code: 'CEB'
              },
              {
                label: 'マニラ',
                code: 'MNL'
              }
            ]
          },
          {
            label: 'カンボジア',
            cities: [
              {
                label: 'アンコールワット（シェムリアップ）',
                code: 'REP'
              },
              {
                label: 'プノンペン',
                code: 'PNH'
              }
             ]
          },
          {
            label: 'マレーシア',
            cities: [
              {
                label: 'ランカウイ',
                code: 'LGK'
              },
              {
                label: 'ペナン',
                code: 'PEN'
              },
              {
                label: 'クアラルンプール',
                code: 'KUL'
              },
              {
                label: 'ブルネイ',
                code: 'BWN'
              },
              {
              label: 'コタキナバル',
              code: 'BKI'
              }
            ]
          },
          {
            label: 'ミャンマー',
            cities: [
              {
                label: 'ヤンゴン',
                code: 'RGN'
              },
            ]
          },
          {
            label: 'スリランカ',
            cities: [
              {
                label: 'コロンボ',
                code: 'CMB'
              },
            ]
          },  
          {
            label: 'モルジブ',
            cities: [
              {
                label: 'マーレ',
                code: 'MLE'
              }
            ]
          },  
          {
            label: 'ネパール',
            cities: [
              {
                label: 'カトマンズ',
                code: 'KTM'
              }
            ]
          }
        ]
      },
      {
        label: '北アメリカ',
        countries: [
          {
            label: 'アメリカ西海岸',
            cities: [
              {
                label: 'ロサンゼルス・アナハイム',
                code: 'LAX'
              },
              {
                label: 'ラスベガス',
                code: 'LAS'
              },
              {
                label: 'シカゴ',
                code: 'CHI'
              },
              {
                label: 'シアトル',
                code: 'SEA'
              },              
              {
                label: 'サンフランシスコ',
                code: 'SFO'
              },
        {
        label: 'デンバー',
          code: 'DEN'
        },
        {
        label: 'サンノゼ',
          code: 'SJC'
        }
            ]
          },
          {
            label: 'アメリカ東海岸',
            cities: [
              {
                label: 'ニューヨーク',
                code: 'NYC'
              },
              {
                label: 'オーランド',
                code: 'ORL'
              },
              {
                label: 'デトロイト',
                code: 'DTT'
              },
              {
                label: 'ボストン',
                code: 'BOS'
              },
              {
                label: 'ワシントンDC',
                code: 'WAS'
              },
              {
                label: 'ミネアポリス',
                code: 'MSP'
              },
              {
                label: 'アトランタ',
                code: 'ATL'
              },
              {
                label: 'ポートランド',
                code: 'PDX'
              },
              {
                label: 'マイアミ',
                code: 'MIA'
              },
              {
                label: 'ヒューストン',
                code: 'HOU'
              }
            ]
          },
          {
            label: 'カナダ',
            cities: [
              {
                label: 'イエローナイフ',
                code: 'YZF'
              },
              {
                label: 'ホワイトホース',
                code: 'YXY'
              },
              {
                label: 'カルガリー',
                code: 'YYC'
              },
        {
                label: 'トロント',
                code: 'YTO'
              },
        {
                label: 'バンクーバー',
                code: 'YVR'
              },
        {
                label: 'モントリオール',
                code: 'YMQ'
              }
            ]
          }
        ]
      },
    {
    label: '中南米',
    countries: [
      {
      label: 'メキシコ',
      cities: [
        {
        label: 'カンクン',
        code: 'CUN'
        }
      ]
      }
    ]
    },
      {
        label: 'ハワイ',
        countries: [
          {
            label: 'ハワイ',
            cities: [
              {
                label: 'ホノルル（オアフ島）',
                code: 'HNL'
              },
              {
                label: 'コナ（ハワイ島）',
                code: 'KOA'
              },
              {
                label: 'カフルイ（マウイ島）',
                code: 'OGG'
              },
              {
                label: 'カウアイ島',
                code: 'LIH'
              }
            ]
          }
        ]
      },
      {
        label: 'ミクロネシア（グアム・サイパン）',
        countries: [
          {
            label: 'グアム',
            cities: [
              {
                label: 'グアム',
                code: 'GUM'
              }
            ]
          },
          {
            label: 'サイパン・ロタ',
            cities: [
              {
                label: 'サイパン（マリアナ諸島）',
                code: 'SPN'
              }
            ]
          },
          {
            label: 'パラオ',
            cities: [
              {
                label: 'パラオ',
                code: 'ROR'
              }
            ]
          }          
        ]
      },
    {
    label: 'アフリカ',
    countries: [
      {
      label: 'モロッコ',
      cities: [
        {
        label: 'カサブランカ',
        code: 'CAS'
        }
      ] 
      }
    ]  
    },
      {
        label: '中東',
        countries: [
          {
            label: 'アラブ首長国連邦（UAE）',
            cities: [
              {
                label: 'ドバイ（デュバイ）',
                code: 'DXB'
              },
              {
                label: 'アブダビ',
                code: 'AUH'
              }
            ]
          }
        ]
      },
      {
        label: 'ヨーロッパ',
        countries: [
          {
            label: 'イギリス',
            cities: [
              {
                label: 'ロンドン',
                code: 'LON'
              }
            ]
          },
          {
            label: 'フランス',
            cities: [
              {
                label: 'パリ',
                code: 'PAR'
              }
            ]
          },
          {
            label: 'イタリア',
            cities: [
              {
                label: 'ミラノ',
                code: 'MIL'
              },
        {
                label: 'ローマ',
                code: 'ROM'
              },
        {
                label: 'ナポリ',
                code: 'NAP'
              },
        {
                label: 'フィレンツェ',
                code: 'FLR'
              },
        {
                label: 'ベネチア',
                code: 'VCE'
              }
            ]
          },
          {
            label: 'スペイン',
            cities: [
              {
                label: 'バルセロナ',
                code: 'BCN'
              },
        {
                label: 'マドリード',
                code: 'MAD'
              }        
            ]
          },
          {
            label: 'フィンランド',
            cities: [
              {
                label: 'ヘルシンキ',
                code: 'HEL'
              }
            ]
          },
          {
            label: 'オーストリア',
            cities: [
              {
                label: 'ウィーン',
                code: 'VIE'
              }
            ]
          },
          {
            label: 'スイス',
            cities: [
              {
                label: 'チューリッヒ',
                code: 'ZRH'
              }
            ]
          },
          {
            label: 'ドイツ',
            cities: [
              {
                label: 'フランクフルト',
                code: 'FRA'
              },
        {
                label: 'ミュンヘン',
                code: 'MUC'
              }
            ]
          },
          {
            label: 'チェコ',
            cities: [
              {
                label: 'プラハ',
                code: 'PRG'
              }
            ]
          },
          {
            label: 'ベルギー',
            cities: [
              {
                label: 'ブリュッセル',
                code: 'BRU'
              }
            ]
          },
          {
            label: 'デンマーク',
            cities: [
              {
                label: 'コペンハーゲン（デンマーク）',
                code: 'CPH'
              }
            ]
          },
          {
            label: 'クロアチア',
            cities: [
              {
                label: 'ドブロブニク',
                code: 'DBV'
              },
        {
                label: 'ザグレブ',
                code: 'ZAG'
              }
            ]
          }
        ]
      },
      {
        label: 'オセアニア・南太平洋',
        countries: [
          {
            label: 'オセアニア',
            cities: [
              {
                label: 'シドニー',
                code: 'SYD'
              },
              {
                label: 'ケアンズ',
                code: 'CNS'
              },
              {
                label: 'ゴールドコースト',
                code: 'OOL'
              },
              {
                label: 'パース',
                code: 'PER'
              },
              {
                label: 'ブリスベン',
                code: 'BNE'
              },
              {
                label: 'メルボルン',
                code: 'MEL'
              },
              {
                label: 'クライストチャーチ',
                code: 'CHC'
              },
              {
                label: 'オークランド',
                code: 'AKL'
              }
            ]
          },
      {
      label: 'フィジー',
      cities: [
        {
        label: 'フィジー（ナンディ）',
                code: 'NAN'
        } 
      ]  
      },
          {
            label: 'ニューカレドニア',
            cities: [
              {
                label: 'ヌメア',
                code: 'NOU'
              }
            ]
          }
        ]
      }
    ];
})(window);
