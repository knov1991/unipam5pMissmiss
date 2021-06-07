const router = require("express").Router();

const authMiddleware = require("../middlewares/auth");
const enterpriseController = require("../controllers/enterpriseController.js");

router.use('/', authMiddleware);

router.get('/:enterprise', async (req, res) => {
      await enterpriseController.findOne(req, res);
});

router.post('/', async (req, res) => {
      await enterpriseController.store(req, res);
});

router.put('/:enterprise', async (req, res) => {
      await enterpriseController.update(req, res);  
});

router.delete('/:enterprise', async (req, res) => {
      await enterpriseController.destroy(req, res);
});

module.exports = app => app.use('/enterprise', router);