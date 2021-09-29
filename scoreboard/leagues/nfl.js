// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: pink; icon-glyph: magic;

let configTeams = {
    league : "nfl",
    id : 17
}

const nflESPNMap = {
    'Arizona Cardinals' : {id : 22, group: "nfcw", name: "Arizona Cardinals",league:"nfl"},
    'Atlanta Falcons' : {id : 1, group: "nfcs", name: "Atlanta Falcons",league:"nfl"},
    'Buffalo Bills' : {id: 2, group: 'afce', name: "Buffalo Bills",league:"nfl"},
    'Chicago Bears' : {id: 3, group: 'nfcn', name: "Chicago Bears",league:"nfl"},
    'Cincinnati Bengals' : {id: 4, group: "afcn", name: "Cincinnati Bengals",league:"nfl"},
    'Cleveland Browns' : {id: 5, group: "afcn", name: "Cleveland Browns",league:"nfl"},
    'Dallas Cowboys' : {id: 6, group: "nfce", name: "Dallas Cowboys",league:"nfl"},
    'Denver Broncos' : {id : 7, group: "afcw", name: "Denver Broncos",league:"nfl"},
    'Detroit Lions' : {id : 8, group: "nfcn", name: "Detroit Lions",league:"nfl"},
    'Green Bay Packers' : {id: 9, group: "nfcn", name: "Green Bay Packers",league:"nfl"},
    'Tennessee Titans' : {id: 10, group: "afcs", name: "Tennessee Titans",league:"nfl"},
    'Indianapolis Colts' : {id :11, group: "afcs", name: "Indianapolis Colts",league:"nfl"},
    'Kansas City Chiefs' : {id: 12, group: "afcw", name: "Kansas City Chiefs",league:"nfl"},
    'Las Vegas Raiders' : {id: 13, group: "afcw", name: "Las Vegas Raiders",league:"nfl"},
    'Los Angeles Chargers' : {id: 24, group: "afcw", name: "Los Angeles Chargers",league:"nfl"},
    'Los Angeles Rams': {id: 14, group: "nfcw", name: "Los Angeles Rams",league:"nfl"},
    'Miami Dolphins' : {id: 15, group: "afce", name: "Miami Dolphins",league:"nfl"},
    'Minnesota Vikings' : {id: 16, group: "nfcn", name: "Minnesota Vikings",league:"nfl"},
    'New England Patriots' : {id: 17, group: "afce", name: "New England Patriots",league:"nfl"},
    'New Orleans Saints' : {id: 18, group: "nfcs", name: "New Orleans Saints",league:"nfl"},
    'New York Giants' : {id: 19, group: "nfce", name: "New York Giants",league:"nfl"},
    'New York Jets' : {id: 20, group: "afce", name: "New York Jets",league:"nfl"},
    'Philadelphia Eagles' : {id: 21, group: "nfce", name: "Philadelphia Eagles",league:"nfl"},
    'Pittsburgh Steelers' : {id: 23, group: "afcn", name: "Pittsburgh Steelers",league:"nfl"},
    'Seattle Seahawks': {id: 25, group: "nfcw", name: "Seattle Seahawks",league:"nfl"},
    'San Francisco 49ers': {id: 26, group: "nfcw", name: "San Francisco 49ers",league:"nfl"},
    'Tampa Bay Buccaneers': {id: 27, group: "nfcs", name: "Tampa Bay Buccaneers",league:"nfl"},
    'Washington' : {id: 28, group: "nfce", name: "Washington",league:"nfl"},
    'Carolina Panthers' : {id: 29, group: "nfcs", name: "Carolina Panthers",league:"nfl"},
    'Jacksonville Jaguars' : {id: 30, group: "nfcs", name: "Jacksonville Jaguars",league:"nfl"},
    'Baltimore Ravens' : {id: 33, group: "afcn", name: "Baltimore Ravens",league:"nfl"},
    'Houston Texans' : {id: 34, group: "afcs", name: "Houston Texans",league:"nfl"}
}

async function fetchData(url, type='loadJSON') {
    const request = new Request(url)
    const res = await request[type]();
    return res
}

function copyObject(object) {
    return JSON.parse(JSON.stringify(object));
}

function sortNFLConference(team1, team2) {
  let stats1 = team1.stats
  let stats2 = team2.stats
  let seed1
  let seed2
  for (s1 of stats1) {
    if (s1.name === 'playoffSeed') {
      seed1 = parseInt(s1.value)
    }
  }
  for (s2 of stats2) {
    if (s2.name === 'playoffSeed') {
      seed2 = parseInt(s2.value)
    }
  }

  return seed1 > seed2
}

function pivotNFLTeams(team_list=nflESPNMap) {
    let id_based = {}
    for (tm in team_list) {
        let team_info = team_list[tm]
        id_based[team_info.id] = copyObject(team_info)
    }
    return id_based
}

async function getNFLStandings() {
    let url = "https://site.api.espn.com/apis/v2/sports/football/nfl/standings?season=2020"
//    let url = "https://site.api.espn.com/apis/v2/sports/football/nfl/standings"
    let baseReturn = await fetchData(url)
    let teams = []
    let team = {}
    let standings = {}
    let gamesPlayed;
    let league_teams = await pivotNFLTeams()

    if (Object.keys(baseReturn).includes('children')) {
        let coreStandings = baseReturn.children
        for (conference of coreStandings) {
            teams = []
            conf_name = conference.abbreviation.toLowerCase()
            rankings = copyObject(conference.standings.entries)
            rankings.sort(sortNFLConference)

            for (let e = 0; e < rankings.length; e++) {
                let entry = rankings[e]
                team = {}
                team['id'] = entry.team.id
                team['made_playoffs'] = false
                team['division'] = league_teams[team['id']]['group']
                gamesPlayed = 0
                for (stat of entry.stats) {
                    if (stat.description === 'Playoff Seed') {
                        team['seed'] = stat.value.toString()
                    } else if (stat.description === 'Games Back') {
                        team['games_back'] = stat.value
                    } else if (stat.name === 'clincher') {
                        team['playoff_status_text'] = stat.description
                        team['playoff_status'] = stat.displayValue
                        if (team['playoff_status'] != 'e') {
                            team.made_playoffs = true
                        }
                    } else if (stat.name == "wins" || stat.name == "losses") {
                        team[stat.name] = stat.value
                        gamesPlayed = gamesPlayed + parseInt(stat.value)
                    }
                }
                team["gamesPlayed"] = gamesPlayed
                if (!Object.keys(team).includes('playoff_status_text')) {
                    team['playoff_status_text'] = 'None'
                    team['playoff_status'] = 'na'
                }
                teams.push(team)
            }
            for (let t = 0; t < teams.length; t++) {
              if (t == 0) {
                teams[t].games_back_next = 0
              } else {
                teams[t].games_back_next = teams[t].games_back - teams[t-1].games_back
              }
            }
              
            standings[conf_name] = teams
        }
    }
    return standings
}

let testFave = [{"id":17,"group":"afce","name":"New England Patriots","league":"nfl","hideScores":false,"showRivals":true,"logo":"https://www.thesportsdb.com/images/media/team/badge/xtwxyt1421431860.png","theSportsDBID":"134920"}]

console.log(await getNFLStandings())

async function getNFLRivals(favorites) {
  let current_standings = await getNFLStandings()
  let nflWeeks = 17
  let rivals = new Set();
  for (fav of favorites) {
    let conf = fav.group.slice(0, 3)
    let favStanding
    let conf_standings = current_standings[conf]
    for (tm of conf_standings) {
      if (tm.id == fav.id) {
        favStanding = copyObject(tm)
      }
    }
    if (favStanding.gamesPlayed > 12) {
        for (c of conf_standings) {
            if (fav.made_playoffs) {
                if (favStanding.seed <= 4) {
                    if (c.seed <= 4 && Math.abs(favStanding.games_back - c.games_back) <= nflWeeks - favStanding.gamesPlayed) {
                        rivals.add(c.id)
                    } else if (!favStanding.playoff_status_text.includes('Clinched Division') && c.division == fav.group && Math.abs(favStanding.games_back - c.games_back) <= nflWeeks - favStanding.gamesPlayed) {
                        rivals.add(c.id)
                    }
                } else {
                    if (c.seed <= 7 && Math.abs(favStanding.games_back - c.games_back) <= nflWeeks - favStanding.gamesPlayed) {
                        rivals.add(c.id)
                    }
                }
            } else {
                if (!c.playoff_status_text.includes('Clinched Division') && c.seed <= favStanding.seed && c.division == fav.group && Math.abs(favStanding.games_back - c.games_back) <= nflWeeks - favStanding.gamesPlayed) {
                    rivals.add(c.id)
                } else if ([5,6,7].includes(c.seed) && c.seed <= favStanding.seed && c.division != fav.group && Math.abs(favStanding.games_back - c.games_back) <= nflWeeks - favStanding.gamesPlayed) {
                    rivals.add(c.id)
                }
            }
        }
    }
  }
  return Array.from(rivals)
}