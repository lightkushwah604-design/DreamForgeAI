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
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

const replicate =
  new Replicate({
    auth: process.env.REPLICATE_API_TOKEN
  });


/* ==========================
   HEALTH CHECK
========================== */

app.get("/", (req, res) => {

  res.json({
    status:
      "DreamForge AI Backend Running"
  });

});


/* ==========================
   IMAGE GENERATION
========================== */

app.post(
  "/generate",
  upload.single("image"),
  async (req, res) => {

    try {

      const prompt =
        req.body.prompt?.trim();


      if (!prompt) {

        return res.status(400).json({
          error:
            "Prompt is required"
        });

      }


      let output;


      /* ======================
         IMAGE → IMAGE
      ====================== */

      if (req.file) {

        const inputImage =
          `data:${req.file.mimetype};base64,` +
          req.file.buffer.toString(
            "base64"
          );


        output =
          await replicate.run(
            "black-forest-labs/flux-kontext-pro",
            {
              input: {
                prompt,
                input_image:
                  inputImage,
                output_format:
                  "jpg"
              }
            }
          );


      }


      /* ======================
         TEXT → IMAGE
      ====================== */

      else {

        output =
          await replicate.run(
            "black-forest-labs/flux-dev",
            {
              input: {
                prompt,
                output_format:
                  "jpg"
              }
            }
          );

      }


      /*
        Replicate can return
        different output shapes.
      */

      let imageUrl;


      if (Array.isArray(output)) {

        imageUrl =
          output[0];

      } else if (
        output &&
        typeof output.url === "function"
      ) {

        imageUrl =
          output.url();

      } else {

        imageUrl =
          output;

      }


      if (!imageUrl) {

        throw new Error(
          "No image returned by Replicate"
        );

      }


      const imageResponse =
        await fetch(imageUrl);


      if (!imageResponse.ok) {

        throw new Error(
          "Could not download generated image"
        );

      }


      const buffer =
        Buffer.from(
          await imageResponse.arrayBuffer()
        );


      res.setHeader(
        "Content-Type",
        "image/jpeg"
      );

      res.setHeader(
        "Cache-Control",
        "no-store"
      );


      res.send(buffer);


    } catch (error) {

      console.error(
        "IMAGE ERROR:",
        error
      );


      res.status(500).json({

        error:
          error.message ||
          "Image generation failed"

      });

    }

  }
);


/* ==========================
   CHATBOT
========================== */

app.post(
  "/chat",
  async (req, res) => {

    try {

      const message =
        req.body.message?.trim();


      if (!message) {

        return res.status(400).json({
          error:
            "Message is required"
        });

      }


      if (
        !process.env.OPENROUTER_API_KEY
      ) {

        throw new Error(
          "OPENROUTER_API_KEY is missing"
        );

      }


      const response =
        await fetch(
          "https://openrouter.ai/api/v1/chat/completions",
          {

            method:"POST",

            headers:{

              "Authorization":
                `Bearer ${process.env.OPENROUTER_API_KEY}`,

              "Content-Type":
                "application/json"

            },

            body:JSON.stringify({

              model:
               "deepseek/deepseek-chat-v3-0324",
              
                messages:[

                {
                  role:"system",

                  content:
                    "You are DreamForge AI, a friendly and helpful AI assistant. Reply naturally in English or Hindi/Hinglish depending on the user's language."
                },

                {
                  role:"user",
                  content:message
                }

              ]

            })

          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data?.error?.message ||
          "OpenRouter request failed"
        );

      }


      if (
        data.error
      ) {

        throw new Error(
          data.error.message ||
          "Chat failed"
        );

      }


      const reply =
        data?.choices?.[0]?.message?.content;


      if (!reply) {

        throw new Error(
          "No reply received"
        );

      }


      res.json({
        reply
      });


    } catch (error) {

      console.error(
        "CHAT ERROR:",
        error
      );


      res.status(500).json({

        error:
          error.message ||
          "Chat failed"

      });

    }

  }
);


/* ==========================
   START
========================== */

const PORT =
  process.env.PORT || 8000;


app.listen(
  PORT,
  () => {

    console.log(
      `🚀 DreamForge AI Backend running on port ${PORT}`
    );

  }
);
