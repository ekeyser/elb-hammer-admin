var express = require("express");
var router = new express.Router();
var AWS = require("aws-sdk");
var common = require("../common");
var config = common.config();
AWS.config.loadFromPath(config.aws_config_path);
var util = require("util");


var callAll = function () {
    "use strict";

    var ec2 = new AWS.EC2({region: "us-east-1"});
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
                    "go-hammer-v1"
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
                        path: "/trigger?number=0&seconds=10"
                    };

                    var callbackFailure = function (err) {

                    };

                    var callback = function (response) {
                        var str = "";

                        response.on("data", function (chunk) {
                            str += chunk;
                        });

                        response.on("end", function () {
                            console.log(Date.now() + " " + str);
                        });
                    };

                    var request = http.request(options, callback);
                    request.setTimeout(10000, callbackFailure);
                    request.on("error", callbackFailure).end();
                });
            });
        }
    });
};

router.get("/", function (req, res, next) {
    "use strict";

    res.setHeader("content-type", "application/json");
    res.send(JSON.stringify({version: "hello"}));

    callAll();
});

module.exports = router;
