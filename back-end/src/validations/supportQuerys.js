const User = require('../models/user')

async function reqUserQuery(userId){
    return reqUser = await User.findOne({ _id : userId });
    
}

module.exports = {
    reqUserQuery
}