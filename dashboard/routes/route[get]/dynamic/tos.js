const index = (fastify, options, done) => {
    fastify.get("/tos", async(req, res) => {
        return req.render("/dynamic/tos.liquid")
    });
    done();
};

module.exports = index;