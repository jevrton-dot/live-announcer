const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
require('dotenv').config();

class TwitchChannelInfo {
    constructor(url) {
        this.channelName = this.#extractUsername(url);
    }

    #extractUsername(url) {
        const regex = /https?:\/\/(?:www\.)?twitch\.tv\/([a-zA-Z0-9_]+)/;
        const match = url.match(regex);
        if (match && match[1]) {
            return match[1];
        }
        throw new Error("URL inválida. Certifique-se de que seja uma URL válida da Twitch.");
    }

    // Método privado para obter o token de acesso
    async #getTwitchToken() {
        const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
        const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;

        // Obter token de acesso
        const tokenResponse = await fetch(
            `https://id.twitch.tv/oauth2/token?client_id=${TWITCH_CLIENT_ID}&client_secret=${TWITCH_CLIENT_SECRET}&grant_type=client_credentials`,
            { method: "POST" }
        );
        const tokenData = await tokenResponse.json();
        return tokenData.access_token;

    }

    async userAvatar() {
        const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
        const accessToken = await this.#getTwitchToken();

        // Obter informações do usuário
        const userResponse = await fetch(`https://api.twitch.tv/helix/users?login=${this.channelName}`, {
            headers: {
                "Client-ID": TWITCH_CLIENT_ID,
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const userData = await userResponse.json();
        if (userData.data && userData.data.length > 0) {
            return userData.data[0].profile_image_url; // URL do avatar
        } else {
            throw new Error("Usuário Twitch não encontrado.");
        }
    }

    async userName() {
        const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
        const accessToken = await this.#getTwitchToken();

        // Obter informações do usuário
        const userResponse = await fetch(`https://api.twitch.tv/helix/users?login=${this.channelName}`, {
            headers: {
                "Client-ID": TWITCH_CLIENT_ID,
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const userData = await userResponse.json();
        if (userData.data && userData.data.length > 0) {
            return userData.data[0].login; // Nome do usuário
        } else {
            throw new Error("Usuário Twitch não encontrado.");
        }
    }

    async liveThumbnail() {
        const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
        const accessToken = await this.#getTwitchToken();

        // Aguarda o username ser resolvido
        const username = await this.userName();

        // Faz a requisição para a API de streams
        const userResponse = await fetch(`https://api.twitch.tv/helix/streams?user_login=${username}`, {
            headers: {
                "Client-ID": TWITCH_CLIENT_ID,
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const liveData = await userResponse.json();

        // Verifica se o streamer está ao vivo e retorna a thumbnail
        if (liveData.data && liveData.data.length > 0) {
            const thumbnailUrl = liveData.data[0].thumbnail_url;
            const customThumbnail = thumbnailUrl.replace("{width}", "1280").replace("{height}", "720");
            return customThumbnail;
        }

        // Retorna null se o streamer não estiver ao vivo
        return null;
    }
    async displayName() {
        const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
        const accessToken = await this.#getTwitchToken();
        
        // Obter informações do usuário
        const userResponse = await fetch(`https://api.twitch.tv/helix/users?login=${this.channelName}`, {
            headers: {
                "Client-ID": TWITCH_CLIENT_ID,
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const userData = await userResponse.json();
        if (userData.data && userData.data.length > 0) {
            return userData.data[0].display_name; // Nome de exibição
        } else {
            throw new Error("Usuário Twitch não encontrado.");
        }
    }

    async inLiveGame() {
        const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
        const accessToken = await this.#getTwitchToken();
    
        // Obter informações de transmissão ao vivo
        const streamResponse = await fetch(`https://api.twitch.tv/helix/streams?user_login=${this.channelName}`, {
            headers: {
                "Client-ID": TWITCH_CLIENT_ID,
                Authorization: `Bearer ${accessToken}`,
            },
        });
    
        const streamData = await streamResponse.json();
        
        if (streamData.data && streamData.data.length > 0) {
            return streamData.data[0].game_name; // Nome do jogo
        } else {
            return "Nenhum jogo detectado ou usuário não está ao vivo.";
        }
    }

    async liveTitle() {
        const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
        const accessToken = await this.#getTwitchToken();
    
        // Obter informações de transmissão ao vivo
        const streamResponse = await fetch(`https://api.twitch.tv/helix/streams?user_login=${this.channelName}`, {
            headers: {
                "Client-ID": TWITCH_CLIENT_ID,
                Authorization: `Bearer ${accessToken}`,
            },
        });
    
        const streamData = await streamResponse.json();
        
        if (streamData.data && streamData.data.length > 0) {
            return streamData.data[0].title; // Título da live
        } else {
            return "Nenhum título encontrado ou usuário não está ao vivo.";
        }
    }

}

module.exports = { TwitchChannelInfo };