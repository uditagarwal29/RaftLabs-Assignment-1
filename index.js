const express = require("express");
const expressLayouts = require('express-ejs-layouts')
const sassMiddleware = require('node-sass-middleware');

const port = 9000;
const app = express();

app.use(sassMiddleware({
    src: './assets/scss',
    dest: './assets/css',
    debug: true,
    outputStyle: 'extended',
    prefix: '/css'
}));


app.use(express.urlencoded());
app.use(express.static('./assets'));
app.use(expressLayouts);
app.set('layout extractStyles', true);
app.set('layout extractScripts', true);

app.set('view engine', 'ejs');
app.set('views', './views');

app.use('/', require('./routes/index'));

app.listen(port, function (err) {
    if (err) {
        console.log('Error in running server', err);
    }
    console.log("Backend server running on port : ", port);
});
