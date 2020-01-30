var rp = require('request-promise');
const Database = require('better-sqlite3');
const db = new Database('./db/lastfm.db', {
    verbose: console.log()
});
const Discord = require("discord.js");
const botconfig = require("../botconfig.json");


module.exports = {
	name: 'tracks',
	description: 'Get 10 most played tracks lastfm!',
	execute(message, args) {
    let userId = message.author.id;
    try {
        const stmt = db.prepare('SELECT lastFM from lastFM WHERE userId = ?');
        const info = stmt.get(userId);
        var username = info.lastFM;
        var url = "http://ws.audioscrobbler.com/2.0/?method=user.gettoptracks&user=" + username + "&api_key=" + botconfig.apiKey + "&format=json&limit=10";
        var period = '';
        var title = "'s Top Tracks (Overall)";
        if (args[0] == undefined) {
            period = '';
            title = "'s Top Tracks (Overall)";
        } else if (args[0] == `w`) {
            period = "&period=7day";
            title = "'s Top Tracks (Weekly)";
        } else if (args[0] == "1m") {
            period = "&period=1month";
            title = "'s Top Tracks (Last Month)";
        } else if (args[0] == "3m") {
            period = "&period=3month";
            title = "'s Top Tracks (Last 3 Months)";
        } else if (args[0] == "6m") {
            period = "&period=6month";
            title = "'s Top Tracks (Last 6 Months)";
        } else if (args[0] == "12m" || args[0] == `y`) {
            period = "&period=12month";
            title = "'s Top Tracks (Last Year)";
        }
        var options = {
            uri: url + period,
            json: true
        };
        rp(options)
            .then(function(tracks) {
                message.channel.send({
                    embed: {
                        color: 0x00AE86,
                        title: username + title,
                        url: "https://www.last.fm/user/"+username,
                        thumbnail: {
                            url: message.author.avatarURL
                        },
                        fields: [{
                            name: "Tracks: ",
                            value:
                                "1. " + "["+tracks.toptracks.track[0].name+"]("+tracks.toptracks.track[0].url+")" + " by " +tracks.toptracks.track[0].artist.name+ " (" + tracks.toptracks.track[0].playcount + " plays)\n" +
                                "2. " + "["+tracks.toptracks.track[1].name+"]("+tracks.toptracks.track[1].url+")" + " by " +tracks.toptracks.track[1].artist.name+ " (" + tracks.toptracks.track[1].playcount + " plays)\n" +
                                "3. " + "["+tracks.toptracks.track[2].name+"]("+tracks.toptracks.track[2].url+")" + " by " +tracks.toptracks.track[2].artist.name+ " (" + tracks.toptracks.track[2].playcount + " plays)\n" +
                                "4. " + "["+tracks.toptracks.track[3].name+"]("+tracks.toptracks.track[3].url+")" + " by " +tracks.toptracks.track[3].artist.name+ " (" + tracks.toptracks.track[3].playcount + " plays)\n" +
                                "5. " + "["+tracks.toptracks.track[4].name+"]("+tracks.toptracks.track[4].url+")" + " by " +tracks.toptracks.track[4].artist.name+ " (" + tracks.toptracks.track[4].playcount + " plays)\n" +
                                "6. " + "["+tracks.toptracks.track[5].name+"]("+tracks.toptracks.track[5].url+")" + " by " +tracks.toptracks.track[5].artist.name+ " (" + tracks.toptracks.track[5].playcount + " plays)\n" +
                                "7. " + "["+tracks.toptracks.track[6].name+"]("+tracks.toptracks.track[6].url+")" + " by " +tracks.toptracks.track[6].artist.name+ " (" + tracks.toptracks.track[6].playcount + " plays)\n" +
                                "8. " + "["+tracks.toptracks.track[7].name+"]("+tracks.toptracks.track[7].url+")" + " by " +tracks.toptracks.track[7].artist.name+ " (" + tracks.toptracks.track[7].playcount + " plays)\n" +
                                "9. " + "["+tracks.toptracks.track[8].name+"]("+tracks.toptracks.track[8].url+")" + " by " +tracks.toptracks.track[8].artist.name+ " (" + tracks.toptracks.track[8].playcount + " plays)\n" +
                                "10. "+ "["+tracks.toptracks.track[9].name+"]("+tracks.toptracks.track[9].url+")" + " by " +tracks.toptracks.track[9].artist.name+ " (" + tracks.toptracks.track[9].playcount + " plays)\n"
                        }],
                        timestamp: new Date(),
                        footer: {
                            text: tracks.toptracks['@attr'].total + " total scrobbles"
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
        message.channel.send("You did not set your LastFM!");
    }
	},
};
