require('dotenv').config({path: './config.env'});

const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const {corsSetup} = require("./utils/corsConfig");
const figurineRepository = require("./repository/figurineRepository")
const swaggerUIPath= require("swagger-ui-express");
const swaggerjsonFilePath = require('./.swagger.json');
app.use("/api-docs", swaggerUIPath.serve, swaggerUIPath.setup(swaggerjsonFilePath));

app.use(corsSetup)
app.options('*', corsSetup)
app.use(cookieParser())
app.use(express.json());

app.use((req, res, next) => {
    res.on('finish', () => {
        console.log(`Request to ${req.method} ${req.originalUrl} finished with status ${res.statusCode}`);
    });

    res.on('error', (err) => {
        console.error(`Error on request ${req.method} ${req.originalUrl}:`, err);
    });

    next();
});

require('./routes')(app);



async function onStart() {
    //await figurineRepository.checkFigurineOnServerStart()
    setInterval(async () => {
        await figurineRepository.checkFigurineOnServerStart()
    }, parseInt(process.env.NEW_FIGURINE_CHECKER_TIMER))
}

onStart().then(() => {
    app.get('/', (req, res) => res.status(200).json({
        messsage: "Se nimmondo esistsse un pò di bene e ognun si considerasse suo fratello.\n" + "Vi sarebbero meno pensieri e meno bene.\n" + "E il mondo ne sarebbe assai più bello"
    }));

    app.listen(process.env.PORT, () => console.log(`Server started at port ${process.env.PORT}`))
});

