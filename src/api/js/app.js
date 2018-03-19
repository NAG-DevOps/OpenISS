'use strict';

const express = require('express');
let serviceLibrary = process.env.NODE_WEB_SERVICE || 'soap.js';
const service = require('./lib/'+serviceLibrary);

// Constants
const PORT = 3000;
const HOST = '0.0.0.0';
const fs = require('fs');
const views = __dirname + '/views/';


// App
const app = express();

app.get('/getFrame/:type', function(req, res, next) {
    if (req.params.type != 'color' && req.params.type != 'depth') {
        res.send("Invalid frame request");
        next();
    }

    let args = {type: req.params.type};
    service.getFrame(args, (function (error, response, body) {


        if(error) {
            console.log("got error");
            console.log(error);
            res.send(error);
            next();
        }
        else {
            var img = new Buffer(body, 'base64');
            res.contentType('image/jpeg');
            res.end(img);
            next();
        }

    }));

});

// Usage: /mixFrame/yourLocalImage&type&operand
// Example: /mixFrame/example&color&+
// A copyright free image called "example" is provided for testing purposes
app.get('/mixFrame/:image&:type&:op', function(req, res, next) {

    // check parameters validity
    if (req.params.type != 'color' && req.params.type != 'depth') {
        res.send("Invalid frame request");
        next();
    }

    // local read of file to be sent
    var content = fs.readFileSync(req.params.image+".jpg", "base64");

    let args = {image: content, type: req.params.type, op: req.params.op};
    service.mixFrame(args, (function (error, response, body) {
        if(error) {
            console.log("got error");
            console.log(error);
            res.send(error);
            next();
        }
        else {
            // convert response to jpg
            var img = new Buffer(body, 'base64');
            res.contentType('image/jpeg');
            res.end(img);
            next();
        }
    }));

});

app.get('/api/:apiCall', function(req, res, next) {

    if (process.env.NODE_WEB_SERVICE !== 'rest') {
        res.send("API Calls work only on rest mode");
        next();
    }

    let args = {apiCall: req.params.apiCall};
    service.apiCall(args, (function (error, response, body) {

        console.log('error:', error); // Print the error if one occurred
        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        console.log('body:', body); // Print the HTML for the Google homepage.

        res.status(response && response.statusCode || 500);

        if(error) {
            res.send(error);
            next();
        }
        else {
            res.send(body);
            next();
        }

    }));

});

app.get('/', (req, res) => {

    res.sendFile(views + "index.html");

});

app.listen(PORT, HOST);
console.log(`SOAP Client HTTP Service Running on http://${HOST}:${PORT}`);


