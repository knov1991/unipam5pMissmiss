const mongoose = require("../database/index");

const AccountReceivableSchema = new mongoose.Schema({
        enterprise : {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Enterprise',
            required: true
        },
        description : {
            type : String,
            required : true
        },
        reservation : {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Reservation',
            required: function(){
                if(this.schedule)
                    return false;
                else
                    return true;
            }
        },
        schedule : {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Schedule',
            required: function(){
                if(this.reservation)
                    return false;
                else
                    return true;
            }
        },
        debtor : {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Debtor',
            required: function(){
                if (this.paymentMethod == "Prazo") return true;
                else return false;
            }
        },
        value: {
            type: Number,
            required: true
        },
        valuePayed: {
            type: Number,
            min: 0,
            required: true
        },
        deadline: {
            type: String,
            required: true
        },
        paymentMethod : {
            type : String,
            enum : ["Dinheiro", "Crédito", "Débito", "Prazo"],
            required : true
        },
        wasPaid : {
            type: Boolean,
            required: true,
            default: false
        } 
    },
    {
        versionKey: false
});

const AccountReceivable = mongoose.model('AccountReceivable', AccountReceivableSchema);

module.exports = AccountReceivable;