const authService = require("../services/auth.service");
const { generateToken } = require("../helpers/jwt.helper");

exports.login = async(req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await authService.login(email, password);

        const token = generateToken(user);

        res.status(200).json({
            success: true,
            message: "Login successful.",
            token,
            user,
        });
    } catch (error) {
        next(error);
    }
};