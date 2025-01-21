const itemsArray = require("./../../../../items");

const index = (fastify, options, done) => {
    fastify.get("/wiki", async (req, res) => {
        let items = [];
        let searchArr = [];
        if (req.query.term) {
            
            searchArr = itemsArray['itemsArray'].filter(item => {
                if (item.type.toLowerCase().match(new RegExp(req.query.term.toLowerCase(), "gi"))) return true;
                else if (item.id.toLowerCase().match(new RegExp(req.query.term.toLowerCase(), "gi"))) return true;
                else if (item.name.toLowerCase().match(new RegExp(req.query.term.toLowerCase(), "gi"))) return true;
                else if (item.story.toLowerCase().match(new RegExp(req.query.term.toLowerCase(), "gi"))) return true;
                else if (item.kind.toLowerCase().match(new RegExp(req.query.term.toLowerCase(), "gi"))) return true;
                else return false;
            })
        }
        let arrToUse = req.query.term ? searchArr : itemsArray["itemsArray"]
        if (!isNaN(req.query.page)) {
            for (let i = 0; i < arrToUse.length; i++) {
                if (items.length < 10 && i >= ((req.query.page - 1) * 10)) items.push(arrToUse[i])
            }

        } else {
            for (let i = 0; i < arrToUse.length; i++) {
                if (i <= 9) items.push(arrToUse[i])
            }
        }

        let page = req.query?.page ?? 1;
        let max = Math.ceil(arrToUse.length / 10);
        let nextPages = [];

        for (let i = 0; i < 3; i++) {
            if (Number(page) + (i + 1) < max) nextPages.push(Number(page) + (i + 1))
        }
        return req.render("/dynamic/wiki.liquid", { items, nextPages, max })
    });
    done();
};

module.exports = index;