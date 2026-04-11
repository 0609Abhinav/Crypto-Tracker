const express = require("express");
const router  = express.Router();
const { getPrefs, updatePrefs, addRecentlyViewed, clearRecentlyViewed } = require("../controllers/prefsController");
const { protect } = require("../middleware/auth");

router.use(protect);
router.get("/",              getPrefs);
router.put("/",              updatePrefs);
router.post("/recent",       addRecentlyViewed);
router.delete("/recent",     clearRecentlyViewed);

module.exports = router;
