const Product = require("../models/product")
const path = require("path");
const fs = require("fs");
const { promisify } = require("util");

async function findOne(req, res) {
    const idEnterprise = req.params.enterprise;
    const idProduct = req.params.product;

    if (idEnterprise == null && idProduct == null)
        return res.status(400).json({ error: "No 'id' provided" });

    try {
        //TODO: validations

        const product = await Product.findOne({ _id: idProduct, enterprise: idEnterprise }).populate('enterprise');
        res.status(200).json({ product })

    } catch (err) {
        return res.status(400).json({ error: "Bad Request" })
    }
}

async function findAll(req, res) {
    const enterprise = req.params.enterprise;

    try {
        //TODO: validations

        const products = await Product.find({ enterprise: enterprise });
        return res.status(200).json({ products });

    } catch (err) {
        return res.status(400).json({ error: "Bad Request" });
    }

}

async function store(req, res) {
    const enterprise = req.params.enterprise;

    const { name, description, quantity, value } = req.body;

    if (enterprise == null || name == null || description == null || quantity == null || value == null)
        return res.status(400).json({ error: "Bad Request" });

    try {
        if (req.file) {
            const product = await Product.create({
                enterprise: enterprise,
                name: name,
                description: description,
                quantity: quantity,
                value: value,
                image: req.file.filename
            });
            res.status(201).json({ product });
        }
        else {
            const product = await Product.create({
                enterprise: enterprise,
                name: name,
                description: description,
                quantity: quantity,
                value: value,
            });
            res.status(201).json({ product });
        }


    } catch (err) {
        console.log(err)
        return res.status(400).json({ error: "Bad Request" });
    }

}

async function update(req, res) {
    const idEnterprise = req.params.enterprise;
    const idProduct = req.params.product;

    const { name, description, quantity, value } = req.body;

    if (idEnterprise == null && idProduct == null)
        return res.status(400).json({ error: "No 'id' provided" });

    if (name == null || description == null || quantity == null || value == null)
        return res.status(400).json({ error: "Bad Request" });

    try {
        if (req.file) {
            const product = await Product.findById({ _id: idProduct, enterprise: idEnterprise })

            if (product.image !== undefined) {
                promisify(fs.unlink)(
                    path.resolve(__dirname, '..', '..', 'uploads', product.image)
                );
            }

            await Product.updateOne({
                _id: idProduct,
                enterprise: idEnterprise
            }, {
                name,
                description,
                quantity,
                value,
                image: req.file.filename
            });
        }
        else {
            await Product.updateOne({
                _id: idProduct,
                enterprise: idEnterprise
            }, {
                name,
                description,
                quantity,
                value
            });
        }

        const product = await Product.findOne({ _id: idProduct })
        res.status(200).json({ product });

    } catch (err) {
        return res.status(400).json({ error: "Bad Request" });
    }
}

async function destroy(req, res) {
    const idEnterprise = req.params.enterprise;
    const idProduct = req.params.product;

    if (idEnterprise == null && idProduct == null)
        return res.status(400).json({ error: "No 'id' provided" });

    try {
        //TODO: validations

        const product = await Product.findById({ _id: idProduct, enterprise: idEnterprise })

        if (product.image !== undefined) {
            promisify(fs.unlink)(
                path.resolve(__dirname, '..', '..', 'uploads', product.image)
            );
        }

        await Product.deleteOne({ _id: idProduct, enterprise: idEnterprise })

        res.status(204).json();

    } catch (err) {
        console.log(err)
        return res.status(400).json({ error: "Bad Request" });
    }
}

module.exports = {
    findOne,
    findAll,
    store,
    update,
    destroy
}