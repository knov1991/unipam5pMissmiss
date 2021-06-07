const router = require('express').Router();

const authMiddleware = require('../middlewares/auth');
const debtorController = require("../controllers/debtorController");

router.use('/', authMiddleware);

router.get('/:enterprise/all', async (req, res) => {
      await debtorController.findAll(req, res);
});

router.get('/:enterprise/:debtor', async (req, res) => {
      await debtorController.findOne(req, res);
});

router.post('/:enterprise', async (req, res) => {
      await debtorController.store(req, res);
});

router.put('/:enterprise/:debtor', async (req, res) => {
      await debtorController.update(req, res);  
});

router.delete('/:enterprise/:debtor', async (req, res) => {
      await debtorController.destroy(req, res);
});

module.exports = app => app.use('/debtor', router);