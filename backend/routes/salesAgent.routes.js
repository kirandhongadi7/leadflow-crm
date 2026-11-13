
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


router.get("/", async (req,res) =>{
  try{
      const allAgents = await SalesAgent.find()

      if(allAgents.length === 0){
        return res.status(404).json({
          message:"No agents found!"
        })
      }

      res.status(200).json({
        message: "Data fetch successfully",   
        success: true,
        data: allAgents
      })
  }catch(e) {
    return res.status(500).json({
        success: false,
  message: "Internal Server Error",
  error: e.message
    });
  }
})
module.exports = router;
