const express = require('express');
const router = express.Router();

const sauceController = require('../controllers/sauce');

router.get('/', sauceController.getAllSauces);
router.get('/:id', sauceController.getOneSauce);

module.exports = router;