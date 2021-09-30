// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: baseball-ball;


function getFormattedURLDate(date, date_type) {
    let working_date = new Date(date);
    let output_date;
    let yr = working_date.getFullYear().toString();
    let mnth = ("0" + (working_date.getMonth()+1)).slice(-2);
    let dy = ("0" + working_date.getDate()).slice(-2);
    if (date_type == 2) {
        output_date = "year_"+yr+"/month_"+mnth+"/day_"+dy;
    } else if (date_type == 3) {
        output_date = yr+mnth+dy;
    } else {
        output_date = yr+'-'+mnth+'-'+dy;
    }
    return output_date;
}

function getISODate(date) {
    let working_date = new Date(date);
    let yr = working_date.getFullYear().toString();
    let mnth = ("0" + (working_date.getMonth()+1)).slice(-2);
    let dy = ("0" + working_date.getDate()).slice(-2);
    let output_date = yr+'-'+mnth+'-'+dy;
    return output_date;
}


async function fetchData(url, type = 'loadJSON') {
    const request = new Request(url)
    const res = await request[type]()
    return res
}

function nth(n){return["st","nd","rd"][((n+90)%100-10)%10-1]||"th"}


//let testing_data = await fetchData("http://statsapi.mlb.com/api/v1.1/game/633709/feed/live");
//gameData
//console.log(Object.keys(testing_data.liveData.linescore));
//console.log(testing_data.liveData.linescore.teams);

async function getMLBStandings () {
  let latest_standings = [];
  let currentYr = new Date();
  currentYr = currentYr.getFullYear()
  let standings_data = await fetchData("https://statsapi.mlb.com/api/v1/standings?leagueId=103&season="+currentYr.toString()+"&standingsTypes=regularSeason");
  for (div of standings_data.records) {
    lg = div.league.id;
    dv = div.division.id;
    dv_info = await fetchData("https://statsapi.mlb.com/api/v1/divisions/"+dv.toString());
    dv_info = dv_info.divisions[0]
    for (tm of div.teamRecords) {
      record = tm.wins.toString()+"-"+tm.losses.toString()
      if (tm.wildCardEliminationNumber == '-' && !tm.divisionLeader) {
        in_wildcard = true;
      } else {
        in_wildcard = false;
      }
      trimmed_team = {
        team : tm.team,
        record : record,
        games_played : tm.gamesPlayed,
        division : dv_info.id,
        division_name : dv_info.nameshort,
        div_place : tm.divisionRank,
        div_place_str : tm.divisionRank+nth(parseInt(tm.divisionRank)),
        wc_place : tm.wildCardRank,
        wc_place_str : tm.wildCardRank+nth(parseInt(tm.wildCardRank)),
        div_gm_back : tm.divisionGamesBack,
        wc_gm_back : tm.wildCardGamesBack,
        league : lg,
        div_lead : tm.divisionLeader,
        in_wc : in_wildcard,
      }
      
      latest_standings.push(trimmed_team);
    }
  }
  return latest_standings
}

let testFave = [{"id":111,"group":"201","name":"Boston Red Sox","league":"MLB","hideScores":false,"showRivals":true,"logo":"https://www.thesportsdb.com/images/media/team/badge/stpsus1425120215.png","theSportsDBID":"135252"}]

async function getMLBRivals(favorites, current_standings=await getMLBStandings()) {
  //flag all the teams related to the favorites once all standings compiled
  // those in front in division and those in front in wc
  // if in first, flag second place
  // if more than seven games out dont bother
  let req_teams = new Set();
  
  for (fav of favorites) {
    req_teams.add(parseInt(fav.id))
    let fav_standing
    for (tm of current_standings) {
      if (parseInt(tm.team.id) == parseInt(fav.id)) {
        fav_standing = copyObject(tm)
      }
    }
    if (fav_standing.games_played > 100) {
      for (c of current_standings) {
        if (fav_standing.)
      }
    }
  }

  for (d_tm of latest_standings) {
    if (fav_info.division == d_tm.division && Math.max(2,parseInt(fav_info.div_place)) >= parseInt(d_tm.div_place) && fav_info.team.id != d_tm.team.id && parseFloat(fav_info.div_gm_back) < 7) {
      req_teams.push(d_tm.team);
    }
    if (!fav_info.div_lead && !d_tm.div_lead) {
      if (fav_info.league == d_tm.league && Math.max(3,parseInt(fav_info.wc_place)) >= parseInt(d_tm.wc_place) && fav_info.team.id != d_tm.team.id && parseFloat(fav_info.wc_gm_back) < 7) {
      req_teams.push(d_tm.team);
      }
    }
  }
  return req_teams;
}

if (parseInt(tm.team.id) == parseInt(favorites.id)) {
  trimmed_team.favorite = true;
  if (!favorite_division.includes(dv)) {
    favorite_division.push(dv)
  }
  fav_info = JSON.parse(JSON.stringify(trimmed_team));
  if (fav_info.div_gm_back == '-') {
    fav_info.div_gm_back = "0";
  }
  if (fav_info.wc_gm_back == '-') {
    fav_info.wc_gm_back = "0";
  }
}


const getMLBGames = async (gmDate, teams) => {
  let empty_games = true;
  let scoreDate = new Date(gmDate);
  let tm_ids = [];
  for (t of teams) {
    tm_ids.push(t.id);
  }
  let game_list = [];
  let scoreboard = {};
  while (empty_games) {
    url = "https://statsapi.mlb.com/api/v1/schedule?date="+getISODate(scoreDate)+"&sportId=1&teamId="+tm_ids.toString()+"";
    scoreboard = await fetchData(url);
    if (parseInt(scoreboard.totalItems) > 0) {
      for (gm of scoreboard.dates[0].games) {
        game_list.push(gm);
      }
      empty_games = false;
    } else {
      scoreDate = scoreDate.setDate(scoreDate.getDate() + 1);
    }
  }

  //build the rendering for the game
  let cleaned_game = {};
  let ready_games = [];
  for (g of game_list) {
    cleaned_game = {};
    cleaned_game['home'] = g.teams.home
    cleaned_game['away'] = g.teams.away
    if (g.status.detailedState == "In Progress") {
      live_url = "https://statsapi.mlb.com"+g.link;
      liveScore = await fetchData(live_url);
      raw_gameData = liveScore.liveData.linescore
      cleaned_game["inning"] = raw_gameData.inningHalf.slice(0,3)+" "+raw_gameData.currentInningOrdinal;
    } else if (g.status.detailedState == 'Scheduled') {
      gStart = new Date(g.gameDate);
      cleaned_game['inning'] = gStart.toLocaleTimeString([],{hours : 'numeric', minutes: 'numeric'})
    } else if (g.status.detailedState == 'Final') {
      cleaned_game['inning'] = 'F';
    } else if (g.status.detailedState == 'Postponed') {
      cleaned_game['inning'] = 'PPD';
    }
    ready_games.push(cleaned_game);
  }
  return ready_games;
}

//if before 10am, show the previous day scores
//else show next game//
// var now = new Date();//
// var gameDate;//
// if (now.getHours() < 10) {
//   gameDate = new Date(now.setDate(now.getDate() - 1));//
// } else {
//   gameDate = new Date(now);//
// }

let configTeams = [
  {lg : "mlb",
   fn : "getMLB",
   id : 111,
   tmName : "Red Sox",
   hideScores : false}
]

async function prepFaves(favorites) {
  var prepped = {};
  for (f of favorites) {
    if (Object.keys(prepped).includes(f.lg)) {
      prepped[f.lg]["ids"].push(f.tmid);
    } else {
      obj = {
        ids : [f.tmid],
        fn : f.fn
      }
        prepped[f.lg] = JSON.parse(JSON.stringify(obj));
    }
  }
  return prepped;
}

console.log(await getMLBRivals(configTeams))