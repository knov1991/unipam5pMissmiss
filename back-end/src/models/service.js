const mongoose = require("../database/index");

const ServiceSchema = new mongoose.Schema(
    {   
        occupation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Occupation',
            required: true
        },
        description: {
            type: String,
            required: true,
        },
    },
    {
        versionKey: false
    }
);

const Service = mongoose.model('Service', ServiceSchema);

module.exports = Service;