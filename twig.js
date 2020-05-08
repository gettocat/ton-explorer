const format = require('humanize-duration')
const dateformat = require('date-format');
const BN = require("bn.js");
const Twig = require("twig")

module.exports = (req, res, next) => {

    Twig.extendFunction("workchain", function () {
        return req.session.workchain_id;
    })

    Twig.extendFilter("balance", function (value) {
        if (!value)
            return "0";
        return new BN("" + value.replace("0x", ""), 16).toString(10);
    })

    Twig.extendFilter("date", function (value) {
        return dateformat.asString('dd.MM.yy hh:mm', value instanceof Date ? value : (new Date(value * 1000)));
    });

    Twig.extendFilter("time", function (value) {
        return dateformat.asString('hh:mm', value);
    });

    Twig.extendFilter("json", function (value) {
        return JSON.stringify(value, null, "  ");
    });

    Twig.extendFunction("trimTx", function (value) {
        return value.substr(0, 4) + "..." + value.substr(-4, 4);
    });

    Twig.extendFilter("duration", function (value) {
        return format(value * 1000, { round: true, delimiter: ' and ', largest: 2 });
    });

    Twig.extendFilter("durationFromTime", function (time) {
        return format((Date.now() / 1000 - time) * 1000, { round: true, delimiter: ' and ', largest: 2 });
    });

    req.app.engine('twig', Twig.__express);
    next();
}