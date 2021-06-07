require('dotenv/config');

const env = process.env;

const db = {

    uri : `mongodb+srv://${env.MONGODB_USER}:${env.MONGODB_PASSWORD}@cluster.7122g.mongodb.net/salon_manager?retryWrites=true&w=majority`
    
}

module.exports = {
    db
}
