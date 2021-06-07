const AccountPayable = require("../models/accountPayable")
const ObjectId = require("mongodb").ObjectId;

async function findOne(req, res) {
    const idEnterprise = req.params.enterprise;
    const idAccountPayable = req.params.accountPayable;

    if (idEnterprise == null && idAccountPayable == null)
        return res.status(400).json({ error: "No 'id' provided" });

    try {
        //TODO: validations

        const accountPayable = await AccountPayable.findOne({ _id: idAccountPayable, enterprise: idEnterprise }).populate('enterprise');
        res.status(200).json({ accountPayable })

    } catch (err) {
        return res.status(400).json({ error: "Bad Request" })
    }
}

async function findAll(req, res) {
    const enterprise = req.params.enterprise;

    try {
        //TODO: validations

        const accountPayables = await AccountPayable.find({ enterprise: enterprise }).sort({ status: 0 });
        return res.status(200).json({ accountPayables });

    } catch (err) {
        return res.status(400).json({ error: "Bad Request" });
    }

}

async function findAccounts(req, res) {
    const enterprise = req.params.enterprise;
    const last = req.query.last;
    const type = req.params.type;

    try {

        if(type == 'payed') {
            const accountPayables = await AccountPayable.find({ 
                enterprise: enterprise, 
                status: true 
            });

            return res.status(200).json({ accountPayables });
        }

        if(type == 'notPayed') {
            const accountPayables = await AccountPayable.find({ 
                enterprise: enterprise, 
                status: false 
            });

            return res.status(200).json({ accountPayables });
        }

        if(type == 'period'){
            const accountPayables = await AccountPayable.find({ 
                enterprise: enterprise, 
                limitDate: { $lte: last }, 
                status: { $ne: true } 
            });

            return res.status(200).json({ accountPayables });
        }

    } catch (err) {
        return res.status(400).json({ error: "Bad Request" });
    }

}

async function findAccountsEmployee(req, res) {
    const idEnterprise = req.params.enterprise;
    const user = req.params.user;
    const type = req.params.type;

    try {

        //TODO: validations

        if (type == 'commissions') {
            const commissions = await AccountPayable.find({ enterprise: idEnterprise, user: user, status: false })
                .populate('enterprise')
                .populate('user')

            return res.status(200).json({ commissions });
        }

        if (type == 'pending') {
            const pending = await AccountPayable.aggregate([
                {
                    $match: {
                        user: new ObjectId(user),
                        status: false
                    }
                },

                {
                    $group:
                    {
                        "_id": "$user",
                        "total": { "$sum": "$value" }
                    }
                }
            ]);

            return res.status(200).json({ pending });
        }

        if (type === 'total') {
            const total = await AccountPayable.aggregate([
                {
                    $match: {
                        user: new ObjectId(user),
                        status: true
                    }
                },

                {
                    $group:
                    {
                        "_id": "$user",
                        "total": { "$sum": "$value" }
                    }
                }
            ]);

            return res.status(200).json({ total });
        }

    } catch (err) {
        return res.status(400).json({ error: "Bad Request" });
    }
}


async function store(req, res) {
    const enterprise = req.params.enterprise;

    const { type, value, limitDate } = req.body;

    if (enterprise == null || type == null || value == null || limitDate == null)
        return res.status(400).json({ error: "Bad Request" });

    try {
        const accountPayable = await AccountPayable.create({
            enterprise: enterprise,
            type: type,
            value: value,
            limitDate: limitDate,
            status: false
        });
        res.status(201).json({ accountPayable });

    } catch (err) {
        console.log(err)
        return res.status(400).json({ error: "Bad Request" });
    }

}

async function update(req, res) {
    const idEnterprise = req.params.enterprise;
    const idAccountPayable = req.params.accountPayable;

    const { type, value, limitDate } = req.body;

    if (idEnterprise == null && idAccountPayable == null)
        return res.status(400).json({ error: "No 'id' provided" });

    if (type == null || value == null || limitDate == null)
        return res.status(400).json({ error: "Bad Request" });

    try {
        await AccountPayable.updateOne({ _id: idAccountPayable, enterprise: idEnterprise }, { type, value, limitDate });

        const accountPayable = await AccountPayable.findOne({ _id: idAccountPayable })
        res.status(200).json({ accountPayable });

    } catch (err) {
        console.log(err)
        return res.status(400).json({ error: "Bad Request" });
    }
}

async function destroy(req, res) {
    const idEnterprise = req.params.enterprise;
    const idAccountPayable = req.params.accountPayable;

    if (idEnterprise == null && idAccountPayable == null)
        return res.status(400).json({ error: "No 'id' provided" });

    try {
        //TODO: validations

        await AccountPayable.deleteOne({ _id: idAccountPayable, enterprise: idEnterprise })
        res.status(204).json();

    } catch (err) {
        return res.status(400).json({ error: "Bad Request" });
    }
}

module.exports = {
    findOne,
    findAll,
    findAccounts,
    findAccountsEmployee,
    store,
    update,
    destroy
}