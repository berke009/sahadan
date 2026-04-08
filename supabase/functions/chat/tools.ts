export const TOOL_DEFINITIONS = [
  // ===== Core Betting =====
  {
    type: 'function',
    function: {
      name: 'get_hot_matches',
      description: 'Bugunku veya belirli bir tarihteki populer ve onemli maclari getirir. Kullanici mac arayinca veya kupon yapmak istediginde kullan.',
      parameters: {
        type: 'object',
        properties: {
          league: { type: 'string', description: 'Lig adi, ornegin "Super Lig", "Premier League". Bos birakilirsa tum ligler.' },
          date: { type: 'string', description: 'Tarih formati YYYY-MM-DD. Bos birakilirsa bugun.' },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_match_odds',
      description: 'Belirli bir macin Turk bahis piyasasi oranlarini getirir (MS 1-X-2, KG Var/Yok, Alt/Ust 2.5, IY).',
      parameters: {
        type: 'object',
        properties: {
          match_id: { type: 'string', description: 'Mac ID' },
          home_team: { type: 'string', description: 'Ev sahibi takim adi' },
          away_team: { type: 'string', description: 'Deplasman takim adi' },
        },
        required: ['match_id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_player_analysis',
      description: 'Bir oyuncunun detayli istatistiklerini, formunu ve sakatlik durumunu getirir.',
      parameters: {
        type: 'object',
        properties: {
          player_name: { type: 'string', description: 'Oyuncu adi' },
        },
        required: ['player_name'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_coupon',
      description: 'Kullanicinin sectigi oranlardan bir bahis kuponu olusturur.',
      parameters: {
        type: 'object',
        properties: {
          selections: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                match_id: { type: 'string' },
                match_label: { type: 'string' },
                market: { type: 'string' },
                selection: { type: 'string' },
                odds: { type: 'number' },
              },
            },
            description: 'Kupondaki secimler',
          },
          stake: { type: 'number', description: 'Bahis miktari (TL)' },
        },
        required: ['selections', 'stake'],
      },
    },
  },

  // ===== Stats & Analytics =====
  {
    type: 'function',
    function: {
      name: 'get_league_standings',
      description: 'Lig puan durumu tablosunu getirir.',
      parameters: {
        type: 'object',
        properties: {
          league: { type: 'string', description: 'Lig adi, varsayilan "Super Lig"' },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_head_to_head',
      description: 'Iki takim arasindaki karsilastirma istatistiklerini getirir.',
      parameters: {
        type: 'object',
        properties: {
          team_a: { type: 'string', description: 'Birinci takim' },
          team_b: { type: 'string', description: 'Ikinci takim' },
        },
        required: ['team_a', 'team_b'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_team_form',
      description: 'Bir takimin son mac formunu ve performans istatistiklerini getirir.',
      parameters: {
        type: 'object',
        properties: {
          team: { type: 'string', description: 'Takim adi' },
        },
        required: ['team'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_goal_distribution',
      description: 'Bir takimin gol dagilimini 15 dakikalik dilimlere gore gosterir.',
      parameters: {
        type: 'object',
        properties: {
          team: { type: 'string', description: 'Takim adi' },
        },
        required: ['team'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_top_scorers',
      description: 'Ligin gol kralligini getirir.',
      parameters: {
        type: 'object',
        properties: {
          league: { type: 'string', description: 'Lig adi, varsayilan "Super Lig"' },
          limit: { type: 'number', description: 'Kac oyuncu gosterilsin, varsayilan 10' },
        },
        required: [],
      },
    },
  },

  // ===== Live =====
  {
    type: 'function',
    function: {
      name: 'get_live_scores',
      description: 'Su an devam eden canli maclarin skorlarini getirir.',
      parameters: {
        type: 'object',
        properties: {
          league: { type: 'string', description: 'Belirli bir lig filtresi' },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_live_odds',
      description: 'Canli maclardaki oran degisimlerini ve hareketlerini gosterir.',
      parameters: {
        type: 'object',
        properties: {
          match_id: { type: 'string', description: 'Belirli bir macin ID si' },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_match_timeline',
      description: 'Bir macin dakika dakika olaylarini getirir (goller, kartlar, degisiklikler).',
      parameters: {
        type: 'object',
        properties: {
          match_id: { type: 'string', description: 'Mac ID' },
        },
        required: ['match_id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_live_commentary',
      description: 'Bir macin canli yazi yorumlarini getirir.',
      parameters: {
        type: 'object',
        properties: {
          match_id: { type: 'string', description: 'Mac ID' },
        },
        required: ['match_id'],
      },
    },
  },

  // ===== Social =====
  {
    type: 'function',
    function: {
      name: 'get_popular_bets',
      description: 'Toplulugun en cok tercih ettigi populer bahisleri getirir.',
      parameters: {
        type: 'object',
        properties: {
          limit: { type: 'number', description: 'Kac bahis gosterilsin' },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'submit_prediction',
      description: 'Kullanicinin bir mac icin tahminini kaydeder.',
      parameters: {
        type: 'object',
        properties: {
          match_id: { type: 'string', description: 'Mac ID' },
          prediction: { type: 'string', enum: ['1', 'X', '2'], description: 'Tahmin' },
        },
        required: ['match_id', 'prediction'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_prediction_results',
      description: 'Bir macin topluluk tahmin sonuclarini ve oylama dagilimini getirir.',
      parameters: {
        type: 'object',
        properties: {
          match_id: { type: 'string', description: 'Mac ID' },
          match_label: { type: 'string', description: 'Mac etiketi (orn: GS vs FB)' },
        },
        required: ['match_id'],
      },
    },
  },

  // ===== Account =====
  {
    type: 'function',
    function: {
      name: 'get_bet_history',
      description: 'Kullanicinin gecmis bahis kuponlarini getirir.',
      parameters: {
        type: 'object',
        properties: {
          limit: { type: 'number', description: 'Kac kupon gosterilsin, varsayilan 10' },
          status: { type: 'string', enum: ['all', 'pending', 'won', 'lost'], description: 'Durum filtresi' },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_profit_loss',
      description: 'Kullanicinin kar/zarar grafiksel verilerini getirir.',
      parameters: {
        type: 'object',
        properties: {
          period: { type: 'string', enum: ['week', 'month', 'all'], description: 'Zaman dilimi' },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_balance_summary',
      description: 'Kullanicinin bakiye ozetini, toplam bahis/kazanc istatistiklerini getirir.',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
    },
  },
];
