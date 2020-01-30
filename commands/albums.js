var rp = require('request-promise');
const Database = require('better-sqlite3');
const db = new Database('./db/lastfm.db', {
    verbose: console.log()
});
const Discord = require("discord.js");
const botconfig = require("../botconfig.json");


module.exports = {
	name: 'albums',
	description: 'Get 10 most played albums info lastfm!',
	execute(message, args) {
    let userId = message.author.id;
    try {
        const stmt = db.prepare('SELECT lastFM from lastFM WHERE userId = ?');
        const info = stmt.get(userId);
        var username = info.lastFM;
        var url = "http://ws.audioscrobbler.com/2.0/?method=user.gettopalbums&user=" + username + "&api_key=" + botconfig.apiKey + "&format=json&limit=10";
        var period = '';
        var title = "'s Top Albums (Overall)";
        if (args[0] == undefined) {
            period = '';
            title = "'s Top Albums (Overall)";
        } else if (args[0] == `w`) {
            period = "&period=7day";
            title = "'s Top Albums (Weekly)";
        } else if (args[0] == "1m") {
            period = "&period=1month";
            title = "'s Top Albums (Last Month)";
        } else if (args[0] == "3m") {
            period = "&period=3month";
            title = "'s Top Albums (Last 3 Months)";
        } else if (args[0] == "6m") {
            period = "&period=6month";
            title = "'s Top Albums (Last 6 Months)";
        } else if (args[0] == "12m" || args[0] == `y`) {
            period = "&period=12month";
            title = "'s Top Albums (Last Year)";
        }
        var options = {
            uri: url + period,
            json: true
        };
        rp(options)
            .then(function(albums) {
                message.channel.send({
                    embed: {
                        color: 0x00AE86,
                        title: username + title,
                        url: "https://www.last.fm/user/"+username,
                        thumbnail: {
                            url: message.author.avatarURL
                        },
                        fields: [{
                            name: "Albums: ",
                            value:
                                "1. " + "["+albums.topalbums.album[0].name+"]("+albums.topalbums.album[0].url+")" + " by " + albums.topalbums.album[0].artist.name + " (" + albums.topalbums.album[0].playcount + ")\n" +
                                "2. " + "["+albums.topalbums.album[1].name+"]("+albums.topalbums.album[1].url+")" + " by " + albums.topalbums.album[1].artist.name + " (" + albums.topalbums.album[1].playcount + ")\n" +
                                "3. " + "["+albums.topalbums.album[2].name+"]("+albums.topalbums.album[2].url+")" + " by " + albums.topalbums.album[2].artist.name + " (" + albums.topalbums.album[2].playcount + ")\n" +
                                "4. " + "["+albums.topalbums.album[3].name+"]("+albums.topalbums.album[3].url+")" + " by " + albums.topalbums.album[3].artist.name + " (" + albums.topalbums.album[3].playcount + ")\n" +
                                "5. " + "["+albums.topalbums.album[4].name+"]("+albums.topalbums.album[4].url+")" + " by " + albums.topalbums.album[4].artist.name + " (" + albums.topalbums.album[4].playcount + ")\n" +
                                "6. " + "["+albums.topalbums.album[5].name+"]("+albums.topalbums.album[5].url+")" + " by " + albums.topalbums.album[5].artist.name + " (" + albums.topalbums.album[5].playcount + ")\n" +
                                "7. " + "["+albums.topalbums.album[6].name+"]("+albums.topalbums.album[6].url+")" + " by " + albums.topalbums.album[6].artist.name + " (" + albums.topalbums.album[6].playcount + ")\n" +
                                "8. " + "["+albums.topalbums.album[7].name+"]("+albums.topalbums.album[7].url+")" + " by " + albums.topalbums.album[7].artist.name + " (" + albums.topalbums.album[7].playcount + ")\n" +
                                "9. " + "["+albums.topalbums.album[8].name+"]("+albums.topalbums.album[8].url+")" + " by " + albums.topalbums.album[8].artist.name + " (" + albums.topalbums.album[8].playcount + ")\n" +
                                "10. "+ "["+albums.topalbums.album[9].name+"]("+albums.topalbums.album[9].url+")" + " by " + albums.topalbums.album[9].artist.name + " (" + albums.topalbums.album[9].playcount + ")\n"
                        }],
                        timestamp: new Date(),
                        footer: {
                            text: albums.topalbums['@attr'].total + " total scrobbles"
                        }
                    }
                  })
                  .then(async function (message){
                  await message.react("👍");
                  await message.react("👎");
                  });
            })
            .catch(function(err) {
                console.log("Unable to get album info \n" + err);
            })
            .finally(function() {
            });
    } catch (error) {
        console.log(error);
        message.channel.send("You did not set an username! Set your LastFM username by doing ,set username!");
    }
	},
};
