// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: pink; icon-glyph: magic;

let configTeams = {
    league : "nfl",
    id : 17
}


async function fetchData(url, type='loadJSON') {
    const request = new Request(url)
    const res = await request[type]();
    return res
}


async function getNFLStandings() {
    let url = "https://site.api.espn.com/apis/v2/sports/football/nfl/standings?season=2019"
//    let url = "https://site.api.espn.com/apis/v2/sports/football/nfl/standings"
    let baseReturn = await fetchData(url)
    let teams = []
    let team = {}
    let standings = {}

    if (Object.keys(baseReturn).includes('children')) {
        let coreStandings = baseReturn.children
        for (conference of coreStandings) {
            teams = []
            conf_name = conference.abbreviation.toLowerCase()
            for (entry of conference.standings.entries) {
                team = {}
                team['id'] = entry.team.id
                team['made_playoffs'] = false
                for (stat of entry.stats) {
                    if (stat.description === 'Playoff Seed') {
                        team['seed'] = stat.value.toString()
                    } else if (stat.description === 'Games Back') {
                        team['games_back'] = stat.value
                    } else if (stat.name === 'clincher') {
                        team['playoff_status_text'] = stat.description
                        team['playoff_status'] = stat.displayValue
                        team.made_playoffs = true
                    }
                }
                teams.push(team)
            }
            standings[conf_name] = teams
        }
    }
    return standings
}

let stding = await getNFLStandings()
console.log(stding)