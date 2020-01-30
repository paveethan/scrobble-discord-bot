var rp = require('request-promise');
const Database = require('better-sqlite3');
const db = new Database('./db/lastfm.db', {
    verbose: console.log()
});
const Discord = require("discord.js");
const botconfig = require("../botconfig.json");
const {
    google
} = require('googleapis');
const youtube = google.youtube({
    version: 'v3',
    auth: botconfig.youtubeApi
});

module.exports = {
	name: 'yt',
	description: 'Get a youtube video/song',
	execute(message, args) {
    if (args[0] == undefined) {
        message.channel.send("You didn't provide anything to search!");
    } else {
        var query = args.join(' ');
        console.log(query);
        var result = youtube.search.list({
                part: 'id,snippet',
                q: query,
                maxResults: 1
            }).then(res => {
                var title = res.data.items[0].snippet.title;
                var url = "https://youtu.be/" + res.data.items[0].id.videoId;
                var msg = title + "\n" + url;
                message.channel.send(msg);
            })
            .catch(error => {
                message.channel.send("Couldn't find that on YouTube!");
                console.error(error);
            });
    }
	},
};
