const mongoose = require("../database/index");

const MovementSchema = new mongoose.Schema(
    {
        enterprise : {
            type:  mongoose.Schema.Types.ObjectId,
            ref : "Enterprise",
            required : function(){
                if(this.employeer)
                    return false;
                else
                    return true;
            }
        },
        employeer : {
            type:  mongoose.Schema.Types.ObjectId,
            ref : "User",
            required : function(){
                if(this.enterprise)
                    return false;
                else
                    return true;
            }            
        },
        accountReceivable : {
            type:  mongoose.Schema.Types.ObjectId,
            ref : "AccountReceivable",
            required : function(){
                if(this.accountPayable || this.employerr)
                    return false;
                else
                    return true;
            }
        },
        accountPayable : {
            type:  mongoose.Schema.Types.ObjectId,
            ref : "AccountPayable",
            required : function(){
                if(this.accountReceivable || this.employeer)
                    return false;
                else
                    return true;
            }
        },
        type : {
            type : String,
            required : true
        },
        value : {
            type : Number,
            required : true
        },
        description : {
            type : String,
            required : true
        },
        date : {
            type : String,
            required : true
        },
        paymentMethod : {
            type : String,
            enum : ["Dinheiro", "Crédito", "Débito", "Prazo"],
            required : true
        }

    },
    {
        versionKey: false
    }
);

const Movement = mongoose.model('Movement', MovementSchema);

module.exports = Movement;