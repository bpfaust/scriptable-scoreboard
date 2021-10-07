// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: teal; icon-glyph: magic;

const { current } = require("./reference/weather-cal-js")


const smartScoreboard = {

    initialize(name, iCloudUsed) {
        this.name = name
        this.fm = iCloudUsed ? FileManager.iCloud() : FileManager.local()
        this.baseLoc = this.fm.joinPath(this.fm.joinPatht(this.fm.libraryDirectory(),'scriptable-scoreboard'),'settings')
        this.now = new Date()
        this.today = new Date(this.now.getFullYear(),this.now.getMonth(),this.now.getDate(),4)
        this.initialized = true
    },

    nflMap() {
        const nflESPNMap = {
            'Arizona Cardinals' : {id : 22, group: "nfcw", name: "Arizona Cardinals"},
            'Atlanta Falcons' : {id : 1, group: "nfcs", name: "Atlanta Falcons"},
            'Buffalo Bills' : {id: 2, group: 'afce', name: "Buffalo Bills"},
            'Chicago Bears' : {id: 3, group: 'nfcn', name: "Chicago Bears"},
            'Cincinnati Bengals' : {id: 4, group: "afcn", name: "Cincinnati Bengals"},
            'Cleveland Browns' : {id: 5, group: "afcn", name: "Cleveland Browns"},
            'Dallas Cowboys' : {id: 6, group: "nfce", name: "Dallas Cowboys"},
            'Denver Broncos' : {id : 7, group: "afcw", name: "Denver Broncos"},
            'Detroit Lions' : {id : 8, group: "nfcn", name: "Detroit Lions"},
            'Green Bay Packers' : {id: 9, group: "nfcn", name: "Green Bay Packers"},
            'Tennessee Titans' : {id: 10, group: "afcs", name: "Tennessee Titans"},
            'Indianapolis Colts' : {id :11, group: "afcs", name: "Indianapolis Colts"},
            'Kansas City Chiefs' : {id: 12, group: "afcw", name: "Kansas City Chiefs"},
            'Las Vegas Raiders' : {id: 13, group: "afcw", name: "Las Vegas Raiders"},
            'Los Angeles Chargers' : {id: 24, group: "afcw", name: "Los Angeles Chargers"},
            'Los Angeles Rams': {id: 14, group: "nfcw", name: "Los Angeles Rams"},
            'Miami Dolphins' : {id: 15, group: "afce", name: "Miami Dolphins"},
            'Minnesota Vikings' : {id: 16, group: "nfcn", name: "Minnesota Vikings"},
            'New England Patriots' : {id: 17, group: "afce", name: "New England Patriots"},
            'New Orleans Saints' : {id: 18, group: "nfcs", name: "New Orleans Saints"},
            'New York Giants' : {id: 19, group: "nfce", name: "New York Giants"},
            'New York Jets' : {id: 20, group: "afce", name: "New York Jets"},
            'Philadelphia Eagles' : {id: 21, group: "nfce", name: "Philadelphia Eagles"},
            'Pittsburgh Steelers' : {id: 23, group: "afcn", name: "Pittsburgh Steelers"},
            'Seattle Seahawks': {id: 25, group: "nfcw", name: "Seattle Seahawks"},
            'San Francisco 49ers': {id: 26, group: "nfcw", name: "San Francisco 49ers"},
            'Tampa Bay Buccaneers': {id: 27, group: "nfcs", name: "Tampa Bay Buccaneers"},
            'Washington' : {id: 28, group: "nfce", name: "Washington"},
            'Carolina Panthers' : {id: 29, group: "nfcs", name: "Carolina Panthers"},
            'Jacksonville Jaguars' : {id: 30, group: "nfcs", name: "Jacksonville Jaguars"},
            'Baltimore Ravens' : {id: 33, group: "afcn", name: "Baltimore Ravens"},
            'Houston Texans' : {id: 34, group: "afcs", name: "Houston Texans"}
        }
        return nflESPNMap
    },

    apiURLs(league,call,parameters) {
        let api_directory = {
            mlb : {
                leagueName : 'MLB',
                teams : 'https://statsapi.mlb.com/api/v1/teams?sportId=1',
                standings : "https://statsapi.mlb.com/api/v1/standings?leagueId=103&season=$current_year&standingsTypes=regularSeason",
                divisions : "https://statsapi.mlb.com/api/v1/divisions/$division_id",
                schedule : "https://statsapi.mlb.com/api/v1/schedule?date=$score_date&sportId=1&teamId=$team_id_string",
                live : "https://statsapi.mlb.com$game_link"
            },
            nba : {
                leagueName : 'NBA',
                teams : "https://data.nba.net/data/10s/prod/v1/$nba_league_year/teams.json",
                standings: "https://data.nba.net/prod/v1/current/standings_conference.json",
                schedule: "https://data.nba.net/10s/prod/v1/$score_date/scoreboard.json",
                live: "https://data.nba.net/data/10s/prod/v1/$score_date/$game_id_mini_boxscore.json",
            },
            nhl : {
                leagueName: 'NHL',
                teams : "https://statsapi.web.nhl.com/api/v1/teams",
                standings: "",
                schedule: "",
                live: ""
            },
            nfl: {
                leagueName: 'NFL',
                standings: "https://site.api.espn.com/apis/v2/sports/football/nfl/standings",
                schedule: "",
                live: ""
            },
            epl: {
                leagueName: 'English Premier League',
                teams : "http://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/teams?limit=99",
                standings: "http://site.api.espn.com/apis/v2/sports/soccer/eng.1/standings",
                schedule: "",
                live: ""
            }
        }
        let url = api_directory[league][call]

        if (parameters) {
            for (param in parameters) {
                url = url.replace(param,parameters[param])
            }
        }

        return url
    },

    async runSetup(name, iCloudUsed, codeFilename) {
        if (!this.initialized) this.initialize(name, iCloudUsed)
        const backgroundSettingExists = this.fm.fileExists(this.bgPath)

        if (!this.fm.fileExists(this.fm.joinPath(this.fm.libraryDirectory(), "smartscore-setup"))) return await this.initialSetup(backgroundSettingExists)
        if (backgroundSettingExists) return await this.editSettings(codeFilename)
        await this.generateAlert("Your scoreboard is configured.  Please choose a background for the widget.", ["Continue"])
        return await this.setWidgetBackground()
    },

    

    async initialSetup(imported = false) {
        let message, options
        if (!imported) {}
    },

    

    // * BUILD FAVORITES FILE *//
    async getTeams(league) {
        let nflESPNMap = await this.nflMap()
        let output = [];
        if (league == "NFL") {
            for (o of Object.keys(nflESPNMap)) {
                output.push(nflESPNMap[o])
            }
        } else {
            let lgURL = await this.apiURLs(league.toLowerCase(),'teams')
            if (league == 'NBA') {
                lgURL = lgURL.replace('$nba_league_year',(await this.NBAleagueYear()).toString())
            }
            let baseReturn = await this.fetchData(lgURL);
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
    },

    async addFavorites() {
        let favorite_list = []
        let leagueMenu = []
        let tmMenu = []
        let baseResponse, lgResponse, tresponse
        let addNewTeam = true;
        let baseMenu = ['Add a new favorite', 'Finished']
        let hideScoreMenu = ['Hide scores', 'Show scores']
        let showImpactGames = ['Show other games in scoreboard', 'Do not show']

        while (addNewTeam) {
            baseResponse = baseMenu[await generateAlert("Favorites Setup",baseMenu)]
            if (baseResponse == 'Finished') {
                addNewTeam = false;
            } else {
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
                        favorite_list.push(f)
                    }
                }
            }
        }


    },

    //* HELPER FUNCTIONS *//

    copyObject(object) {
        return JSON.parse(JSON.stringify(object));
    },

    async fetchData(url, type='loadJSON') {
        const request = new Request(url)
        const res = await request[type]();
        return res
    },

    async generatePrompt(title,message,options,textvals,placeholders) {
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
    },

    async generateAlert(title,options,message) {
        return await generatePrompt(title,message,options)
    },

    NBAleagueYear() {
        let yr = this.now.getFullYear();
        if (this.now.getMonth() < 9) {
            yr = yr - 1;
        }
        return yr
    },

    NHLleagueYear() {
        let yr = this.now.getFullYear
        if (this.now.getMonth() < 9) {
            yr = (yr-1).toString()+yr.toString()
        } else {
            yr = yr.toString()+(yr+1).toString()
        }
        return yr
    },

    saveFile(filename, contents) {
        let fileContents = typeof contents == "string" ? contents : JSON.stringify(contents)
        this.fm.writeString(this.fm.joinPath(this.baseLoc, filename), fileContents)
    },

    readFile(filename, path=this.baseLoc) {
        let fullPath = this.fm.joinPath(path, filename)
        if (this.fm.fileExists(fullPath)) {
            return [true,JSON.parse(this.fm.readString(fullPath))]
        } else {
            return [false,filename+" does not exist"]
        }
    },

    getFormattedURLDate(date, date_type) {
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
    },

    getISODate(date) {
        let working_date = new Date(date);
        let yr = working_date.getFullYear().toString();
        let mnth = ("0" + (working_date.getMonth()+1)).slice(-2);
        let dy = ("0" + working_date.getDate()).slice(-2);
        let output_date = yr+'-'+mnth+'-'+dy;
        return output_date;
    },

    nth(n){return["st","nd","rd"][((n+90)%100-10)%10-1]||"th"},

    date_trunc(date) {
        return new Date(date.getFullYear(),date.getMonth(),date.getDate(),4)
    },

    //* LEAGUE FUNCTIONS *//
    //! mlb //
    async getMLBStandings() {
        let standings_file_path = this.fm.joinPath(this.baseLoc, 'mlb-standings.txt')
        let final_standings
        if (this.fm.fileExists(standings_file_path) && this.fm.modificationDate(standings_file_path) >= this.today) {
            standings_contents = await this.readFile('mlb-standings.txt')
            final_standings = standings_contents[0] ? this.copyObject(standings_contents[1]) : []
        } else {
            final_standings = await this.fetchMLBStandings()
            await this.saveFile('mlb-standings.txt',final_standings)
        }
    
        if (final_standings.length == 0) {
            final_standings = await this.fetchMLBStandings()
            await this.saveFile('mlb-standings.txt',final_standings)
        }
        return final_standings
    },

    async fetchMLBStandings () {
        let latest_standings = [];
        let currentYr = this.now.getFullYear()
        let url = await this.apiURLs('mlb','standings',{'$current_year': currentYr.toString()})
        let standings_data = await this.fetchData(url);
        for (div of standings_data.records) {
            lg = div.league.id;
            dv = div.division.id;
            dv_info = await this.fetchData(await this.apiURLs('mlb','divisions',{'$division_id': dv.toString()}));
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
                    div_leader : tm.divisionLeader,
                    div_place : tm.divisionRank,
                    div_place_str : tm.divisionRank+this.nth(parseInt(tm.divisionRank)),
                    lg_place_str: tm.leageRank+this.nth(parseInt(tm.leagueRank)),
                    wc_place : tm.wildCardRank,
                    wc_place_str : 'W'+tm.wildCardRank,
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
    },

    async getMLBRivals(favorites, current_standings) {
        let req_teams = new Set();
        let fav_standing
        
        for (fav of favorites) {
            req_teams.add(parseInt(fav.id))
            for (tm of current_standings) {
                if (parseInt(tm.team.id) == parseInt(fav.id)) {
                fav_standing = this.copyObject(tm)
                }
            }
            if (fav_standing.games_played > 100) {
                for (c of current_standings) {
                    if (fav_standing.division == c.division && fav_standing.team.id != c.team.id && (Math.max(2,parseInt(fav_standing.div_place)) >= parseInt(c.div_place) || Math.abs(parseInt(fav_standing.div_place)-parseInt(c.div_place)) == 1) && Math.abs(parseFloat(fav_standing.div_gm_back)-parseFloat(c.div_gm_back)) < 7) {
                        req_teams.add(parseInt(c.team.id))
                    }
                    if (!fav_standing.div_lead && !c.div_lead) {
                        if (fav_standing.league == c.league && Math.max(3,parseInt(fav_standing.wc_place)) >= parseInt(c.wc_place) && fav_standing.team.id != c.team.id && parseFloat(fav_standing.wc_gm_back) < 7) {
                            req_teams.add(parseInt(c.team.id))
                        }
                    }
                }
            }
        }
        return Array.from(req_teams)
    },

    async getMLBTeams(favorites) {
        let current_standings = await this.getMLBStandings()
        let team_ids = await this.getMLBRivals(favorites, current_standings)
        let final_teams = []
        for (tm of current_standings) {
            for (t of team_ids) {
                if (parseInt(tm.team.id) == parseInt(t)) {
                    text_games_back_div = tm.div_leader ? tm.div_place.toString() : '-'+tm.div_gm_back.toString()
                    if (parseInt(tm.wc_gm_back) > 8 || tm.div_leader) {
                      text_games_back_wc = false
                    } else {
                      text_games_back_wc = tm.in_wc ? tm.wc_place_str : '-'+tm.wc_gm_back.toString()
                    }
                    text_standings = !text_games_back_wc ? text_games_back_div : text_games_back_div+' | '+text_games_back_wc
                    team_object = {
                        name : tm.team.name,
                        id : t,
                        standings : text_standings
                    }
                    final_teams.push(team_object)
                }
            }
        }
        return final_teams
    },

    //! nba //
    async getNBAStandings() {
        let standings_file_path = this.fm.joinPath(this.baseLoc, 'nba-standings.txt')
        let final_standings
        if (this.fm.fileExists(standings_file_path) && this.fm.modificationDate(standings_file_path) >= this.today) {
            standings_contents = await this.readFile('nba-standings.txt')
            final_standings = standings_contents[0] ? this.copyObject(standings_contents[1]) : []
        } else {
            final_standings = await this.fetchNBAStandings()
            await this.saveFile('nba-standings.txt',final_standings)
        }
    
        if (final_standings.length == 0) {
            final_standings = await this.fetchNBAStandings()
            await this.saveFile('nba-standings.txt',final_standings)
        }
        return final_standings
    },

    async fetchNBAStandings() {
        let final_standings = []
        let url = await this.apiURLs('nba','standings')
        let baseData = await this.fetchData(url)
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
    },

    getNBARivals(favorites, current_standings) {
        let favorite_conf
        let favorite_info = {};
        let req_teams = new Set();
    
        for (fav of favorites) {
            req_teams.add(fav.id)
            favorite_conf = fav.group
            for (fc of current_standings[favorite_conf]) {
                if (fc.id == fav.id) {
                    favorite_info = this.copyObject(fc)
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
    },

    async getNBATeams(favorites) {
        let current_standings = await this.getNBAStandings()
        let team_ids = await this.getNBARivals(favorites, current_standings)
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
    },
    
    //! nfl //
    sortNFLConference(team1, team2) {
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
    },

    pivotNFLTeams(team_list) {
        let id_based = {}
        for (tm in team_list) {
            let team_info = team_list[tm]
            id_based[team_info.id] = copyObject(team_info)
        }
        return id_based
    },

    async getNFLStandings() {
        let standings_file_path = this.fm.joinPath(this.baseLoc, 'nfl-standings.txt')
        let final_standings
        if (this.fm.fileExists(standings_file_path) && this.fm.modificationDate(standings_file_path) >= this.today) {
            standings_contents = await this.readFile('nfl-standings.txt')
            final_standings = standings_contents[0] ? this.copyObject(standings_contents[1]) : []
        } else {
            final_standings = await this.fetchNFLStandings()
            await this.saveFile('nfl-standings.txt',final_standings)
        }
    
        if (final_standings.length == 0) {
            final_standings = await this.fetchNFLStandings()
            await this.saveFile('nfl-standings.txt',final_standings)
        }
        return final_standings
    },

    async fetchNFLStandings() {
        let url = await this.apiURLs('nfl','standings')
        let baseReturn = await this.fetchData(url)
        let teams = []
        let team = {}
        let standings = {}
        let gamesPlayed;
        let league_teams = await this.pivotNFLTeams(await this.nflMap())
        
        if (Object.keys(baseReturn).includes('children')) {
            let coreStandings = baseReturn.children
            for (conference of coreStandings) {
                teams = []
                conf_name = conference.abbreviation.toLowerCase()
                rankings = this.copyObject(conference.standings.entries)
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
    },

    async getNFLRivals(favorites, current_standings) {
        let nflWeeks = 17
        let rivals = new Set();
        for (fav of favorites) {
            rivals.add(fav.id)
            let conf = fav.group.slice(0, 3)
            let favStanding
            let conf_standings = current_standings[conf]
            for (tm of conf_standings) {
                if (tm.id == fav.id) {
                    favStanding = this.copyObject(tm)
                }
            }

            if (favStanding.gamesPlayed > 12) {
                for (c of conf_standings) {
                    if (parseInt(c.id) == parseInt(fav.id)) {
                        continue
                    }
                    if (fav.made_playoffs) {
                        if (parseInt(favStanding.seed) <= 4) {
                            if (parseInt(c.seed) <= 4 && Math.abs(parseInt(favStanding.games_back) - parseInt(c.games_back)) <= nflWeeks - parseInt(favStanding.gamesPlayed)) {
                                rivals.add(parseInt(c.id))
                            } else if (!favStanding.playoff_status_text.includes('Clinched Division') && c.division == fav.group && Math.abs(parseInt(favStanding.games_back) - parseInt(c.games_back)) <= nflWeeks - parseInt(favStanding.gamesPlayed)) {
                                rivals.add(parseInt(c.id))
                            }
                        } else {
                            if (parseInt(c.seed) <= 7 && Math.abs(parseInt(favStanding.games_back) - parseInt(c.games_back)) <= nflWeeks - parseInt(favStanding.gamesPlayed)) {
                                rivals.add(parseInt(c.id))
                            }
                        }
                    } else {
                        if (!c.playoff_status_text.includes('Clinched Division') && parseInt(c.seed) <= parseInt(favStanding.seed) && c.division == fav.group && Math.abs(parseInt(favStanding.games_back) - parseInt(c.games_back)) <= nflWeeks - parseInt(favStanding.gamesPlayed)) {
                            rivals.add(parseInt(c.id))
                        } else if ([5,6,7].includes(parseInt(c.seed)) && parseInt(c.seed) <= parseInt(favStanding.seed) && c.division != fav.group && Math.abs(parseInt(favStanding.games_back) - parseInt(c.games_back)) <= nflWeeks - parseInt(favStanding.gamesPlayed)) {
                            rivals.add(parseInt(c.id))
                        }
                    }
                }
            }
        }
        return Array.from(rivals)
    },

    async getNFLTeams(favorites) {
        let current_standings = await this.getNFLStandings()
        let team_ids = await this.getNFLRivals(favorites, current_standings)
        let team_list = this.pivotNFLTeams(await this.nflMap())
        let final_teams = []
        for (conf in current_standings) {
            for (s of current_standings[conf]) {
                for (t of team_ids) {
                    if (parseInt(s.id) == parseInt(t)) {
                        text_games_back = (parseInt(s.games_back)*-1) > 0 ? "+"+(parseInt(s.games_back) * -1).toString() : (parseInt(s.games_back) * -1).toString()
                        team_object = {
                            name : team_list[t]['name'],
                            id : t,
                            standings : s.seed.toString()+" | "+text_games_back
                        }
                        final_teams.push(team_object)
                    }
                }
            }
        }
        return final_teams
    },
    
    //! epl //
    async getEPLStandings() {
        let standings_file_path = this.fm.joinPath(this.baseLoc, 'epl-standings.txt')
        let final_standings
        if (this.fm.fileExists(standings_file_path) && this.fm.modificationDate(standings_file_path) >= this.today) {
            standings_contents = await this.readFile('epl-standings.txt')
            final_standings = standings_contents[0] ? this.copyObject(standings_contents[1]) : []
        } else {
            final_standings = await this.fetchEPLStandings()
            await this.saveFile('epl-standings.txt',final_standings)
        }
    
        if (final_standings.length == 0) {
            final_standings = await this.fetchEPLStandings()
            await this.saveFile('epl-standings.txt',final_standings)
        }
        return final_standings
    },

    async fetchEPLStandings() {
        let raw_table = await this.fetchData(await this.apiURLs('epl','standings'))
        if ('children' in raw_table) {
            let dims = ['rank','points','gamesPlayed']
            let proc_table = []
            let table = raw_table.children[0].standings.entries
            for (tm of table) {
                let obj = {
                    name: tm.team.name,
                    id: tm.team.id,
                }
                for (stat of tm.stats) {
                    if (dims.includes(stat.name)) {
                        obj[stat.name] = stat.value
                    }
                }
                proc_table.push(obj)
            }
            return proc_table
        } else {
            return []
        }
    },

    async getEPLRivals(favorites, standings) {
        let favorite_standing;
        let req_teams = new Set();
        
        for (fav of favorites) {
            req_teams.add(fav.id)
            for (t of standings) {
                if (t.id == fav.id) {
                    favorite_standing = this.copyObject(t)
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
    },

    async getEPLTeams(favorites) {
        let current_standings = await this.getEPLStandings()
        let team_ids = await this.getEPLRivals(favorites, current_standings)
        let final_teams = []
        for (rival of team_ids) {
            for (tm of current_standings) {
                if (parseInt(r) == parseInt(tm.id)) {
                    let tobj = {
                        name = tm.name,
                        id: rival,
                        standings: tm.rank.toString()+' ('+tm.points.toString()+')'
                    }
                    final_teams.push(tobj)
                }
            }
        }
        
        return final_teams
    },

    //* GAME RELATED FUNCTIONS *//

    //* WIDGET CONSTRUCTION *//
}