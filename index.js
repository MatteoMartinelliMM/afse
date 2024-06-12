const express = require('express');
const app = express();
const port = 3000


const {corsSetup} = require("./utils/corsConfig");

require('./utils/corsConfig')

app.use(express.json());
app.use(corsSetup)
app.options('*', corsSetup)

require('./routes')(app);

app.use((err, res, req) => {
        if (err) {
            res.status(err.status || 500).json({message: err.message})
        }
    }
)

app.get('/', (req, res) => res.status(200).json({
    messsage: "Se nimmondo esistsse un pò di bene e ognun si considerasse suo fratello.\n" +
        "Vi sarebbero meno pensieri e meno bene.\n" +
        "E il mondo ne sarebbe assai più bello"
}));

app.listen(port, () => console.log(`Server started at port ${port}`))