const express = require("express");
const router = express.Router();

const Lead = require("../modules/leadSchema.module");

// Get leads closed in the last week
// Get leads closed in the last week (using updatedAt)
router.get("/last-week", async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const leads = await Lead.find({
      status: "Closed",
      updatedAt: { $gte: sevenDaysAgo },
    })
      .select("_id name salesAgent updatedAt")
      .populate("salesAgent", "name");

    const result = leads.map((lead) => ({
      id: lead._id,
      name: lead.name,
      salesAgent: lead.salesAgent?.name || null,
      closedAt: lead.updatedAt,
    }));

    return res.status(200).json({ success: true, result });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
});


// Get total leads in pipeline (status not Closed)
router.get("/pipeline", async (req, res) => {
  try {
    const count = await Lead.countDocuments({ status: { $ne: "Closed" } });
    return res.status(200).json({ totalLeadsInPipeline: count });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

const SalesAgent = require("../modules/salesAgentSchema.module");

// Get number of leads closed by each sales agent
router.get("/closed-by-agent", async (req, res) => {
  try {
    const results = await Lead.aggregate([
      { $match: { status: "Closed" } },
      { $group: { _id: "$salesAgent", closedCount: { $sum: 1 } } },
      {
        $lookup: {
          from: "salesagents",
          localField: "_id",
          foreignField: "_id",
          as: "agent",
        },
      },
      { $unwind: "$agent" },
      {
        $project: {
          _id: 0,
          salesAgentId: "$agent._id",
          salesAgentName: "$agent.name",
          closedCount: 1,
        },
      },
    ]);
    return res.status(200).json(results);
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
});



module.exports = router