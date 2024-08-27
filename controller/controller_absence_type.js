const pool = require('../config/connect');
const type = require('../function/absence_type');
const errors = require('../function/global_function');

pool.on('error', (err) => {
    console.error(err);
});

module.exports = {
    async selectType(req, res) {
        let business = req.body.business;
        pool.getConnection(function(err, connection) {
            if (err) {
                errors.rollback(connection, res, err, 'v1/absence_type/select');
            } else {
                connection.beginTransaction(async function(err) {
                    if (err) {
                        errors.rollback(connection, res, err, 'v1/absence_type/select');
                    } else {
                        var results = await type.selectAbsenceType(business, res, connection);

                        connection.commit(function(err) {
                            if (err) {
                                errors.rollback(connection, res, err, 'v1/absence_type/select');
                            } else {
                                if (results.length > 0) {
                                    res.status(200).json({
                                        success: true,
                                        message: "Found",
                                        data: results
                                    })
                                } else {
                                    res.status(404).json({
                                        success: false,
                                        message: "Not Found",
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
    async insertType(req, res) {
        let data = {
            business: req.body.business,
            name: req.body.name,
            startHour: req.body.start_hour,
            startMinute: req.body.start_minute,
            endHour: req.body.end_hour,
            endMinute: req.body.end_minute,
            zone: req.body.zone ? req.body.zone : "1"
        }

        let canCommit = true;
        pool.getConnection(function(err, connection) {
            if (err) {
                errors.rollback(connection, res, err, 'v1/absence_type/insert');
            } else {
                connection.beginTransaction(async function(err) {
                    if (err) {
                        errors.rollback(connection, res, err, 'v1/absence_type/insert');
                    } else {
                        var results = await type.selectInsertAbsenceType(data, res, connection);
                        if (results.length > 0) {
                            canCommit = false;
                        } else {
                            var results2 = await type.insertAbsenceType(data, res, connection);
                        }

                        connection.commit(function(err) {
                            if (err) {
                                errors.rollback(connection, res, err, 'v1/absence_type/insert');
                            } else {
                                if (!canCommit) {
                                    res.status(404).json({
                                        success: false,
                                        message: "Absence type already used",
                                        data: []
                                    })
                                } else {
                                    res.status(200).json({
                                        success: true,
                                        message: "Insert Success"
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
    async deleteType(req, res) {
        let code = req.body.code;
        pool.getConnection(function(err, connection) {
            if (err) {
                errors.rollback(connection, res, err, 'v1/absence_type/delete');
            } else {
                connection.beginTransaction(async function(err) {
                    if (err) {
                        errors.rollback(connection, res, err, 'v1/absence_type/delete');
                    } else {
                        var results = await type.deleteAbsenceType(code, res, connection);
                        connection.commit(function(err) {
                            if (err) {
                                errors.rollback(connection, res, err, 'v1/absence_type/delete');
                            } else {
                                res.status(200).json({
                                    success: true,
                                    message: "Delete Success"
                                })
                                connection.release();
                            };
                        })
                    }
                })
            }
        })
    },
    async updateType(req, res) {
        let data = {
            code: req.body.code,
            business: req.body.business,
            name: req.body.name,
            startHour: req.body.start_hour,
            startMinute: req.body.start_minute,
            endHour: req.body.end_hour,
            endMinute: req.body.end_minute,
            zone: req.body.zone ? req.body.zone : "1"
        }
        pool.getConnection(function(err, connection) {
            if (err) {
                errors.rollback(connection, res, err, 'v1/absence_type/update');
            } else {
                connection.beginTransaction(async function(err) {
                    if (err) {
                        errors.rollback(connection, res, err, 'v1/absence_type/update');
                    } else {
                        var results = await type.updateAbsenceType(data, res, connection);
                        connection.commit(function(err) {
                            if (err) {
                                errors.rollback(connection, res, err, 'v1/absence_type/update');
                            } else {
                                res.status(200).json({
                                    success: true,
                                    message: "Update Success"
                                })
                                connection.release();
                            };
                        })
                    }
                })
            }
        })
    },
}