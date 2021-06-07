const router = require("express").Router();

const authMiddleware = require("../middlewares/auth");
const scheduleController = require("../controllers/scheduleController");

router.use('/', authMiddleware);


router.get('/:enterprise/:appointment', async (req, res) => {
      await scheduleController.findOne(req, res);
});

router.get('/:enterprise/:appointments/:user/payed', async (req, res) => {
      await scheduleController.findPayed(req, res);
});

router.get('/:enterprise/:appointments/:user/notPayed', async (req, res) => {
      await scheduleController.findNotPayed(req, res);
});

router.get('/:enterprise/:user/verify', async (req, res) => {
      await scheduleController.verifiyAppoitment(req, res);
});

router.post('/:enterprise/:user', async (req, res) => {
      await scheduleController.store(req, res);
});

router.put('/:enterprise/:appointment/payment', async (req, res) => {
      await scheduleController.payment(req, res);  
});

router.put('/:enterprise/:appointment', async (req, res) => {
      await scheduleController.update(req, res);  
});

router.delete('/:enterprise/:appointment', async (req, res) => {
      await scheduleController.destroy(req, res);
});

module.exports = app => app.use('/schedule', router);