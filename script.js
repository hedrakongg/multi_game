document.addEventListener('DOMContentLoaded', () => {
    // Get references to HTML elements
    const messagesDiv = document.getElementById('messages');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const connectionStatus = document.getElementById('connectionStatus');

    // --- IMPORTANT: REPLACE THIS WITH YOUR RENDER WEBSOCKET SERVER URL ---
    // This MUST be the URL of your deployed Render Web Service (your server).
    // If your server URL is https://multi-game-server.onrender.com
    // Then your WebSocket URL will be wss://multi-game-server.onrender.com
    const WS_SERVER_URL = 'wss://multi-game-server.onrender.com'; // <--- VERIFY THIS URL!
    // -------------------------------------------------------------------

    let ws; // Variable to hold our WebSocket connection

    // Function to establish WebSocket connection
    function connectWebSocket() {
        connectionStatus.textContent = 'Connecting...';
        connectionStatus.style.color = '#bbb';

        ws = new WebSocket(WS_SERVER_URL);

        // Event handler for when the WebSocket connection is opened
        ws.onopen = (event) => {
            console.log('WebSocket connection opened:', event);
            connectionStatus.textContent = 'Connected';
            connectionStatus.style.color = '#4CAF50'; // Green
        };

        // Event handler for when a message is received from the server
        ws.onmessage = (event) => {
            let messageData;
            try {
                // Parse the JSON string received from the server
                messageData = JSON.parse(event.data);
            } catch (e) {
                console.error("Failed to parse message from server:", event.data, e);
                // If parsing fails, we can't process the message, so just return
                return;
            }

            console.log('Message from server:', messageData); // Log the received message for debugging

            // Handle different types of messages from the server
            switch (messageData.type) {
                case 'system':
                    // For system messages (like user joined/left)
                    appendMessage(messageData.message, 'system');
                    break;
                case 'chat':
                    // For regular chat messages
                    appendMessage(`${messageData.sender}: ${messageData.message}`, 'chat');
                    break;
                default:
                    // Log if an unknown message type is received (good for debugging)
                    console.warn('Unknown message type received from server:', messageData.type);
            }
        };

        // Event handler for when the WebSocket connection is closed
        ws.onclose = (event) => {
            console.log('WebSocket connection closed:', event);
            connectionStatus.textContent = `Disconnected: ${event.reason || 'Unknown reason'}`;
            connectionStatus.style.color = '#f44336'; // Red color for disconnected status
            appendMessage('Disconnected from server. Attempting to reconnect...', 'system-error');

            // Attempt to reconnect after a short delay (e.g., 3 seconds)
            setTimeout(connectWebSocket, 3000);
        };

        // Event handler for WebSocket errors
        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            connectionStatus.textContent = 'Connection Error!';
            connectionStatus.style.color = '#f44336'; // Red color for error status
            // Close the connection to trigger onclose and attempt reconnection
            ws.close();
        };
    }

    // Function to append a new message to the message board display
    function appendMessage(message, type) {
        const p = document.createElement('p'); // Create a new paragraph element
        p.textContent = message; // Set its text content
        p.classList.add(type); // Add a CSS class based on message type (e.g., 'system', 'chat')
        messagesDiv.appendChild(p); // Add the paragraph to the messages container
        // Scroll to the bottom to ensure the latest message is visible
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    // Function to send a chat message to the server
    function sendMessage() {
        const message = messageInput.value.trim(); // Get message text, remove leading/trailing whitespace
        // Check if message is not empty and WebSocket is open
        if (message && ws && ws.readyState === WebSocket.OPEN) {
            // Send the message as a JSON string with type 'chat'
            ws.send(JSON.stringify({ type: 'chat', message: message }));
            messageInput.value = ''; // Clear the input field after sending
        } else if (ws && ws.readyState !== WebSocket.OPEN) {
            // If not connected, inform the user
            appendMessage('Not connected to server. Please wait or refresh.', 'system-error');
        }
    }

    // Event listener for the Send button click
    sendButton.addEventListener('click', sendMessage);

    // Event listener for the Enter key press in the message input field
    messageInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            sendMessage(); // Send message when Enter is pressed
        }
    });

    // Initial connection attempt when the page first loads
    connectWebSocket();
});
