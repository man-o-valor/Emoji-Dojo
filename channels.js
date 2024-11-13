const {logchannel, errorchannel} = require('./index.js')

async function messagelog(user, message, title, footer) {
      let logembed; // Declare logembed outside the conditional blocks

      if (user === 'error') {
        logembed = new EmbedBuilder()
              .setColor(0xEA4335)
              .setTitle('Error!')
              .setAuthor({
                name: user.username,
                iconURL: user.displayAvatarURL(),
              })
              .setDescription(message)
              .setThumbnail(user.displayAvatarURL())
              .setTimestamp();
        errorchannel.send({ content: `Error by @${user.username}`, embeds: [logembed] });
      } else {
        logembed = new EmbedBuilder()
            .setColor(0xE9F8F9)
            .setTitle(title)
            .setAuthor({
                name: user.username,
                iconURL: user.displayAvatarURL(),
            })
            .setDescription(message)
            .setThumbnail(user.displayAvatarURL())
            .setTimestamp()
            .setFooter({
                text: footer,
            });
        logchannel.send({ content: `Log by @${user.username}`, embeds: [logembed] });
    }
}

module.exports = {messagelog}