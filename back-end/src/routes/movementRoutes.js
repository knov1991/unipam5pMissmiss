const router = require("express").Router();

const authMiddleware = require("../middlewares/auth");
const movementController = require("../controllers/movementController");

router.use('/', authMiddleware);

router.get('/:enterprise/status', async (req, res) => {
      await movementController.movementStatus(req, res);
});

router.get('/:enterprise/all', async (req, res) => {
      await movementController.findAll(req, res);
});

router.get('/:enterprise/:type', async (req, res) => {
      await movementController.findMovements(req, res);
});

router.get('/:enterprise/:movement', async (req, res) => {
      await movementController.findOne(req, res);
});

router.post('/:enterprise', async (req, res) => {
      await movementController.store(req, res);
});

router.post('/:enterprise/:account', async (req, res) => {
      await movementController.storeOutlay(req, res);
});

router.put('/:enterprise/:movement', async (req, res) => {
      await movementController.update(req, res);  
});

router.delete('/:enterprise/:movement', async (req, res) => {
      await movementController.destroy(req, res);
})

module.exports = app => app.use('/movement', router);