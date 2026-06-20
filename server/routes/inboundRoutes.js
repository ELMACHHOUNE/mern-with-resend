const express = require("express");
const { inboundWebhook } = require("../controllers/inboundController");

const router = express.Router();

router.post("/inbound-email", inboundWebhook);

module.exports = router;
