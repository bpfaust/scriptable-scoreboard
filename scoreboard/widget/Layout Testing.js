// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: pink; icon-glyph: magic;

async function fetchData(url, type='loadJSON') {
    const request = new Request(url)
    const res = await request[type]();
    return res
}

async function initWidget() {
    let widget = new ListWidget()
    let imagePath = fm.joinPath(backgrounds_path,background_file_name+'.jpg')
    if (fm.fileExists(imagePath)) {
        if (!fm.isFileDownloaded(imagePath)) {await fm.downloadFileFromiCloud(imagePath)}
        widget.backgroundImage = fm.readImage(imagePath)
    } else {
        widget.backgroundColor = new Color(DARK_MODE ? '#1B1B1B' : '#FFFFFF')
    }
    widget.setPadding(4,4,4,4)

    return widget
}

const addImage = (el, src, size = logoSize) => {
    let image = el.addImage(src)
    image.imageSize = new Size(size, size)
}

function addText (el, string, type = 'default', alignment = 'center', size = defaultTextSize, color = defaultColor) {
    const text = el.addText(string)
    if (type === 'winner') {
        text.font = Font.boldRoundedSystemFont(size * 1.05)
        text.textColor = new Color(DARK_MODE ? '#FFD700' : '#DC143C')
    } else {
        if (type === 'loser') {
            text.font = Font.regularRoundedSystemFont(size)
            text.opacity = .65
        } else if (type === 'bold') {
            text.font = Font.boldRoundedSystemFont(size * 1.2)
        } else if (type === 'small') {
            text.font = Font.thinMonospacedSystemFont(size * 0.55)
        } else if (type === 'F' || type === 'default') {
          	  text.font = Font.regularRoundedSystemFont(size)
        } else {
            text.font = Font.regularRoundedSystemFont(size * .8)
        }
        text.color = color
//         text.textOpacity = type === 'small' ? 0.8 : 1
        //text.textColor = new Color(DARK_MODE ? '#ffffff' : '#000000', 1)
    }
    text.lineLimit = 1
    text.centerAlignText()
}

async function addStack (el, type = 'horizontal', centered = false, size) {
    let stack = el.addStack()
    if (type === 'vertical') stack.layoutVertically()
    else stack.layoutHorizontally()
    if (centered) stack.centerAlignContent()
    if (size) stack.size = size
    return stack
}

const getLogo = async (src) => {
    let img = await fetchData(src, 'loadImage')
    return img
}

async function initGame(el, event) {
    await addStandings(el, event.homeStandings, event.awayStandings)
    el.addSpacer(5)
    let home = await getLogo(event.homeTeam)
    let away = await getLogo(event.awayTeam)
    await addLogos(el, home, away)
    el.addSpacer(8)
    await addScores(el, event.homeScore, event.awayScore, event.status, event.period)
    if (event.status === 'In Progress') {
        el.borderColor = new Color('#FFD700', .6)
        el.borderWidth = 1.5
        el.cornerRadius = 5
    }
}

async function addStandings(el, standings) {
  let standingsStack = await addStack(el, 'horizontal', true)
  standingsStack.addSpacer()
  await addText(standingsStack,standings,'small')
  standingsStack.addSpacer()
}

async function addLogo(el, logoURL) {
  let logoStack = await addStack(el, 'horizontal', true)
  logoStack.addSpacer()
  await addImage(logoStack, await getLogo(logoURL))
  logoStack.addSpacer()
}

async function isWinner(event, teamType) {
  if (event.status != 'Final' || event.homeScore == event.awayScore) {
    return 'default'
  } else if (event.homeScore > event.awayScore) {
      if (teamType === 'home') {
        return 'winner'
      } else {
        return 'loser'
      }
  } else if (event.homeScore < event.awayScore) {
      if (teamType === 'away') {
        return 'winner'
      } else {
        return 'loser'
      }
    } 
}
      
async function addScore(el, status, score) {
  let scoreStack = await addStack(el, 'horizontal', true)
  scoreStack.addSpacer()
  await addText(scoreStack,score,status)
  scoreStack.addSpacer()
}

async function addTeam(el, event, teamType, eventSize) {
  let teamStack = await addStack(el, 'vertical', true, eventSize)
  if (event.status != 'Scheduled') {
    teamStack.addSpacer()
  } else {
    teamStack.addSpacer(33)
  }
  await addStandings(teamStack, event[teamType+'Standings'])
  teamStack.addSpacer(8)
  await addLogo(teamStack, event[teamType+'Team'])
  if (event.status != 'Scheduled') {
    teamStack.addSpacer(8)
    await addScore(teamStack,await isWinner(event, teamType),event[teamType+'Score'])
}
  teamStack.addSpacer()
}

async function addPeriod(el, event, atSize) {
  let middleStack = await addStack(el, 'vertical', true, atSize)
if (event.status != 'Scheduled') {
    middleStack.addSpacer()
  } else {
    middleStack.addSpacer(33)
  }
  let top = await addStack(middleStack, 'horizontal', true)
  top.addSpacer()
  await addText(top, ' ')
  top.addSpacer()
  middleStack.addSpacer(15)
  let at = await addStack(middleStack,'horizontal',true)
  at.addSpacer()
  await addText(at,'@')
  at.addSpacer()
  if (event.status != 'Scheduled') {
    middleStack.addSpacer(15)
    let bottom = await addStack(middleStack,'horizontal',true)
    bottom.addSpacer()
    await addText(bottom, event.period, event.period)
    bottom.addSpacer()
    
  }
  middleStack.addSpacer()
}

async function buildGame(game, event,sizes) {
  await addTeam(game,event,'away',sizes.event)
  await addPeriod(game,event,sizes.at)
  await addTeam(game,event,'home',sizes.event)
}

async function buildSchedule(game, event) {
  game.addSpacer()
  await addText(game,event.period)
  game.addSpacer()
}

async function renderGame(el, event) {
  let gameSize = new Size(gameHeight, gameHeight)
  let sizes = {
    game : gameSize
  }
  if (event.status == 'Scheduled') {
    sizes['event'] = new Size((gameHeight-atWidth)/2,gameHeight-scheduleHeight)
    sizes['at'] = new Size(atWidth, gameHeight-scheduleHeight)
    sizes['schedule'] = new Size(gameHeight,scheduleHeight)
    sizes['teams'] = new Size(gameHeight,gameHeight-scheduleHeight)
    await initGameScheduled(el, event, sizes)
  } else {
    sizes['event'] = new Size((gameHeight-atWidth)/2,gameHeight)
    sizes['at'] = new Size(atWidth, gameHeight)
    await initGameActive(el, event, sizes)
  }
}

async function initGameActive(el, event, sizes) {
  let game = await addStack(el, 'horizontal', true, sizes.game)
  await buildGame(game,event,sizes)
  if (event.status === 'In Progress') {
        game.borderColor = new Color('#FFD700', .6)
        game.borderWidth = 1.5
        game.cornerRadius = 5
    }
}

async function initGameScheduled(el,event,sizes) {
  let game = await addStack(el, 'vertical', true, sizes.game)
  game.addSpacer()
  let gameInfo = await addStack(game,'horizontal',true,sizes.teams)
  await buildGame(gameInfo,event,sizes)
//   game.addSpacer(8)
  let gameSchedule = await addStack(game,'horizontal',false,sizes.schedule)
  await buildSchedule(gameSchedule, event,sizes)
  game.addSpacer()
}

async function initGameAlt(el, event) {
  let awayStack = await addStack(el,'vertical',true,eventSize)
awayStack.borderColor = new Color('#FFD700', .6)
//         awayStack.borderWidth = 1.5
//         awayStack.cornerRadius = 5
  awayStack.addSpacer()
  let top = await addStack(awayStack,'horizontal',true)
//    top.setPadding(3,3,3,3)
   top.addSpacer()
  await addText(top, event.awayStandings, 'small')
   top.addSpacer()
  awayStack.addSpacer(8)
  let mid = await addStack(awayStack,'horizontal',true)
  mid.addSpacer()
  await addImage(mid, await getLogo(event.awayTeam))
  mid.addSpacer()
  awayStack.addSpacer(8)
  let bottom = await addStack(awayStack,'horizontal',true)
  bottom.addSpacer()
  await addText(bottom, event.awayScore)
  bottom.addSpacer()
  awayStack.addSpacer()
  let atStack = await addStack(el, 'vertical',true,atSize)
atStack.borderColor = new Color('#FFD700', .6)
//         atStack.borderWidth = 1.5
//         atStack.cornerRadius = 5
  atStack.addSpacer()
  let atTop = await addStack(atStack,'horizontal',true)
  atTop.addSpacer()
//   await addText(atStack,' ')
  await addText(atTop,' ')
  atTop.addSpacer()
  atStack.addSpacer(15)
  
  let atMid = await addStack(atStack,'horizontal',true)
//   atMid.setPadding(5,5,5,5)
  atMid.addSpacer()
//   await addText(atStack,'@')
  await addText(atMid,'@')
  atMid.addSpacer()
  atStack.addSpacer(15)
  
  let atBot = await addStack(atStack,'horizontal',true)
//   atBot.setPadding(2, 2, 2, 2)
  atBot.addSpacer()
  
//   await addText(atStack,event.period)
  await addText(atBot,event.period,event.period)
  atBot.addSpacer()
  
  atStack.addSpacer()
  let homeStack = await addStack(el, 'vertical',true,eventSize)
  homeStack.addSpacer()
  let htop = await addStack(homeStack,'horizontal',true)
  htop.addSpacer()
  await addText(htop, event.homeStandings, 'small')
  htop.addSpacer()
  homeStack.addSpacer(8)
  let hmid = await addStack(homeStack,'horizontal',true)
  hmid.addSpacer()
  await addImage(hmid, await getLogo(event.homeTeam))
  hmid.addSpacer()
  homeStack.addSpacer(8)
  let hbottom = await addStack(homeStack,'horizontal',true)
  hbottom.addSpacer()
  await addText(hbottom, event.homeScore)
  hbottom.addSpacer()
  homeStack.addSpacer()
  if (event.status === 'In Progress') {
        el.borderColor = new Color('#FFD700', .6)
        el.borderWidth = 1.5
        el.cornerRadius = 5
    }
}

const test_games = [
    {
        status: 'Final',
        period: 'F',
        homeScore: "2",
        awayScore: "5",
        homeTeam: "https://www.thesportsdb.com/images/media/team/badge/littyt1554031623.png",
        awayTeam: "https://www.thesportsdb.com/images/media/team/badge/wsxtyw1432577334.png",
        homeStandings: "-2.0 | W1",
        awayStandings: "-1.5 | W2"
    },
    {
        status: 'In Progress',
        period: 'B8',
        homeScore: "3",
        awayScore: "0",
        homeTeam: "https://www.thesportsdb.com/images/media/team/badge/stpsus1425120215.png",
        awayTeam: "https://www.thesportsdb.com/images/media/team/badge/wqwwxx1423478766.png",
        homeStandings : "1 | Z",
        awayStandings : "-8.5 | -4.0"
    },
    {
        status: 'In Progress',
        period: "85",
        homeScore: "1",
        awayScore: "0",
        homeTeam: "https://www.thesportsdb.com/images/media/team/badge/yvwvtu1448813215.png",
        awayTeam: "https://www.thesportsdb.com/images/media/team/badge/uvxuqq1448813372.png",
        homeStandings: "1 (89)",
        awayStandings: "2 (87)"
    },
    {
        status: 'Scheduled',
        period: '8:05 PM',
        homeScore: "0",
        awayScore: "0",
        homeTeam: "https://www.thesportsdb.com/images/media/team/badge/miwigx1521893583.png",
        awayTeam: "https://www.thesportsdb.com/images/media/team/badge/qt9qki1521893151.png",
        homeStandings: "1st",
        awayStandings: "-10.5 | -12"
    },
    {
        status: 'In Progress',
        period: "4",
        homeScore: "109",
        awayScore: "95",
        homeTeam: "https://www.thesportsdb.com/images/media/team/badge/051sjd1537102179.png",
        awayTeam: "https://www.thesportsdb.com/images/media/team/badge/5v67x51547214763.png",
        homeStandings: "4 | -8.0",
        awayStandings: "6 | -10.5"
    },
    {
        status: 'Scheduled',
        period: "7/28",
        homeScore: "0",
        awayScore: "0",
        homeTeam: "https://www.thesportsdb.com/images/media/team/badge/051sjd1537102179.png",
        awayTeam: "https://www.thesportsdb.com/images/media/team/badge/5v67x51547214763.png",
        homeStandings: "4th | -8.0",
        awayStandings: "6th | -10.5"
    },
    {
        status: 'Scheduled',
        period: "8/2",
        homeScore: "0",
        awayScore: "0",
        homeTeam: "https://www.thesportsdb.com/images/media/team/badge/051sjd1537102179.png",
        awayTeam: "https://www.thesportsdb.com/images/media/team/badge/5v67x51547214763.png",
        homeStandings: "4th | -8.0",
        awayStandings: "6th | -10.5"
    },
    {
        status: 'Scheduled',
        period: "8/5",
        homeScore: "0",
        awayScore: "0",
        homeTeam: "https://www.thesportsdb.com/images/media/team/badge/051sjd1537102179.png",
        awayTeam: "https://www.thesportsdb.com/images/media/team/badge/5v67x51547214763.png",
        homeStandings: "4th | -8.0",
        awayStandings: "6th | -10.5"
    },
    {
        status: 'Scheduled',
        period: "10/30",
        homeScore: "0",
        awayScore: "0",
        homeTeam: "https://www.thesportsdb.com/images/media/team/badge/051sjd1537102179.png",
        awayTeam: "https://www.thesportsdb.com/images/media/team/badge/5v67x51547214763.png",
        homeStandings: "4th | -8.0",
        awayStandings: "6th | -10.5"
    }
]


async function createScoreboardAlt(games) {
  let scoreboard = await initWidget()
  scoreboard.addSpacer()
  let plan = widgetFramework[widgetSize]
  let r = 1
  for (let g = 0; g < plan.max_games; g++) {
    if (r <= plan.rows && g%2 == 0) {
      newRow = await addStack(scoreboard,'horizontal',true)
      newRow.addSpacer()
    }
    await renderGame(newRow, games[g])
    newRow.addSpacer()
    if (g%2 == 1) {
      r++
      scoreboard.addSpacer()
    }
  }
  return scoreboard
}

async function createScoreBoard (games) {
    let scoreboard = await initWidget()
    if (widgetSize == 'small') {
        await initGame(scoreboard, games[0])
    } else {
        let s = await addStack(scoreboard,'horizontal', true)
         s.addSpacer()
        await initGameAlt(await addStack(s, 'horizontal', true, gameSize), games[0])
        s.addSpacer()
        await initGameAlt(await addStack(s, 'horizontal', true, gameSize), games[1])
        s.addSpacer()
        if (widgetSize == 'large') {
            scoreboard.addSpacer(10)
            let s2 = await addStack(scoreboard, 'horizontal', true)
            s2.addSpacer()
            await initGameAlt(await addStack(s2, 'horizontal', true, gameSize), games[2])
            s2.addSpacer()
            await initGameAlt(await addStack(s2, 'horizontal', true, gameSize), games[3])
            s2.addSpacer()
            scoreboard.addSpacer(10)
//             let s3 = await addStack(scoreboard, 'horizontal', true)
//             s3.addSpacer()
//             await initGame(await addStack(s3, 'vertical', true, new Size(120,90)), games[4])
//             s3.addSpacer()
//             await initGame(await addStack(s3, 'vertical', true, new Size(120,90)), games[5])
//             s3.addSpacer()
        }
    }
    return scoreboard
}

const widgetSize = 'large'
const fm = FileManager.iCloud()
const backgrounds_path = fm.joinPath(fm.documentsDirectory(),'backgrounds')
const background_file_name = widgetSize+'_top_clear'// 
// const DARK_MODE = Device.isUsingDarkAppearance()
const DARK_MODE = true
 //config.widgetFamily || 'medium'
const defaultTextSize = 15
const defaultColor = new Color(DARK_MODE ? '#ffffff' : '#000000', 1)
const logoSize = 42
const gameHeight = 150
const atWidth = 34
const scheduleHeight = 44
const spacing = { normal: 8, smaller: 6, vs: 5, widget: 10}
const widgetFramework = {
  small : {
    max_games : 1,
    rows : 1
  },
  medium : {
    max_games : 2,
    rows : 1
  },
  large : {
    max_games : 4,
    rows : 2,
  }
}
const board = await createScoreboardAlt(test_games)
Script.setWidget(board)
Script.complete()

if (widgetSize == 'small') {
  await board.presentSmall()
} else if (widgetSize == 'medium') {
  await board.presentMedium()
} else if (widgetSize == 'large') {
  await board.presentLarge()
} else {
  console.log('Invalid size parameter')
}