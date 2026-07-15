const termService = require("../services/term.service");

exports.getTerms = async(req, res) => {
    const terms = await termService.getTerms();

    res.json({
        success: true,
        message: "Terms retrieved successfully.",
        data: terms,
    });
};