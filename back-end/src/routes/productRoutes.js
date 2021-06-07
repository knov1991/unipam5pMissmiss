const router = require("express").Router();
const multer = require('multer');
const multerConfig = require('../config/multer')

const authMiddleware = require("../middlewares/auth");
const productController = require("../controllers/productController");

router.use('/', authMiddleware);

router.get('/:enterprise/all', async (req, res) => {
      await productController.findAll(req, res);
});

router.get('/:enterprise/:product', async (req, res) => {
      await productController.findOne(req, res);
});

router.post('/:enterprise', multer(multerConfig).single("image"), async (req, res) => {
      await productController.store(req, res);
});

router.put('/:enterprise/:product', multer(multerConfig).single("image"), async (req, res) => {
      await productController.update(req, res);
});

router.delete('/:enterprise/:product', async (req, res) => {
      await productController.destroy(req, res);
})

module.exports = app => app.use('/product', router);