const index = (fastify, options, done) => {
    fastify.get("/contact", async(req, res) => {
        return res.redirect("https://discord.gg/sticksurfofficial");
    });
    done()
};

module.exports = index;