const multer = require("multer");
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json());
const upload = multer({ storage: multer.memoryStorage() });

const ACCOUNT_ID = process.env.CF_ACCOUNT_ID;
const API_TOKEN = process.env.CF_API_TOKEN;

app.get("/", (req, res) => {
  res.json({ status: "DreamForge AI Backend Running" });
});

app.post("/generate", upload.single("image"), async (req, res) => {
  try {
    const { prompt } = req.body;
const image = req.file;
console.log("Prompt:", prompt);

if (image) {
    console.log("Image uploaded:", image.originalname);
}
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const response = await axios.post(
      `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/ai/run/@cf/stabilityai/stable-diffusion-xl-base-1.0`,
      {
        prompt: prompt
      },
      {
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          "Content-Type": "application/json"
        },
        responseType: "arraybuffer"
      }
    );

    res.setHeader("Content-Type", "image/png");
    res.send(response.data);

  } catch (err) {
    console.log(err.response?.data?.toString() || err.message);
    res.status(500).json({
      error: err.response?.data?.toString() || err.message
    });
  }
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
