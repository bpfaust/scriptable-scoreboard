// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-blue; icon-glyph: basketball-ball;
const favorite_teams = [
	{
		tsdb_id : 133610,
		name : 'Chelsea',
		hide_scores : false,
		abbrev : "",
		league : [
          {id: 4328, name: "epl", grp: "tsdb"},
          {id: 4480, name: "ucl", grp: "tsdb"},
          {id: 4481, name: "uel", grp: "tsdb"},
          {id: 4482, name: "fac", grp: "tsdb"},
          {id: 4503, name: "clwc", grp: "tsdb"},
          {id: 4570, name: "flc", grp: "tsdb"},
          {id: 4571, name: "fash", grp: "tsdb"}
        ]
	},
	{
		tsdb_id : 135252,
		name : 'Sox',
		hide_scores : true,
		abbrev : "BOS",
		league : [{id : 4424, name : "mlb", grp: "mlb"}],
	},
	{
		tsdb_id : 134860,
		name : 'Celts',
		hide_scores : false,
		abbrev : 'BOS',
		league : [{id : 4387, name : 'nba', grp: "nba"}]
	},
	{
		tsdb_id : 134920,
		name : 'Pats',
		hide_scores : false,
		abbrev : "",
		league : [{id : 4391, name : 'nfl', grp: "nfl"}]
	},
	{
		tsdb_id : 133907,
		name : 'Germany',
		hide_scores : false,
		abbrev: "",
		league : [{id: 4498, name: "confed", grp: "tsdb"},{id: 4429, name: "wc", grp: "tsdb"},{id: 4502, name: "euro", grp: "tsdb"}]
	},
	{
		tsdb_id : 133914,
		name : 'England',
		hide_scores : false,
		abbrev: "",
		league : [{id: 4498, name: "confed", grp: "tsdb"},{id: 4429, name: "wc", grp: "tsdb"},{id: 4502, name: "euro", grp: "tsdb"}]
	},
	{
		tsdb_id : 134514,
		name : 'USMNT',
		hide_scores : false,
		abbrev: "",
		league : [{id: 4498, name: "confed", grp: "tsdb"},{id: 4429, name: "wc", grp: "tsdb"}]
	},
	{
  		tsdb_id : 136971,
  		name : "Hoos Football",
  		hide_scores : false,
  		abbrev : "",
  		league : [{id: 4479, name: "ncaaf",grp: "tsdb"}]
	},
	{
  		tsdb_id : 138622,
  		name: "Hoos Hoops",
  		hide_scores : false,
  		abbrev: "UVA",
  		league : [{id: 4607, name: "ncaab",grp: "tsdb"}]
	},
	{
  		tsdb_id : 136868,
  		name : "BC Football",
  		hide_scores : false,
  		abbrev : "",
  		league : [{id: 4479, name: "ncaaf",grp: "tsdb"}]
	},
	{
  		tsdb_id : 138610,
  		name: "BC Hoops",
  		hide_scores : false,
  		abbrev: "BC",
  		league : [{id: 4607, name: "ncaab",grp: "tsdb"}]
	},
]

// 134514 usmnt
// 133907 dfb
// 133914 eng
// 136971 hoos f
// 138622 hoos b
// 136868 bc f
// 138610 bc b



const league_info = {
  mlb : {
    league_name : "MLB",
    apis : [
    	{
    		api_id : "mlb.com",
    		url: "http://gdx.mlb.com/components/game/mlb/$1/master_scoreboard.json",
    		date_type: 2,
    		headers : [],
  		},
  		{
    		api_id : "thesportsdb",
    		url : "",
    		date_type : 1,
    		headers : [],
		}
		]
  	},
  nba : {
    league_name : "NBA",
    apis : [
    	{
      		api_id : "nba.com",
      		url : "http://data.nba.net/10s/prod/v1/$1/scoreboard.json",
      		date_type : 3,
      		headers : [],
    	},
    	{
    		api_id : "thesportsdb",
    		url : "",
    		date_type : 1,
    		headers : [],
		}
    	]
  }
}

let now = new Date();
let distinct_leagues = [];
let scores = {};


function getFormattedDate(date, date_type) {  
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

async function buildAPIURL(api_url, d_type) {  
  let api_date = await getFormattedDate(now,d_type);
  let final_url = api_url.replace("$1",api_date);
  return final_url;
}

const fetchData = async (url, type = 'loadJSON') => {
  const request = new Request(url)
  const res = await request[type]()
  return res
}

const getMLB = async (the_date) => {      
  let other_games = false;
  let schedYear = the_date.getFullYear().toString();
  let standings = await fetchData("https://statsapi.mlb.com/api/v1/standings?leagueId=103,104&season="+schedYear+"&standingsTypes=regularSeason")


  let gameList = [];
  if ('data' in raw_data) {
    if ('games' in raw_data.data) {
      gameList = raw_data.data.games.game;  
    }
  }
  if (gameList != undefined && gameList.length > 0) {
    for (gm of gameList) {  
      if (gm.away_code == "bos" || gm.home_code == "bos") {
        console.log(gm);
      }
    }
  }
}
  

//across all teams, find the leagues needed to be checked
for (ft of favorite_teams) {
  for (l of ft.league) {        
    if (!distinct_leagues.includes(l.grp) && l.grp in league_info) {
      distinct_leagues.push(l.grp);
    }
  }
}

//for necessary groups, get the data
let gathered = false;
let api_call;
let nl;
for (dl of distinct_leagues) {    
  gathered = false;
  nl = league_info[dl]
  for (a of nl.apis) {
    if (!gathered) {        
      api_call = a.url.replace("$1",getFormattedDate(now, a.date_type));  
      try {
        api_response = await fetchData(api_call);
        if (dl == 'mlb') {
          parseMLB(api_response);
        }
      } catch (error) {
        console.log('There was an error');
      }
    }
  }
}




      