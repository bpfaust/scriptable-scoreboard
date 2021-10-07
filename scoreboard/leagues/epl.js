// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-gray; icon-glyph: magic;
let standings = "http://site.api.espn.com/apis/v2/sports/soccer/eng.1/standings"

let favorites = [{"id":"363","name":"Chelsea","group":"700","league":"English Premier League","hideScores":false,"showRivals":true,"logo":"https://www.thesportsdb.com/images/media/team/badge/yvwvtu1448813215.png","theSportsDBID":"133610"}]

async function fetchData(url, type='loadJSON') {
    const request = new Request(url)
    const res = await request[type]();
    return res
}

function copyObject(object) {
    return JSON.parse(JSON.stringify(object));
}

let raw_table = await fetchData(standings)
let table = raw_table.children[0].standings.entries
let proc_table = []
let dims = ['rank','points','gamesPlayed']

for (tm of table) {
  let obj = {
    name : tm.team.name,
    id : tm.team.id,
  }
  for (stat of tm.stats) {
    if (dims.includes(stat.name)) {
      obj[stat.name] = stat.value
    }
  }
  proc_table.push(obj)
}


async function getEPLRivals(favorites, standings) {
let favorite_standing;
let req_teams = new Set();

for (fav of favorites) {
  req_teams.add(fav.id)
  for (t of standings) {
    if (t.id == fav.id) {
      favorite_standing = copyObject(t)
    }
  }
  if (parseInt(favorite_standing.gamesPlayed) > 28) {
    for (tt of standings) {
      if (Math.abs(parseInt(favorite_standing.points)-parseInt(tt.points)) < (38-parseInt(favorite_standing.gamesPlayed))*3) {
        req_teams.add(tt.id)
      }
    }
  }
}
return Array.from(req_teams)
}

let rivals = await getEPLRivals(favorites, proc_table)
let final_teams = []

for (r of rivals) {
  for (tm of proc_table) {
    if (parseInt(r) == parseInt(tm.id)) {
  tobj = {
    name: tm.name,
    id: r,
    standings: tm.rank.toString()+' ('+tm.points.toString()+')'
  }
  final_teams.push(tobj)
}
}
}



console.log(final_teams)