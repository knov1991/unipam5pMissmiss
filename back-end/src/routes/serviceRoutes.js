const router = require("express").Router();

const authMiddleware = require("../middlewares/auth");
const serviceController = require("../controllers/serviceController");

router.use('/', authMiddleware);

router.get('/:occupation/all', async (req, res) => {
      await serviceController.findAll(req, res);
});

router.post('/:occupation', async (req, res) => {
      await serviceController.store(req, res);
});

router.put('/:occupation/:service', async (req, res) => {
    await serviceController.update(req, res);
});

router.delete('/:occupation/:service', async (req, res) => {
      await serviceController.destroy(req, res);
});

module.exports = app => app.use('/service', router);