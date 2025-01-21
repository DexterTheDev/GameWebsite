const db = require("playerio-node");

const index = (fastify, options, done) => {

    fastify.get("/pricing", async (req, res) => {
        let items = [];

    
        function connection() {
            return new Promise(async function (resolve, reject) {
                await db.PlayerIO.authenticate(
                    "surf--gle056q8huavuerrdccbyg",
                    "shopconnection",
                    {
                        userId: "Stock",
                        auth: require("../../../../../index").hashGenerator("Stock")
                    },
                    {},
                     (client) => {
                        client.bigDB.loadOrCreate("StockItems", "Stock",  function (obj) {
                             req.config.stockItems.map(async item => {
                                 items.push({
                                    name: item.name,
                                    img: item.img,
                                    price: item.price,
                                    stats: item.stats,
                                    stock: obj[item.img] ?? 5
                                })
                            })
                            resolve()
                            
                        });
                    },
                    (error) => {
                        console.log(error)
                    }

                )
            });
        }


        await connection()
        .then(async (res) => {
            await req.render("/dynamic/pricing/index.liquid", { stockItems: items, Chests: req.config.chests, exclusives: req.config.exclusive });
        })
    });

    done()
};

module.exports = index;