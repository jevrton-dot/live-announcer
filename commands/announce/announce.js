const {
  SlashCommandBuilder,
  SlashCommandStringOption,
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle
} = require("discord.js");

const { getPlatform } = require("./src/getPlatform");
const { TwitchChannelInfo } = require("./src/TwitchChannelInfo");

/* command description */
const commandName = "announce";
const commandDescription = "Use this command to mannualy announce a livestream on this channel!";

/* parameters create */
const commandURLInput = new SlashCommandStringOption();
commandURLInput.setName("livestream-url");
commandURLInput.setDescription("The URL that leads for your livestream");
commandURLInput.setRequired(true);


/* Validar e corrigir URL */
const validateURL = (url) => {
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return `https://${url}`; // Adiciona https:// no início
  }
  return url;
};


/*
* function body
*/
const announceCommand = async (interaction) => {
  let liveURL = interaction.options.getString("livestream-url");
  liveURL = validateURL(liveURL);

  const platform = getPlatform(liveURL);

  // Variável para armazenar o avatar (padrão: vazio)
  let thumbnail = null;
  let image = null;
  let field = null;
  let displayName = null;
  let liveTitle = null;

  // Verifica se é um link da Twitch e obtém o avatar, se for
  // TODO: Melhorar a forma que isso é feito. (Classe/função)
  switch (platform) {
    case "Twitch":

      const channel = new TwitchChannelInfo(liveURL)
      const avatar = channel.userAvatar()
      const liveThumbnail = channel.liveThumbnail()
      const gameInLive = channel.inLiveGame()
      const userDisplayName = channel.displayName()
      const title = channel.liveTitle()

      try {
        thumbnail = await avatar;
        image = await liveThumbnail
        field = await gameInLive
        displayName = await userDisplayName
        liveTitle = await title
      } catch (error) {
        console.error("Erro ao obter informações do usuário Twitch:", error);
      }
      break;
  }

  // Cria um botão com o link da live
  const urlButton = new ButtonBuilder()
    .setLabel(platform)
    .setStyle(ButtonStyle.Link)
    .setURL(liveURL);

  // Cria uma actionRow com o botão
  const actionRow = new ActionRowBuilder()
    .addComponents(urlButton);

  // Cria um embed
  const announceEmbed = new EmbedBuilder()
    .setURL(liveURL)

  if (liveTitle) {
    announceEmbed.setTitle(liveTitle)
  }

  if (displayName && field) {
    announceEmbed.setAuthor({ name: `${displayName}  |  ${field}` })
  }

  if (thumbnail) {
    announceEmbed.setThumbnail(thumbnail);
  }

  if (image) {
    announceEmbed.setImage(image)
  }

  // Responde ao comando
  interaction.reply("Anúncio realizado!");

  // Envia a mensagem no canal
  const channel = interaction.channel;
  channel.send({
    embeds: [announceEmbed],
    components: [actionRow],
  });
};


module.exports = {
  data: new SlashCommandBuilder()
    .setName(commandName)
    .setDescription(commandDescription)
    .addStringOption(commandURLInput),
  async execute(interaction) {
    await announceCommand(interaction);
  },
};
