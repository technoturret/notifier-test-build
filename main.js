if (process.version.slice(1).split(".")[0] < 8) throw new Error("Node 8.0.0 or higher is required. Update Node on your system.");

// Discord
const Discord = require("discord.js");

// Client
const client = new Discord.Client()

// Datastoring
const redis = require('redis')
const asyncredis = require('async-redis')

// Other
const {promisify} = require("util");
const util = require("util")
const readdir = promisify(require("fs").readdir);
const Enmap = require("enmap");
const bodyParser = require('body-parser')
const express = require("express");
const http = require('request')

const config = require('./config.js')

var app = express();
var rediscli = redis.createClient({url: process.env.REDIS_URL})
client.redisClient = rediscli

asyncredis.decorate(client.redisClient)


client.logger = require("./util/Logger");
client.config = config
client.commands = new Enmap()
client.aliases = new Enmap()

var prefix = "$"


require("./modules/functions.js")(client)

// Function for generating coolio IDs
function genID() { 
  var d = new Date().getTime();
  var d2 = d
  if (typeof d2 !== 'undefined' && typeof d2.now === 'function'){
      d += performance.now(); 
  }
  return 'ID-xxxxx-xxxxx-4xxx4-yxxxx-xxxxx'.replace(/[xy]/g, function (c) {
      var r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

// Ready event to load sources
client.on("ready", async () => {
  // await client.wait(2500)
  console.log("The client is ready and has loaded.")
  let sourceChannel = client.channels.get(config.sourceChannel)
  let log = client.channels.get(config.approvedChat)
  if (!sourceChannel) {
    log.send("There was an error receiving the data to begin the notifiers.\nContact <@240639333567168512> ASAP.")
  } else {
    log.send("The notifier is initializing.")
    sourceChannel.fetchMessage(config.sourceMessage).then(message => {
      try {
        let output = eval(message.content)
        if (output._repeat) {
          log.send("Limited notifier up.")
        } else {
          log.send("An error has occurred within the source code.\nContact <@240639333567168512> ASAP. (Limited notifier)")
        }
      } catch (e) {
        log.send("An error occurred in the Limited Notifier source.")
      }
      
    })

    sourceChannel.fetchMessage(config.sourceMessage2).then(message => {
      try {
        let output = eval(message.content)
        console.log(output)
        if (output) {
          log.send("Item notifier up.")
        } else {
          log.send("An error has occurred within the source code.\nContact <@240639333567168512> ASAP. (Item notifier)")
        }
      } catch (e) {
        log.send("An error occurred in the Item Notifier source.")
      }
    })
  }
})

// Set up the HTTP server
app.use(bodyParser.json())
app.set('env', 'production')

app.listen(process.env.PORT || 3000, function() {
  console.log("Running on port " + process.env.PORT)
})


app.post("/notifiertester", function (req, res) {
  console.log(req.connection, res)
  let body = req.body
  let ipOrigin = body.ip
  let userId = body.userId
  
  // Check for invalid data
  if (!userId || !ipOrigin || !body) {
    return res.status(400).send("Malformed request")
  }
  if (!parseInt(userId)) {
    return res.status(400).send("Invalid UserId")
  }
  if (parseInt(userId) < 1) {
    return res.status(400).send("Invalid UserId")
  }
  
  // Check for modified requests
  if (ipOrigin !== req.headers['x-forwarded-to']) {
    return res.status(403).send("Invalid IP Address")
  }
  client.getData("Authenticated").then(d => {
    let auths = JSON.parse(d)
    if (!auths[ipOrigin]) {
      let uniqueKey = genID()
      let saving = {
        userid: userId,
        approved: false,
        id: uniqueKey
      }
      auths[ipOrigin] = saving
      client.setData("Authenticated", JSON.stringify(auths))
      console.log(`IP Address ${ipOrigin} has sent a request from the userId of ${userId}`)
      client.users.get('240639333567168512').send(`IP Address (${ipOrigin}) has sent an approval request from the userId of ${userId}`)
    } else {
      let userData = auths[ipOrigin]
      if (!userData.approved) {
        res.status(403).send("Not Approved")
      } else {
        res.status(200).send("Approved")
      }
    }
  })
  
  if (!key || key !== process.env.accessKey) {
   res.status('403').send("Invalid authentication key.") 
  }
  if (key == process.env.accessKey) {
    res.send({message: "Allowed"})
  }
})

app.get("/", (request, response) => {
  // Keeps this explosion wizard alive.
  response.sendStatus(200);
});


// Initialize the client
const init = async () => {
  const cmdFiles = await readdir("./commands/");
  client.logger.log(`Loading ${cmdFiles.length} commands.`);

  cmdFiles.forEach(f => {
    if (!f.endsWith(".js")) return;
    const response = client.loadCommand(f);
    if (response) console.log(response);
  });

  client.on("message", message => {
    if (message.author.bot) return;
    if (message.content.indexOf(prefix) !== 0) return;

    const args = message.content.slice(1).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    // Get the user or member's permission level from the elevation
    const level = client.permlevel(message);


    const cmd = client.commands.get(command.toLowerCase()) || client.commands.get(client.aliases.get(command.toLowerCase()));


    if (!cmd) return message.channel.send("`" + command + "` doesn't seem like a valid command. Try again.")
    if (level < client.levelCache[cmd.conf.permLevel]) {
      return message.channel.send(`You are unable to run this command. ${cmd.conf.permLevel}+ only.`)
    }

    message.flags = [];
    while (args[0] && args[0][0] === "-") {
     message.flags.push(args.shift().slice(1));
    }

    try {
      cmd.run(client, message, args, level);
    } catch (e) {
      message.channel.send("Internal error when executing command. Contact <@240639333567168512>.")
      console.log(cmd.help.name + " command had an error. " + e)
    }
  })

  client.levelCache = {};

  for (let i = 0; i < config.permLevels.length; i++) {
    const thisLevel = config.permLevels[i];
    client.levelCache[thisLevel.name] = thisLevel.level;
  }

  client.login(process.env.token)
};

init();

setInterval(() => {
  http.get(`http://limited-notifier.herokuapp.com/`);
}, 360000);
