const index = require('redis');
const redisClient = index.createClient();


redisClient.on('error', (err) => {
    console.log(err);
});

export default redisClient;
