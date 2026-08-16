import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import multer from "multer";
import Replicate from "replicate";

const app = express();

app.use(cors());
app.use(express.json());

const upload = multer({
  storage: multer.memoryStorage(),
});

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

app.get("/", (req, res) => {
  res.json({
    status: "DreamForge AI Backend Running (Replicate SDK)",
  });
});

app.post("/generate", upload.single("image"), async (req, res) => {
  try {
    const prompt = req.body.prompt;

    if (!prompt) {
      return res.status(400).json({
        error: "Prompt is required",
      });
    }

    let output;

    if (req.file) {
      // Image-to-Image (FLUX Kontext Pro)
      output = await replicate.run(
        "black-forest-labs/flux-kontext-pro",
        {
          input: {
            prompt: prompt,
            input_image: `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
            output_format: "jpg",
          },
        }
      );
    } else {
      // Text-to-Image (FLUX Dev)
      output = await replicate.run(
        "black-forest-labs/flux-dev",
        {
          input: {
            prompt: prompt,
            output_format: "jpg",
          },
        }
      );
    }

    const imageUrl = Array.isArray(output)
      ? output[0]
      : (output.url ? output.url() : output);

    const response = await fetch(imageUrl);
    const buffer = Buffer.from(await response.arrayBuffer());

    res.setHeader("Content-Type", "image/jpeg");
    return res.send(buffer);

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: err.message || "Generation failed",
    });
  }
});
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
