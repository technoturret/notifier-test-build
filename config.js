const config = {
  "ownerID": "240639333567168512",
  "sendingChannel": "516755189449883658",
  "sourceChannel": "508815057401151490",
  "sourceMessage": "516776968432254991",
  "sourceMessage2": "517857111993090068",
  "approvedChat": "516604996851335168",
  "scrapeChannel": "518530622969479168",
  "startScraper": "518535615726354443",

  permLevels: [
    // This is the lowest permisison level, this is for non-roled users.
    { level: 1,
      name: "User",

      check: () => true
    },

    { level: 999,
      name: "Bot Owner",

      check: (message, client, data) => {
        return message.author.id == "240639333567168512"
      }
    }
  ],
};

module.exports = config;
