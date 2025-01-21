const db = require("playerio-node");
const paypal = require("paypal-rest-sdk");

const index = (fastify, options, done) => {
  fastify.get("/purchaseitem", async (req, res) => {
    let item = req.session?.get(req.query.author);
    if (!req.query.author)
      return req.render("./handlers/custom.liquid", {
        error: true,
        message: "Error occured while getting username",
      });
    else if (
      [
        ...req.config.stockItems,
        ...req.config.chests,
        ...req.config.exclusive,
      ].filter((i) => i.img == req.session?.get(req.query.author))?.length <= 0
    )
      return req.render("./handlers/custom.liquid", {
        error: true,
        message: "This is not hackable u idiot made by dexter ;)",
      });
    else if (req.session.get(req.query.author) === null)
      return req.render("./handlers/custom.liquid", {
        error: true,
        message: "Expired connection, repurchase",
      });
    else {
      if (req.query.type == "success") {
        let pass = req.config.stockItems.filter(
          (item) => item.img == req.session?.get(req.query.author)
        ).length;
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
          mode: req.config.paypal.mode,
          client_id: req.config.paypal.client_id,
          client_secret: req.config.paypal.client_secret,
        });
        paypal.payment.execute(
          paymentId,
          execute_payment_json,
          async (error, payment) => {
            if (error) {
              console.log(error);
              dataToSend = {
                error: true,
                message: `${error.response.message}`,
              };
            } else {
              await db.PlayerIO.authenticate(
                "surf--gle056q8huavuerrdccbyg",
                "shopconnection",
                {
                  userId: req.query.author,
                  auth: require("../../../../../index").hashGenerator(
                    req.query.author
                  ),
                },
                {},
                (client) => {
                  client.bigDB.loadOrCreate(
                    "StorePayments",
                    req.query.paymentId,
                    function (DBpayment) {
                      DBpayment.item = item;
                      DBpayment.date = new Date(Date.now());
                      DBpayment.buyer =  client.connectUserId?.split("simple")[1] ?? client.connectUserId;
                      DBpayment.save();
                    },
                    function (error) {
                      console.log(error);
                    }
                  );
                  client.payVault.refresh(
                    function () {
                      client.payVault.give(
                        [{ itemkey: item?.toLowerCase() ?? item }],
                        () => {
                          console.log("New Purchase");
                        },
                        function (error) {
                            dataToSend = { error: true, message: "Error while giving the item" };
                        }
                      );
                    },
                    function (error) {
                        dataToSend = { error: true, message: "Error while giving the item" };
                    }
                  );
                  if (pass > 0) {
                    client.bigDB.loadOrCreate(
                      "StockItems",
                      "Stock",
                      function (obj) {
                        if (!obj[item]) obj[item] = 4;
                        else obj[item] -= 1;
                        obj.save();
                      },
                      function (error) {
                        console.log(error);
                      }
                    );
                  }
                },
                function (error) {
                  dataToSend = { error: true, message: "Unknown username" };
                }
              );
            }
          }
        );

        await req.session.set(req.query.author, null);
        return req.render("/handlers/custom.liquid", {
          error: false,
          message: `${
            item.charAt(0).toUpperCase() + item.slice(1)
          } has been added to your inventory, make sure to click store refresh button!`,
        });
      } else if (req.query.type == "cancel")
        return req.render("/handlers/custom.liquid", {
          error: true,
          message: "Your payment request has been canceled",
        });
      else
        return req.render("/handlers/custom.liquid", {
          error: true,
          message: "Wrong pass, contact developer",
        });
    }
  });

  done();
};

module.exports = index;
