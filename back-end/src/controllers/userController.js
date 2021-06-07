require('dotenv/config');

const User = require("../models/user");
const Enterprise = require("../models/enterprise");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { reqUserQuery } = require("../validations/supportQuerys")

const env = process.env;

function generateToken(params) {
    return jwt.sign(params, env.USER_TOKEN,
        { expiresIn: 86400 });
}

async function findOne(req, res) {
    const idEnterprise = req.params.enterprise;
    const idUser = req.params.user;
    
    if (idEnterprise == null && idUser == null)
        return res.status(400).json({ error: "Invalid 'id'" });

    const reqUser = await reqUserQuery(req.userId);

    try {

        if (reqUser != 'master') {
            if (reqUser.type != 'manager' && reqUser.enterprise != idEnterprise) {
                if (req.userId != idUser) {
                    return res.status(403).json({ error: "No authorization" });
                }
            }
        }

        const user = await User.findOne({ _id: idUser, enterprise: idEnterprise }).populate('enterprise')

        return res.status(200).json({ user })

    } catch (err) {
        return res.status(400).json({ error: "Bad Request" });
    }
};

async function findAll(req, res) {
    const idEnterprise = req.params.enterprise;
    const reqUser = await reqUserQuery(req.userId);
    
    if (idEnterprise == null)
        return res.status(400).json({ error: "Invalid 'id'" });

    try {

        if (reqUser.type != 'master') {
            if (reqUser.type != 'manager' && reqUser.enterprise != idEnterprise) {
                return res.status(403).json({ error: "No authorization" });
            }
        }

        const users = await User.find({ enterprise: idEnterprise, type: { $ne: 'master' } }).populate('occupation');
        return res.status(200).json({ users });

    } catch (err) {
        return res.status(400).json({ error: "Bad Request" });
    }
};

async function findScheduleUser(req, res) {
    const idEnterprise = req.params.enterprise;

    const reqUser = await reqUserQuery(req.userId);

    if (idEnterprise == null)
        return res.status(400).json({ error: "Invalid 'id'" });

    try {

        if (reqUser.type != 'master') {
            if (reqUser.type != 'manager' && reqUser.enterprise != idEnterprise) {
                return res.status(403).json({ error: "No authorization" });
            }
        }

        const schedules = await User.find({enterprise: idEnterprise, type: { $ne: 'customer' } }, { name: 1 })
        return res.status(200).json({ schedules });

    } catch (err) {
        return res.status(400).json({ error: "Bad Request" });
    }
}

async function findComissionUser(req, res) {
    const idEnterprise = req.params.enterprise;

    const reqUser = await reqUserQuery(req.userId);

    if (idEnterprise == null)
        return res.status(400).json({ error: "Invalid 'id'" });

    try {

        if (reqUser.type != 'master') {
            if (reqUser.type != 'manager' && reqUser.enterprise != idEnterprise) {
                return res.status(403).json({ error: "No authorization" });
            }
        }

        const schedules = await User.find({enterprise: idEnterprise, type: { $eq: 'employee' }, commission: { $ne: 0 } }, { name: 1 })
        return res.status(200).json({ schedules });

    } catch (err) {
        return res.status(400).json({ error: "Bad Request" });
    }
}

async function login(req, res) {
    const { username, password } = req.body;

    const user = await User.findOne({ username: new RegExp("^" + username.toLowerCase(), "i") }).populate('enterprise').select("+password");

    if (!user)
        return res.status(401).json({ error: "Invalid 'username'" });

    try {
        await bcrypt.compare(password, user.password, function (err, response) {
            if (response) {

                user.password = undefined;
                return res.status(200).json({
                    user,
                    token: generateToken({ id: user._id })
                });
            }

            return res.status(401).json({ error: "Invalid 'password'" });
        });

    } catch (err) {
        return res.status(400).json({ error: "Bad Request" });
    }
};

async function store(req, res) {
    const idEnterprise = req.params.enterprise;

    const { username, name, password, commission, type, phoneNumber, occupation } = req.body;

    const possibleTypes = ['customer', 'manager', 'employee']

    const reqUser = await reqUserQuery(req.userId);

    try {
        if (reqUser.type != 'master' && reqUser.type != 'manager')
            return res.status(403).json({ error: "No authorization" });

        if (!await Enterprise.findOne({ _id: idEnterprise }))
            return res.status(400).json({ error: "'enterprise' does not exists" })

        if (await User.findOne({ username: username }))
            return res.status(400).json({ error: "User already exists" })

        if (!(possibleTypes.includes(type)))
            return res.status(400).json({ error: "Invalid 'type'" });

        if (type != 'employee' && commission)
            return res.status(400).json({ error: `Type '${type}' don't have 'commission' property` });

        const user = await User.create({
            enterprise: idEnterprise,
            username: username,
            name: name,
            password: password,
            type: type,
            commission: commission,
            phoneNumber: phoneNumber,
            occupation: occupation,
        });

        user.password = undefined;
        return res.status(201).json(user);

    } catch (err) {
        return res.status(400).json({ error: "Bad Request" })
    }
};

async function update(req, res) {
    const idEnterprise = req.params.enterprise;
    const idUser = req.params.user;

    const { username, name, password, type, commission, occupation } = req.body;

    if (idEnterprise == null && idUser == null)
        return res.status(400).json({ error: "Invalid 'id'" });

    if (username == null || name == null || password == null || type == null)
        return res.status(400).json({ error: "Bad Request" });

    const reqUser = await reqUserQuery(req.userId);

    const possibleTypes = ['customer', 'manager', 'employee']

    try {

        if (reqUser.type != 'master' && reqUser.type != 'manager') {
            if (req.userId != idUser) {
                return res.status(403).json({ error: "No authorization" });
            }
        }

        if (!(possibleTypes.includes(type)))
            return res.status(400).json({ error: "Invalid 'type'" });

        if (type != 'employee' && commission)
            return res.status(400).json({ error: `Type '${type}' don't have 'commission' property` });

        if (!await User.findOne({ _id: idUser, enterprise: idEnterprise }))
            throw err;

        await User.updateOne({ _id: idUser, enterprise: idEnterprise }, req.body);

        const user = await (await User.findOne({ _id: idUser, enterprise: idEnterprise })).populate('enterprise');
        return res.status(200).json({ user })

    } catch (err) {
        if (err.code = 11000)
            return res.status(400).json({ error: "User already exists" });
        return res.status(400).json({ error: "Bad Request" });
    }

};

async function destroy(req, res) {
    const idEnterprise = req.params.enterprise;
    const idUser = req.params.user;

    
    if (idEnterprise == null && idUser == null)
        return res.status(400).json({ error: "Invalid 'id'" });

    const reqUser = await reqUserQuery(req.userId);

    try {

        if (reqUser.type != 'master') {
            if (reqUser.type != 'manager' || reqUser.enterprise != req.params.enterprise) {
                return res.status(403).json({ error: "No authorization" });
            }
        }

        if (!await User.findOne({ _id: idUser, enterprise: idEnterprise }))
            throw err;

        await User.deleteOne({ _id: idUser, enterprise: idEnterprise });
        return res.status(204).json();

    } catch (err) {
        return res.status(400).json({ error: "Invalid 'id'" });
    }
};

module.exports = {
    findOne,
    findAll,
    findScheduleUser,
    findComissionUser,
    login,
    store,
    update,
    destroy
}