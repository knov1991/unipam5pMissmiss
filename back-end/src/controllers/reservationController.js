const Reservation = require("../models/reservation");
const Product = require("../models/product");
const AccountReceivable = require("../models/accountReceivable");
const Movement = require("../models/movement")

async function findOne(req, res) {
    const idEnterprise = req.params.enterprise;
    const idReservation = req.query.reservation;

    if (idEnterprise == null && idReservation == null)
        return res.status(400).json({ error: "No 'id' provided" });

    try {
        //TODO: validations
        const reservation = await Reservation.findOne({ _id: idReservation, enteprise: idEnterprise })
            .populate({ path: 'product', model: 'Product' })
            .populate({ path: 'enterprise', model: 'Enterprise' })
            .populate({ path: 'customer', model: 'User' });

        res.status(200).json({ reservation });

    } catch (err) {
        return res.status(400).json({ error: "Bad Request" })
    }
}

async function findAll(req, res) {
    const enterprise = req.params.enterprise;

    try {
        //TODO: validations
        const reservation = await Reservation.find({ enterprise: enterprise }).populate({ path: 'product', model: 'Product' });
        return res.status(200).json({ reservation });

    } catch (err) {
        return res.status(400).json({ error: "Bad Request" });
    }

}

async function store(req, res) {
    const enterprise = req.params.enterprise;
    const product = req.params.product;

    if (enterprise == null && product == null)
        return res.status(400).json({ error: "No 'id' provided" });

    const { customer, customerName, quantity, phoneNumber } = req.body;

    try {
        //TODO: validations

        await Product.updateOne({ _id: product }, { $inc: { quantity: -quantity } })

        if (customer) {
            const reservation = await Reservation.create({
                product: product,
                enterprise: enterprise,
                customer: customer,
                customerName: customerName,
                quantity: quantity,
                phoneNumber: phoneNumber,
                status: false
            });
            res.status(201).json({ reservation });
        }
        else {
            const reservation = await Reservation.create({
                product: product,
                enterprise: enterprise,
                customerName: customerName,
                quantity: quantity,
                phoneNumber: phoneNumber,
                status: false
            });
            res.status(201).json({ reservation });
        }

    } catch (err) {
        return res.status(400).json({ error: "Bad Request" });
    }

}

async function update(req, res) {
    const idReservation = req.params.reservation;

    if (idReservation == null)
        return res.status(400).json({ error: "Bad Request" });

    try {
        //TODO: validations

        if (!await Reservation.findOne({ _id: idReservation }))
            throw err;

        await Reservation.updateOne({ _id: idReservation }, req.body);

        const reservation = await Reservation.findOne({ _id: idReservation })
        res.status(200).json({ reservation });

    } catch (err) {
        console.log(err)
        return res.status(400).json({ error: "Bad Request" });

    }
}

async function payment(req, res) {
    const idEnterprise = req.params.enterprise;
    const idReservation = req.params.reservation;

    let { description, debtor, value, valuePayed, paymentMethod, deadline, wasPaid } = req.body;

    if (valuePayed == value) {
        wasPaid = true;
    }

    try {
        //TODO: validations

        if (!await Reservation.findOne({ _id: idReservation }))
            throw err;

        await Reservation.updateOne({ _id: idReservation }, { status: true });

        const accountReceivable = await AccountReceivable.create({
            description: description,
            enterprise: idEnterprise,
            reservation: idReservation,
            debtor: debtor,
            value: value,
            valuePayed: valuePayed,
            paymentMethod: paymentMethod,
            deadline: deadline,
            wasPaid: wasPaid
        })

        if (paymentMethod != 'Prazo' || valuePayed != 0) {

            let date = new Date()
            let day = String(date.getDate()).padStart(2, "0")
            let month = String(date.getMonth() + 1).padStart(2, "0")
            let year = String(date.getFullYear())
            let today = (`${year}-${month}-${day}`)

            await Movement.create({
                enterprise: idEnterprise,
                accountReceivable: accountReceivable._id,
                type: 'Entrada',
                value: valuePayed,
                description: description,
                date: today,
                paymentMethod: paymentMethod
            });
        }

        return res.status(204).json()

    } catch (err) {
        console.log(err)
        return res.status(400).json({ error: "Bad Request" });

    }
};

async function sale(req, res) {
    const idEnterprise = req.params.enterprise;
    const idProduct = req.params.product;

    let { customerName, debtor, quantity, description, value, valuePayed, paymentMethod, deadline, wasPaid } = req.body;

    let date = new Date()
    let day = String(date.getDate()).padStart(2, "0")
    let month = String(date.getMonth() + 1).padStart(2, "0")
    let year = String(date.getFullYear())
    let today = (`${year}-${month}-${day}`)

    if (valuePayed == value) {
        wasPaid = true;
    }

    try {
        //TODO: validations

        await Product.updateOne({ _id: idProduct }, { $inc: { quantity: -quantity } })

        const reservation = await Reservation.create({
            product: idProduct,
            enterprise: idEnterprise,
            customerName: customerName,
            quantity: quantity,
            status: true
        });

        const accountReceivable = await AccountReceivable.create({
            description: description,
            debtor: debtor,
            enterprise: idEnterprise,
            reservation: reservation._id,
            value: value,
            valuePayed: valuePayed,
            paymentMethod: paymentMethod,
            deadline: deadline,
            wasPaid: wasPaid
        })

        if (paymentMethod != 'Prazo' || valuePayed != 0) {
            await Movement.create({
                enterprise: idEnterprise,
                accountReceivable: accountReceivable._id,
                type: 'Entrada',
                value: valuePayed,
                description: description,
                date: today,
                paymentMethod: paymentMethod
            });
        }

        return res.status(204).json()

    } catch (err) {
        console.log(err)
        return res.status(400).json({ error: "Bad Request" });

    }
};

async function destroy(req, res) {
    const idEnterprise = req.params.enterprise;
    const idReservation = req.params.reservation;

    if (idEnterprise == null && idReservation == null)
        return res.status(400).json({ error: "No 'id' provided" });

    try {
        //TODO: validations

        const reservation = await Reservation.findOne({ _id: idReservation, enterprise: idEnterprise })

        await Product.updateOne({ _id: reservation.product }, { $inc: { quantity: reservation.quantity } })

        await Reservation.deleteOne({ _id: idReservation, enterprise: idEnterprise })
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
    payment,
    sale,
    destroy
}