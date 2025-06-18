document.addEventListener('DOMContentLoaded', () => {
    const messagesDiv = document.getElementById('messages');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const connectionStatus = document.getElementById('connectionStatus');

    // --- IMPORTANT: REPLACE THIS WITH YOUR RENDER WEBSOCKET SERVER URL ---
    // Example: If your Render Web Service URL is https://my-game-server.onrender.com
    // Then your WebSocket URL will be wss://my-game-server.onrender.com
    const WS_SERVER_URL = 'wss://multi-game-server.onrender.com'; // Placeholder - CHANGE THIS!
    // -------------------------------------------------------------------

    let ws;

    function connectWebSocket() {
        connectionStatus.textContent = 'Connecting...';
        connectionStatus.style.color = '#bbb';

        ws = new WebSocket(WS_SERVER_URL);

        ws.onopen = (event) => {
            console.log('WebSocket connection opened:', event);
            connectionStatus.textContent = 'Connected';
            connectionStatus.style.color = '#4CAF50'; // Green
            appendMessage('You have connected to the server.', 'system');
        };

        ws.onmessage = (event) => {
            // Assuming the server sends plain text messages for this example
            const messageData = event.data;
            console.log('Message from server:', messageData);
            appendMessage(messageData, 'server');
        };

        ws.onclose = (event) => {
            console.log('WebSocket connection closed:', event);
            connectionStatus.textContent = `Disconnected: ${event.reason || 'Unknown reason'}`;
            connectionStatus.style.color = '#f44336'; // Red
            appendMessage('Disconnected from server. Attempting to reconnect...', 'system-error');

            // Attempt to reconnect after a delay
            setTimeout(connectWebSocket, 3000); // Try to reconnect after 3 seconds
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            connectionStatus.textContent = 'Connection Error!';
            connectionStatus.style.color = '#f44336'; // Red
            ws.close(); // Close the connection to trigger onclose and retry
        };
    }

    function appendMessage(message, type) {
        const p = document.createElement('p');
        p.textContent = message;
        p.classList.add(type); // Add a class for styling (e.g., 'server', 'system', 'system-error')
        messagesDiv.appendChild(p);
        // Scroll to the bottom to see the latest message
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    function sendMessage() {
        const message = messageInput.value.trim();
        if (message && ws && ws.readyState === WebSocket.OPEN) {
            ws.send(message);
            appendMessage(`You: ${message}`, 'you'); // Display your own message
            messageInput.value = ''; // Clear input field
        } else if (ws && ws.readyState !== WebSocket.OPEN) {
            appendMessage('Not connected to server. Please wait or refresh.', 'system-error');
        }
    }

    // Event listeners
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            sendMessage();
        }
    });

    // Initial connection attempt when the page loads
    connectWebSocket();
});
