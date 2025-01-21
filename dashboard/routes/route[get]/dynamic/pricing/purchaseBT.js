const db = require("playerio-node");
const paypal = require("paypal-rest-sdk");

const index = (fastify, options, done) => {

    fastify.get("/purchase", async (req, res) => {
        if (!req.query.author) return req.render("./handlers/custom.liquid", { error: true, message: "Error occured while getting username" })
        else if (![110, 250, 650, 1500, 3500, 7500].includes(Number(req.session.get(req.query.author)))) return req.render("./handlers/custom.liquid", { error: true, message: "This is not hackable u idiot made by dexter ;)" })
        else if (req.session.get(req.query.author) === 0) return req.render("./handlers/custom.liquid", { error: true, message: "Expired connection, repurchase" })
        else {
            let amount = req.session.get(req.query.author)
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
                                total: req.query.price,
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
                                        DBpayment.amount = Number(amount);
                                        DBpayment.date = new Date(Date.now());
                                        DBpayment.buyer =  client.connectUserId?.split("simple")[1] ?? client.connectUserId;
                                        DBpayment.save();
                                    }, function (error) { console.log(error); });
                                    client.bigDB.loadOrCreate("Division",  client.connectUserId?.split("simple")[1] ?? client.connectUserId, async (user) => {
                                        if (user == null) dataToSend = { error: true, message: "User doesn't exist in game" }
                                        else {
                                            user.bluetokens += Number(amount);
                                            user.save();

                                            dataToSend = { error: false, message: "Your tokens has been added to your vault" };
                                        }
                                    })
                                },
                                function (error) { dataToSend = { error: true, message: "Unknown username" } }
                            );

                        }

                    });

                await req.session.set(req.query.author, 0)
                return req.render("/handlers/custom.liquid", { error: false, message: "Your tokens has been added to your vault" })
            } else if (req.query.type == "cancel") return req.render("/handlers/custom.liquid", { error: true, message: "Your payment request has been canceled" });
            else return req.render("/handlers/custom.liquid", { error: true, message: "Wrong pass, contact developer" });
        }
    });

    done()
};

module.exports = index;