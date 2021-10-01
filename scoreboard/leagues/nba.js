// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-brown; icon-glyph: basketball-ball;

function copyObject(object) {
    return JSON.parse(JSON.stringify(object));
  }

async function fetchData(url, type='loadJSON') {
    const request = new Request(url)
    const res = await request[type]();
    return res
}

function getNBADateFormat(date) {
    let working_date = new Date(date);
    let yr = working_date.getFullYear().toString();
    let mnth = ("0" + (working_date.getMonth()+1)).slice(-2);
    let dy = ("0" + working_date.getDate()).slice(-2);
    return yr+mnth+dy;
}

async function getNBAStandings() {
    let standings_file_path = fm.joinPath(baseLoc, 'nba-standings.txt')
    let final_standings
    if (fm.fileExists(standings_file_path) && fm.modificationDate(standings_file_path) >= today) {
        standings_contents = await readFile('nba-standings.txt')
        final_standings = standings_contents[0] ? copyObject(standings_contents[1]) : []
    } else {
        final_standings = await fetchNBAStandings()
        await saveFile('nba-standings.txt',final_standings)
    }

    if (final_standings.length == 0) {
        final_standings = await fetchNBAStandings()
        await saveFile('nba-standings.txt',final_standings)
    }
    return final_standings
}

async function fetchNBAStandings() {
    let final_standings = []
    let baseData = await fetchData("http://data.nba.net/prod/v1/current/standings_conference.json")
    if (Object.keys(baseData).includes("league")) {
        standings = baseData.league.standard.conference
    } else {
        standings = {}
    }
    for (conf in standings) {
        for (tm of standings[conf]) {
            team_obj = {
                name : tm.teamSitesOnly.teamName+' '+tm.teamSitesOnly.teamNickname,
                id: tm.teamID,
                conf: conf,
                conf_rank : tm.confRank,
                conf_games_back: parseInt(tm.gamesBehind)*-1,
                in_playoffs: parseInt(tm.teamSitesOnly.clinchedPlayoffs) == 1 ? true : false,
                games_played: parseInt(tm.win)+parseInt(tm.loss)
            }
            final_standings.push(team_obj)
        }
    }
    return final_standings
}

function getNBARivals(favorites, current_standings) {
    let favorite_conf
    let favorite_info = {};
    let req_teams = new Set();

    for (fav of favorites) {
        req_teams.add(fav.id)
        favorite_conf = fav.group
        for (fc of current_standings[favorite_conf]) {
            if (fc.id == fav.id) {
                favorite_info = copyObject(fc)
            }
        }
        if (favorite_info.games_played > 50) {
            for (t of current_standings[favorite_conf]) {
                if (Math.abs(parseInt(t.conf_games_back) - parseInt(favorite_info.conf_games_back)) <= 3) {
                    if (parseInt(favorite_info.conf_rank) <= 8 && Math.abs(parseInt(favorite_info.conf_rank)-parseInt(t.conf_rank)) <= 1) {
                        req_teams.add(t.id)
                    } else if (parseInt(favorite_info.conf_rank) > 8 && parseInt(t.conf_rank) >= 8) {
                        req_teams.add(t.id)
                    }
                }
            }
        }
    }
    return Array.from(req_teams);
}

async function getNBATeams(favorites) {
    let current_standings = await getNBAStandings()
    let team_ids = await getNBARivals(favorites, current_standings)
    let final_teams = []
    for (tm of current_standings) {
        for (t of team_ids) {
            if (parseInt(tm.id) === parseInt(t)) {
                text_games_back = tm.conf_games_back < 0 ? ' | '+tm.conf_games_back.toString() : ''
                text_standings = tm.conf_rank.toString()+text_games_back
                team_object = {
                    name: tm.name,
                    id: t,
                    standings:text_standings
                }
                final_teams.push(team_object)
            }
        }
    }
    return final_teams
}

console.log(test)