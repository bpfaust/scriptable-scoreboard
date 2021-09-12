// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-green; icon-glyph: magic;
// Get Team ID from https://www.thesportsdb.com and add it as widget parameter

const TEAM_ID = args.widgetParameter || 135252
const DARK_MODE = true
const widgetSize = config.widgetFamily || 'small'
const textSize = 9.5
const logoSize = 38
const logoSmallSize = 22
const spacing = { normal: 8, smaller: 6, vs: 5, widget: 10 }

console.log(TEAM_ID)

const fetchData = async (url, type = 'loadJSON') => {
  const request = new Request(url)
  const res = await request[type]()
  return res
}

const getTeamData = async id => {
  const url = 'https://www.thesportsdb.com/api/v1/json/1/lookupteam.php?id='
  const teamUrl = url + id
  let fullData = await fetchData(teamUrl);
  console.log(fullData);
  const data = fullData.teams[0]
  return {
    image: await fetchData(`${data.strTeamBadge}/preview`, 'loadImage'),
    stadium: data.strStadium
  }
}

const getTeamEvents = async () => {
  const url = 'https://www.thesportsdb.com/api/v1/json/1/eventsnext.php?id='
  const data = await fetchData(url + TEAM_ID)
  return data.events
}

const getUpcomingEventData = async event => {
  const home = await getTeamData(event.idHomeTeam)
  const away = await getTeamData(event.idAwayTeam)
  return {
    competition: event.strLeague,
    homeLogo: home.image,
    awayLogo: away.image,
    homeTeam: event.strHomeTeam,
    awayTeam: event.strAwayTeam,
    date: event.strTimestamp,
    stadium: home.stadium,
  }
}

const getRestEventsData = async events => {
  const output = []
  for (const event of events) {
    const isHomeTeam = event.idHomeTeam ==TEAM_ID
    const team = await getTeamData(event[isHomeTeam ? 'idAwayTeam' : 'idHomeTeam'])
    output.push({
      competition: event.strLeague,
      logo: team.image,
      team: event[isHomeTeam ? 'strAwayTeam' : 'strHomeTeam'],
      date: event.strTimestamp,
      stadium: 'stadium',
      text: isHomeTeam ? 'vs' : 'at',
    })
  }
  return output
}

const getFormattedDate = (timestamp, useToday = true) => {
  const millisPerDay = 24 * 60 * 60 * 1000
  const formats = [
    "MMM d, yyyy 'at' h:mm a",
    "'Tomorrow at' h:mm a",
    "'Today at' h:mm a",
  ]
  const date = new Date(timestamp)
  const matchDay = (new Date(date)).setHours(0, 0, 0, 0)
  const today = (new Date()).setHours(0, 0, 0, 0)
  const diff = (matchDay - today) / millisPerDay
  const format = useToday ? (diff < 1 ? 2 : diff < 2 ? 1 : 0) : 0
  const dateFormatter = new DateFormatter()
  dateFormatter.dateFormat = formats[format]
  return dateFormatter.string(date)
}

const addText = (el, string, type) => {
  const text = el.addText(string)
  text.font = type === 'bold' ?
    Font.boldSystemFont(textSize * 1.2) :
    Font.regularSystemFont(textSize)
  text.textColor = new Color(DARK_MODE ? '#ffffff' : '#000000', 1)
  text.lineLimit = 1
  text.textOpacity = type === 'small' ? 0.5 : 1
  text.centerAlignText()
}

const addImage = (el, src, size = logoSize) => {
  const image = el.addImage(src)
  image.imageSize = new Size(size, size)
}

const addSpacer = (el, type) => {
  el.addSpacer(spacing[type])
}

const addStack = (el, type = 'horizontal', centered = false, size) => {
  const stack = el.addStack()
  if (type === 'vertical') stack.layoutVertically()
  else stack.layoutHorizontally()
  if (centered) stack.centerAlignContent()
  if (size) stack.size = size
  return stack
}

const addLogos = (el, homeLogo, awayLogo) => {
  const s = addStack(el, 'horizontal', true)
  addSpacer(s)
  addImage(s, homeLogo)
  addSpacer(s, 'vs')
  addText(s, 'vs')
  addSpacer(s, 'vs')
  addImage(s, awayLogo)
  addSpacer(s)
}

const initWidget = () => {
  const w = new ListWidget()
  w.backgroundColor = new Color(DARK_MODE ? '#1B1B1B' : '#FFFFFF', 1)
  w.setPadding(
    spacing.widget, spacing.widget,
    spacing.widget, spacing.widget,
  )
  return w
}

const addCenteredText = (el, text, type) => {
  const s = addStack(el, 'horizontal', true)
  addSpacer(s)
  addText(s, text, type)
  addSpacer(s)
}

const initUpcomingEvent = (el, event) => {
  addSpacer(el)
  addCenteredText(el, event.competition)
  addSpacer(el, 'normal')
  addLogos(el, event.homeLogo, event.awayLogo)
  addSpacer(el, 'normal')
  addCenteredText(el, event.homeTeam.toUpperCase(), 'bold')
  addCenteredText(el, event.awayTeam.toUpperCase(), 'bold')
  addSpacer(el, 'smaller')
  addCenteredText(el, getFormattedDate(event.date))
  addCenteredText(el, event.stadium)
  addSpacer(el)
}

const initRestEvents = (el, events) => {
  events.forEach((data, idx) => {
    const hs = addStack(el, 'horizontal', true)
    addText(hs, data.text, 'small')
    addSpacer(hs, 'vs')
    addImage(hs, data.logo, logoSmallSize)
    addSpacer(hs, 'vs')
    const vs = addStack(hs, 'vertical')
    addText(vs, data.team.toUpperCase(), 'bold')
    addText(vs, getFormattedDate(data.date, false), 'small')
    if (idx < 3) addSpacer(el, 'small')
  })
}

const createNextMatchWidget = async () => {
  const events = await getTeamEvents()
  const widget = initWidget()
  if (widgetSize === 'small') {
    const upcomingEventData = await getUpcomingEventData(events[0])
    initUpcomingEvent(widget, upcomingEventData)
  } else if (widgetSize === 'medium') {
    const upcomingEventData = await getUpcomingEventData(events[0])
    const restEventData = await getRestEventsData(events.slice(1, 5))
    const s = addStack(widget, 'horizontal', true)
    initUpcomingEvent(addStack(s, 'vertical', true, new Size(130, 135)), upcomingEventData)
    addSpacer(s, 'normal')
    initRestEvents(addStack(s, 'vertical', true, new Size(160, 135)), restEventData)
  }
  return widget
}

const widget = await createNextMatchWidget()
Script.setWidget(widget)
Script.complete()
await widget.presentMedium()