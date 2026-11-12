
const express = require("express");
const mongoose = require('mongoose');
const router = express.Router();

const Lead = require("../modules/leadSchema.module");
const Comment = require("../modules/commentSchema.module")
router.post("/", async (req, res) => {
  try {
    const {
      name,
      source,
      salesAgent,
      status,
      tags,
      timeToClose,
      priority
    } = req.body;

    if (!name || !source || !salesAgent || !status || !timeToClose || !priority) {
      return res.status(400).json({
        message: "Name, source and salesAgent are required"
      });
    }

    const newLead = await Lead.create({
      name,
      source,
      salesAgent,
      status,
      tags,
      timeToClose,
      priority
    });

    return res.status(201).json({
      message: "Lead created successfully",
      data: newLead
    });

  } catch (e) {
    return res.status(500).json({
      message: e.message
    });
  }
});
  // Add comment to the lead
router.post("/:id/comments", async (req, res) => {
  try {
    const { author, commentText } = req.body;
    const { id } = req.params;

    if (!author || !commentText) {
      return res.status(400).json({
        message: "Author and commentText are required"
      });
    }

    const lead = await Lead.findById(id);

    if (!lead) {
      return res.status(404).json({
        message: "Lead not found"
      });
    }

const newComment = await Comment.create({
  author,
  commentText,
  lead: id
});

return res.status(201).json({
  message: "Comment added successfully",
  data: newComment
});

  } catch (e) {
    return res.status(500).json({
      message: e.message
    });
  }
});


// Get all leads with optional filters

router.get("/", async (req, res) => {
  try {
    const { salesAgent, status, tags, source } = req.query;
    // Validation
    const allowedStatuses = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Closed'];
    const allowedSources = ['Website', 'Referral', 'Cold Call', 'Advertisement', 'Email', 'Other'];
    if (salesAgent && !mongoose.Types.ObjectId.isValid(salesAgent)) {
      return res.status(400).json({ error: "Invalid input: 'salesAgent' must be a valid ObjectId." });
    }
    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid input: 'status' must be one of ${JSON.stringify(allowedStatuses)}.` });
    }
    if (source && !allowedSources.includes(source)) {
      return res.status(400).json({ error: `Invalid input: 'source' must be one of ${JSON.stringify(allowedSources)}.` });
    }
    const filter = {};
    if (salesAgent) filter.salesAgent = salesAgent;
    if (status) filter.status = status;
    if (source) filter.source = source;
    if (tags) {
      const tagsArray = tags.split(',').map(t => t.trim());
      filter.tags = { $in: tagsArray };
    }
    const leads = await Lead.find(filter).populate('salesAgent', '_id name');
    return res.status(200).json(leads);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
});



// Update a lead by ID
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    // Validate lead ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid input: 'id' must be a valid ObjectId." });
    }

    const { name, source, salesAgent, status, tags, timeToClose, priority } = req.body;
    if (!name || !source || !salesAgent || !status || !timeToClose || !priority) {
      return res.status(400).json({ error: "All fields (name, source, salesAgent, status, timeToClose, priority) are required." });
    }

    const allowedStatuses = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Closed'];
    const allowedSources = ['Website', 'Referral', 'Cold Call', 'Advertisement', 'Email', 'Other'];

    if (!mongoose.Types.ObjectId.isValid(salesAgent)) {
      return res.status(400).json({ error: "Invalid input: 'salesAgent' must be a valid ObjectId." });
    }
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid input: 'status' must be one of ${JSON.stringify(allowedStatuses)}.` });
    }
    if (!allowedSources.includes(source)) {
      return res.status(400).json({ error: `Invalid input: 'source' must be one of ${JSON.stringify(allowedSources)}.` });
    }

    const update = { name, source, salesAgent, status, tags, timeToClose, priority };
    const updatedLead = await Lead.findByIdAndUpdate(id, update, { new: true, runValidators: true })
      .populate('salesAgent', '_id name');

    if (!updatedLead) {
      return res.status(404).json({ error: "Lead not found." });
    }
    return res.status(200).json(updatedLead);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
});
// Delete Lead
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid input: 'id' must be a valid ObjectId." });
    }

    const lead = await Lead.findById(id);
    if (!lead) {
      return res.status(404).json({ error: "Lead not found." });
    }

    await Lead.findByIdAndDelete(id);
    return res.status(200).json({ message: "Lead deleted successfully." });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
});




module.exports = router
