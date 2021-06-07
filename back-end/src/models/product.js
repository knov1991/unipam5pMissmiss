const mongoose = require("../database/index");

const ProductSchema = new mongoose.Schema(
    {
        enterprise: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Enterprise",
            required: true
        },
        name: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: false
        },
        quantity: {
            type: Number,
            required: true
        },
        value: {
            type: Number,
            required: true
        },
        image: {
            type: String,
            required: false
        }
    },
    {
        versionKey: false
    }
);

const Product = mongoose.model('Product', ProductSchema);

module.exports = Product;