const express = require("express");
const router = express.Router();
const { getPortfolio, addHolding, updateHolding, deleteHolding } = require("../controllers/portfolioController");
const { protect } = require("../middleware/auth");

router.use(protect);
router.get("/", getPortfolio);
router.post("/", addHolding);
router.put("/:holdingId", updateHolding);
router.delete("/:holdingId", deleteHolding);

module.exports = router;
