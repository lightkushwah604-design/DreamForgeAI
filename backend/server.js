require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const axios = require("axios");

const app = express();

app.use(cors());

const app = express();

app.use(cors());
app.use(express.json());

const upload = multer({
  storage: multer.memoryStorage(),
});
const HF_TOKEN = process.env.HF_TOKEN;

app.get("/", (req, res) => {
  res.json({ status: "DreamForge AI Backend Running (Hugging Face)" });
});

app.post("/generate", upload.single("image"), async (req, res) => {
  try {
    const prompt = req.body.prompt;

    if (!prompt) {
      return res.status(400).json({
        error: "Prompt is required",
      });
    }

    let response;

    if (req.file) {
      // Image-to-Image
      response = await axios.post(
        "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-refiner-1.0",
        req.file.buffer,
        {
          params: {
            prompt: prompt,
          },
          headers: {
            Authorization: `Bearer ${HF_TOKEN}`,
            "Content-Type": req.file.mimetype,
          },
          responseType: "arraybuffer",
        }
      );
    } else {
      // Text-to-Image
      response = await axios.post(
        "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev",
        {
          inputs: prompt,
        },
        {
          headers: {
            Authorization: `Bearer ${HF_TOKEN}`,
          },
          responseType: "arraybuffer",
        }
      );
    }

    res.setHeader("Content-Type", "image/png");
    res.send(response.data);
  } catch (err) {
    console.error(err.response?.data || err.message);

    res.status(500).json({
      error: err.response?.data?.toString() || err.message,
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
