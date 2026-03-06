const { Router } = require("express");
const GenNet = require("../db-models/gen-net");
const router = Router();

router.get("/:id", async (req, res) => {
    const { id } = req.params;
    const genNet = await GenNet.findByIdAndUpdate(id, { lastFetchedAt: new Date() }, { new: true });
    if(!genNet) {
        return res.status(404).json({ error: "GenNet not found" });
    }
    res.json({
        id: genNet._id,
        content: genNet.content,
        lastFetchedAt: genNet.lastFetchedAt,
    });
    res.end();
});

router.post("/", async (req, res) => {
	const { content } = req.body;
    const genNet = new GenNet({ content: content });
    try {
        await genNet.save();
    }
    catch (error) {
        return res.status(400).json(error.message);
    }
    
    res.json({
        id: genNet._id,
    });
    res.end();
});

module.exports = router;