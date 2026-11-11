
const express = require("express");
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


module.exports = router;
