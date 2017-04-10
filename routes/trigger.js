var express = require("express");
var router = new express.Router();
var AWS = require("aws-sdk");
var common = require("../common");
var config = common.config();
AWS.config.loadFromPath(config.aws_config_path);
var util = require("util");
var ec2 = new AWS.EC2({region: "us-east-1"});


var callAll = function () {
    "use strict";

    var params = {
        Filters: [
            {
                Name: "tag-key",
                Values: [
                    "elasticbeanstalk:environment-name"
                ]
            },
            {
                Name: "tag-value",
                Values: [
                    "hammer-v1"
                ]
            }
        ]
    };
    ec2.describeInstances(params, function (err, data) {
        if (err) {
            console.warn(err, err.stack);
        } else {
            // console.log(util.inspect(data, {showHidden: true, depth: null}));
            data.Reservations.forEach(function (reservation) {
                // console.log(util.inspect(reservation, {showHidden: true, depth: null}));
                reservation.Instances.forEach(function (instance) {
                    console.log(util.inspect(instance.PublicDnsName, {showHidden: true, depth: null}));
                    console.warn("making call....");
                    var http = require("http");

                    var options = {
                        host: instance.PublicDnsName,
                        path: "/?number=10000&seconds=10"
                    };

                    var callback = function (response) {
                        var str = "";

                        // console.log("mk2");
                        //another chunk of data has been recieved, so append it to `str`
                        response.on("data", function (chunk) {
                            str += chunk;
                        });

                        //the whole response has been recieved, so we just print it out here
                        response.on("end", function () {
                            console.log(Date.now() + " " + str);
                        });
                    };

                    var request = http.request(options, callback);
                    request.on("error", function (err) {
                        console.log(err);
                        // arrExceptions.push(err);
                        // console.log("arrExceptions.length: " + arrExceptions.length);
                    }).end();
                });
            });
        }
    });
};

router.get("/", function (req, res, next) {
    "use strict";

    callAll();
    res.setHeader("content-type", "application/json");
    res.send(JSON.stringify({version: "hello"}));
});

module.exports = router;
