# 🎵 Bot de Música para Discord con SoundCloud

[![Discord.js](https://img.shields.io/badge/discord.js-v14-blue.svg)](https://discord.js.org/)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![Licencia](https://img.shields.io/badge/license-ISC-yellow.svg)](LICENSE)
[![Discord Player](https://img.shields.io/badge/discord--player-v7.2.0-blueviolet.svg)](https://discord-player.js.org/)

Un bot de música para Discord, con un toque de humor español y enfocado en ofrecer musical estable mediante **SoundCloud**. Nace de la frustración con los bots masificados y los bloqueos de Google, permitiéndote hostear tu propio bot y olvidarte de las interrupciones.

> “Por desgracia este es mi primer bot y no he podido mejorarlo para escuchar música de YouTube, solo de SoundCloud, pero el siguiente bot si podrá escuchar de YouTube. Pero espero tenerlo hecho en unas semanas.” 

---

## ✨ Características Principales

*   **🎧 Reproducción de Música**: Reproduce canciones directamente desde SoundCloud.
*   **🕹️ Panel de Control Interactivo**: Controla la música con botones (⏮️ Anterior, ⏯️ Pausa/Reanudar, ⏭️ Siguiente, 🗑️ Limpiar cola) sin necesidad de escribir comandos.
*   **📜 Cola de Reproducción Paginada**: Visualiza la lista de canciones en espera con un sistema de páginas interactivo.
*   **🗑️ Gestión de Cola**: Elimina canciones específicas de la cola con un solo comando.
*   **💬 Humor**: Respuestas con personalidad y un toque de humor español para hacer la experiencia más divertida.
*   **🔒 Sistema Anti-Crash**: Protección básica contra errores no manejados para mantener el bot en línea, y así no fastidiar la reproducción de muúica.
*   **⚙️ Fácil de Configurar**: Solo necesitas un token de Discord Bot y Node.js para empezar.
*   **🔧 Código Abierto y Personalizable**: Haz un fork y adáptalo a tu gusto

---

## 📋 Requisitos Previos

Asegúrate de tener instalado lo siguiente en tu sistema:

*   [Node.js](https://nodejs.org/) (versión 18.0.0 o superior)
*   [npm](https://www.npmjs.com/) (se instala con Node.js)
*   Un [Token de Bot de Discord](https://discord.com/developers/applications) (Lo puedes sacar pinchando en el enlace)

---

## 🚀 Instalación y Configuración Rápida

Sigue estos pasos para tener tu bot funcionando en menos de 5 minutos:

1.  **Clona el repositorio**:
    ```bash
    git clone https://github.com/Aremanky/bot-discord-musica-sound-clound.git
    cd bot-discord-musica-sound-clound
    ```
    
2.  **Instala las dependencias**:
    ```bash
    npm install
    ```
Las dependencias clave incluyen `discord.js` (v14), `discord-player` (v7), y sus extractores.

3.  **Configura las variables de entorno**:
*   Modifica `.env` (si existe) o crea uno nuevo.
*   Dentro del archivo `.env`, añade tu token de bot de la siguiente manera:
  
    ```evn
    TOKEN=tu_token_de_discord_aqui
    ```
    
4.  **¡Enciende el bot!**:
    ```bash
    node index.js
    ```
    
Si todo sale bien, verás en la consola: `🤖 ¡Bot encendido y listo como TuBot#1234!`.

---

## 🎮 Comandos y Uso

El bot usa el prefijo `.` (punto) por defecto pero en la linea 18 del `index.js` verás `const prefix = '.';`, cambialo a tu gusto. Todos los comandos deben escribirse en un canal de texto.

| Comando | Descripción | Ejemplo |
| :--- | :--- | :--- |
| `.play <búsqueda>` | Busca y reproduce una canción en SoundCloud. | `.play linkin park` |
| `.cola` | Muestra la cola de reproducción actual con botones para navegar entre páginas. | `.cola` |
| `.fora <número>` | Elimina una canción específica de la cola según su número en la lista. | `.fora 3` |
| `.help` | Muestra un mensaje de ayuda con todos los comandos y sus funciones. | `.help` |

---

## 🕹️ Controles Interactivos del Reproductor

Cuando inicias una canción, el bot envía un mensaje con un panel de control visual que incluye:

*  ⏮️ (Anterior): Vuelve al inicio de la canción (si han pasado +10s) o a la canción anterior del historial.

*  ⏯️ (Pausa/Reanudar): Alterna entre pausar y reanudar la reproducción.

*  ⏭️ (Siguiente): Salta a la siguiente canción en la cola.

*  🗑️ (Limpiar): Vacía toda la cola de reproducción, excepto la canción que está sonando.

