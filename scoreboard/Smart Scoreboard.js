// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: teal; icon-glyph: magic;


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

    apiURLs(league,call) {
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
                standings: "",
                schedule: "",
                live: ""
            },
            epl: {
                leagueName: 'English Premier League',
                teams : "http://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/teams?limit=99",
                standings: "",
                schedule: "",
                live: ""
            }
        }
        return api_directory[league][call]
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

    //* GAME RELATED FUNCTIONS *//

    //* WIDGET CONSTRUCTION *//
}