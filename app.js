// Configuration
const config = {
    twitch: '',
    kick: '',
    youtube: '',
    youtubeKey: '',
    emoteSet: '',
    transparent: false,
    showPlatformBadges: true,
    showSystemMessages: true,
    showUsernameColors: true,
    maxMessages: 500,
    maxWidth: 1200
};

// Emote caches
const emotes = {
    '7tv': {},
    'bttv': {},
    'ffz': {},
    'twitch': {}
};

// Connection status
const status = {
    twitch: false,
    kick: false,
    youtube: false
};

// Parse URL parameters
function parseURLParams() {
    const params = new URLSearchParams(window.location.search);
    config.twitch = params.get('twitch') || localStorage.getItem('twitch') || '';
    config.kick = params.get('kick') || localStorage.getItem('kick') || '';
    config.youtube = params.get('youtube') || localStorage.getItem('youtube') || '';
    config.youtubeKey = params.get('youtubekey') || localStorage.getItem('youtubekey') || '';

    // Extract just the ID from 7TV emote set URL if full URL provided
    let emoteSetValue = params.get('7tv') || localStorage.getItem('7tv') || '';
    if (emoteSetValue.includes('7tv.app/emote-sets/')) {
        emoteSetValue = emoteSetValue.split('7tv.app/emote-sets/')[1];
    }
    config.emoteSet = emoteSetValue;

    config.transparent = params.get('transparent') === 'true';

    // URL parameters override localStorage for badge/system message settings
    if (params.has('hidebadges')) {
        config.showPlatformBadges = params.get('hidebadges') !== 'true';
    } else {
        config.showPlatformBadges = localStorage.getItem('showPlatformBadges') !== 'false';
    }

    if (params.has('hidesystem')) {
        config.showSystemMessages = params.get('hidesystem') !== 'true';
    } else {
        config.showSystemMessages = localStorage.getItem('showSystemMessages') !== 'false';
    }

    if (params.has('hidecolors')) {
        config.showUsernameColors = params.get('hidecolors') !== 'true';
    } else {
        config.showUsernameColors = localStorage.getItem('showUsernameColors') !== 'false';
    }

    // Parse max messages setting
    const maxMessagesParam = params.get('maxmessages');
    if (maxMessagesParam) {
        config.maxMessages = parseInt(maxMessagesParam, 10);
    } else {
        const storedMax = localStorage.getItem('maxMessages');
        config.maxMessages = storedMax ? parseInt(storedMax, 10) : 500;
    }

    // Parse max width setting
    const maxWidthParam = params.get('maxwidth');
    if (maxWidthParam) {
        config.maxWidth = parseInt(maxWidthParam, 10);
    } else {
        const storedWidth = localStorage.getItem('maxWidth');
        config.maxWidth = storedWidth ? parseInt(storedWidth, 10) : 1200;
    }
}

// Fetch emotes
async function fetchEmotes() {
    try {
        // Fetch 7TV global emotes
        try {
            const sevenTVGlobal = await fetch('https://7tv.io/v3/emote-sets/global');
            if (sevenTVGlobal.ok) {
                const sevenTVData = await sevenTVGlobal.json();
                if (sevenTVData.emotes && Array.isArray(sevenTVData.emotes)) {
                    sevenTVData.emotes.forEach(emote => {
                        emotes['7tv'][emote.name] = `https://cdn.7tv.app/emote/${emote.id}/1x.webp`;
                    });
                }
            }
        } catch (e) {
            console.log('Could not fetch 7TV global emotes:', e);
        }

        // Fetch BTTV global emotes
        try {
            const bttvGlobal = await fetch('https://api.betterttv.net/3/cached/emotes/global');
            if (bttvGlobal.ok) {
                const bttvData = await bttvGlobal.json();
                if (Array.isArray(bttvData)) {
                    bttvData.forEach(emote => {
                        emotes['bttv'][emote.code] = `https://cdn.betterttv.net/emote/${emote.id}/1x`;
                    });
                }
            }
        } catch (e) {
            console.log('Could not fetch BTTV global emotes:', e);
        }

        // Fetch FFZ global emotes
        try {
            const ffzGlobal = await fetch('https://api.frankerfacez.com/v1/set/global');
            if (ffzGlobal.ok) {
                const ffzData = await ffzGlobal.json();
                if (ffzData.sets) {
                    Object.values(ffzData.sets).forEach(set => {
                        if (set.emoticons && Array.isArray(set.emoticons)) {
                            set.emoticons.forEach(emote => {
                                emotes['ffz'][emote.name] = `https://cdn.frankerfacez.com/emote/${emote.id}/1`;
                            });
                        }
                    });
                }
            }
        } catch (e) {
            console.log('Could not fetch FFZ global emotes:', e);
        }

        // If Twitch channel specified, fetch channel-specific emotes
        if (config.twitch) {
            try {
                const userResponse = await fetch(`https://api.betterttv.net/3/cached/users/twitch/${config.twitch}`);
                if (userResponse.ok) {
                    const userData = await userResponse.json();

                    // BTTV channel emotes
                    if (userData.channelEmotes && Array.isArray(userData.channelEmotes)) {
                        userData.channelEmotes.forEach(emote => {
                            emotes['bttv'][emote.code] = `https://cdn.betterttv.net/emote/${emote.id}/1x`;
                        });
                    }
                    if (userData.sharedEmotes && Array.isArray(userData.sharedEmotes)) {
                        userData.sharedEmotes.forEach(emote => {
                            emotes['bttv'][emote.code] = `https://cdn.betterttv.net/emote/${emote.id}/1x`;
                        });
                    }
                }
            } catch (e) {
                console.log('Could not fetch channel-specific emotes:', e);
            }
        }

        // Fetch custom 7TV emote set
        if (config.emoteSet) {
            try {
                const customSet = await fetch(`https://7tv.io/v3/emote-sets/${config.emoteSet}`);
                if (customSet.ok) {
                    const customData = await customSet.json();
                    if (customData.emotes && Array.isArray(customData.emotes)) {
                        customData.emotes.forEach(emote => {
                            emotes['7tv'][emote.name] = `https://cdn.7tv.app/emote/${emote.id}/1x.webp`;
                        });
                    }
                }
            } catch (e) {
                console.log('Could not fetch custom 7TV emote set:', e);
            }
        }

        console.log('Loaded emotes:', Object.keys(emotes['7tv']).length, '7TV,',
                   Object.keys(emotes['bttv']).length, 'BTTV,',
                   Object.keys(emotes['ffz']).length, 'FFZ');
    } catch (error) {
        console.error('Error fetching emotes:', error);
    }
}

// Replace emotes in message text (optimized with single pass)
function replaceEmotes(text) {
    const words = text.split(' ');
    const result = [];

    for (let i = 0; i < words.length; i++) {
        const word = words[i];
        let found = false;

        // Check all emote sources
        for (const emoteMap of Object.values(emotes)) {
            if (emoteMap[word]) {
                result.push(`<img class="emote" src="${emoteMap[word]}" alt="${word}" title="${word}">`);
                found = true;
                break;
            }
        }

        if (!found) {
            result.push(word);
        }
    }

    return result.join(' ');
}

// Add message to unified chat (optimized with RAF and fragment)
let messageQueue = [];
let rafScheduled = false;

function addMessage(platform, username, message, color = null, isSystemMessage = false) {
    // Skip system messages if disabled
    if (isSystemMessage && !config.showSystemMessages) {
        return;
    }

    messageQueue.push({ platform, username, message, color });

    if (!rafScheduled) {
        rafScheduled = true;
        requestAnimationFrame(flushMessageQueue);
    }
}

function flushMessageQueue() {
    rafScheduled = false;

    if (messageQueue.length === 0) return;

    const chatMessages = document.getElementById('chat-messages');
    const fragment = document.createDocumentFragment();

    // Process all queued messages
    for (const { platform, username, message, color } of messageQueue) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message';

        // Conditionally add platform badge
        const platformBadge = config.showPlatformBadges
            ? `<span class="platform-badge ${platform}">${platform}</span>`
            : '';
        const usernameColor = (config.showUsernameColors && color) ? `color: ${color}` : '';
        const usernameSpan = `<span class="username" style="${usernameColor}">${username}</span>`;
        const messageHTML = replaceEmotes(message);
        const messageSpan = `<span class="message-text">${messageHTML}</span>`;

        messageDiv.innerHTML = platformBadge + usernameSpan + messageSpan;
        fragment.appendChild(messageDiv);
    }

    chatMessages.appendChild(fragment);
    messageQueue = [];

    // Auto-scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Limit messages based on config (batch remove for better performance)
    const children = chatMessages.children;
    const toRemove = children.length - config.maxMessages;
    if (toRemove > 0) {
        for (let i = 0; i < toRemove; i++) {
            chatMessages.removeChild(children[0]);
        }
    }
}

// Update status indicator
function updateStatus(platform, connected) {
    status[platform] = connected;
    const statusDot = document.getElementById(`status-${platform}`);
    if (statusDot) {
        if (connected) {
            statusDot.classList.add('connected');
        } else {
            statusDot.classList.remove('connected');
        }
    }
}

// Connect to Twitch via WebSocket IRC
let twitchWs = null;
function connectTwitch() {
    if (!config.twitch) return;

    try {
        // Connect to Twitch IRC via WebSocket
        twitchWs = new WebSocket('wss://irc-ws.chat.twitch.tv:443');

        twitchWs.onopen = () => {
            console.log('Twitch WebSocket opened');
            // Send anonymous login and request tags for colors
            twitchWs.send('CAP REQ :twitch.tv/tags');
            twitchWs.send('PASS oauth:justinfan12345');
            twitchWs.send('NICK justinfan12345');
            twitchWs.send(`JOIN #${config.twitch.toLowerCase()}`);
        };

        twitchWs.onmessage = (event) => {
            const messages = event.data.split('\r\n');

            for (const msg of messages) {
                if (!msg) continue;

                // Respond to PING
                if (msg.startsWith('PING')) {
                    twitchWs.send('PONG :tmi.twitch.tv');
                    continue;
                }

                // Parse PRIVMSG (chat messages)
                if (msg.includes('PRIVMSG')) {
                    // IRC format with tags: @tags :user!user@user.tmi.twitch.tv PRIVMSG #channel :message
                    // Extract username from the part after @ tags and before !
                    const userMatch = msg.match(/\s:(\w+)!/);
                    const messageMatch = msg.match(/PRIVMSG #\w+ :(.+)$/);

                    if (userMatch && messageMatch) {
                        const username = userMatch[1];
                        const message = messageMatch[1];

                        // Extract color from tags if available
                        let color = null;
                        const colorMatch = msg.match(/color=(#[0-9A-F]{6})/i);
                        if (colorMatch) {
                            color = colorMatch[1];
                        }

                        addMessage('twitch', username, message, color);
                    }
                }

                // Check for successful connection
                if (msg.includes('376') || msg.includes('JOIN')) {
                    updateStatus('twitch', true);
                    addMessage('twitch', 'System', `Connected to ${config.twitch}'s chat`, '#9147ff', true);
                    // console.log('Twitch connected successfully'); // Disabled for performance
                }
            }
        };

        twitchWs.onerror = (error) => {
            console.error('Twitch WebSocket error:', error);
            updateStatus('twitch', false);
        };

        twitchWs.onclose = () => {
            console.log('Twitch WebSocket closed');
            updateStatus('twitch', false);
        };

    } catch (error) {
        console.error('Error connecting to Twitch:', error);
        updateStatus('twitch', false);
        addMessage('twitch', 'System', 'Failed to connect', '#ff0000', true);
    }
}

// Connect to Kick (via Pusher WebSocket)
let kickWs = null;
async function connectKick() {
    if (!config.kick) return;

    try {
        // Fetch chatroom ID
        const response = await fetch(`https://kick.com/api/v2/channels/${config.kick}`);
        if (!response.ok) {
            throw new Error(`Kick channel not found: ${config.kick}`);
        }
        const data = await response.json();
        const chatroomId = data.chatroom.id;
        console.log('Kick chatroom ID:', chatroomId);

        // Connect to Kick via Pusher (try both known app keys)
        const appKey = '32cbd69e4b950bf97679'; // Primary app key
        kickWs = new WebSocket(`wss://ws-us2.pusher.com/app/${appKey}?protocol=7&client=js&version=8.4.0-rc2&flash=false`);

        kickWs.onopen = () => {
            updateStatus('kick', true);
            addMessage('kick', 'System', `Connected to ${config.kick}'s chat`, '#53fc18', true);

            // Subscribe to chatroom
            const subscribeMsg = JSON.stringify({
                event: 'pusher:subscribe',
                data: { channel: `chatrooms.${chatroomId}.v2` }
            });
            console.log('Subscribing to Kick:', subscribeMsg);
            kickWs.send(subscribeMsg);
        };

        kickWs.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                // console.log('Kick message:', data); // Disabled for performance

                // Handle different event types
                if (data.event === 'pusher:connection_established') {
                    // console.log('Kick connection established'); // Disabled for performance
                } else if (data.event === 'pusher:error') {
                    console.error('Kick pusher error:', data.data);
                    addMessage('kick', 'System', `Error: ${data.data?.message || 'Connection error'}`, '#ff0000', true);
                } else if (data.event === 'pusher_internal:subscription_succeeded') {
                    // console.log('Kick subscription successful'); // Disabled for performance
                    addMessage('kick', 'System', 'Listening for messages...', '#53fc18', true);
                } else if (data.event === 'App\\Events\\ChatMessageEvent') {
                    const messageData = JSON.parse(data.data);
                    const username = messageData.sender?.username || 'Unknown';
                    const message = messageData.content || '';
                    const color = messageData.sender?.identity?.color || null;
                    // console.log('Kick chat message:', username, message, color); // Disabled for performance
                    addMessage('kick', username, message, color);
                }
            } catch (e) {
                console.error('Kick message parse error:', e, event.data);
            }
        };

        kickWs.onerror = (error) => {
            console.error('Kick WebSocket error:', error);
            updateStatus('kick', false);
        };

        kickWs.onclose = () => {
            console.log('Kick WebSocket closed');
            updateStatus('kick', false);
        };

    } catch (error) {
        console.error('Error connecting to Kick:', error);
        updateStatus('kick', false);
    }
}

// Connect to YouTube (polling)
let youtubeInterval = null;
let youtubeLiveChatId = null;
let youtubeNextPageToken = null;

async function connectYouTube() {
    if (!config.youtube || !config.youtubeKey) return;

    try {
        // Get live chat ID
        const videoResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=liveStreamingDetails&id=${config.youtube}&key=${config.youtubeKey}`
        );
        const videoData = await videoResponse.json();

        if (!videoData.items || videoData.items.length === 0) {
            console.error('YouTube video not found or not live');
            return;
        }

        youtubeLiveChatId = videoData.items[0].liveStreamingDetails?.activeLiveChatId;

        if (!youtubeLiveChatId) {
            console.error('No active live chat found');
            return;
        }

        updateStatus('youtube', true);
        addMessage('youtube', 'System', `Connected to YouTube live chat`, '#ff0000', true);

        // Poll for messages
        pollYouTubeMessages();
        youtubeInterval = setInterval(pollYouTubeMessages, 5000);

    } catch (error) {
        console.error('Error connecting to YouTube:', error);
        updateStatus('youtube', false);
    }
}

async function pollYouTubeMessages() {
    if (!youtubeLiveChatId) return;

    try {
        let url = `https://www.googleapis.com/youtube/v3/liveChat/messages?liveChatId=${youtubeLiveChatId}&part=snippet,authorDetails&key=${config.youtubeKey}`;

        if (youtubeNextPageToken) {
            url += `&pageToken=${youtubeNextPageToken}`;
        }

        const response = await fetch(url);
        const data = await response.json();

        if (data.items) {
            data.items.forEach(item => {
                const username = item.authorDetails.displayName;
                const message = item.snippet.displayMessage;
                addMessage('youtube', username, message);
            });
        }

        youtubeNextPageToken = data.nextPageToken;

    } catch (error) {
        console.error('Error polling YouTube messages:', error);
    }
}

// Initialize connections
async function initializeChat() {
    const chatContainer = document.getElementById('chat-container');
    const chatMessages = document.getElementById('chat-messages');

    // Check if any chat is configured
    if (!config.twitch && !config.kick && !config.youtube) {
        chatContainer.innerHTML = `
            <div id="no-chat-message">
                <div>
                    <h2>No Chats Configured</h2>
                    <p>Click the Configure button to set up your unified chat,<br>or add URL parameters like:<br>?twitch=channel&kick=channel&youtube=videoID&youtubekey=KEY</p>
                </div>
            </div>
        `;
        return;
    }

    // Apply transparent mode
    if (config.transparent) {
        document.body.classList.add('transparent');
    }

    // Apply max width
    document.documentElement.style.setProperty('--max-chat-width', `${config.maxWidth}px`);

    // Fetch emotes first
    await fetchEmotes();

    // Connect to platforms
    connectTwitch();
    connectKick();
    connectYouTube();
}

// Disconnect all
function disconnectAll() {
    if (twitchWs) {
        twitchWs.close();
        twitchWs = null;
    }
    if (kickWs) {
        kickWs.close();
        kickWs = null;
    }
    if (youtubeInterval) {
        clearInterval(youtubeInterval);
        youtubeInterval = null;
    }
    updateStatus('twitch', false);
    updateStatus('kick', false);
    updateStatus('youtube', false);
}

// Modal controls
const configButton = document.getElementById('config-button');
const configModal = document.getElementById('config-modal');
const saveButton = document.getElementById('save-config');
const cancelButton = document.getElementById('cancel-config');

configButton.addEventListener('click', () => {
    document.getElementById('twitch-channel').value = config.twitch;
    document.getElementById('kick-channel').value = config.kick;
    document.getElementById('youtube-video').value = config.youtube;
    document.getElementById('youtube-key').value = config.youtubeKey;
    document.getElementById('emote-set').value = config.emoteSet;
    document.getElementById('show-platform-badges').checked = config.showPlatformBadges;
    document.getElementById('show-system-messages').checked = config.showSystemMessages;
    document.getElementById('show-username-colors').checked = config.showUsernameColors;
    document.getElementById('max-messages').value = config.maxMessages;
    document.getElementById('max-messages-value').textContent = config.maxMessages;
    document.getElementById('max-width').value = config.maxWidth;
    document.getElementById('max-width-value').textContent = config.maxWidth;
    configModal.classList.add('active');
});

// Update slider value displays
document.getElementById('max-messages').addEventListener('input', (e) => {
    document.getElementById('max-messages-value').textContent = e.target.value;
});

document.getElementById('max-width').addEventListener('input', (e) => {
    document.getElementById('max-width-value').textContent = e.target.value;
});

cancelButton.addEventListener('click', () => {
    configModal.classList.remove('active');
});

saveButton.addEventListener('click', () => {
    config.twitch = document.getElementById('twitch-channel').value.trim();
    config.kick = document.getElementById('kick-channel').value.trim();
    config.youtube = document.getElementById('youtube-video').value.trim();
    config.youtubeKey = document.getElementById('youtube-key').value.trim();
    config.emoteSet = document.getElementById('emote-set').value.trim();
    config.showPlatformBadges = document.getElementById('show-platform-badges').checked;
    config.showSystemMessages = document.getElementById('show-system-messages').checked;
    config.showUsernameColors = document.getElementById('show-username-colors').checked;
    config.maxMessages = parseInt(document.getElementById('max-messages').value, 10);
    config.maxWidth = parseInt(document.getElementById('max-width').value, 10);

    // Save to localStorage
    localStorage.setItem('twitch', config.twitch);
    localStorage.setItem('kick', config.kick);
    localStorage.setItem('youtube', config.youtube);
    localStorage.setItem('youtubekey', config.youtubeKey);
    localStorage.setItem('7tv', config.emoteSet);
    localStorage.setItem('showPlatformBadges', config.showPlatformBadges);
    localStorage.setItem('showSystemMessages', config.showSystemMessages);
    localStorage.setItem('showUsernameColors', config.showUsernameColors);
    localStorage.setItem('maxMessages', config.maxMessages);
    localStorage.setItem('maxWidth', config.maxWidth);

    // Update URL with all parameters
    const params = new URLSearchParams();
    if (config.twitch) params.set('twitch', config.twitch);
    if (config.kick) params.set('kick', config.kick);
    if (config.youtube) params.set('youtube', config.youtube);
    if (config.youtubeKey) params.set('youtubekey', config.youtubeKey);
    if (config.emoteSet) params.set('7tv', config.emoteSet);
    if (config.transparent) params.set('transparent', 'true');
    if (!config.showPlatformBadges) params.set('hidebadges', 'true');
    if (!config.showSystemMessages) params.set('hidesystem', 'true');
    if (!config.showUsernameColors) params.set('hidecolors', 'true');
    if (config.maxMessages !== 500) params.set('maxmessages', config.maxMessages);
    if (config.maxWidth !== 1200) params.set('maxwidth', config.maxWidth);

    const newUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
    window.history.replaceState({}, '', newUrl);

    configModal.classList.remove('active');

    // Apply max width immediately
    document.documentElement.style.setProperty('--max-chat-width', `${config.maxWidth}px`);

    // Reconnect
    disconnectAll();
    document.getElementById('chat-messages').innerHTML = '';
    initializeChat();
});

// Initialize
parseURLParams();
initializeChat();