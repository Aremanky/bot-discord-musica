/*
Este bot nace de la necesidad de un bot decente de música, ya que los bloqueos de Google 
a los bots de música, o que simplemente dejan de funcionar por la masificación de
personas que los usan, han degradado la calidad de estos. Este bot está para que lo 
podais hostear vosotros mismos, al igual que yo voy ha hacer en mi servidor, no tengais 
miedo a hacer un fork y mejorarlo o adaptarlo a vosotros. Espero ser de ayuda. Por desgracia
este es mi primer bot y no he podido mejorarlo para escuchar musica de youtube, solo de
sound cloud, pero el siguiente bot si podrá escuchar de youtube.
*/

const { Client, GatewayIntentBits,ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { Player } = require('discord-player');
const { DefaultExtractors } = require('@discord-player/extractor');
require('dotenv').config();

const setupMusicCommands = require('./musicCommands')

const prefix = '.'; 

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,           
        GatewayIntentBits.GuildVoiceStates, 
        GatewayIntentBits.GuildMessages,    
        GatewayIntentBits.MessageContent    
    ]
});

const player = new Player(client);
async function iniciarBot() {
    await player.extractors.loadMulti(DefaultExtractors);

    setupMusicCommands(client, player, prefix);

    client.once('clientReady', () => {
        console.log(`🎵 ¡Bot encendido y listo como ${client.user.tag}!`);
    });

    // Conectamos el bot a Discord
    await client.login(process.env.TOKEN); 
}

// A veces no encuentra musica y me veo obligado a poner un Anti-Crash para evitar caidas del bot
process.on('unhandledRejection', (error) => {
    console.error('🛡️ [Anti-Crash] Error no manejado:', error);
});

process.on('uncaughtException', (error) => {
    console.error('🛡️ [Anti-Crash] Excepción no capturada:', error);
});

iniciarBot();