const User = require("../models/user");

const ObjectId = require("mongodb").ObjectId;

module.exports = async (idUser, type) => {
    
    const user = await User.findOne({ _id : new ObjectId(idUser) }, {_id : 0, type : 1});
    
    if(type.includes(user.type) || type == user.type)
        return true;
    return false;
}