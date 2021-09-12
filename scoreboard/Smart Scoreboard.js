// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: teal; icon-glyph: magic;


const smartScoreboard = {

    initialize(name, iCloudUsed) {
        this.name = name
        this.fm = iCloudUsed ? FileManager.iCloud() : FileManager.local()
        this.bgPath = this.fm.joinPath(this.fm.libraryDirectory(), "smartscore-" + this.name)
        this.prefPath = this.fm.joinPath(this.fm.libraryDirectory(), "smartscore-preferences-" + name)
        this.now = new Date()
        this.favorites = []
        this.data = {}
        this.initialized = true
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

    async runSetup(name, iCloudUsed, codeFilename) {
        if (!this.initialized) this.initialize(name, iCloudUsed)
        const backgroundSettingExists = this.fm.fileExists(this.bgPath)

        if (!this.fm.fileExists(this.fm.joinPath(this.fm.libraryDirectory(), "smartscore-setup"))) return await this.initialSetup(backgroundSettingExists)
        if (backgroundSettingExists) return await this.editSettings(codeFilename)
        await this.generateAlert("Your scoreboard is configured.  Please choose a background for the widget.", ["Continue"])
        return await this.setWidgetBackground()
    },

    async NBAleagueYear() {
        let yr = this.now.getFullYear();
        if (this.now.getMonth() < 9) {
            yr = yr - 1;
        }
        return yr
    },

    async initialSetup(imported = false) {
        let message, options
        if (!imported) {}
    },

    async fetchData(url, type='loadJSON') {
        const request = new Request(url)
        const res = await request[type]();
        return res
    },

    async getTeams(league) {
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
        let leagueSet = {
            mlb : {
                leagueName : 'MLB',
                leagueURL : 'https://statsapi.mlb.com/api/v1/teams?sportId=1',
            },
            nba : {
                leagueName : 'NBA',
                leagueURL : 'http://data.nba.net/data/10s/prod/v1/$1/teams.json',
            },
            nfl : {
                leagueName : 'NFL',
            }
        }
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
                        group : t.division.id.toString()
                    }
                    output.push(t_obj)
                }
            } else if (league == 'NBA') {
                for (t of baseReturn.league.standard) {
                    t_obj = {
                        id : t.teamId,
                        name : t.fullName,
                        group : t.confName.toLowerCase()
                    }
                    output.push(t_obj)
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




}