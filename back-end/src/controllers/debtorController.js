const Debtor = require('../models/debtor');

async function findOne(req, res) {
    const idEnterprise = req.params.enterprise;
    const idDebtor = req.params.debtor;

    try {

        //TODO: validations

        const debtor = await Debtor.findOne({_id : idDebtor, enterprise: idEnterprise}).populate('enterprise');
        res.status(200).json({ debtor })

    } catch (err){
        res.status(400).json({ error: "Bad Request" })
    }
}

async function findAll(req, res) {
    const idEnterprise = req.params.enterprise;

    try {

        //TODO: validations

        const debtor = await Debtor.find({ enterprise: idEnterprise }).populate('enterprise');
        return res.status(200).json({ debtor });

    } catch (err) {
        return res.status(400).json({ error: "Bad Request" });
    }

}

async function store(req, res) {
    const idEnterprise = req.params.enterprise;
    const {customerName, phoneNumber, customer} = req.body;

    if(customerName == null || phoneNumber == null)
        res.status(400).json({ error: "Bad Request" });

    try{

        //TODO: validations
        
        const debtor = await Debtor.create({
            enterprise : idEnterprise,
            customer : customer,
            customerName : customerName,
            phoneNumber : phoneNumber
        });

        res.status(201).json({ debtor })

    } catch (err) {
        res.status(400).json({ error: "Bad Request" })
    }
}

async function update(req, res) {
    const idEnterprise = req.params.enterprise;
    const idDebtor = req.params.debtor;

    const {customerName, phoneNumber, customer} = req.body;

    if(customerName == null || phoneNumber == null)
        res.status(400).json({ error: "Bad Request" });

    try {

        await Debtor.updateOne({_id : idDebtor}, {
            customerName : customerName,
            phoneNumber : phoneNumber
        });

        const debtor = await Debtor.findOne({_id : idDebtor, enterprise: idEnterprise}).populate('enterprise');
        res.status(200).json({ debtor });

    } catch (err) {
        console.log(err)
        res.status(400).json({ error: "Bad Request" })
    }
}

async function destroy(req, res) {
    const idEnterprise = req.params.enterprise;
    const idDebtor = req.params.debtor;

    try {
        //TODO: validations

        await Debtor.deleteOne({ _id: idDebtor, enterprise: idEnterprise })
        res.status(204).json();

    } catch (err) {
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