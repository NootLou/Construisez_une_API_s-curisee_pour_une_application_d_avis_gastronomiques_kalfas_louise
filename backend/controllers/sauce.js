const Sauce = require('../models/sauce');

exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then( sauces => res.status(200).json( sauces))
        .catch(error => res.status(500).json({ error }));
};