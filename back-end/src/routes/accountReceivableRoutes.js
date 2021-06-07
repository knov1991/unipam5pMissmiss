const router = require('express').Router();

const authMiddleware = require('../middlewares/auth');
const accountReceivableController = require("../controllers/accountReceivableController");

router.use('/', authMiddleware);

router.get('/:enterprise/all', async (req, res) => {
      await accountReceivableController.findAll(req, res);
});

router.get('/:enterprise/:debtor', async (req, res) => {
      await accountReceivableController.findAccountsDebtor(req, res);
});

router.get('/:enterprise/:accountReceivable', async (req, res) => {
      await accountReceivableController.findOne(req, res);
});

router.post('/:enterprise', async (req, res) => {
      await accountReceivableController.store(req, res);
});

router.put('/:enterprise/:accountReceivable', async (req, res) => {
      await accountReceivableController.update(req, res);  
});

router.put('/:enterprise/:accountReceivable/payment', async (req, res) => {
      await accountReceivableController.payment(req, res);  
});

router.delete('/:enterprise/:accountReceivable', async (req, res) => {
      await accountReceivableController.destroy(req, res);
});

module.exports = app => app.use('/accountReceivable', router)