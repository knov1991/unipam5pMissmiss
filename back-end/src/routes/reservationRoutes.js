const router = require("express").Router();

const authMiddleware = require("../middlewares/auth");
const reservationController = require("../controllers/reservationController");

router.use('/', authMiddleware);

router.get('/:enterprise/all', async (req, res) => {
      await reservationController.findAll(req, res);
});

router.get('/:enterprise/:reservation', async (req, res) => {
      await reservationController.findOne(req, res);
});

router.post('/:enterprise/:product', async (req, res) => {
      await reservationController.store(req, res);
});

router.put('/:enterprise/:reservation', async (req, res) => {
      await reservationController.update(req, res);  
});

router.put('/:enterprise/:reservation/payment', async (req, res) => {
      await reservationController.payment(req, res);  
});

router.put('/:enterprise/:product/sale', async (req, res) => {
      await reservationController.sale(req, res);  
});

router.delete('/:enterprise/:reservation', async (req, res) => {
      await reservationController.destroy(req, res);
});

module.exports = app => app.use('/reservation', router);