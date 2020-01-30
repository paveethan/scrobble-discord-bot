var rp = require('request-promise');
const Database = require('better-sqlite3');
const db = new Database('./db/lastfm.db', {
    verbose: console.log()
});
const Discord = require("discord.js");
const botconfig = require("../botconfig.json");


module.exports = {
	name: 'set',
	description: 'Set the users lastfm!',
	execute(message, args) {
    let userId = message.author.id;
    if (args.length == 0){
      message.channel.send("You did not specify a username!");
    }
    else {
      var username = args[0].toLowerCase().trim();
      try {
        const stmt = db.prepare(`INSERT INTO lastfm (userId,lastFM) VALUES (?, ?)`);
        const info = stmt.run(userId, username);
        var options = {
            uri: "http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user="+username+"&api_key="+botconfig.apiKey+"&format=json&extended=1",
            headers: {
                'Connection': 'keep-alive',
                'Accept-Encoding': '',
                'Accept-Language': 'en-US,en;q=0.8',
            },
            json: true
        };
        rp(options)
        .then(function(lastfm) {
          var regex = /' '/gi;
          var trackName = lastfm.recenttracks.track[0].name.replace(/ /g,"+");
          var artistName = lastfm.recenttracks.track[0].artist.name.replace(' ', '+');
          var trackURL = "http://ws.audioscrobbler.com/2.0/?method=track.getInfo&username="+username+"&api_key="+botconfig.apiKey+"&artist="+artistName+"&track="+trackName+"&format=json&autocorrect=1";
          var options2 = {
              uri: trackURL,
              headers: {
                  'Connection': 'keep-alive',
                  'Accept-Encoding': '',
                  'Accept-Language': 'en-US,en;q=0.8',
              },
              json: true
          };
          rp(options2)
          .then(function(track) {
            try {
              var playCount = '?';
              if (track.track.userplaycount != undefined) {
                playCount = track.track.userplaycount;
              }
            } catch (error) {
              playCount = '?';
            }
            message.channel.send({
              embed: {
                color: 0x00AE86,
                title: username + "'s Last.FM",
                url: "https://www.last.fm/user/"+username,
                thumbnail: {
                  url: lastfm.recenttracks.track[0].image[2]['#text']
                },
                fields: [{
                  name: "Current Song:",
                  value: "["+lastfm.recenttracks.track[0].name+"]("+lastfm.recenttracks.track[0].url+")",
                  inline: true
                },
                {
                  name: "Current Artist:",
                  value: "["+lastfm.recenttracks.track[0].artist.name+"]("+lastfm.recenttracks.track[0].artist.url+")",
                  inline: true
                }
                ],
                timestamp: new Date(),
                footer: {
                text: playCount + " scrobbles | " + lastfm.recenttracks['@attr'].total + " total scrobbles"
                }
              }
            }).then(async function (message){
            await message.react("👍");
            await message.react("👎");
            });

          })
          .catch(function(err) {
              console.log(err);
          });
        })
        .catch(function(err) {
          try{
              message.channel.send(err.error.message+"!");
          }
          catch{
            message.channel.send("Set your LastFm succesfully!");
          }
        });
      }
      catch (error) {
          if (error.code == "SQLITE_CONSTRAINT_PRIMARYKEY") {
            const stmt = db.prepare(`UPDATE lastfm SET lastFM = ? WHERE userId = ?`);
            const info = stmt.run(username,userId);
            var options = {
                uri: "http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user="+username+"&api_key="+botconfig.apiKey+"&format=json&extended=1",
                headers: {
                    'Connection': 'keep-alive',
                    'Accept-Encoding': '',
                    'Accept-Language': 'en-US,en;q=0.8',
                },
                json: true
            };
            rp(options)
            .then(function(lastfm) {
              var regex = /' '/gi;
              var trackName = lastfm.recenttracks.track[0].name.replace(/ /g,"+");
              var artistName = lastfm.recenttracks.track[0].artist.name.replace(' ', '+');
              var trackURL = "http://ws.audioscrobbler.com/2.0/?method=track.getInfo&username="+username+"&api_key="+botconfig.apiKey+"&artist="+artistName+"&track="+trackName+"&format=json&autocorrect=1";
              var options2 = {
                  uri: trackURL,
                  headers: {
                      'Connection': 'keep-alive',
                      'Accept-Encoding': '',
                      'Accept-Language': 'en-US,en;q=0.8',
                  },
                  json: true
              };
              rp(options2)
              .then(function(track) {
                try {
                  var playCount = '?';
                  if (track.track.userplaycount != undefined) {
                    playCount = track.track.userplaycount;
                  }
                } catch (error) {
                  playCount = '?';
                }
                message.channel.send({
                  embed: {
                    color: 0x00AE86,
                    title: username + "'s Last.FM",
                    url: "https://www.last.fm/user/"+username,
                    thumbnail: {
                      url: lastfm.recenttracks.track[0].image[2]['#text']
                    },
                    fields: [{
                      name: "Current Song:",
                      value: "["+lastfm.recenttracks.track[0].name+"]("+lastfm.recenttracks.track[0].url+")",
                      inline: true
                    },
                    {
                      name: "Current Artist:",
                      value: "["+lastfm.recenttracks.track[0].artist.name+"]("+lastfm.recenttracks.track[0].artist.url+")",
                      inline: true
                    }
                    ],
                    timestamp: new Date(),
                    footer: {
                    text: playCount + " scrobbles | " + lastfm.recenttracks['@attr'].total + " total scrobbles"
                    }
                  }
                }).then(async function (message){
                await message.react("👍");
                await message.react("👎");
                });

              })
              .catch(function(err) {
                  console.log(err);
              });
            })
            .catch(function(err) {
              try{
                  message.channel.send(err.error.message+"!");
              }
              catch{
                message.channel.send("Set your LastFm succesfully!");
              }
            });
          } else {
              console.log(error);
              message.channel.send("Something went wrong! Please try again later!");
          }
    }
  }
	},
};
