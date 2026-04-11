const express = require("express");
const router = express.Router();
const { getAlerts, createAlert, deleteAlert, toggleAlert } = require("../controllers/alertController");
const { protect } = require("../middleware/auth");

router.use(protect);
router.get("/", getAlerts);
router.post("/", createAlert);
router.delete("/:alertId", deleteAlert);
router.patch("/:alertId/toggle", toggleAlert);

module.exports = router;
