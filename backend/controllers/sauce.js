const Sauce = require('../models/sauce');
const fs = require('fs');

exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(500).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(404).json({ error }));
};

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    delete sauceObject._userId;
    const sauce = new Sauce({
        ...sauceObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    });
    sauce.save()
        .then(() => res.status(201).json({ message: 'Sauce créée !' }))
        .catch(error => res.status(400).json({ error }))
};

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            if (sauce.userId != req.auth.userId) {
                res.status(403).json({ message: 'Requête non-autorisée' })
            } else {
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Sauce.deleteOne({ _id: req.params.id })
                        .then(() => res.status(200).json({ message: 'Sauce supprimée !' }))
                        .catch(error => res.status(401).json({ error }));
                })
            };
        })
        .catch(error => res.status(404).json({ error }));
};

exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : {
        ...req.body
    }
    delete sauceObject._userId;
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            if (sauce.userId != req.auth.userId) {
                res.status(403).json({ message: 'Requête non autorisée.' })
            } else {
                Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
                    .then(() => res.status(201).json({ message: 'Sauce modifiée !' }))
                    .catch(error => res.status(400).json({ error }));
            }
        })
        .catch(error => res.status(404).json({ error }));
};

exports.sauceLike = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            let userId = req.body.userId;
            let like = req.body.like;
            if (like === 1) {
                // si userLiked ne contient pas l'id de lutilisateur, on ajoute son id au tableau et on augment de 1 la valeur de liked
                if (!sauce.usersLiked.includes(userId)) {
                    Sauce.updateOne({ _id: req.params.id }, {
                        $push: { usersLiked: userId },
                        $inc: { likes: +1 }
                    })
                        .then(() => res.status(200).json({ message: 'Vous aimez cette sauce !' }))
                        .catch(error => res.status(400).json({ error }));
                    //Sinon, si userLiked contient l'id de l'utilisateur, on renvoie une erreur avec un message
                } else if (sauce.usersLiked.includes(userId)) {
                    res.status(400).json({ message: 'Vous aimez déjà cette sauce !' })
                };
            } else if (like === 0) {
                // si usersLiked contient l'id de l'utilisateur, on l'enlève et on enlève 1 au compteur de likes
                if (sauce.usersLiked.includes(userId)) {
                    Sauce.updateOne({ _id: req.params.id }, {
                        $pull: { usersLiked: { $in: userId } },
                        $inc: { likes: -1 },
                    })
                        .then(() => res.status(200).json({ message: "Vous n'aimez plus cette sauce." }))
                        .catch(error => res.status(401))
                    // sinon, si userDisliked contient l'id de l'utilisateur, on l'enlève et on enlève 1 au compteur de dislikes
                } else if (sauce.usersDisliked.includes(userId)) {
                    Sauce.updateOne({ _id: req.params.id }, {
                        $pull: { usersDisliked: { $in: userId } },
                        $inc: { dislikes: -1 },
                    })
                        .then(() => res.status(200).json({ message: "Cette sauce ne fait plus partie de celles que vous n'aimez pas." }))
                        .catch(error => res.status(400).json({ error }));
                }
            } else if (like === -1) {
                //Si l'usersDisliked ne contient pas l'id de l'utilisateur, on l'ajoute au tableau et on ajoute 1 au compteur de dislikes
                if (!sauce.usersDisliked.includes(userId)) {
                    Sauce.updateOne({ _id: req.params.id }, {
                        $push: { usersDisliked: userId },
                        $inc: { dislikes: +1 }
                    })
                        .then(() => res.status(200).json({ message: "Vous n'aimez pas cette sauce" }))
                        .catch(error => res.status(400).json({ error }));
                    //Sinon, si userLiked contient l'id de l'utilisateur, on renvoie une erreur avec un message
                } else if (sauce.usersDisliked.includes(userId)) {
                    res.status(400).json({ message: "Cette sauce fait déjà partie de celles que vous n'aimez pas" })
                };
            };
        })
        .catch(error => res.status(500).json({ error }))
};