const Movement = require("../models/movement")
const AccountPayable = require('../models/accountPayable');
const AccountReceivable = require('../models/accountReceivable');
const ObjectId = require("mongodb").ObjectId;

async function findOne(req, res) {
    const idEnterprise = req.params.enterprise;
    const idMovement = req.params.movement;

    if (idEnterprise == null && idMovement == null)
        return res.status(400).json({ error: "No 'id' provided" });

    try {
        //TODO: validations

        const movement = await Movement.findOne({ _id: idMovement, enterprise: idEnterprise }).populate('enterprise');
        res.status(200).json({ movement })

    } catch (err) {
        return res.status(400).json({ error: "Bad Request" })
    }
}

async function findAll(req, res) {
    const enterprise = req.params.enterprise;

    try {
        //TODO: validations

        const movements = await Movement.find({ enterprise: enterprise });
        return res.status(200).json({ movements });

    } catch (err) {
        return res.status(400).json({ error: "Bad Request" });
    }

}

async function movementStatus(req, res) {
    const enterprise = req.params.enterprise;
    const initial = req.query.initial;
    const last = req.query.last;

    try {
        //TODO: validations

        const outlay = await Movement.aggregate([
            {
                $match: {
                    type: 'Saída',
                    enterprise: new ObjectId(enterprise),
                    date: { $gte: initial, $lte: last }
                }
            },

            {
                $group:
                {
                    "_id": "$enterprise",
                    "total": { "$sum": "$value" }
                }
            }
        ]);

        const revenue = await Movement.aggregate([
            {
                $match: {
                    type: 'Entrada',
                    enterprise: new ObjectId(enterprise),
                    date: { $gte: initial, $lte: last }
                }
            },

            {
                $group:
                {
                    "_id": "$enterprise",
                    "total": { "$sum": "$value" }
                }
            }
        ]);

        const pending = await AccountReceivable.aggregate([
            {
                $match: {
                    wasPaid: false,
                    enterprise: new ObjectId(enterprise),
                }
            },

            {
                $group:
                {
                    "_id": "$enterprise",
                    "value": { "$sum": "$value" },
                    "valuePayed": { "$sum": "$valuePayed" }

                }
            },
            {
                $addFields: {
                    total: { $subtract: ["$value", "$valuePayed"] }
                }
            }
        ]);

        const money = await Movement.aggregate([
            {
                $match: {
                    enterprise: new ObjectId(enterprise),
                    date: { $gte: initial, $lte: last },
                    paymentMethod: 'Dinheiro'
                }
            },

            {
                $group:
                {
                    "_id": "$enterprise",
                    "total": { "$sum": "$value" }
                }
            }
        ]);

        const credit = await Movement.aggregate([
            {
                $match: {
                    enterprise: new ObjectId(enterprise),
                    date: { $gte: initial, $lte: last },
                    paymentMethod: 'Crédito'
                }
            },

            {
                $group:
                {
                    "_id": "$enterprise",
                    "total": { "$sum": "$value" }
                }
            }
        ]);

        const debit = await Movement.aggregate([
            {
                $match: {
                    enterprise: new ObjectId(enterprise),
                    date: { $gte: initial, $lte: last },
                    paymentMethod: 'Débito'
                }
            },

            {
                $group:
                {
                    "_id": "$enterprise",
                    "total": { "$sum": "$value"}
                }
            }
        ]);

        return res.status(200).json({ outlay, revenue, pending, money, credit, debit });

    } catch (err) {
        console.log(err)
        return res.status(400).json({ error: "Bad Request" });
    }

}

async function findMovements(req, res) {
    const enterprise = req.params.enterprise;
    const initial = req.query.initial;
    const last = req.query.last;
    const type = req.params.type;

    try {

        if (type == 'revenue') {
            const revenues = await Movement.find({ 
                enterprise: enterprise, 
                type: { $eq: 'Entrada' }, 
                date: { $gte: initial, $lte: last } 
            }).sort({ date: 1 });

            return res.status(200).json({ revenues });
        }

        if(type == 'outlay'){
            const outlays = await Movement.find({ 
                enterprise: enterprise, 
                type: { $eq: 'Saída' }, 
                date: { $gte: initial, $lte: last } 
            }).sort({ date: 1 });

            return res.status(200).json({ outlays });
        }

    }
    catch (err) {
        return res.status(400).json({ error: "Bad Request" });
    }
}

async function store(req, res) {
    const enterprise = req.params.enterprise;

    const { type, value, description, date, paymentMethod } = req.body;

    if (enterprise == null || type == null || value == null || description == null || date == null || paymentMethod == null)
        return res.status(400).json({ error: "Bad Request" });

    try {
        const movement = await Movement.create({
            enterprise: enterprise,
            type: type,
            value: value,
            description: description,
            date: date,
            paymentMethod: paymentMethod
        });
        res.status(201).json({ movement });

    } catch (err) {
        return res.status(400).json({ error: "Bad Request" });
    }

}

async function storeOutlay(req, res) {
    const enterprise = req.params.enterprise;
    const account = req.params.account;

    const { value, description, date } = req.body;

    if (enterprise == null || value == null || description == null || date == null)
        return res.status(400).json({ error: "Bad Request" });

    try {
        const movement = await Movement.create({
            enterprise: enterprise,
            accountPayable: account,
            type: 'Saída',
            value: value,
            description: description,
            date: date,
            paymentMethod: 'Dinheiro'
        });

        await AccountPayable.updateOne({ _id: account, enterprise: enterprise }, { status: true });

        res.status(201).json({ movement });

    } catch (err) {
        return res.status(400).json({ error: "Bad Request" });
    }

}

async function update(req, res) {
    const idEnterprise = req.params.enterprise;
    const idMovement = req.params.movement;

    const { type, value, description, date, paymentMethod } = req.body;

    if (idEnterprise == null && idMovement == null)
        return res.status(400).json({ error: "No 'id' provided" });

    if (type == null || value == null || description == null || date == null || paymentMethod == null)
        return res.status(400).json({ error: "Bad Request" });

    try {
        await Movement.updateOne({ _id: idMovement, enterprise: idEnterprise }, { type, value, description, date, paymentMethod });

        const movement = await Movement.findOne({ _id: idMovement })
        res.status(200).json({ movement });

    } catch (err) {
        return res.status(400).json({ error: "Bad Request" });
    }
}

async function destroy(req, res) {
    const idEnterprise = req.params.enterprise;
    const idMovement = req.params.movement;

    if (idEnterprise == null && idMovement == null)
        return res.status(400).json({ error: "No 'id' provided" });

    try {
        //TODO: validations

        await Movement.deleteOne({ _id: idMovement, enterprise: idEnterprise })
        res.status(204).json();

    } catch (err) {
        return res.status(400).json({ error: "Bad Request" });
    }
}

module.exports = {
    findOne,
    findAll,
    findMovements,
    movementStatus,
    store,
    storeOutlay,
    update,
    destroy
}