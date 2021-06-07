const mongoose = require('../database/index');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema(
    {
        enterprise : {
            type:  mongoose.Schema.Types.ObjectId,
            ref : 'Enterprise',
            required : true
        },
        username : {
            type : String,
            required : true,
            unique : true
        },
        name : {
            type : String,
            required : true,
        },
        password : {
            type : String,
            required : true,
            select : false
        },
        type : {
            type: String,
            required : true
        },
        commission : {
            type : Number,
            required : false,
        },
        phoneNumber : {
            type : String,
            required : false
        },
        occupation: [{
            type: mongoose.Schema.Types.ObjectId,
            ref : 'Occupation',
            required: false
        }]
    },
    {
        versionKey: false
});

UserSchema.pre('save', async function(next) {
    const cryptedPassword = await bcrypt.hash(this.password, 10);
    this.password = cryptedPassword;  

    next();
})

UserSchema.pre('updateOne', async function(next) {
    const cryptedPassword = await bcrypt.hash(this._update.password, 10);
    this._update.password = cryptedPassword;  

    if(this._update.commission == undefined) {
        delete this._update.commission;
    }
    if(this._update.phoneNumber == undefined) {
        delete this._update.phoneNumber;
    }

    next();
})

const User = mongoose.model('User', UserSchema);

module.exports = User;