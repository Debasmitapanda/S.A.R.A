let express = require('express');
const router = express.Router();

const { addAmendment, getAmend ,saveMLResult,getMlResult} = require("../controllers/amend");

router.post("/addAmend",addAmendment);
router.get("/getAmend",getAmend);
router.post("/:aId/saveAmends",saveMLResult);
router.get("/:Id/getMlResult",getMlResult);

module.exports = router;