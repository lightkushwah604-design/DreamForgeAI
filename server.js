require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const axios = require("axios");

const app = express();

app.use(cors());

const upload = multer({
  storage: multer.memoryStorage(),
});

const ACCOUNT_ID = process.env.CF_ACCOUNT_ID;
const API_TOKEN = process.env.CF_API_TOKEN;

app.get("/", (req, res) => {
  res.json({ status: "DreamForge AI Backend Running" });
});

app.post("/generate", upload.single("image"), async (req, res) => {
  try {
    const prompt = req.body.prompt;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const input = {
      prompt,
      output_format: "png",
    };

    if (req.file) {
      const base64 = req.file.buffer.toString("base64");

      input.image = `data:${req.file.mimetype};base64,${base64}`;
    }

    const response = await axios.post(
      `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/ai/run`,
      {
        model: "black-forest-labs/flux-2-flex",
        input,
      },
      {
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    const imageUrl = response.data.result.image;

    const image = await axios.get(imageUrl, {
      responseType: "arraybuffer",
    });

    res.setHeader("Content-Type", "image/png");
    res.send(image.data);
  } catch (err) {
    console.error(err.response?.data || err.message);

    res.status(500).json({
      error: err.response?.data || err.message,
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
