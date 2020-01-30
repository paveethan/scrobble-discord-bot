const botconfig = require("./botconfig.json");
const Discord = require("discord.js");
var rp = require('request-promise');
const Database = require('better-sqlite3');
const fs = require('fs');
const db = new Database('./db/lastfm.db', {
    verbose: console.log()
});
const {
    google
} = require('googleapis');
var SpotifyWebApi = require('spotify-web-api-node');
var spotifyApi = new SpotifyWebApi({
    clientId: botconfig.spotifyClientId,
    clientSecret: botconfig.spotifyClientSecret
});
const youtube = google.youtube({
    version: 'v3',
    auth: botconfig.youtubeApi
});
const bot = new Discord.Client({
    disableEveryone: true
});
bot.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	bot.commands.set(command.name, command);
}


bot.on("ready", async () => {
    console.log(`${bot.user.username} is online!`);
    let guilds = bot.guilds.array();
    db.exec(`CREATE TABLE IF NOT EXISTS lastfm (
      userId PRIMARY KEY,
      lastFM NOT NULL
      );`);
   db.pragma('journal_mode = WAL');
});


bot.on('error', err => {
    console.error(err);
    process.exit(1);
});

bot.on('message', async message => {
    const prefixes = botconfig.prefixes;
    let prefix = false;
    for(const thisPrefix of prefixes) {
      if(message.content.startsWith(thisPrefix)) prefix = thisPrefix;
    }
    if(!prefix) return;

    const args = message.content.slice(prefix.length).split(/ +/);
  	const command = args.shift().toLowerCase();
  	if (!bot.commands.has(command)) return;
    if (!message.content.startsWith(prefix) || message.author.bot) return;
  	try {
  		bot.commands.get(command).execute(message, args);
  	} catch (error) {
  		console.error(error);
  		message.reply('An error has occured!');
  	}
});

bot.login(botconfig.token);
