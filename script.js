/* =========================================
   DREAMFORGE AI
   Single Input / Single Button
========================================= */

const IMAGE_API = "https://dreamforgeai-3.onrender.com/generate";
const CHAT_API = "https://dreamforgeai-3.onrender.com/chat";

/* =========================================
   ELEMENTS
========================================= */

const chat =
  document.getElementById("chat");

const welcome =
  document.getElementById("welcome");

const promptInput =
  document.getElementById("prompt");

const imageInput =
  document.getElementById("imageInput");

const generateBtn =
  document.getElementById("generateBtn");

const previewContainer =
  document.getElementById("previewContainer");

const uploadPreview =
  document.getElementById("uploadPreview");

const removeImage =
  document.getElementById("removeImage");

const loading =
  document.getElementById("loading");

const loadingTitle =
  document.getElementById("loadingTitle");

const loadingText =
  document.getElementById("loadingText");

const voiceBtn =
  document.getElementById("voiceBtn");

const attachBtn =
  document.getElementById("attachBtn");

const menuBtn =
  document.getElementById("menuBtn");

const settingsBtn =
  document.getElementById("settingsBtn");


let selectedFile = null;
let recognition = null;


/* =========================================
   IMAGE UPLOAD
========================================= */

imageInput.addEventListener("change", () => {

  const file = imageInput.files[0];

  if (!file) return;

  selectedFile = file;

  uploadPreview.src =
    URL.createObjectURL(file);

  previewContainer.style.display =
    "block";

  showToast("Image selected");

});


removeImage.addEventListener("click", () => {

  selectedFile = null;

  imageInput.value = "";

  uploadPreview.removeAttribute("src");

  previewContainer.style.display =
    "none";

});


/* =========================================
   ATTACH BUTTON
========================================= */

attachBtn.addEventListener("click", () => {

  imageInput.click();

});


/* =========================================
   AUTO TEXTAREA HEIGHT
========================================= */

promptInput.addEventListener(
  "input",
  () => {

    promptInput.style.height = "auto";

    promptInput.style.height =
      Math.min(
        promptInput.scrollHeight,
        110
      ) + "px";

  }
);


/* =========================================
   ENTER
========================================= */

promptInput.addEventListener(
  "keydown",
  (event) => {

    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {

      event.preventDefault();

      generateBtn.click();

    }

  }
);


/* =========================================
   MAIN BUTTON
========================================= */

generateBtn.addEventListener(
  "click",
  handleRequest
);


async function handleRequest(){

  const prompt =
    promptInput.value.trim();


  if (!prompt && !selectedFile){

    showToast(
      "Write a message or upload an image"
    );

    return;

  }


  /*
    IMAGE UPLOADED
    ----------------
    Always Image → Image
  */

  if (selectedFile){

    await generateImage(prompt);

    return;

  }


  /*
    No image
    ----------------
    Decide Chat OR Text → Image
  */

  if (looksLikeImageRequest(prompt)){

    await generateImage(prompt);

  }else{

    await sendChat(prompt);

  }

}


/* =========================================
   IMAGE INTENT
========================================= */

function looksLikeImageRequest(text){

  const value =
    text.toLowerCase();


  const imageWords = [

    "generate image",
    "create image",
    "make image",
    "generate a photo",
    "create a photo",
    "make a photo",

    "draw",
    "illustration",
    "wallpaper",
    "poster",

    "text to image",
    "text-to-image",

    "image of",
    "picture of",
    "photo of",

    "cinematic image",
    "realistic image",
    "digital art",
    "concept art",

    "ghibli art",
    "anime art",

    "portrait of",

    "render",
    "visualize"

  ];


  return imageWords.some(
    word => value.includes(word)
  );

}


/* =========================================
   IMAGE GENERATION
========================================= */

async function generateImage(prompt){

  setLoading(
    "Creating your image",
    selectedFile
      ? "Transforming your image..."
      : "Dreaming up your image..."
  );


  addUserMessage(
    prompt || "Transform this image",
    selectedFile
  );


  const form =
    new FormData();

  form.append(
    "prompt",
    prompt || "Improve and transform this image"
  );


  if (selectedFile){

    form.append(
      "image",
      selectedFile
    );

  }


  try{

    const response =
      await fetch(
        IMAGE_API,
        {
          method:"POST",
          body:form
        }
      );


    if (!response.ok){

      let errorMessage =
        "Image generation failed";

      try{

        const data =
          await response.json();

        if (data.error){
          errorMessage =
            data.error;
        }

      }catch(_){}

      throw new Error(
        errorMessage
      );

    }


    const blob =
      await response.blob();


    const imageUrl =
      URL.createObjectURL(blob);


    addAIImage(imageUrl);


    promptInput.value = "";

    promptInput.style.height =
      "auto";


    clearSelectedImage();


  }catch(error){

    addAIText(
      "❌ " +
      (error.message ||
       "Image generation failed")
    );

  }finally{

    hideLoading();

  }

}


/* =========================================
   CHAT
========================================= */

async function sendChat(prompt){

  setLoading(
    "DreamForge AI",
    "Thinking..."
  );


  addUserMessage(
    prompt
  );


  promptInput.value = "";

  promptInput.style.height =
    "auto";


  try{

    const response =
      await fetch(
        CHAT_API,
        {
          method:"POST",

          headers:{
            "Content-Type":
              "application/json"
          },

          body:JSON.stringify({
            message:prompt
          })

        }
      );


    const data =
      await response.json();


    if (!response.ok){

      throw new Error(
        data.error ||
        "Chat request failed"
      );

    }


    if (data.error){

      throw new Error(
        data.error
      );

    }


    addAIText(
      data.reply ||
      "I couldn't generate a reply."
    );


  }catch(error){

    addAIText(
      "❌ " +
      (error.message ||
       "Chat failed")
    );

  }finally{

    hideLoading();

  }

}


/* =========================================
   USER MESSAGE
========================================= */

function addUserMessage(
  text,
  file = null
){

  hideWelcome();


  const box =
    document.createElement("div");

  box.className =
    "user-message";


  if (file){

    const image =
      document.createElement("img");

    image.src =
      URL.createObjectURL(file);

    box.appendChild(image);

  }


  const textBox =
    document.createElement("div");

  textBox.className =
    "message-text";

  textBox.textContent =
    text;


  box.appendChild(textBox);

  chat.appendChild(box);


  scrollBottom();

}


/* =========================================
   AI IMAGE
========================================= */

function addAIImage(url){

  hideWelcome();


  const box =
    document.createElement("div");

  box.className =
    "ai-message";


  const card =
    document.createElement("div");

  card.className =
    "image-card";


  const image =
    document.createElement("img");

  image.src =
    url;

  image.alt =
    "DreamForge AI generated image";


  /*
    DOWNLOAD BUTTON
  */

  const download =
    document.createElement("button");

  download.className =
    "download-image";

  download.innerHTML =
    '<i class="fa-solid fa-download"></i>';

  download.title =
    "Download image";


  download.onclick =
    () => downloadImage(url);


  card.appendChild(image);

  card.appendChild(download);


  /*
    IMAGE TOOLS
  */

  const tools =
    document.createElement("div");

  tools.className =
    "image-tools";


  const like =
    createToolButton(
      "fa-regular fa-heart",
      "Like"
    );

  like.onclick =
    () => {

      like.innerHTML =
        '<i class="fa-solid fa-heart"></i>';

      showToast("Saved to favourites");

    };


  const edit =
    createToolButton(
      "fa-solid fa-wand-magic-sparkles",
      "Edit"
    );

  edit.onclick =
    () => {

      selectedFile =
        null;

      /*
        Use generated image
        as reference by fetching it.
      */

      fetch(url)
        .then(res => res.blob())
        .then(blob => {

          selectedFile =
            new File(
              [blob],
              "DreamForgeAI.png",
              {
                type:
                  blob.type ||
                  "image/png"
              }
            );

          uploadPreview.src =
            url;

          previewContainer.style.display =
            "block";

          promptInput.focus();

          showToast(
            "Image ready for editing"
          );

        })
        .catch(() => {

          showToast(
            "Could not prepare image"
          );

        });

    };


  const save =
    createToolButton(
      "fa-regular fa-bookmark",
      "Save"
    );

  save.onclick =
    () => {

      showToast(
        "Image saved"
      );

    };


  const help =
    createToolButton(
      "fa-regular fa-circle-question",
      "Help"
    );

  help.onclick =
    () => {

      showToast(
        "Use Edit to transform this image"
      );

    };


  tools.appendChild(like);
  tools.appendChild(edit);
  tools.appendChild(save);
  tools.appendChild(help);


  box.appendChild(card);

  box.appendChild(tools);


  chat.appendChild(box);


  scrollBottom();

}


/* =========================================
   TOOL BUTTON
========================================= */

function createToolButton(
  icon,
  title
){

  const button =
    document.createElement("button");

  button.innerHTML =
    `<i class="${icon}"></i>`;

  button.title =
    title;

  return button;

}


/* =========================================
   AI TEXT
========================================= */

function addAIText(text){

  hideWelcome();


  const box =
    document.createElement("div");

  box.className =
    "ai-message";


  const textBox =
    document.createElement("div");

  textBox.className =
    "ai-text";

  textBox.textContent =
    text;


  box.appendChild(
    textBox
  );


  chat.appendChild(box);


  scrollBottom();

}


/* =========================================
   DOWNLOAD
========================================= */

async function downloadImage(url){

  try{

    const response =
      await fetch(url);

    const blob =
      await response.blob();


    const blobUrl =
      URL.createObjectURL(blob);


    const a =
      document.createElement("a");

    a.href =
      blobUrl;

    a.download =
      "DreamForgeAI.png";


    document.body.appendChild(a);

    a.click();

    a.remove();


    setTimeout(
      () => URL.revokeObjectURL(blobUrl),
      1000
    );


    showToast(
      "Image downloaded"
    );

  }catch(error){

    /*
      Fallback
    */

    window.open(
      url,
      "_blank"
    );

  }

}


/* =========================================
   CLEAR IMAGE
========================================= */

function clearSelectedImage(){

  selectedFile = null;

  imageInput.value = "";

  uploadPreview.removeAttribute(
    "src"
  );

  previewContainer.style.display =
    "none";

}


/* =========================================
   LOADING
========================================= */

function setLoading(
  title,
  text
){

  loadingTitle.textContent =
    title;

  loadingText.textContent =
    text;

  loading.style.display =
    "flex";

}


function hideLoading(){

  loading.style.display =
    "none";

}


/* =========================================
   WELCOME
========================================= */

function hideWelcome(){

  if (welcome){

    welcome.style.display =
      "none";

  }

}


/* =========================================
   SCROLL
========================================= */

function scrollBottom(){

  requestAnimationFrame(
    () => {

      chat.scrollTop =
        chat.scrollHeight;

    }
  );

}


/* =========================================
   TOAST
========================================= */

function showToast(message){

  const toast =
    document.getElementById("toast");


  toast.textContent =
    message;


  toast.style.display =
    "block";


  clearTimeout(
    window.toastTimer
  );


  window.toastTimer =
    setTimeout(
      () => {

        toast.style.display =
          "none";

      },
      2200
    );

}


/* =========================================
   VOICE INPUT
========================================= */

if (
  "webkitSpeechRecognition"
  in window
){

  recognition =
    new webkitSpeechRecognition();

  recognition.lang =
    "en-IN";

  recognition.continuous =
    false;

  recognition.interimResults =
    false;


  recognition.onresult =
    event => {

      const text =
        event.results[0][0].transcript;

      promptInput.value =
        text;

      promptInput.dispatchEvent(
        new Event("input")
      );

    };


  recognition.onerror =
    () => {

      showToast(
        "Voice input unavailable"
      );

    };

}


voiceBtn.addEventListener(
  "click",
  () => {

    if (!recognition){

      showToast(
        "Voice input is not supported"
      );

      return;

    }

    recognition.start();

    showToast(
      "Listening..."
    );

  }
);


/* =========================================
   TOP BUTTONS
========================================= */

menuBtn.addEventListener(
  "click",
  () => {

    showToast(
      "More DreamForge tools coming soon"
    );

  }
);


settingsBtn.addEventListener(
  "click",
  () => {

    showToast(
      "Settings coming soon"
    );

  }
);
