const Occupation = require("../models/occupation");
const Service = require("../models/service");
const User = require("../models/user");

const validType = require("../validations/validType");

async function findAll(req, res) {
    const idEnterprise = req.params.enterprise;

    if (idEnterprise == null)
        return res.status(400).json({ error: "No 'id' provided" });

    try {
        if (!await validType(req.userId, ['master', 'manager', 'employee'])) {
            return res.status(403).json({ error: "No authorization" });
        }

        const occupations = await Occupation.find({ enterprise: idEnterprise });
        return res.status(200).json({ occupations });

    } catch (err) {
        return res.status(400).json({ error: "Bad Request" });
    }

}

async function store(req, res) {
    const idEnterprise = req.params.enterprise;
    const { name, description } = req.body;

    if (idEnterprise == null)
        return res.status(400).json({ error: "No 'id' provided" });

    if (name == null)
        return res.status(400).json({ error: "Bad Request" });

    try {

        if (!await validType(req.userId, ['master', 'manager', 'employee'])) {
            return res.status(403).json({ error: "No authorization" });
        }

        const occupation = await Occupation.create({
            enterprise: idEnterprise,
            name: name,
            description: description
        });
        res.status(201).json({ occupation });

    } catch (err) {
        return res.status(400).json({ error: "Bad Request" });
    }

}

async function update(req, res) {
    const idEnterprise = req.params.enterprise;
    const idOccupation = req.params.occupation;

    const { name, description } = req.body;

    if (description == null)
        return res.status(400).json({ error: "Bad Request" });

    try {
        if (!await validType(req.userId, 'master')) {
            if (!await validType(req.userId, 'manager')) {
                return res.status(403).json({ error: "No authorization" });
            }
        }

        await Occupation.updateOne({ _id: idOccupation, enterprise: idEnterprise }, { name, description });

        const occupation = await Occupation.findOne({ _id: idOccupation })
        res.status(200).json({ occupation });
        
    } catch (err) {
        return res.status(400).json({ error: "Bad Request" });
    }
}

async function destroy(req, res) {
    const idOccupation = req.params.occupation;

    try {
        if (!await validType(req.userId, 'master')) {
            if (!await validType(req.userId, 'manager')) {
                return res.status(403).json({ error: "No authorization" });
            }
        }

        await Occupation.deleteOne({ _id: idOccupation });
        await Service.deleteMany({ occupation: idOccupation });
        await User.updateMany({}, {$pull: {occupation: idOccupation}});

        res.status(204).json();

    } catch (err) {
        console.log(err)
        return res.status(400).json({ error: "Bad Request" });
    }
}

module.exports = {
    findAll,
    store,
    update,
    destroy
}