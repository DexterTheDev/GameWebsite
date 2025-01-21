const index = (fastify, options, done) => {
    fastify.get("/privacy", async(req, res) => {
        return req.render("/dynamic/privacy.liquid")
    });
    done();
};

module.exports = index;