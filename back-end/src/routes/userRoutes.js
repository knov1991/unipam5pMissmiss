const router = require("express").Router();

const authMiddleware = require("../middlewares/auth");
const userController = require("../controllers/userController");

router.use(/\/[0-9,a-z]{24}/, authMiddleware);

router.get('/:enterprise/schedule', async (req, res) => {
    await userController.findScheduleUser(req, res);
});

router.get('/:enterprise/comission', async (req, res) => {
    await userController.findComissionUser(req, res);
});


router.get('/:enterprise/all', async (req, res) => {
    await userController.findAll(req, res);
});

router.get('/:enterprise/:user', async (req, res) => {
    await userController.findOne(req, res);
});

router.post('/login', async (req, res) => {
    await userController.login(req, res);
});

router.post('/:enterprise', async (req, res) => {
    await userController.store(req, res);
});

router.put('/:enterprise/:user', async (req, res) => {
    await userController.update(req, res);
});

router.delete('/:enterprise/:user', async (req, res) => {
    await userController.destroy(req, res);
});

module.exports = app => app.use('/user', router);