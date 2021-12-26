const express = require('express');
const app = express();
const fs = require("fs");
const path = require("path");
const cors = require('cors');
const bodyParser = require('body-parser')

const port = process.env.PORT || 3000;
const requestToken = process.env.TOKEN || 'token';

app.use(cors());
app.use(bodyParser({ extended: true }));

// Token Control
app.use(async (req, res, next) => {
    const headers = req.headers;
    const token = (headers && headers.authorization) ? headers.authorization : null;
    if (!token.includes('Bearer ')) return res.status(401).send('Unauthorized');
    const tokenValue = token.split('Bearer ')[1];
    if (tokenValue !== requestToken) {
        res.status(401).send('Unauthorized');
        return;
    }
    next();
});

// Dosya Oku
app.get('/read', async (req, res, next) => {
    const file = fs.readFileSync(path.join(__dirname, "./filters.txt"), "utf8");
    const filters = file.split("\n").map(item => {
        const splitted = item.split("=");
        return {
            name: splitted[0],
            value: splitted[1]
        }
    });
    return res.json(filters)
});

// Dosya Yaz
app.post('/write', async (req, res, next) => {
    const fullBody = req.body;
    const txtString = fullBody.map((element, i) => {
        if (i === fullBody.length - 1) {
            return element.name + "=" + element.value;
        } else {
            return element.name + "=" + element.value + "\n";
        }
    });
    fs.writeFileSync(path.join(__dirname, "./filters.txt"), txtString.join(""), "utf8");
    res.json(fullBody);
})

app.listen(port);