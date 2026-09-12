const express = require("express");
const router = express.Router();
const { getJobs } = require("./jobs.controller");

router.get("/", getJobs);

module.exports = router;