'use strict'

var bcrypt = require('bcrypt-nodejs');
var User = require('../models/user');
var jwt = require('../services/jwt');
var Car = require('../models/car');
var mongoosePaginate = require('mongoose-pagination');

function prueba(req, res) {
    res.status(200).send({
        message: 'Probando el controlador de usuarios'
    });
};

function saveUser(req, res) {
    var user = new User();
    var params = req.body;

    user.name = params.name;
    user.email = params.email;

    if (params.password) {
        bcrypt.hash(params.password, null, null, (err, hash) => {
            user.password = hash;
            if (user.name != null && user.email != null) {
                user.save((err, userStored) => {
                    if (err) {
                        res.status(500).send({ message: 'Error al guardar el usuario' });
                    } else {
                        if (!userStored) {
                            res.status(404).send({ message: 'No se registró el usuario' });
                        } else {
                            res.status(200).send({ message: 'Usuario Guardado', user: userStored });
                        }
                    }
                });
            }
        });
    } else {
        res.status(500).send({ message: 'Introduce la contraseña' });
    }
}

function getUsers(req, res) {
    if (req.params.page) {
        var page = req.params.page;
    } else {
        var page = 1;
    }

    var itemsPerPage = 5;

    User.find().paginate(page, itemsPerPage, (err, users, total) => {
        if (err) {
            res.status(500).send({ message: 'Error en la base de datos' });
        } else {
            if (!users) {
                res.status(404).send({ message: 'No se encontraron usuarios' });
            } else {
                res.status(200).send({
                    message: 'ok',
                    total: total,
                    users
                });
            }
        }
    });
}

function login(req, res) {
    var params = req.body;

    var email = params.email;
    var password = params.password;

    User.findOne({ email: email.toLowerCase() }, (err, user) => {
        if (err) {
            res.status(500).send({ message: 'Ocurrio un problema con la base de datos' });
        } else {
            if (!user) {
                res.status(404).send({ message: 'El usuario no existe' });
            } else {
                bcrypt.compare(password, user.password, (err, check) => {
                    if (check) {
                        if (params.gethash) {
                            res.status(200).send({ message: 'Usuario logeado correctamente', token: jwt.createToken(user) });
                        } else {
                            res.status(200).send({ message: 'Usuario logeado correctamente', user });
                        }
                    } else {
                        res.status(404).send({ message: 'Contraseña o email incorrectos' });
                    }
                });
            }
        }
    });
};

function updateUser(req, res) {
    var userId = req.params.id;
    var update = req.body;

    User.findByIdAndUpdate(userId, update, (err, userUpdated) => {
        if (err) {
            res.status(500).send({ message: 'Error en la base de datos...' });
        } else {
            if (!userUpdated) {
                res.status(404).send({ message: 'No se encontro el usuario...' });
            } else {
                res.status(200).send({ message: 'ok', userUpdated });
            }
        }
    });
}

function deleteUser(req, res) {
    var userId = req.params.id;

    User.findOneAndRemove(userId, (err, user) => {
        if (err) {
            res.status(500).send({ message: 'Error con la base de datos...' });
        } else {
            if (!user) {
                res.status(404).send({ message: 'Usuario no encontrado' });
            } else {
                res.status(200).send({ message: 'ok', user });
            }
        }
    });
}

function getCars(req, res) {
    var id = req.params.id;

    Car.find({
        user: id
    }, (err, list) => {
        if (err) {
            res.status(500).send({
                message: 'Error en la base de datos...'
            });
        } else {
            if (!list) {
                res.status(404).send({
                    message: "No se encontraron canciones del album"
                });
            } else {
                res.status(200).send({
                    message: "ok",
                    cars: list
                });
            }
        }
    });
}

module.exports = {
    prueba,
    saveUser,
    getUsers,
    login,
    updateUser,
    deleteUser,
    getCars
};