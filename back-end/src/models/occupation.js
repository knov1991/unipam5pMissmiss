const mongoose = require("../database/index");

const OccupationSchema = new mongoose.Schema(
    {   
        enterprise : {
            type:  mongoose.Schema.Types.ObjectId,
            ref : 'Enterprise',
            required : true
        },
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: false,
        },
    },
    {
        versionKey: false
    }
);

const Occupation = mongoose.model('Occupation', OccupationSchema);

module.exports = Occupation;