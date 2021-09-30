// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: gray; icon-glyph: magic;
let fm = FileManager.iCloud()
let baseLoc = fm.joinPath(fm.joinPath(fm.libraryDirectory(),'scriptable-scoreboard'),'settings')

function date_trunc(date) {
  return new Date(date.getFullYear(),date.getMonth(),date.getDate(),4)
}

async function needToRefreshTeams() {
  let today = await date_trunc(new Date())
  let result
  let teamsDate
  let favoritesDate
  let favorites = fm.joinPath(baseLoc, 'favorites.txt')
  let teams = fm.joinPath(baseLoc,'teams.txt')
  if (fm.fileExists(favorites)) {
    favoritesDate = fm.modificationDate(favorites)
  } else {
//     trigger setting up favorotes
  }
  
  if (fm.fileExists(teams)) {
    teamsDate = fm.modificationDate(teams)
  } else {
    result = true
  }
  
  if (favoritesDate > teamsDate || await date_trunc(teamsDate) < today) {
      result = true
  } else {
      result = false
  }
  return result
}

async function refreshTeamsCache() {
    let favoritesFile = fm.joinPath(baseLoc, 'favorites.txt')
    let teams_list = []
    let leagues = new Set()
    if (!fm.fileExists(favoritesFile)) {
        //exit and set up favorites
    } else {
        let favorites_list = await getFavorites()
        for (f of favorites_list) {
            leagues.add(f.league.toLowerCase())
        }
        for (lg of leagues) {
            league_favorites = []
            league_teams = []
            for (ff of favorites) {
                if (ff.league.toLowerCase() === lg) {
                    league_favorites.push(ff)
                }
            }
            switch (lg) {
                case "nfl":
                    league_teams = await getNFLTeams(league_favorites)
                    break
                case "mlb":
                    league_teams = await getMLBTeams(league_favorites)
                    break
                case "nba":
                    league_teams = await getNBATeams(league_favorites)
                    break
                case "nhl":
                    league_teams = await getNHLTeams(league_favorites)
                    break
                case "english premier league":
                    league_teams = await getEPLTeams(league_favorites)
                    break
                default:
                    league_teams = []
            }
            teams_list = teams_list.concat(league_teams)
        }
        await saveFile('teams.txt',teams_list)
        return true
    }
}