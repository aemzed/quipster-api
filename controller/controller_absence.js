const pool = require('../config/connect');
const absence = require('../function/absence');
const errors = require('../function/global_function');
const sha1 = require('sha1');
const fs = require('fs');

pool.on('error', (err) => {
    console.error(err);
});

module.exports = {
    async checkAbsences(req, res) {
        let employeeCode = req.body.employee;
        pool.getConnection(function(err, connection) {
            if (err) {
                errors.rollback(connection, res, err, 'v1/absence/check');
            } else {
                connection.beginTransaction(async function(err) {
                    if (err) {
                        errors.rollback(connection, res, err, 'v1/absence/check');
                    } else {
                        var results = await absence.absenceSelectCheck(employeeCode, res, connection);
                        connection.commit(function(err) {
                            if (err) {
                                errors.rollback(connection, res, err, 'v1/absence/check');
                            } else {
                                if (results.length != 0) {
                                    res.status(200).json({
                                        success: true,
                                        message: "ok",
                                        data: results[0]
                                    })
                                } else {
                                    res.status(200).json({
                                        success: true,
                                        message: "null",
                                        data: []
                                    })
                                }

                                connection.release();
                            };
                        })
                    }
                })
            }
        })
    },
    async insertAbsence(req, res) {
        let data = {
            business: req.body.business,
            user: req.body.user,
            employee: req.body.employee ? req.body.employee : "0",
            absenceType: req.body.absence_type,
            hash: req.body.hash ? req.body.hash : "",
            date: req.body.date,
            image: req.body.image,
            latitude: req.body.latitude,
            longitude: req.body.longitude,
            pin: req.body.pin,
            customercode: req.body.customer,
            notes: req.body.notes
        }
        pool.getConnection(function(err, connection) {
            if (err) {
                errors.rollback(connection, res, err, 'v1/absence/insert');
            } else {
                connection.beginTransaction(async function(err) {
                    if (err) {
                        errors.rollback(connection, res, err, 'v1/absence/insert');
                    } else {
                        var results = await absence.selectAbsences(data, res, connection);
                        if (results) {
                            data['hashNew'] = sha1(data['business'] + data['employee'] + data['date']);
                            if (data['image'] != '') {
                                var results2 = await absence.selectCodeAbsence(data, res, connection);
                                data['resultsCode'] = results2[0]['code'];
                                let images = Buffer.from(data['image'], "base64");
                                let imagess = await absence.saveImageToPath(data, images);
                                data['image'] = 'https://quipster-ws.looyal.id/' + imagess['path'] + imagess['filename'];
                            }

                            var insertResults = await absence.insertAbsence(data, res, connection);

                            if (data['hash'] != '') {
                                var insertHash = await absence.updateHash(data, res, connection);
                                var insertHashs = await absence.updateHashs(data, res, connection);
                            }
                        }

                        connection.commit(function(err) {
                            if (err) {
                                errors.rollback(connection, res, err, 'v1/absence/insert');
                            } else {
                                res.status(200).json({
                                    success: true,
                                    message: "Success"
                                })
                                connection.release();
                            };
                        })
                    }
                })
            }
        })
    }
}