let express = require('express');
const router = express.Router();

const { addAmendment, getAmend, saveMLResult, getMlResult, saveComments, deleteAmendment } = require("../controllers/amend");

router.post("/addAmend",addAmendment);
router.get("/getAmend",getAmend);
router.post("/:aId/saveAmends",saveMLResult);
router.get("/:Id/getMlResult",getMlResult);
router.post("/:aId/saveComments", saveComments);
router.delete("/:aId", deleteAmendment);

module.exports = router;