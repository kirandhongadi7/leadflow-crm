
const express = require("express");
const router = express.Router();
const Tag = require("../modules/tagSchema.module");

// Add Tag
router.post("/", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Tag name is required"
      });
    }
    const existingTag = await Tag.findOne({
      name: name.trim()
    });

    if (existingTag) {
      return res.status(409).json({
        success: false,
        message: "Tag already exists"
      });
    }

    const newTag = await Tag.create({
      name: name.trim()
    });

    return res.status(201).json({
      success: true,
      message: "Tag created successfully",
      data: newTag
    });

  } catch (e) {
    console.error("Error creating tag:", e);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
});


// Fetch Tags
router.get("/", async (req, res) => {
  try {
    const tags = await Tag.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: tags.length,
      data: tags
    });

  } catch (e) {
    console.error("Error fetching tags:", e);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
});

module.exports = router;
