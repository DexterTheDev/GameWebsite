const index = (fastify, options, done) => {

    fastify.get("/", async (req, res) => {
        return req.render("index.liquid");
    });

    done()
};

module.exports = index;