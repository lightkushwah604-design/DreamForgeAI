require("dotenv").config();

const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json());

const HF_TOKEN = process.env.HF_TOKEN;
const MODEL = "black-forest-labs/FLUX.1-schnell";

app.get("/", (req, res) => {
  res.json({ status: "Backend Running" });
});

app.post("/generate", async (req, res) => {
  try {
const { prompt, negative_prompt } = req.body;
    // अगर size नहीं भेजी गई, तो 1024x1024 इस्तेमाल होगी
    const [width, height] = (size || "1024x1024")
      .split("x")
      .map(Number);

     const formData = new FormData();

formData.append("prompt", prompt);

if (req.file) {
  formData.append("image", req.file.buffer, {
    filename: req.file.originalname,
    contentType: req.file.mimetype,
  });
}

const input = {
  prompt: prompt,
  output_format: "png"
};

if (req.file) {
  const mime = req.file.mimetype;
  const base64 = req.file.buffer.toString("base64");

  input.input_images = [
    `data:${mime};base64,${base64}`
  ];
}


const input = {
  prompt: prompt,
  output_format: "png"
};

if (image) {
  const mime = image.mimetype;
  const base64 = image.buffer.toString("base64");

  input.input_images = [
    `data:${mime};base64,${base64}`
  ];
}

const response = await axios.post(
  `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/ai/run`,
  {
    model: "black-forest-labs/flux-2-flex",
    input
  },
  {
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
      "Content-Type": "application/json"
    },
    responseType: "arraybuffer"
  }
);

{
  prompt: prompt,
  negative_prompt: negative_prompt
},
      {
        headers: {
          Authorization: `Bearer ${CF_TOKEN}`
        },
        responseType: "arraybuffer"
      }
    );

    res.set("Content-Type", "image/png");
    res.send(response.data);

  } catch (err) {
    console.log(err.response?.data || err.message);
    res.status(500).json({
      error: err.response?.data || err.message
    });
  }
});
app.listen(3000, () => {
  console.log("✅ Server running on http://localhost:3000");
});
