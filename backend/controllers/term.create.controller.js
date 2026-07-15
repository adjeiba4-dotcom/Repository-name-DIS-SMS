const termRepository = require("../repositories/term.repository");

exports.createTerm = async(req, res) => {
    const term = await termRepository.createTerm(req.body);

    res.status(201).json({
        success: true,
        message: "Term created successfully.",
        data: term,
    });
};