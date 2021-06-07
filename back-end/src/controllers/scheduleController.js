const Schedule = require("../models/schedule");
const AccountReceivable = require("../models/accountReceivable");
const Movement = require("../models/movement");
const AccountPayable = require("../models/accountPayable");

const validType = require("../validations/validType");
const User = require("../models/user");

async function findOne(req, res) {
    const idAppointment = req.params.appointment;

    if (idAppointment == null)
        return res.status(400).json({ error: "No 'id' provided" });

    try {
        //TODO: validations

        const schedule = await Schedule.findOne({ _id: idAppointment })
        res.status(200).json({ schedule })

    } catch (err) {
        return res.status(400).json({ error: "Bad Request" })
    }
}

async function findNotPayed(req, res) {
    const idUser = req.params.user;

    const initial = req.query.initial;
    const last = req.query.last;

    if (idUser == null)
        return res.status(400).json({ error: "No 'id' provided" });

    if (initial == null || initial.length == 0)
        return res.status(400).json({ error: "'date' invalid" });

    try {
        if (!await validType(req.userId, ['master', 'manager', 'employee'])) {
            return res.status(403).json({ error: "No authorization" });
        }

        const appointments = await Schedule.find({ 
            user: idUser,
            date: { $gte: initial, $lte: last }, 
            status: false 
        }).sort({ 
            date: 1, 
            startTime: 1 
        }).populate('user');
        
        return res.status(200).json({ appointments });

    } catch (err) {
        return res.status(400).json({ error: "Bad Request" });
    }

}

async function findPayed(req, res) {
    const idUser = req.params.user;

    const initial = req.query.initial;
    const last = req.query.last;

    if (idUser == null)
        return res.status(400).json({ error: "No 'id' provided" });

    if (initial == null || initial.length == 0)
        return res.status(400).json({ error: "'date' invalid" });

    try {
        if (!await validType(req.userId, ['master', 'manager', 'employee'])) {
            return res.status(403).json({ error: "No authorization" });
        }

        const appointments = await Schedule.find({ user: idUser, date: { $gte: initial, $lte: last }, status: true }).sort({ date: 1 }).populate('user');
        return res.status(200).json({ appointments });

    } catch (err) {
        return res.status(400).json({ error: "Bad Request" });
    }

}

async function verifiyAppoitment(req, res) {
    const idUser = req.params.user;
    const date = req.query.date;
    const start = req.query.start;
    const end = req.query.end;

    if (idUser == null)
        return res.status(400).json({ error: "No 'id' provided" });

    if (date == null)
        return res.status(400).json({ error: "'date' invalid" });

    if (start == null ||  start.length == 0)
        return res.status(400).json({ error: "'start time' invalid" });
    
    if (end == null  || end.length == 0)
        return res.status(400).json({ error: "'end time' invalid" });
      
    try {
        if (!await validType(req.userId, ['master', 'manager', 'employee'])) {
            return res.status(403).json({ error: "No authorization" });
        }

        const appointments = await Schedule.find({ 
            user: idUser, 
            date: date, 
            startTime: {$lte: start, $lte: end},
            endTime: {$gte: end, $gte: start},   
            status: false,
        });

        return res.status(200).json({ appointments });

    } catch (err) {
        console.log(err)
        return res.status(400).json({ error: "Bad Request" });
    }

}

async function store(req, res) {
    const idUser = req.params.user;

    const { customer, date, startTime, endTime, services } = req.body;

    if (idUser == null)
        return res.status(400).json({ error: "No 'id' provided" });

    if (customer == null || date == null || startTime == null || endTime == null || services === null)
        return res.status(400).json({ error: "Bad Request" });

    try {

        if (!await validType(req.userId, ['master', 'manager', 'employee'])) {
            return res.status(403).json({ error: "No authorization" });
        }

        const schedule = await Schedule.create({
            user: idUser,
            customer: customer,
            date: date,
            startTime: startTime,
            endTime: endTime,
            services: services,
            status: false
        });
        res.status(201).json({ schedule });

    } catch (err) {
        console.log(err)
        return res.status(400).json({ error: "Bad Request" });
    }

}

async function update(req, res) {
    const idAppointment = req.params.appointment;

    const { customer, date, startTime, endTime, services } = req.body;

    if (idAppointment == null)
        return res.status(400).json({ error: "No 'id' provided" });

    if (customer == null || startTime == null || endTime == null || services == null)
        return res.status(400).json({ error: "Bad Request" });

    try {

        if (!await validType(req.userId, 'master')) {
            if (!await validType(req.userId, 'manager')) {
                return res.status(403).json({ error: "No authorization" });
            }
        }

        await Schedule.updateOne({ _id: idAppointment }, { customer, date, startTime, endTime, services });

        const schedule = await Schedule.findOne({ _id: idAppointment })
        res.status(200).json({ schedule });

    } catch (err) {

        return res.status(400).json({ error: "Bad Request" });

    }
}

async function payment(req, res) {
    const idAppointment = req.params.appointment;
    const idEnterprise = req.params.enterprise;

    let { description, debtor, value, valuePayed, paymentMethod, deadline, wasPaid } = req.body;

    if(valuePayed == value) {
        wasPaid = true;
    }

    try {

        if (!await validType(req.userId, 'master')) {
            if (!await validType(req.userId, ['manager', 'employee'])) {
                return res.status(403).json({ error: "No authorization" });
            }
        }

        if (!await Schedule.findOne({ _id: idAppointment }))
            throw err;

        await Schedule.updateOne({ _id: idAppointment }, { status: true });

        const accountReceivable = await AccountReceivable.create({
            description: description,
            enterprise: idEnterprise,
            schedule: idAppointment,
            debtor: debtor,
            value: value,
            valuePayed: valuePayed,
            paymentMethod: paymentMethod,
            deadline: deadline,
            wasPaid: wasPaid
        })

        let base = new Date()
        
        let date = new Date(base.valueOf() - base.getTimezoneOffset() * 60000)
        let day = String(date.getDate()).padStart(2, "0")
        let month = String(date.getMonth() + 1).padStart(2, "0")
        let year = String(date.getFullYear())
        let today = (`${year}-${month}-${day}`)

        if(paymentMethod != 'Prazo' || valuePayed != 0)
        {

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

        const schedule = await Schedule.findOne({ _id: idAppointment }).populate('user');
        
        if(schedule.user.commission > 0){

            let commission = schedule.user.commission;
            let employeerId = schedule.user._id;

            let commissionCalculation = (commission/100) * value;

            let dayLimit = date.getDate() + 30
            let monthLimit = date.getMonth() + 1
            let yearLimit = date.getFullYear()

            if (dayLimit > 31 ){
                monthLimit++;
                dayLimit -= 30;
            }
            if(monthLimit > 12){
                yearLimit++;
                monthLimit -= 12;
            }
            let limit = (`${String(yearLimit).padStart(2, "0")}-${String(monthLimit).padStart(2, "0")}-${String(dayLimit)}`)

            const accountPayable = await AccountPayable.create({ 
                enterprise: idEnterprise,
                type: `Comissão de ${schedule.user.name} - ${schedule.services}`,
                user: schedule.user._id,
                value: commissionCalculation,
                limitDate: limit,
                status: false
            }); 

            await Movement.create({
                employeer: employeerId,
                accountReceivable: accountPayable._id,
                type: 'Entrada',
                value: commissionCalculation,
                description: description,
                date: today,
                paymentMethod: "Dinheiro"
            });

        }

        res.status(204).json();

    } catch (err) {
        console.log(err)
        return res.status(400).json({ error: "Bad Request" });
    }
}

async function destroy(req, res) {
    const idAppointment = req.params.appointment;

    if (idAppointment == null)
        return res.status(400).json({ error: "No 'id' provided" });

    try {
        //TODO: validations

        await Schedule.deleteOne({ _id: idAppointment })
        res.status(204).json();

    } catch (err) {
        return res.status(400).json({ error: "Bad Request" });
    }
}

module.exports = {
    findOne,
    findNotPayed,
    findPayed,
    verifiyAppoitment,
    store,
    update,
    payment,
    destroy
}