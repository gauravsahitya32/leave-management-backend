const mongoose = require('mongoose');
require('dotenv/config');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const routes = require('./routes/index');
const globalUtils = require('./utils');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(globalUtils.myLogger);
app.use(routes);

mongoose.connect(`${process.env.DB_URL}/${process.env.DB_NAME}`, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {

    console.log(`Connected to the database.`);

    app.listen(process.env.PORT, () => {
        console.log(`Server started at port ${process.env.PORT}`);
    }); 

}).catch((error) => {
    console.log(`An error occured while starting the server\nError:${error}`);
});