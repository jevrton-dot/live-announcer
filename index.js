const fs = require("node:fs");
const path = require("node:path");

const {
  Client,
  Events,
  GatewayIntentBits,
  Collection,
  MessageFlags 
} = require("discord.js");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

/* Handling Commands */
client.commands = new Collection();
const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith(".js"));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(
        `[WARNING] - the command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }
}

/* Startup Log */
client.once(Events.ClientReady, (readyClient) => {
  console.info(`----------------------------------------`);
  console.info(`[ ${readyClient.user.tag} ] - bot is ready!`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);
  if (!command) {
    console.error(`[ERROR] - no command matching ${interaction.commandName} was found`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: `Houve um erro ao executar o comando!`,
        flags: MessageFlags.Ephemeral,
      });
    } else {
      await interaction.reply({
        content: `Houve um erro ao executar o comando!`,
        flags: MessageFlags.Ephemeral,
      });
    }
  }
});

require('dotenv').config();
client.login(process.env.TOKEN_BOT_DISCORD);
