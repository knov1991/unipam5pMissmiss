const mongoose = require("../database/index");

const AccountPayableSchema = new mongoose.Schema(
    {
        enterprise : {
            type:  mongoose.Schema.Types.ObjectId,
            ref : "Enterprise",
            required : true
        },
        user : {
            type:  mongoose.Schema.Types.ObjectId,
            ref : "User",
            required : false
        },
        type : {
            type : String,
            required : true
        },
        value : {
            type : Number,
            required : true
        },
        limitDate : {
            type : String,
            required : true
        },
        status : {
            type : Boolean,
            required : true,
            default: false
        }

    },
    {
        versionKey: false
    }
);

const AccountPayable = mongoose.model('AccountPayable', AccountPayableSchema);

module.exports = AccountPayable;