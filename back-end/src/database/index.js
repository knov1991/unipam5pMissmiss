const mongoose = require('mongoose');
const { db } = require('./config.js');

mongoose.Promise = global.Promise;

mongoose.connect(db.uri, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });

module.exports = mongoose;