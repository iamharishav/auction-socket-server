import ws from 'k6/ws';

export let options = {
  vus: 100, // Virtual Users (connections)
  duration: '30s', // Duration of the test
};

export default function () {
  const url = 'ws://localhost:8080'; // Replace with your WebSocket server URL

  ws.connect(url, function (socket) {
    
    socket.on('open', () => {
        console.log('Connected');
    });

    socket.on('message', (data) => {
        console.log(`Received message: ${data}`);
    });

    socket.on('close', () => {
        console.log('Connection closed');
    });

    socket.send('Test message');

    socket.send(JSON.stringify({ message: 'Hello, WebSocket!' }));

  });
}
