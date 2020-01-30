var rp = require('request-promise');
const Database = require('better-sqlite3');
const db = new Database('./db/lastfm.db', {
    verbose: console.log()
});
const Discord = require("discord.js");
const botconfig = require("../botconfig.json");
var SpotifyWebApi = require('spotify-web-api-node');
var spotifyApi = new SpotifyWebApi({
    clientId: botconfig.spotifyClientId,
    clientSecret: botconfig.spotifyClientSecret
});

module.exports = {
	name: 'spotify',
	description: 'Get a song URL from spotify',
	execute(message, args) {
    if (args[0] == undefined) {
        message.channel.send("You didn't provide anything to search!");
    } else {
        spotifyApi.clientCredentialsGrant().then(
            function(data) {
                // Save the access token so that it's used in future calls
                spotifyApi.setAccessToken(data.body['access_token']);
                var query = args.join(' ');
                spotifyApi.searchTracks(query)
                    .then(function(data) {
                        try{
                          message.channel.send(data.body.tracks.items[0].external_urls.spotify);
                        }
                        catch{
                          message.channel.send("Couldn't find that song on Spotify!");
                        }
                    }, function(err) {
                        message.channel.send("Couldn't find that song on Spotify!");
                        console.error(err);
                    });
            },
            function(err) {
                console.log('Something went wrong when retrieving an access token', err);
            }
        );
    }
	},
};
