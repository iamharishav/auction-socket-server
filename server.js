const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const app = express();
const server = http.createServer(app);
const cors = require('cors');
require('dotenv').config(); 
const { SocketConnectionAuthorize } = require('./utilities.js');
const { 
    writeDatatoRedis, 
    readDataFromRedis, 
    joinAuction,  
    leaveAuction, 
    getLiveBidders,
    newBid,
    recentBids } = require('./redis-db-operations.js');
app.use(cors());
const io = socketIO(server, {
    cors: {
        origin: "*",
    }
});

app.get('/', async(req, res) => {
    res.send('Ok');
});

io.on('connection', async (socket) => {
    console.log(`Socket Connection Established ${socket.id}`);
    const token = socket.handshake.query.token;
    const bidderName = socket.handshake.query.bidderName;
    const authUser = await SocketConnectionAuthorize(token);
    if( authUser ) {
        await writeDatatoRedis(socket.id, {"userId": authUser.userId, bidderName: bidderName });
    } else {
        socket.disconnect(true);
    }

    socket.on('joinAuction', (message) => {
        joinAuction(message['auction_id'], socket.id);
    });

    socket.on('leaveAuction', (message) => {
        leaveAuction(message['auction_id'], socket.id);
    });

    socket.on('newBid', async (message) => {
        const userInfo = await readDataFromRedis(socket.id);
        await newBid(message['auction_id'], userInfo['userId'], userInfo['bidderName'], message['bid_anount']);
        const liveBidders = await getLiveBidders(message['auction_id']);
        const bids = await recentBids(message['auction_id']);
        bids.forEach(function(bid){
            console.log(typeof(bid));
        });
        liveBidders.forEach((socketId) => {
            io.to(socketId).emit('auctionUpdate', bids);
        });
    });

    socket.on('disconnect', () => {
        console.log('Socket Connection is Disconnected');
    });
});

const port = process.env.PORT || 8080;
server.listen(port, () => {
    console.log(`The socket server is running on http://localhost:${port}`);
})
