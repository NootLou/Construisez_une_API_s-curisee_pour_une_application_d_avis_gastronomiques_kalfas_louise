const express = require('express');
const router = express.Router();

const sauceController = require('../controllers/sauce');

router.get('/', sauceController.getAllSauces);

module.exports = router;