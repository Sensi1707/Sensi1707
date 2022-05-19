require("dotenv").config()
const fs = require("fs")
const { Client, Collection, Intents } = require("discord.js")


const client = new Client({intents:[Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS]})

client.commands = new Collection() 

const commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.js')); 
const eventFiles = fs.readdirSync('./src/events').filter(file => file.endsWith('.js')); 


commandFiles.forEach((commandFile) => {
	const command = require(`./src/commands/${commandFile}`);
	client.commands.set(command.data.name, command);
})

eventFiles.forEach(eventFile => {
    const event = require(`./src/events/${eventFile}`)
    client.on(event.name, (...args) => event.execute(...args))
})

client.once("ready", () => {
    console.log(`Ready! Logged in as ${client.user.tag}! I'm on ${client.guilds.cache.size} guild(s)!`)
    
    const servers = client.guilds.cache.size

    const membercounter = client.guilds.cache.reduce((a,b) => a+b.memberCount, 0)  

    const statusmessages = [ "with Sensi", "under the bed UwU", "/help", `not with ${membercounter} members` ]
    current = [0]
    setInterval(() => {
        if (statusmessages[current]){
            client.user.setActivity(statusmessages[current] , {type: "PLAYING"})
            current++
        } else{
            current = 0
            client.user.setActivity(statusmessages[current] , {type : "PLAYING"})
        }
    }, 5000)
    client.user.setPresence({
        status: "online"
})
})

client.on("interactionCreate", async (interaction) => {

    if(!interaction.isCommand()) return

    const command = client.commands.get(interaction.commandName)

    if(command) {

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);

            if(interaction.deferred || interaction.replied) {
                interaction.editReply('Liegt nicht an dir! Sensi kann einfach kein JavaScript')
            }else {
                interaction.reply('Liegt nicht an dir! Sensi kann einfach kein JavaScript')
            }
        }
    }
})

client.login(process.env.DISCORD_BOT_TOKEN)




const { REST } = require("@discordjs/rest")
const { Routes } = require('discord-api-types/v9');
const commands = []


commandFiles.forEach((commandFile) => {
    const command = require(`./src/commands/${commandFile}`)
    commands.push(command.data.toJSON())
})

const restClient = new REST({ version: "9" }).setToken(process.env.DISCORD_BOT_TOKEN)


restClient.put(Routes.applicationGuildCommands(process.env.DISCORD_APPLICATION_ID, process.env.DISCORD_GUILD_ID),
    { body: commands })
    .then(() => console.log("Sucessfully registered Commands!"))
    .catch(console.error)
