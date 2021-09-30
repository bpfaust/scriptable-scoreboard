// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: orange; icon-glyph: magic;

let fm = FileManager.iCloud()
let baseLoc = fm.joinPath(fm.joinPath(fm.libraryDirectory(),'scriptable-scoreboard'),'settings')
if (!fm.isDirectory(baseLoc)) {
  fm.createDirectory(baseLoc, true)
}

function saveFile(filename, contents) {
  let fileContents = typeof contents == "string" ? contents : JSON.stringify(contents)
  fm.writeString(fm.joinPath(baseLoc, filename), fileContents)
}

function readFile(filename, path=baseLoc) {
  let fullPath = fm.joinPath(path, filename)
  if (fm.fileExists(fullPath)) {
    return [true,JSON.parse(fm.readString(fullPath))]
  } else {
    return [false,filename+" does not exist"]
  }
}

async function generatePrompt(title,message,options,textvals,placeholders) {
    const alert = new Alert()
    alert.title = title
    if (message) alert.message = message

    const buttons = options || ["OK"]
    for (button of buttons) { alert.addAction(button) }

    if (!textvals) { return await alert.presentAlert() }

    for (i=0; i < textvals.length; i++) {
        alert.addTextField(placeholders && placeholders[i] ? placeholders[i] : null,(textvals[i] || "") + "")
    }

    if (!options) await alert.present()
    return alert
}

async function generateAlert(title,options,message) {
    return await generatePrompt(title,message,options)
}

async function fetchData(url, type='loadJSON') {
    const request = new Request(url)
    const res = await request[type]();
    return res
}

async function NBAleagueYear() {
    let now = new Date();
    let yr = now.getFullYear();
    if (now.getMonth() < 9) {
        yr = yr - 1;
    }
    return yr
}

async function getTeams(league) {
    let output = [];
    if (league == "NFL") {
        for (o of Object.keys(nflESPNMap)) {
            output.push(nflESPNMap[o])
        }
    } else {
        for (lr of Object.keys(leagueSet)) {
            if (leagueSet[lr].leagueName == league) {
                lgURL = leagueSet[lr].leagueURL
            }
        }
        if (league == 'NBA') {
            lgURL = lgURL.replace('$1',(await NBAleagueYear()).toString())
        }
        let baseReturn = await fetchData(lgURL);
        if (league == 'MLB') {
            for (t of baseReturn.teams) {
                t_obj = {
                    id : t.id,
                    name : t.name,
                    group : t.division.id.toString(),
                    league : league
                }
                output.push(t_obj)
            }
        } else if (league == 'NBA') {
            for (t of baseReturn.league.standard) {
                t_obj = {
                    id : t.teamId,
                    name : t.fullName,
                    group : t.confName.toLowerCase(),
                    league : league
                }
                output.push(t_obj)
            }
        } else if (league == 'English Premier League') {
            for (t of baseReturn.sports[0].leagues[0].teams) {
                t_obj = {
                    id: t.team.id,
                    name : t.team.name,
                    group : '700',
                    league : league
                }
                output.push(t_obj)
            }
        } else if (league == 'NHL') {
            for (t of baseReturn.teams) {
                if (t.active) {
                    t_obj = {
                        id : t.id,
                        name : t.name,
                        group : t.conference.id.toString(),
                        league : league
                    }
                    output.push(t_obj)
                }
            }
        }
    }
    return output
}

async function stringSearchSportDB(team_name,league_name) {
    let url = "https://www.thesportsdb.com/api/v1/json/1/searchteams.php?t="+team_name.replace(/\ /g,"_")
    let search = await fetchData(url)
    let result = []
    let team = {}
    for (sdbt of search.teams) {
        team = {}
        if ((sdbt.strTeam == team_name || sdbt.strAlternate == team_name) && sdbt.strLeague == league_name) {
            team['name'] = team_name
            team['logo'] = sdbt.strTeamBadge
            team['theSportsDBID'] = sdbt.idTeam
            result.push(team)
        }
    }
    return result
}

async function updateLogosLookup(results) {
    let logo_set = new Set()
    let logo_file = await readFile('logos.txt')
    let logo_array = logo_file[0] ? log_file[1] : []
    let new_logo_array = []
    for (l of logo_array) {
        logo_set.add(l.name)
    }
    for (r of result) {
        logo_set.add(r.name)
    }
    for (ls of logo_set) {
        found = false
        for (re of results) {
            for (lf of logo_array) {
                if (lf.name === ls) {
                    new_logo_array.push(lf)
                    found = true
                }
            }
            if (re.name === ls && !found) {
                new_logo_array.push(re)
                found = true
            }
        }
    }
    await saveFile('logos.txt',new_logo_array)
    return true
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

let leagueSet = {
    epl : {
        leagueName : "English Premier League",
//         leagueURL : "https://www.thesportsdb.com/api/v1/json/1/search_all_teams.php?l=English_Premier_League"
        leagueURL: "http://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/teams?limit=99"
    },
    mlb : {
        leagueName : 'MLB',
        leagueURL : 'https://statsapi.mlb.com/api/v1/teams?sportId=1',
    },
    nba : {
        leagueName : 'NBA',
        leagueURL : 'http://data.nba.net/data/10s/prod/v1/$1/teams.json',
    },
    nhl : {
        leagueName : 'NHL',
        leagueURL : 'https://statsapi.web.nhl.com/api/v1/teams'
    },
    nfl : {
        leagueName : 'NFL',
    },
}

async function getFavorites() {
  let favoritesLoad = await readFile('favorites.txt')
  let favorite_list = favoritesLoad[0] ? favoritesLoad[1] : []
  return favorite_list
}

async function buildFavorites() {
    let favorite_list = await getFavorites()
    let leagueMenu = [];
    let tmMenu = [];

    let baseResponse;
    let lgResponse;
    let tresponse;

    let addNewTeam = true;
    let baseMenu = ['Add a new favorite', 'Finished']
    let hideScoreMenu = ['Hide scores', 'Show scores']
    let showImpactGames = ['Show other games in scoreboard', 'Do not show']
    let addedTeams = []

    while (addNewTeam) {
        if (favorite_list.length > 0 && baseMenu.length < 3) {
            baseMenu.splice(1, 0, "Manage favorites")
        } else if (favorite_list.length == 0 && baseMenu.length == 3) {
            baseMenu.splice(1, 1)
        }
        baseResponse = baseMenu[await generateAlert("Favorites Setup",baseMenu)]
        if (baseResponse == 'Finished') {
            await saveFile('favorites.txt', favorite_list)
            written = addedTeams.length > 0 ? await updateLogosLookup(addedTeams) : false
            addNewTeam = false;
        } else if (baseResponse == 'Add a new favorite'){
            leagueMenu = [];
            tmMenu = [];
            for (l of Object.keys(leagueSet)) {
                leagueMenu.push(leagueSet[l].leagueName)
            }
            lgResponse = leagueMenu[await generateAlert("Choose a league",leagueMenu)]
            teamInfoSet = await getTeams(lgResponse);
            for (tm of teamInfoSet) {
                tmMenu.push(tm.name);
            }
            tmMenu = tmMenu.sort()
            tresponse = tmMenu[await generateAlert("Choose team",tmMenu)]
            hideChoice = await generateAlert("Do you want to hide scores for this team?",hideScoreMenu);
            showImpactChoice = await generateAlert("Do you want to show games for teams close in standings?", showImpactGames)
            if (hideChoice == 0) {
                hide = true;
            } else {
                hide = false;
            }
            if (showImpactChoice == 0) {
                rivals = true;
            } else {
                rivals = false;
            }
            for (f of teamInfoSet) {
                if (f.name == tresponse) {
                    f['hideScores'] = hide;
                    f['showRivals'] = rivals;
                    tsdbSearch = await stringSearchSportDB(tresponse,lgResponse)
                    f['logo'] = tsdbSearch[0].logo;
                    f['theSportsDBID'] = tsdbSearch[0].theSportsDBID;
                    favorite_list.push(f)
                    added_teams.push(tsdbSearch[0])
                }
            }
        } else {
            edit = await editFavorites(favorite_list)
        }
    }
return true
}
/*
units: {
    val: "imperial",
    name: "Units",
    description: "Use imperial for Fahrenheit or metric for Celsius.",
    type: "enum",
    options: ["imperial","metric"],

console.log(favorite_list)
*/

async function editFavorites(favoritesData) {
    const table = new UITable()
    table.showSeparators = true

    for (favoriteTeam of favoritesData) {
        const row = new UITableRow()
        row.dismissOnSelect = false

        logoCell = UITableCell.imageAtURL(favoriteTeam.logo)
        logoCell.widthWeight = 10
        nameCell = UITableCell.text(favoriteTeam.name)
        nameCell.widthWeight = 55
        nameCell.leftAligned()
        editButtonCell = UITableCell.text('Edit')
        editButtonCell.titleColor = Color.blue()
        //editButtonCell.onTap
        editButtonCell.centerAligned()
        editButtonCell.widthWeight = 15
        buttonCell = UITableCell.text('Remove')
//     		buttonCell.onTap
        buttonCell.centerAligned()
        buttonCell.titleColor = Color.red()
        buttonCell.widthWeight = 20

        row.addCell(logoCell)
        row.addCell(nameCell)
        row.addCell(editButtonCell)
        row.addCell(buttonCell)
        table.addRow(row)
    }
    await table.present()

    return 1
}

let faves = await buildFavorites()