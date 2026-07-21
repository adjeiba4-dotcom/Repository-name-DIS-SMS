const swaggerJsdoc = require("swagger-jsdoc");

const options = {
    definition: {
        openapi: "3.0.3",

        info: {
            title: "DIS-SMS API",
            version: "1.0.0",
            description: "Enterprise School Management System REST API",

            contact: {
                name: "Data Insight Studio",
            },
        },

        servers: [{
            url: "http://localhost:5000/api",
            description: "Development Server",
        }, ],

        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },

        security: [{
            bearerAuth: [],
        }, ],
    },

    apis: [
        "./routes/*.js",
        "./controllers/*.js",
    ],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;