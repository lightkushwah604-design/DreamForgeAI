require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json());

const upload = multer({
  storage: multer.memoryStorage(),
});

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

app.get("/", (req, res) => {
  res.json({ status: "DreamForge AI Backend Running (Replicate)" });
});

app.post("/generate", upload.single("image"), async (req, res) => {
  try {
    const prompt = req.body.prompt;

    if (!prompt) {
      return res.status(400).json({
        error: "Prompt is required",
      });
    }

    let prediction;

    if (req.file) {
      // Image-to-Image (FLUX Kontext Pro)
      prediction = await axios.post(
        "https://api.replicate.com/v1/predictions",
        {
          model: "black-forest-labs/flux-kontext-pro",
          input: {
            prompt: prompt,
            input_image: `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
            output_format: "jpg",
          },
        },
        {
          headers: {
            Authorization: `Bearer ${REPLICATE_API_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );
    } else {
      // Text-to-Image (FLUX Dev)
      prediction = await axios.post(
        "https://api.replicate.com/v1/predictions",
        {
          model: "black-forest-labs/flux-dev",
          input: {
            prompt: prompt,
            output_format: "jpg",
          },
        },
        {
          headers: {
            Authorization: `Bearer ${REPLICATE_API_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const predictionUrl = prediction.data.urls.get;

    while (true) {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const result = await axios.get(predictionUrl, {
        headers: {
          Authorization: `Bearer ${REPLICATE_API_TOKEN}`,
        },
      });

      if (result.data.status === "succeeded") {
        const imageUrl = Array.isArray(result.data.output)
          ? result.data.output[0]
          : result.data.output;

        const image = await axios.get(imageUrl, {
          responseType: "arraybuffer",
        });

        res.setHeader("Content-Type", "image/jpeg");
        return res.send(image.data);
      }

      if (result.data.status === "failed") {
        return res.status(500).json({
          error: "Image generation failed",
        });
      }
    }
  } catch (err) {
    console.error(err.response?.data || err.message);

    res.status(500).json({
      error: err.response?.data || err.message,
    });
  }
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
