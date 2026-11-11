
const express = require("express");
const router = express.Router();
const SalesAgent = require("../modules/salesAgentSchema.module");

router.post("/", async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        message: "Required both Name and Email"
      });
    }

    // Save data into MongoDB
    const newSalesAgent = await SalesAgent.create({
      name,
      email
    });

    return res.status(201).json({
      message: "Sales Agent created successfully",
      data: newSalesAgent
    });

  } catch (e) {
    return res.status(500).json({
      message: e.message
    });
  }
});

module.exports = router;
