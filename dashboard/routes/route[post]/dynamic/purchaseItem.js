const db = require("playerio-node");
const paypal = require("paypal-rest-sdk");

const index = (fastify, options, done) => {

    fastify.post("/purchaseitem", async (req, res) => {
        if (!req.body.username) res.send({ error: true, message: "Provide username to get the item" })
        else if ([...req.config.stockItems,  ...req.config.chests, ...req.config.exclusive].filter(item => item.name == req.query.item)?.length <= 0) res.send({ error: true, message: "This is not hackable u idiot made by dexter ;)" })
        else {
            let price;
            let item;
            req.config.stockItems.filter(iteM => {
                if (iteM.name == req.query.item) {
                    price = iteM.price
                    item = iteM.img
                }
            });
            req.config.chests.filter(iteM => {
                if (iteM.name == req.query.item) {
                    price = iteM.price
                    item = iteM.img
                }
            });
            req.config.exclusive.filter(iteM => {
                if (iteM.name == req.query.item) {
                    price = iteM.price
                    item = iteM.img
                }
            });

            db.PlayerIO.authenticate(
                "surf--gle056q8huavuerrdccbyg",
                "shopconnection",
                {
                    userId: req.body.username,
                    auth: require("../../../../index").hashGenerator(req.body.username)
                },
                {},
                (client) => {
                    client.bigDB.loadOrCreate("StockItems", "Stock", function (obj) {
                        if ( obj && obj[item] === 0) res.send({ error: true, message: "Out of stock" })
                        else {
                            client.bigDB.load("Division", client.connectUserId?.split("simple")[1] ?? client.connectUserId, async (user) => {
                                if (user == null) res.send({ error: true, message: "User doesn't exist in game" })
                                else {

                                    paypal.configure({
                                        'mode': req.config.paypal.mode,
                                        'client_id': req.config.paypal.client_id,
                                        'client_secret': req.config.paypal.client_secret
                                    });

                                    req.session.set( client.connectUserId?.split("simple")[1] ?? client.connectUserId, item);
                                    const create_payment_json = {
                                        "intent": "sale",
                                        "payer": {
                                            "payment_method": "paypal"
                                        },
                                        "redirect_urls": {
                                            "return_url": `${req.config.domain}/purchaseitem?type=success&author=${ client.connectUserId?.split("simple")[1] ?? client.connectUserId}&price=${await price}`,
                                            "cancel_url": `${req.config.domain}/purchaseitem?type=cancel`
                                        },
                                        "transactions": [{
                                            "item_list": {
                                                "items": [{
                                                    "name": `${item}`,
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
                                            "description": `Purchase ${req.query.item} Item`
                                        }]
                                    };
                                    paypal.payment.create(create_payment_json, (error, payment) => {
                                        if (error) console.log(error)
                                        else for (let i = 0; i < payment.links.length; i++) if (payment.links[i].rel === 'approval_url') res.send({ error: false, message: "You will be redirected", paypal: payment.links[i].href });

                                        return res;
                                    });

                                }
                            })
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