const router = require("express").Router();

const authMiddleware = require("../middlewares/auth");
const accountPayableController = require("../controllers/accountPayableController");

router.use('/', authMiddleware);

router.get('/:enterprise/all', async (req, res) => {
      await accountPayableController.findAll(req, res);
});

router.get('/:enterprise/:type', async (req, res) => {
      await accountPayableController.findAccounts(req, res);
});

router.get('/:enterprise/:user/:type', async (req, res) => {
      await accountPayableController.findAccountsEmployee(req, res);
});

router.get('/:enterprise/:accountPayable', async (req, res) => {
      await accountPayableController.findOne(req, res);
});

router.post('/:enterprise', async (req, res) => {
      await accountPayableController.store(req, res);
});

router.put('/:enterprise/:accountPayable', async (req, res) => {
      await accountPayableController.update(req, res);  
});

router.delete('/:enterprise/:accountPayable', async (req, res) => {
      await accountPayableController.destroy(req, res);
})

module.exports = app => app.use('/accountPayable', router);