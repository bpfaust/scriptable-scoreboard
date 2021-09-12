// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-brown; icon-glyph: basketball-ball;
let configTeams = {
    lg: "nba",
    fn: "getNBA",
    tmid: 1610612738,
    tmName: "Celtics",
    hideScores: false
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

async function getNBAReqTeams(teams) {
    var favorite_conf;
    let favorite_info = {};
    let req_teams = []
    let baseData = await fetchData("http://data.nba.net/prod/v1/current/standings_conference.json")
    if (Object.keys(baseData).includes("league")) {
        standings = baseData.league.standard.conference
    } else {
        standings = {}
    }
    for (cnf of Object.keys(standings)) {
        for (t of standings[cnf]) {
            if (teams.includes(t.teamId)) {
                favorite_conf = cnf;
                favorite_info = JSON.parse(JSON.stringify(t));
            }
        }
    }
    for (tt of standings[favorite_conf]) {
        //if favorite is leading the conference, get the second place unless more than 3 games up
        //if in top 8 get teams 1 above and 1 back within 3 games
        //if below 8, get all teams between them and 8 within 3 games of the team
        if (tt.teamId == favorite_info.teamId) {
            req_teams.push(tt.teamId);
        } else if (Math.abs(parseFloat(tt.gamesBehind) - parseFloat(favorite_info.gamesBehind)) <= 3) {
            if (parseInt(favorite_info.confRank) <= 8 && Math.abs(parseInt(favorite_info.confRank) - parseInt(tt.confRank)) <= 1) {
                req_teams.push(tt.teamId)
            } else if (parseInt(favorite_info.confRank) > 8 && parseInt(tt.confRank) >= 8) {
                req_teams.push(tt.teamId);
            }
        }
    }
    return req_teams;
}

async function getNBAGames(gmDate, teams) {
    let empty_games = true;
    let scoreDate = new Date(gmDate);
    let tm_ids = []

}

let test = await getNBAReqTeams(["1610612738"]);


console.log(test)