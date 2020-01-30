var rp = require('request-promise');
const Database = require('better-sqlite3');
const db = new Database('./db/lastfm.db', {
    verbose: console.log()
});
const Discord = require("discord.js");
const botconfig = require("../botconfig.json");


module.exports = {
	name: 'artists',
	description: 'Get 10 most played artists info lastfm!',
	execute(message, args) {
    let userId = message.author.id;
    try {
        const stmt = db.prepare('SELECT lastFM from lastFM WHERE userId = ?');
        const info = stmt.get(userId);
        var username = info.lastFM;
        var url = "http://ws.audioscrobbler.com/2.0/?method=user.gettopartists&user=" + username + "&api_key=" + botconfig.apiKey + "&format=json&limit=10";
        var period = '';
        var title = "'s Top Artists (Overall)";
        if (args[0] == undefined) {
            period = '';
            title = "'s Top Artists (Overall)";
        } else if (args[0] == `w`) {
            period = "&period=7day";
            title = "'s Top Artists (Weekly)";
        } else if (args[0] == "1m") {
            period = "&period=1month";
            title = "'s Top Artists (Last Month)";
        } else if (args[0] == "3m") {
            period = "&period=3month";
            title = "'s Top Artists (Last 3 Months)";
        } else if (args[0] == "6m") {
            period = "&period=6month";
            title = "'s Top Artists (Last 6 Months)";
        } else if (args[0] == "12m" || args[0] == `y`) {
            period = "&period=12month";
            title = "'s Top Artists (Last Year)";
        }
        var options = {
            uri: url + period,
            json: true
        };
        rp(options)
            .then(function(artists) {
                message.channel.send({
                    embed: {
                        color: 0x00AE86,
                        title: username + title,
                        url: "https://www.last.fm/user/"+username,
                        thumbnail: {
                            url: message.author.avatarURL
                        },
                        fields: [{
                            name: "Artists: ",
                            value:
                                "1. " + "["+artists.topartists.artist[0].name+"]("+artists.topartists.artist[0].url+")"+" ("+artists.topartists.artist[0].playcount+" plays)\n"+
                                "2. " + "["+artists.topartists.artist[1].name+"]("+artists.topartists.artist[1].url+")"+" ("+artists.topartists.artist[1].playcount+" plays)\n"+
                                "3. " + "["+artists.topartists.artist[2].name+"]("+artists.topartists.artist[2].url+")"+" ("+artists.topartists.artist[2].playcount+" plays)\n"+
                                "4. " + "["+artists.topartists.artist[3].name+"]("+artists.topartists.artist[3].url+")"+" ("+artists.topartists.artist[3].playcount+" plays)\n"+
                                "5. " + "["+artists.topartists.artist[4].name+"]("+artists.topartists.artist[4].url+")"+" ("+artists.topartists.artist[4].playcount+" plays)\n"+
                                "6. " + "["+artists.topartists.artist[5].name+"]("+artists.topartists.artist[5].url+")"+" ("+artists.topartists.artist[5].playcount+" plays)\n"+
                                "7. " + "["+artists.topartists.artist[6].name+"]("+artists.topartists.artist[6].url+")"+" ("+artists.topartists.artist[6].playcount+" plays)\n"+
                                "8. " + "["+artists.topartists.artist[7].name+"]("+artists.topartists.artist[7].url+")"+" ("+artists.topartists.artist[7].playcount+" plays)\n"+
                                "9. " + "["+artists.topartists.artist[8].name+"]("+artists.topartists.artist[8].url+")"+" ("+artists.topartists.artist[8].playcount+" plays)\n"+
                                "10. "+ "["+artists.topartists.artist[9].name+"]("+artists.topartists.artist[9].url+")"+" ("+artists.topartists.artist[9].playcount+" plays)\n"
                        }],
                        timestamp: new Date(),
                        footer: {
                            text: artists.topartists['@attr'].total + " total scrobbles"
                        }
                    }
                  })
                  .then(async function (message){
                  await message.react("👍");
                  await message.react("👎");
                  });
            })
            .catch(function(err) {
                console.log("Unable to get artist info \n" + err);
            })
            .finally(function() {
            });
    } catch (error) {
        console.log(error);
        message.channel.send("You did not set your LastFM!");
    }
	},
};
