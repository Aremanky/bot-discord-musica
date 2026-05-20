const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

function generarEmbedCola(queue, guildName, pagina, autor) {
    const currentTrack = queue.currentTrack;
    const tracks = queue.tracks.toArray();
    const maxCanciones = 10;
    
    const totalPaginas = Math.ceil(tracks.length / maxCanciones) || 1;

    if (pagina < 0) pagina = 0;
    if (pagina >= totalPaginas) pagina = totalPaginas - 1;

    const embedCola = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle(`🎶 Lista de reproducción - ${guildName}`)
        .setThumbnail(currentTrack.thumbnail)
        .addFields(
            { name: '▶️ Sonando ahora:', value: `\`${currentTrack.title}\` \n*Duración: ${currentTrack.duration}*` }
        );

    if (tracks.length === 0) {
        embedCola.setDescription('*No hay más canciones en la cola de reproducción.*');
    } else {
        const inicio = pagina * maxCanciones;
        const fin = inicio + maxCanciones;
        const cancionesAMostrar = tracks.slice(inicio, fin);
        let listaTexto = '';

        cancionesAMostrar.forEach((track, index) => {
            listaTexto += `**${inicio + index + 1}.** \`${track.title}\` — *${track.duration}*\n`;
        });

        embedCola.addFields({ name: `📋 Próximas canciones (Pág. ${pagina + 1}/${totalPaginas}):`, value: listaTexto });
    }

    embedCola.setFooter({ 
        text: `Canciones en espera: ${tracks.length} | Solicitado por ${autor.displayName}`,
        iconURL: autor.displayAvatarURL({ dynamic: true })
    });

    const filaPaginacion = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`queue_page_${pagina - 1}`)
            .setEmoji('⬅️')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(pagina === 0), 
        new ButtonBuilder()
            .setCustomId(`queue_page_${pagina + 1}`)
            .setEmoji('➡️')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(pagina >= totalPaginas - 1 || tracks.length === 0) 
    );

    return { embedCola, filaPaginacion };
}

module.exports = (client, player,prefix) => {
    player.events.on('error', (queue, error) => {
        console.error(`❌ [Error de la cola]: ${error.message}`);
    });
    
    player.events.on('playerError', (queue, error) => {
        console.error(`❌ [Error del reproductor de audio]: ${error.message}`);
    });

    function generarEmbedReproductor(queue, track) {

        const timestamp = queue.node.getTimestamp();
        const tiempoActual = timestamp?.current?.label || '00:00';
        const tiempoTotal = timestamp?.total?.label || track.duration;
        const progresoPorcentaje = timestamp?.progress || 0;

        const totalBarras = 13;
        const barrasPasadas = Math.min(totalBarras, Math.max(0, Math.round((progresoPorcentaje / 100) * totalBarras)));
        const barraVisual = '▬'.repeat(barrasPasadas) + '🔘' + '▬'.repeat(totalBarras - barrasPasadas);

        return new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle(`▶️ ${track.title}`)
            .setImage(track.thumbnail) 
            .setFooter({ 
                text: `${tiempoActual}  ${barraVisual}  ${tiempoTotal}   |   Controla la música` 
            });
    }

    player.events.on('playerStart', async (queue, track) => {
        if (queue.updateInterval) clearInterval(queue.updateInterval);

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
        
        const embedInicial = generarEmbedReproductor(queue, track);
        const nuevoMensaje = await queue.metadata.channel.send({
            embeds: [embedInicial],
            components: [filaBotones]
        });

        queue.lastPlayerMessage = nuevoMensaje;

        queue.updateInterval = setInterval(async () => {
            if (!queue || !queue.isPlaying()) {
                clearInterval(queue.updateInterval);
                return;
            }
            const embedActualizado = generarEmbedReproductor(queue, queue.currentTrack);
            await queue.lastPlayerMessage.edit({ embeds: [embedActualizado] }).catch(() => {});
        }, 20000);
    });

    player.events.on('emptyQueue', async (queue) => {
        if (queue.lastPlayerMessage) {
            await queue.lastPlayerMessage.delete().catch(() => {});
        }
    });

    // Comando .play <canción o url>
    client.on('messageCreate', async (message) => {
        if (message.author.bot) return;

        if (message.content.startsWith(prefix+' ')){
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

    //Comando .cola para ver lista de reproducción
    client.on('messageCreate', async (message) => {
        if (message.author.bot || !message.content.startsWith(prefix + 'cola')) return;

        const queue = player.nodes.get(message.guild.id);

        if (!queue || !queue.isPlaying()) {
            return message.reply(`¿Pero qué lista quieres ver si no hay nada sonando? 🙄 Pide una canción primero, espabilao.`);
        }

        // Generamos la página 0 (la primera de todas)
        const { embedCola, filaPaginacion } = generarEmbedCola(queue, message.guild.name, 0, message.member);
        return message.reply({ embeds: [embedCola], components: [filaPaginacion] });
    });

    // Comando .fora pa quitar
    client.on('messageCreate', async (message) => {
        if (message.author.bot || !message.content.startsWith(prefix + 'fora')) return;

        const queue = player.nodes.get(message.guild.id);

        if (message.member.voice.channelId !== message.guild.members.me.voice.channelId) {
            return message.reply(message.member.displayName+' no vas a joder mientras yo esté aquí, entra al menos a su chat de voz y da la cara, Payaso');
        }

        if (!queue || !queue.isPlaying()) {
            return message.reply(`¿Pero qué quieres quitar si no está sonando nada? Como se nota que tus padres son primos🙄`);
        }

        const args = message.content.split(' ').slice(1);
        const numeroBuscado = parseInt(args[0]);

        if (isNaN(numeroBuscado) || numeroBuscado <= 0) { 
            return message.reply(`Pon un numero. Ejemplo: \`${prefix}fora 3\`. Entiendo que tu profe se suicidara al aguantar a semejante trozo de carse sin cerebro.`);
        }

        const tracks = queue.tracks.toArray();

        if (tracks.length === 0) {
            return message.reply(`La cola está vacía, no hay nada que quitar aparte de la que suena y tus ganas de vivir (y para eso usa el botón de Skip, genio).`);
        }

        const indiceReal = numeroBuscado - 1;

        if (indiceReal >= tracks.length) {
            return message.reply(`Tranquilo, entiendo que tienes down, te lo explico pa tontitos. En la lista solo hay **${tracks.length}** canciones en espera, no me pidas la **${numeroBuscado}**, pide una que esté en la lista.`);
        }

        const cancionEliminada = tracks[indiceReal];

        queue.node.remove(indiceReal);

        return message.reply(`🗑️ ¡A MAMARLA!: He borrado **${cancionEliminada.title}** de la cola.`);
    });

    client.on('interactionCreate', async (interaction) => {
        if (!interaction.isButton()) return;

        const queue = player.nodes.get(interaction.guild.id);
        
        if (interaction.customId.startsWith('queue_page_')) {
            if (!queue || !queue.isPlaying()) {
                return interaction.reply({ content: '❌ La música se ha detenido y esta lista ya no es válida.', ephemeral: true });
            }

            const paginaDestino = parseInt(interaction.customId.split('_')[2]);
            
            const { embedCola, filaPaginacion } = generarEmbedCola(queue, interaction.guild.name, paginaDestino, interaction.member);

            await interaction.update({ embeds: [embedCola], components: [filaPaginacion] });
            return;
        }
        
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