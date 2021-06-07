const router = require("express").Router();

const authMiddleware = require("../middlewares/auth");
const occupationController = require("../controllers/occupationController");

router.use('/', authMiddleware);

router.get('/:enterprise/all', async (req, res) => {
      await occupationController.findAll(req, res);
});

router.post('/:enterprise', async (req, res) => {
      await occupationController.store(req, res);
});

router.put('/:enterprise/:occupation', async (req, res) => {
      await occupationController.update(req, res);
});

router.delete('/:enterprise/:occupation', async (req, res) => {
      await occupationController.destroy(req, res);
});

module.exports = app => app.use('/occupation', router);