// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: brown; icon-glyph: magic;
// config file schema
  {
 favorites : [],
 leagues : [],
 backgroundType : string, //image, gradient, color
 useAltInDarkMode : bool,
 backgroundTypeAlt : string,
 backgroundImage : image path
 backgroundImageAlt : image path
 widgetSize : string //med, large
 widgetLocatiom : string //top, bottom, middle,
 icloudUsed : bool,
 inProgressFirst: bool,
 highlightInProgress: bool,
 InProgressColor: string //
}

// rivals file schema
// look up once per day (4am eastern)
// defines what teams are needed in schedule call
{
  mlb : {
    updateDate : date,
    teams : [
    {teamId : bigint,
     mainStanding : string,
     secondaryStanding : string //wildcard
    ]
  }
}

// games file schema
// check if current date is after start date
// if yes, hit api for in progress
{
  mlb : [
    {gameid : bigint,
     status : string,
     period : string,
     homeTeam : image,
     awayTeam : image,
     homeStanding : string,
     awayStanding : string,
     homescore : string,
     awayscore : string,
     gameStartDate : date
  }
  ]
}

// modules per league
// downloaded at initial setup