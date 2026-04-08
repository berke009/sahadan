// Maps API-Football responses to our app's Turkish market format

export function mapFixtureToMatch(fixture: any) {
  return {
    id: String(fixture.fixture.id),
    home_team: fixture.teams.home.name,
    away_team: fixture.teams.away.name,
    home_logo: fixture.teams.home.logo,
    away_logo: fixture.teams.away.logo,
    league: fixture.league.name,
    kickoff: fixture.fixture.date,
    status: mapStatus(fixture.fixture.status.short),
    home_score: fixture.goals.home,
    away_score: fixture.goals.away,
    elapsed: fixture.fixture.status.elapsed,
    venue: fixture.fixture.venue?.name,
  };
}

function mapStatus(apiStatus: string): 'upcoming' | 'live' | 'finished' {
  const liveStatuses = ['1H', '2H', 'HT', 'ET', 'BT', 'P', 'LIVE'];
  const finishedStatuses = ['FT', 'AET', 'PEN'];
  if (liveStatuses.includes(apiStatus)) return 'live';
  if (finishedStatuses.includes(apiStatus)) return 'finished';
  return 'upcoming';
}

export function mapOddsToTurkishMarkets(oddsData: any, match: any) {
  const markets: any[] = [];
  const bookmaker = oddsData?.response?.[0]?.bookmakers?.[0];
  if (!bookmaker) return { match, markets };

  for (const bet of bookmaker.bets) {
    switch (bet.name) {
      case 'Match Winner':
        markets.push({
          market: 'MS',
          label: 'Mac Sonucu',
          options: bet.values.map((v: any) => ({
            id: `ms_${v.value.toLowerCase()}`,
            label: v.value === 'Home' ? '1' : v.value === 'Draw' ? 'X' : '2',
            value: parseFloat(v.odd),
          })),
        });
        break;

      case 'Both Teams Score':
        markets.push({
          market: 'KG',
          label: 'Karsilikli Gol',
          options: bet.values.map((v: any) => ({
            id: `kg_${v.value.toLowerCase()}`,
            label: v.value === 'Yes' ? 'Var' : 'Yok',
            value: parseFloat(v.odd),
          })),
        });
        break;

      case 'Goals Over/Under': {
        const line25 = bet.values.filter((v: any) => v.value.includes('2.5'));
        if (line25.length > 0) {
          markets.push({
            market: 'ALT_UST',
            label: 'Alt/Ust 2.5',
            options: line25.map((v: any) => ({
              id: `au_${v.value.includes('Over') ? 'ust' : 'alt'}`,
              label: v.value.includes('Over') ? 'Ust' : 'Alt',
              value: parseFloat(v.odd),
            })),
          });
        }
        break;
      }
    }
  }

  return { match, markets };
}

export function mapPlayerToAnalysis(playerData: any) {
  const player = playerData?.response?.[0];
  if (!player) return null;

  const stats = player.statistics?.[0] || {};
  return {
    id: String(player.player.id),
    name: player.player.name,
    team: stats.team?.name || '',
    position: mapPosition(stats.games?.position),
    photo: player.player.photo,
    nationality: player.player.nationality,
    age: player.player.age,
    injured: player.player.injured || false,
    stats: {
      matches: stats.games?.appearences || 0,
      goals: stats.goals?.total || 0,
      assists: stats.goals?.assists || 0,
      rating: parseFloat(stats.games?.rating || '0'),
      minutes: stats.games?.minutes || 0,
      yellow_cards: stats.cards?.yellow || 0,
      red_cards: stats.cards?.red || 0,
      shots_on_target: stats.shots?.on || 0,
      pass_accuracy: stats.passes?.accuracy ? parseInt(stats.passes.accuracy) : undefined,
    },
    form: [],
  };
}

function mapPosition(pos: string): string {
  const map: Record<string, string> = {
    Attacker: 'Forvet',
    Midfielder: 'Orta Saha',
    Defender: 'Defans',
    Goalkeeper: 'Kaleci',
  };
  return map[pos] || pos || 'Bilinmiyor';
}

export function mapStandings(standingsData: any) {
  const standings = standingsData?.response?.[0]?.league?.standings?.[0] || [];
  return standings.map((entry: any) => ({
    rank: entry.rank,
    team: entry.team.name,
    team_logo: entry.team.logo,
    played: entry.all.played,
    won: entry.all.win,
    drawn: entry.all.draw,
    lost: entry.all.lose,
    goals_for: entry.all.goals.for,
    goals_against: entry.all.goals.against,
    goal_difference: entry.goalsDiff,
    points: entry.points,
    form: (entry.form || '').split('').map((c: string) => c as 'W' | 'D' | 'L'),
  }));
}

export function mapEvents(eventsData: any) {
  const events = eventsData?.response || [];
  return events.map((event: any) => ({
    minute: event.time.elapsed,
    type: mapEventType(event.type),
    team: event.team.name,
    player: event.player.name,
    detail: event.detail,
    assist: event.assist?.name,
  }));
}

function mapEventType(type: string): string {
  const map: Record<string, string> = {
    Goal: 'goal',
    Card: 'yellow_card',
    subst: 'substitution',
    Var: 'var',
  };
  return map[type] || 'info';
}

export function mapTopScorers(data: any) {
  const players = data?.response || [];
  return players.map((entry: any, i: number) => ({
    rank: i + 1,
    player_id: String(entry.player.id),
    name: entry.player.name,
    team: entry.statistics?.[0]?.team?.name || '',
    photo: entry.player.photo,
    goals: entry.statistics?.[0]?.goals?.total || 0,
    assists: entry.statistics?.[0]?.goals?.assists || 0,
    matches: entry.statistics?.[0]?.games?.appearences || 0,
  }));
}
