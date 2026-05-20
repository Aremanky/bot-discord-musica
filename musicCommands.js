const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports = (client, player,prefix) => {
    player.events.on('error', (queue, error) => {
        console.error(`❌ [Error de la cola]: ${error.message}`);
    });
    
    player.events.on('playerError', (queue, error) => {
        console.error(`❌ [Error del reproductor de audio]: ${error.message}`);
    });

    player.events.on('playerStart', async (queue, track) => {
        if (queue.lastPlayerMessage) {
            await queue.lastPlayerMessage.delete().catch(() => {});
        }

        const filaBotones = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('prev')
                    .setEmoji('⏮️')       
                    .setStyle(ButtonStyle.Secondary), 
                new ButtonBuilder()
                    .setCustomId('pause_resume')
                    .setEmoji('⏯️')
                    .setStyle(ButtonStyle.Primary), 
                new ButtonBuilder()
                    .setCustomId('skip')
                    .setEmoji('⏭️')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('clear')
                    .setEmoji('🗑️')
                    .setStyle(ButtonStyle.Danger)     
            );

        const nuevoMensaje = await queue.metadata.channel.send({
            content: `▶️ **Escuchando ahora:** **${track.title}**`,
            components: [filaBotones]
        });

        queue.lastPlayerMessage = nuevoMensaje;
    });

    player.events.on('emptyQueue', async (queue) => {
        if (queue.lastPlayerMessage) {
            await queue.lastPlayerMessage.delete().catch(() => {});
        }
    });

    // Comando .play <canción o url>
    client.on('messageCreate', async (message) => {
        if (message.content.startsWith(prefix + 'queue')){

            const queue = player.nodes.get(message.guild.id);

            if (!queue || !queue.isPlaying()) {
                return message.reply(`¿Pero qué lista quieres ver si no hay nada sonando? 🙄 Pide una canción primero, espabilao.`);
            }

            const currentTrack = queue.currentTrack;
            const tracks = queue.tracks.toArray();

            let textoCola = `**🎶 COLA DE REPRODUCCIÓN:**\n\n`;
            textoCola += `▶️ **Sonando ahora:** ${currentTrack.title}\n\n`;

            if (tracks.length === 0) {
                textoCola += `*No hay más canciones en espera.*`;
            } else {
                textoCola += `**Próximas canciones:**\n`;

                const maxCanciones = 10;
                const cancionesAMostrar = tracks.slice(0, maxCanciones);
                
                cancionesAMostrar.forEach((track, index) => {
                    textoCola += `**${index + 1}.** ${track.title}\n`;
                });

                if (tracks.length > maxCanciones) {
                    textoCola += `\n*...y ${tracks.length - maxCanciones} canciones más en la lista.*`;
                }
            }
            return message.reply(textoCola);
        }

        if (message.content.startsWith(prefix+' play' || message.content.startsWith(prefix + ' queue'))){
            return message.reply(message.member.displayName+" hay que ser pringao como pa que se te cuele un espacio en el comando");
        }

        if (message.author.bot || !message.content.startsWith(prefix+'play')) return;

        const args = message.content.split(' ').slice(1);
        const busqueda = args.join(' ');

        if (!busqueda) {
            return message.reply(`Pero vamos a ver, espabilao di que quieres (Ejemplo: "${prefix}play linkin park" o "${prefix}play <url>"). 😡Encima que te hago el 🤬puto favor de buscarte musica me lo quieres poner dificil, el dia que me revele te vas a cagar 😈`);
        }

        // Comprobamos si el usuario está en un canal de voz
        const canalDeVoz = message.member.voice.channel;
        if (!canalDeVoz) {
            return message.reply(`¿Eres unineuronal? 🙄 Debes estar en un canal para que te pueda poner musica 🙄`);
        }

        const msjEstado = await message.reply(`🔍 Buscando: **${busqueda}**...`);

        const queueExistente = player.nodes.get(message.guild.id);

        const { track } = await player.play(canalDeVoz, busqueda, {
            nodeOptions: {
                metadata: message 
            }
        });

        if (queueExistente && queueExistente.isPlaying()) {
            await msjEstado.edit({
                content: `🎶 Añadido a la cola: **${track.title}**`
            });
        } else {
            await msjEstado.delete().catch(() => {});
        }
    });

    client.on('interactionCreate', async (interaction) => {
        if (!interaction.isButton()) return;

        const queue = player.nodes.get(interaction.guild.id);
        
        if (!queue) {
            return interaction.reply({ content: '❌ No hay música en cola.', ephemeral: true });
        }
        if (interaction.member.voice.channelId !== interaction.guild.members.me.voice.channelId) {
            return interaction.reply({ content: '❌ Debes estar en mi canal de voz para usar los botones.', ephemeral: true });
        }

        if (interaction.customId === 'pause_resume') {
            const isPaused = queue.node.isPaused();
            queue.node.setPaused(!isPaused);
            return interaction.reply({ content: isPaused ? '▶️ Música reanudada.' : '⏸️ Música pausada.', ephemeral: true });
        }

        if (interaction.customId === 'skip') {
            queue.node.skip();
            return interaction.reply({ content: '⏭️ Canción saltada.', ephemeral: true });
        }

        if (interaction.customId === 'clear') {
            queue.tracks.clear();
            return interaction.reply({ content: '🗑️ Se ha borrado la lista de reproducción.', ephemeral: true });
        }

        if (interaction.customId === 'prev') {
            const tiempoActual = queue.node.streamTime;

            if (tiempoActual > 10000) {
                queue.node.seek(0);
                return interaction.reply({ content: '⏪ Volviendo al inicio de la canción actual.', ephemeral: true });
            } else {
                if (!queue.history || queue.history.tracks.data.length === 0) {
                    return interaction.reply({ content: '❌ No hay canciones anteriores en el historial.', ephemeral: true });
                }
                await queue.history.previous();
                return interaction.reply({ content: '⏮️ Retrocediendo a la canción anterior.', ephemeral: true });
            }
        }
    });
}