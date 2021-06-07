const mongoose = require("../database/index");

const ScheduleSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        customer : {
            type : String,
            required : true
        },
        date: {
            type: String,
            required: true,
        },
        startTime : {
            type : String,
            required : true
        },
        endTime : {
            type : String,
            required : true
        },
        services: [{
            type: String,
            required: true
        }],
        status : {
            type : Boolean,
            required : true
        },
    },
    {
        versionKey: false
    }
);

const Schedule = mongoose.model('Schedule', ScheduleSchema);

module.exports = Schedule;