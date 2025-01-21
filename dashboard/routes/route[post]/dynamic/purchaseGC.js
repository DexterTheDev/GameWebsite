const db = require("playerio-node");
const paypal = require("paypal-rest-sdk");

const index = (fastify, options, done) => {

    fastify.post("/giftcode", async (req, res) => {
        if (!req.body.username) res.send({ error: true, message: "Provide username to get the item" })
        else {
            let item;

            db.PlayerIO.authenticate(
                "surf--gle056q8huavuerrdccbyg",
                "shopconnection",
                {
                    userId: req.body.username,
                    auth: require("../../../../index").hashGenerator(req.body.username)
                },
                {},
                (client) => {
                    let giftcode;
                    let giftcodeChance = [];

                    for (const [key, value] of Object.entries(require("../../../../config").giftcodesChance)) {
                        for (let i = 0; i < value; i++) {
                            giftcodeChance.push(key)
                        }
                    }

                    giftcode = giftcodeChance[Math.floor((Math.random() * giftcodeChance.length).toFixed(2))]

                    client.bigDB.load("Division",  client.connectUserId?.split("simple")[1] ?? client.connectUserId, async (user) => {
                        if (user == null) res.send({ error: true, message: "User doesn't exist in game" })
                        else {

                            paypal.configure({
                                'mode': req.config.paypal.mode,
                                'client_id': req.config.paypal.client_id,
                                'client_secret': req.config.paypal.client_secret
                            });

                            req.session.set( client.connectUserId?.split("simple")[1] ?? client.connectUserId, giftcode);
                            const create_payment_json = {
                                "intent": "sale",
                                "payer": {
                                    "payment_method": "paypal"
                                },
                                "redirect_urls": {
                                    "return_url": `${req.config.domain}/giftcode?type=success&author=${ client.connectUserId?.split("simple")[1] ?? client.connectUserId}`,
                                    "cancel_url": `${req.config.domain}/giftcode?type=cancel`
                                },
                                "transactions": [{
                                    "item_list": {
                                        "items": [{
                                            "name": `${item}`,
                                            "sku": "1",
                                            "price": 1.49,
                                            "currency": "USD",
                                            "quantity": 1
                                        }]
                                    },
                                    "amount": {
                                        "currency": "USD",
                                        "total": 1.49
                                    },
                                    "description": `Purchase Giftcode`
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
                (error) => {
                    console.log(error)
                }
            );
            return res;
        }
    });

    done()
};

module.exports = index;