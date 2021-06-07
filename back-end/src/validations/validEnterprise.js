//Valida se 'id' passado nos parâmetros pertence a 'idEnterprise' também passada.

const User = require("../models/user");

const ObjectId = require("mongodb").ObjectId;

module.exports = async (id, idEnterprise) => {
    
    const user = await User.findOne({ _id : new ObjectId(id) }, {_id : 0, idEnterprise : 1});

    if(idEnterprise == user.idEnterprise)
        return true;

    return false;
}