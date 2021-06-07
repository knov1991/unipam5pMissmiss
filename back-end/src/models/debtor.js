const mongoose = require("../database/index");

const DebtorSchema = new mongoose.Schema({
        enterprise : {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Enterprise',
            required: true
        },
        customer : {
            type:  mongoose.Schema.Types.ObjectId,
            ref : 'User',
            required : false
        },
        customerName :{
            type : String,
            required: true
        },
        phoneNumber : {
            type : String,
            required : true
        },
    },   
    {
        versionKey: false
    
});


const Debtor = mongoose.model('Debtor', DebtorSchema);

module.exports = Debtor;