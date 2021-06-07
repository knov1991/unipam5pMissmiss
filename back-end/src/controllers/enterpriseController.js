const Enterprise = require("../models/enterprise");

const { reqUserQuery } = require("../validations/supportQuerys")

async function findOne(req, res) {
    const idEnterprise = req.params.enterprise;

    if (idEnterprise == null)
        return res.status(400).json({ error: "No 'id' provided" });

    const reqUser = await reqUserQuery(req.userId);

    try {

        if (reqUser.type != 'master') {
            if (reqUser.type != 'manager' || reqUser.enterprise != idEnterprise)
                return res.status(403).json({ error: "No authorization" });
        }

        const enterprise = await Enterprise.findOne({ _id: idEnterprise });
        return res.status(200).json({ enterprise });

    } catch (err) {
        return res.status(400).json({ error: "Invalid 'id'" });
    }
};

async function store(req, res) {
    const { name, cnpj } = req.body;

    if (name == null || cnpj == null)
        return res.status(400).json({ error: "Bad Request" });

    const reqUser = await reqUserQuery(req.userId);

    try {

        if (reqUser.type != 'master')
            return res.status(403).json({ error: "No authorization" });

        const enterprise = await Enterprise.create({ name, cnpj });
        return res.status(201).json(enterprise);

    } catch (err) {
        if (await Enterprise.findOne({ cnpj }))
            return res.status(400).json({ error: "Enterprise already exists" });

        return res.status(400).json({ error: "Bad Request" });
    };
};

async function update(req, res) {
    const idEnterprise = req.params.enterprise;
    const { name, cnpj } = req.body;

    if (idEnterprise == null)
        return res.status(400).json({ error: "No 'id' provided" });

    if (name == null || cnpj == null)
        return res.status(400).json({ error: "Bad Request" });

    const reqUser = await reqUserQuery(req.userId);

    try {

        if (reqUser.type != 'master') {
            if (reqUser.type != 'manager' || reqUser.enterprise != idEnterprise)
                return res.status(403).json({ error: "No authorization" });
        }

        if (!await Enterprise.findOne({ _id: idEnterprise }))
            throw err;

        await Enterprise.updateOne({ _id: idEnterprise }, { name, cnpj });

        const enterprise = await Enterprise.findOne({ _id: idEnterprise });
        return res.status(200).json(enterprise);

    } catch (err) {
        if (await Enterprise.findOne({ cnpj }))
            return res.status(400).json({ error: "'cnpj' already exists" });

        return res.status(400).json({ error: "Invalid 'id'" });
    }
};

async function destroy(req, res) {
    const idEnterprise = req.params.enterprise;

    if (idEnterprise == null)
        return res.status(400).json({ error: "No 'id' provided" });

    const reqUser = await reqUserQuery(req.userId);

    try {

        if (reqUser.type != 'master')
            return res.status(403).json({ error: "No authorization" });

        if (!await Enterprise.findOne({ _id: idEnterprise }))
            throw err;

        await Enterprise.deleteOne({ _id: idEnterprise });
        return res.status(204).json();

    } catch (err) {
        return res.status(400).json({ error: "Invalid 'id'" });
    }
};

module.exports = {
    findOne,
    store,
    update,
    destroy
};
