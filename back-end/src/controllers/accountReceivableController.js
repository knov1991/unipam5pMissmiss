const AccountReceivable = require('../models/accountReceivable');
const Movement = require('../models/movement');

async function findOne(req, res) {
    const idEnterprise = req.params.enterprise;
    const idAccountReceivable = req.params.accountReceivable;

    try {

        //TODO: validations

        const accountReceivable = await AccountReceivable.findOne({ _id: idAccountReceivable, enterprise: idEnterprise })
            .populate('enterprise')
            .populate('debtor')
            .populate('schedule')
            .populate('reservation');

        res.status(200).json({ accountReceivable })

    } catch (err) {
        res.status(400).json({ error: "Bad Request" })
    }
}

async function findAll(req, res) {
    const idEnterprise = req.params.enterprise;

    try {

        //TODO: validations

        const accountReceivable = await AccountReceivable.find({ enterprise: idEnterprise })
            .populate('enterprise')
            .populate('debtor')
            .populate('schedule')
            .populate('reservation');

        return res.status(200).json({ accountReceivable });

    } catch (err) {
        return res.status(400).json({ error: "Bad Request" });
    }
}

async function findAccountsDebtor(req, res) {
    const idEnterprise = req.params.enterprise;
    const debtor = req.params.debtor;

    try {

        //TODO: validations

        const accountReceivable = await AccountReceivable.find({ enterprise: idEnterprise, debtor: debtor, wasPaid: false })
            .populate('enterprise')
            .populate('debtor')
            .populate('schedule')
            .populate('reservation')
            .populate('product');

        return res.status(200).json({ accountReceivable });

    } catch (err) {
        return res.status(400).json({ error: "Bad Request" });
    }
}


async function store(req, res) {
    const idEnterprise = req.params.enterprise;

    const { description, reservation, schedule, debtor, value, valuePayed, paymentMethod, deadline, wasPaid } = req.body;

    try {

        const accountReceivable = await AccountReceivable.create({
            description: description,
            enterprise: idEnterprise,
            reservation: reservation,
            schedule: schedule,
            debtor: debtor,
            value: value,
            valuePayed: valuePayed,
            paymentMethod: paymentMethod,
            deadline: deadline,
            wasPaid: wasPaid
        })

        res.status(201).json({ accountReceivable })

    } catch (err) {
        res.status(400).json({ error: "Bad Request" })
    }
}

async function update(req, res) {
    const idAccountReceivable = req.params.accountReceivable;

    try {

        if (!await AccountReceivable.findOne({ _id: idAccountReceivable }))
            throw err;

        await AccountReceivable.updateOne({ _id: idAccountReceivable }, req.body);

        const accountReceivable = await AccountReceivable.findOne({ _id: idAccountReceivable })
            .populate('enterprise')
            .populate('debtor')
            .populate('schedule')
            .populate('reservation');

        res.status(200).json({ accountReceivable });

    } catch (err) {
        res.status(400).json({ error: "Bad Request" })
    }
}

async function payment(req, res) {
    const idEnterprise = req.params.enterprise;
    const idAccountReceivable = req.params.accountReceivable;
    const { value, description, paymentMethod } = req.body;

    try {

        if (!await AccountReceivable.findOne({ _id: idAccountReceivable }))
            throw 'Conta não localizada!';

        await AccountReceivable.updateOne({ _id: idAccountReceivable }, { $inc: { valuePayed: value } });

        let date = new Date()
        let day = String(date.getDate()).padStart(2, "0")
        let month = String(date.getMonth() + 1).padStart(2, "0")
        let year = String(date.getFullYear())
        let today = (`${year}-${month}-${day}`)
        
        await Movement.create({
            enterprise: idEnterprise,
            accountReceivable: idAccountReceivable,
            type: 'Entrada',
            value: value,
            description: description,
            date: today,
            paymentMethod: paymentMethod
        });

        const account = await AccountReceivable.findOne({ _id: idAccountReceivable });
        
        if(account.value === account.valuePayed){
            await AccountReceivable.updateOne({ _id: idAccountReceivable }, { wasPaid: true });
        }

        res.status(204).json();

    } catch (err) {
        console.log(err)
        res.status(400).json({ error: "Bad Request" })
    }
}

async function destroy(req, res) {
    const idEnterprise = req.params.enterprise;
    const idAccountReceivable = req.params.accountReceivable;

    try {
        //TODO: validations

        await AccountReceivable.deleteOne({ _id: idAccountReceivable, enterprise: idEnterprise })
        res.status(204).json();

    } catch (err) {
        return res.status(400).json({ error: "Bad Request" });
    }
}

module.exports = {
    findOne,
    findAll,
    findAccountsDebtor,
    store,
    update,
    payment,
    destroy
}