const mongoose = require('../database/index');

const ReservationSchema = new mongoose.Schema(
    {
        enterprise : {
            type:  mongoose.Schema.Types.ObjectId,
            ref : "Enterprise",
            required : true
        },
        product : {
            type : mongoose.Schema.Types.ObjectId,
            reg : 'Product',
            required : true
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
        quantity : {
            type : Number,
            required : true
        },
        status : {
            type : Boolean,
            default : false,
            required : true
        },
        phoneNumber : {
            type : String,
            required : false
        },
    },
    {
        versionKey: false
});

const Reservation = mongoose.model('Reservation', ReservationSchema);

module.exports = Reservation;