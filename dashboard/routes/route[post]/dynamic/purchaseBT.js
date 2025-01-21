const db = require("playerio-node");
const paypal = require("paypal-rest-sdk");

const index = (fastify, options, done) => {

    fastify.post("/purchase", async (req, res) => {
        if (!req.body.username) res.send({ error: true, message: "Provide username to get the blue tokens" })
        else if (![110, 250, 650, 1500, 3500, 7500].includes(Number(req.query.amount))) res.send({ error: true, message: "This is not hackable u idiot made by dexter ;)" })
        else {
            let price = req.query.amount == 250 ? 2 : req.query.amount == 650 ? 5 : req.query.amount == 1500 ? 10 : req.query.amount == 3500 ? 25 : req.query.amount == 7500 ? 50 : 1
            db.PlayerIO.authenticate(
                "surf--gle056q8huavuerrdccbyg",
                "shopconnection",
                {
                    userId: req.body.username,
                    auth: require("../../../../index").hashGenerator(req.body.username)
                },
                {},
                (client) => {
                    client.bigDB.load("Division",  client.connectUserId?.split("simple")[1] ?? client.connectUserId, async (user) => {
                        if (user == null) res.send({ error: true, message: "User doesn't exist in game" })
                        else {

                            paypal.configure({
                                'mode': req.config.paypal.mode,
                                'client_id': req.config.paypal.client_id,
                                'client_secret': req.config.paypal.client_secret
                            });

                            req.session.set( client.connectUserId?.split("simple")[1] ?? client.connectUserId, req.query.amount);
                            const create_payment_json = {
                                "intent": "sale",
                                "payer": {
                                    "payment_method": "paypal"
                                },
                                "redirect_urls": {
                                    "return_url": `${req.config.domain}/purchase?type=success&author=${ client.connectUserId?.split("simple")[1] ?? client.connectUserId}&price=${await price}`,
                                    "cancel_url": `${req.config.domain}/purchase?type=cancel`
                                },
                                "transactions": [{
                                    "item_list": {
                                        "items": [{
                                            "name": `${req.query.amount} Tokens`,
                                            "sku": "1",
                                            "price": await price,
                                            "currency": "USD",
                                            "quantity": 1
                                        }]
                                    },
                                    "amount": {
                                        "currency": "USD",
                                        "total": await price
                                    },
                                    "description": `Purchase ${req.query.amount} Blue tokens for ${await price}`
                                }]
                            };
                            paypal.payment.create(create_payment_json, (error, payment) => {
                                if (error) console.log(error)
                                else for (let i = 0; i < payment.links.length; i++) if (payment.links[i].rel === 'approval_url') res.send({ error: false, message: "You will be redirected", paypal: payment.links[i].href });

                                return res;
                            });

                        }
                    })
                },
                (error) => { res.send({ error: true, message: "Unknown username" }) }
            );

            return res;
        }
    });

    done()
};

module.exports = index;