const Redis = require('ioredis');
const redis = new Redis({
    host: 'localhost', 
    port: 6379, 
});

const writeDatatoRedis = async function (key, data) {
    if (!key) {
        throw new Error("Key is required to write data redis");
    }
    const json = JSON.stringify(data);
    await redis.set(key, json, 'EX', 3600);
}

const readDataFromRedis = async function(key) {
    if (!key) {
        throw new Error("Key is required to read data from redis");
    }
    const json = await redis.get(key);
    if (json) {
        return JSON.parse(json);
    }
    return null; 
}

const joinAuction = async function(auction_id, socket_id) {
    if(!auction_id) {
        throw new Error("auction_id is required to join the auction");
    }
    if(!socket_id) {
        throw new Error("socket_id is required to join the auction");
    }
    await redis.sadd(`bidders_${auction_id}`, socket_id);
}

const leaveAuction = async function(auction_id, socket_id) {
    if(!auction_id) {
        throw new Error("auction_id is required to leave the auction");
    }
    if(!socket_id) {
        throw new Error("socket_id is required to leave the auction");
    }
    await redis.srem(`bidders_${auction_id}`, socket_id);
}

const getLiveBidders = async function(auction_id) {
    if(!auction_id) {
        throw new Error("auction_id is required to get live bidders");
    }
    const members = await redis.smembers(`bidders_${auction_id}`);
    return members;
}

const newBid = async function(auction_id, bidder_id, bidder_name, bid_amount) {
    await redis.sadd(`bids_${auction_id}`, {auction_id: auction_id, bidder_id: bidder_id, bidder_name: bidder_name, bid_amount: bid_amount });
} 

const recentBids = async function(auction_id) {
    const bids = await redis.smembers(`bids_${auction_id}`);
    return JSON.parse(bids);
}

module.exports = { writeDatatoRedis, readDataFromRedis, joinAuction,  leaveAuction, getLiveBidders, newBid, recentBids }






