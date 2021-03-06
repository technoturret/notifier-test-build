const Discord = require("discord.js");

exports.run = (client, message, args, level) => {
  var sourceChannel = client.channels.get(client.config.sourceChannel)
  if (client.scraper) {
    message.channel.send("Previous scraper loop was cleared.")
    clearInterval(client.scraper)
  }
  if (args[0]) {
    return message.channel.send("Scraping ignored due to inclusion of first argument.")
  }

  client.awaitReply(message, "Please send an ID to start scraping items from.").then(reply => {
    if (!parseInt(reply)) {
      return message.channel.send("You dolt, that isn't a number.")
    }
    let id = parseInt(reply)
    client.scrapeID = id
    let embed = new Discord.RichEmbed()
    embed.setTitle("Success")
    embed.setDescription(`Scrape ID has been set to ${id}!\nItems will start being scraped in <#518530622969479168>.`)
    embed.setColor('GREEN')
    message.channel.send({embed})

    sourceChannel.fetchMessage(client.config.startScraper).then(msgc => {
      let output = eval(msgc.content)
      if (output) {
        console.log("Scraper running")
      } else {
        console.log("Scraper errored on startup")
      }
    })
  })


};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [""],
  permLevel: "Bot Owner"
};

exports.help = {
  name: "scrape",
  category: "System",
  description: "Sets the ID of the user to track.",
  usage: "scrape"
};
