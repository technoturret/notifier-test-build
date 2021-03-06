const Discord = require("discord.js");

exports.run = (client, message, args, level) => {
  var config = client.config
  let type = args[0]

  if (type == "items") {
    if (client.interval2) {
      message.channel.send("Cleared previous loop of ID " + client.interval2._idleStart)
      clearInterval(client.interval2)
    }
    let embed = new Discord.RichEmbed()
    embed.setTitle("Currently updating item notifier")
    embed.setDescription(`Updating the item notifier source...`)
    embed.setColor('ORANGE')
    message.channel.send({embed}).then(msg => {
      let sourceChannel = client.channels.get(config.sourceChannel)
      let log = client.channels.get(config.approvedChat)
      if (!sourceChannel) {
        let embed2 = new Discord.RichEmbed()
        embed2.setTitle("Source channel invalid")
        embed2.setDescription(`The item notifier source was not found.`)
        embed2.setColor('RED')
        msg.edit(embed2)
      } else {
        let embed2 = new Discord.RichEmbed()
        embed2.setTitle("Initalizing...")
        embed2.setDescription(`Initalizing source.`)
        embed2.setColor('ORANGE')
        msg.edit(embed2)
        sourceChannel.fetchMessage(config.sourceMessage2).then(msgc => {
          let output = eval(msgc.content)
          if (output) {
            let embed3 = new Discord.RichEmbed()
            embed3.setTitle("Item Notifier running!")
            embed3.setDescription(`✅ The item notifier source is now running.`)
            embed3.setColor('GREEN')
            msg.edit(embed3)
          } else {
            let embed3 = new Discord.RichEmbed()
            embed3.setTitle("Initialization failed")
            embed3.setDescription(`Initialization failed. Contact <@240639333567168512> ASAP.`)
            embed3.setColor('GREEN')
            msg.edit(embed3)
            console.log(output)
          }
        })
      }
    })
    return
  }
  message.channel.send("`update items`")


};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [""],
  permLevel: "Bot Owner"
};

exports.help = {
  name: "update",
  category: "System",
  description: "Updates to the source code provided.",
  usage: "update"
};
