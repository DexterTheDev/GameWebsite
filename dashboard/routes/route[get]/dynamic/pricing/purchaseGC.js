const db = require("playerio-node");
const paypal = require("paypal-rest-sdk");

const index = (fastify, options, done) => {

    fastify.get("/giftcode", async (req, res) => {
        let item = req.session?.get(req.query.author);
        let giftcode = require("../../../../../index").RandomString(6);
        if (!req.query.author) return req.render("./handlers/custom.liquid", { error: true, message: "Error occured while getting username" })
        else if (req.session.get(req.query.author) === null) return req.render("./handlers/custom.liquid", { error: true, message: "Expired connection, repurchase" })
        else {
            if (req.query.type == "success") {
                let dataToSend = {};
                const payerId = req.query.PayerID;
                const paymentId = req.query.paymentId;

                const execute_payment_json = {
                    payer_id: payerId,
                    transactions: [
                        {
                            amount: {
                                currency: "USD",
                                total: 1.49,
                            },
                        },
                    ],
                };
                paypal.configure({
                    'mode': req.config.paypal.mode,
                    'client_id': req.config.paypal.client_id,
                    'client_secret': req.config.paypal.client_secret
                });
                paypal.payment.execute(
                    paymentId,
                    execute_payment_json,
                    async (error, payment) => {
                        if (error) {
                            console.log(error)
                            dataToSend = { error: true, message: `${error.response.message}` }
                        }

                        else {
                            await db.PlayerIO.authenticate(
                                "surf--gle056q8huavuerrdccbyg",
                                "shopconnection",
                                {
                                    userId: req.query.author,
                                    auth: require("../../../../../index").hashGenerator(req.query.author)
                                },
                                {},
                                (client) => {
                                    client.bigDB.loadOrCreate("StorePayments", req.query.paymentId, function (DBpayment) {
                                        DBpayment.item = item;
                                        DBpayment.type = "Giftcode";
                                        DBpayment.gc = giftcode;
                                        DBpayment.date = new Date(Date.now());
                                        DBpayment.buyer =  client.connectUserId?.split("simple")[1] ?? client.connectUserId;
                                        DBpayment.save();
                                    }, function (error) { console.log(error); });
                                    client.bigDB.loadOrCreate("Giftcodes", "codeslist", function (obj) {
                                        obj[giftcode] = item
                                        obj.save();
                                    }, function (error) { console.log(error); });
                                },
                                function (error) { dataToSend = { error: true, message: "Unknown username" } }
                            );

                        }

                    });

                await req.session.set(req.query.author, null)
                return req.render("/handlers/custom.liquid", { error: false, message: `<b class="text-green-600">${giftcode}</b> has been generated, make sure to copy!` })
            } else if (req.query.type == "cancel") return req.render("/handlers/custom.liquid", { error: true, message: "Your payment request has been canceled" });
            else return req.render("/handlers/custom.liquid", { error: true, message: "Wrong pass, contact developer" });
        }
    });

    done()
};

module.exports = index;