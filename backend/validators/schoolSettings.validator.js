// validators/schoolSettings.validator.js

const { body } = require("express-validator");

const updateSchoolSettings = [
  body("schoolName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("School name cannot be empty.")
    .isLength({ max: 150 })
    .withMessage("School name cannot exceed 150 characters."),
  body("schoolCode")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 50 })
    .withMessage("School code cannot exceed 50 characters."),
  body("motto").optional({ nullable: true }).trim().isLength({ max: 255 }),
  body("address").optional({ nullable: true }).trim().isLength({ max: 1000 }),
  body("city").optional({ nullable: true }).trim().isLength({ max: 100 }),
  body("region").optional({ nullable: true }).trim().isLength({ max: 100 }),
  body("country").optional({ nullable: true }).trim().isLength({ max: 100 }),
  body("postalCode").optional({ nullable: true }).trim().isLength({ max: 30 }),
  body("phone").optional({ nullable: true }).trim().isLength({ max: 40 }),
  body("email")
    .optional({ nullable: true })
    .trim()
    .isEmail()
    .withMessage("Email must be valid."),
  body("website").optional({ nullable: true }).trim().isLength({ max: 255 }),
  body("logoUrl").optional({ nullable: true }).trim().isLength({ max: 500 }),
  body("stampUrl").optional({ nullable: true }).trim().isLength({ max: 500 }),
  body("establishedYear")
    .optional({ nullable: true })
    .isInt({ min: 1800, max: 2200 })
    .withMessage("Established year must be between 1800 and 2200."),
  body("accreditationInfo")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 2000 }),
];

module.exports = {
  updateSchoolSettings,
};
