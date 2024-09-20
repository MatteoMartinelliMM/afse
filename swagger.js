const options = {
    openapi: "3.0.0", // Correggi la versione OpenAPI a 3.0.0
    language: "en-US",
    disableLogs: false,
    autoHeaders: false,
    autoQuery: false,
    autoBody: false,
};
const generateSwagger = require("swagger-autogen")();

const swaggerDocument = {
    info: {
        version: "1.0.0",
        title: "AFSE API",
        description: "API for Managing AFSE",
        contact: {
            name: "API Support",
            email: "matteo.martinelli5@studenti.unimi.it",
        },
    },
    servers: [
        {
            url: "http://localhost:3000",
            description: "Local server"
        }
    ],
    definitions: {
        User: {
            type: "object",
            properties: {
                name: { type: "string", example: "Tony" },
                surname: { type: "string", example: "Stark" },
                username: { type: "string", example: "IronMan" },
                email: { type: "string", example: "tonystark@starkindustries.com" },
                pwd: {
                    type: "string",
                    description: "Password hashed in SHA-256",
                    example: "cd0aa9856147b6c5b4ff2b7dfee5da20aa38253099ef1b4a64aced233c9afe29"
                },
                isHero: { type: "boolean", example: true },
                favouriteHero: { type: "integer", example: 1009368 },
                profilePicture: {
                    type: "string",
                    format: "url",
                    example: "http://i.annihil.us/u/prod/marvel/i/mg/9/c0/527bb7b37ff55.jpg"
                },
                coinAmount: { type: "integer", example: 9 },
                exchangeable: { type: "array", items: { type: "string" }, example: [] },
                figurine: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            _id: {
                                type: "object",
                                properties: {
                                    $oid: { type: "string", example: "66e1c5d3aa3bfbc871eb1fab" }
                                }
                            },
                            figurineId: { type: "integer", example: 1011334 },
                            name: { type: "string", example: "3-D Man" }
                        }
                    },
                    example: [
                        {
                            _id: { $oid: "66e1c5d3aa3bfbc871eb1fab" },
                            figurineId: 1011334,
                            name: "3-D Man"
                        },
                        {
                            _id: { $oid: "66e1c5d3aa3bfbc871eb1fac" },
                            figurineId: 1010672,
                            name: "Amora"
                        }
                        // Altri elementi...
                    ]
                }
            }
        }
    },
    components: {
        securitySchemes: {
            cookieAuth: {
                type: "jwt",
                in: "cookie",
                name: "jwt", // Nome del cookie contenente il JWT
                description: "JWT token passato tramite cookie"
            }
        },
        schemas: {
            SuccessResponse: {
                type: "object",
                properties: {
                    message: {
                        type: "string",
                        example: "Operation successful"
                    }
                }
            },
            ErrorResponse: {
                type: "object",
                properties: {
                    message: {
                        type: "string",
                        example: "Error occurred"
                    }
                }
            }
        }
    },
    paths: {}
};

const swaggerFile = "swagger.json";
const apiRouteFile = ["./routes/index.js"];
generateSwagger(swaggerFile, apiRouteFile, swaggerDocument);
