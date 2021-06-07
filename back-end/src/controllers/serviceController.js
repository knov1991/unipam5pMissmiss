const Service = require("../models/service");

const validType = require("../validations/validType")

async function findAll(req, res) {
    const idOccupation = req.params.occupation;

    if (idOccupation == null)
        return res.status(400).json({ error: "No 'id' provided" });

    try {
        if (!await validType(req.userId, ['master', 'manager', 'employee'])) {
            return res.status(403).json({ error: "No authorization" });
        }

        const services = await Service.find({ occupation: idOccupation }).populate('occupation');
        return res.status(200).json({ services });

    } catch (err) {
        return res.status(400).json({ error: "Bad Request" });
    }

}

async function store(req, res) {
    const idOccupation = req.params.occupation;

    const { description } = req.body;

    if (description == null)
        return res.status(400).json({ error: "Bad Request" });

    try {

        if (!await validType(req.userId, ['master', 'manager', 'employee'])) {
            return res.status(403).json({ error: "No authorization" });
        }

        const service = await Service.create({
            occupation: idOccupation,
            description: description
        });

        res.status(201).json({ service });

    } catch (err) {
        return res.status(400).json({ error: "Bad Request" });
    }

}

async function update(req, res) {
    const idOccupation = req.params.occupation;
    const idService = req.params.service;

    const { description } = req.body;

    if (idOccupation == null & idService == null)
        return res.status(400).json({ error: "No 'id' provided" });

    if (description == null)
        return res.status(400).json({ error: "Bad Request" });

    try {

        if (!await validType(req.userId, 'master')) {
            if (!await validType(req.userId, 'manager')) {
                return res.status(403).json({ error: "No authorization" });
            }
        }

        await Service.updateOne({ _id: idService, occupation: idOccupation }, { description });

        const service = await Service.findOne({ _id: idService })
        res.status(200).json({ service });

    } catch (err) {
        return res.status(400).json({ error: "Bad Request" });
    }
}

async function destroy(req, res) {
    const idOccupation = req.params.occupation;
    const idService = req.params.service;

    if (idOccupation == null & idService == null)
        return res.status(400).json({ error: "No 'id' provided" });

    try {
        //TODO: validations

        await Service.deleteOne({ _id: idService, occupation: idOccupation })
        res.status(204).json();

    } catch (err) {
        return res.status(400).json({ error: "Bad Request" });
    }
}

module.exports = {
    findAll,
    store,
    update,
    destroy
}