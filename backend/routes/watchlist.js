const express = require("express");
const router = express.Router();
const { getWatchlist, addCoin, removeCoin } = require("../controllers/watchlistController");
const { protect } = require("../middleware/auth");

router.use(protect);
router.get("/", getWatchlist);
router.post("/", addCoin);
router.delete("/:coinId", removeCoin);

module.exports = router;
