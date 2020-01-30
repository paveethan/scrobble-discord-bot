var rp = require('request-promise');
const Database = require('better-sqlite3');
const db = new Database('./db/lastfm.db', {
    verbose: console.log()
});
const Discord = require("discord.js");
const botconfig = require("../botconfig.json");


module.exports = {
	name: 'np',
	description: 'Get users most recent track from lastfm!',
	execute(message, args) {
    let userId = message.author.id;
    var username;
      try {
        const stmt = db.prepare(`SELECT lastFM from lastfm where userId = ?`);
        const info = stmt.get(userId);
        username = info.lastFM;
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
        .catch(function(err){
          message.channel.send("Couldn't retrieve your last track!")
        });
      }
      catch (error) {
        console.log(error);
    }
	},
};
