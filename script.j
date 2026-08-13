const clearGalleryBtn = document.getElementById("clearGalleryBtn");
const clearFavoritesBtn = document.getElementById("clearFavoritesBtn");
const imageInput = document.getElementById("imageInput");
const negativePrompt = document.getElementById("negativePrompt");
const prompt = document.getElementById("prompt");
const style = document.getElementById("style");
const size = document.getElementById("size");

const generateBtn = document.getElementById("generateBtn");
const loading = document.getElementById("loading");

const result = document.getElementById("result");
const resultImage = document.getElementById("resultImage");
const downloadBtn = document.getElementById("downloadBtn");

const gallery = document.getElementById("gallery");
const favorites = document.getElementById("favorites");

generateBtn.addEventListener("click", async () => {
    const text = prompt.value.trim();

    if (!text) {
        alert("कृपया Prompt लिखें।");
        return;
    }

    generateBtn.disabled = true;
    generateBtn.innerText = "⏳ Generating...";
    loading.style.display = "block";
    result.style.display = "none";

    try
 {
     const response = await fetch("http://127.0.0.1:3000/generate", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        prompt: text,
        negative_prompt: negativePrompt.value,
        size: size.value
    })
});
        if (!response.ok) {
            throw new Error(await response.text());
        }

        const blob = await response.blob();
       const reader = new FileReader();

reader.onloadend = () => {
    const imageUrl = reader.result;

    resultImage.src = imageUrl;
    result.style.display = "block";

    // Save in LocalStorage
    let images = JSON.parse(localStorage.getItem("gallery") || "[]");
    images.unshift(imageUrl);

    // केवल आखिरी 20 images रखें
    if (images.length > 20) {
        images = images.slice(0, 20);
    }

    localStorage.setItem("gallery", JSON.stringify(images));

    // Gallery में जोड़ो
    const box = document.createElement("div");

    const img = document.createElement("img");
    img.src = imageUrl;
    img.style.width = "100%";
    img.style.borderRadius = "10px";

    const favBtn = document.createElement("button");
    favBtn.innerText = "⭐ Favorite";

    favBtn.onclick = () => {
        let favs = JSON.parse(localStorage.getItem("favorites") || "[]");
        favs.unshift(imageUrl);
        localStorage.setItem("favorites", JSON.stringify(favs));
        loadFavorites();
    };

    box.appendChild(img);
    box.appendChild(favBtn);

    gallery.prepend(box);
};

reader.readAsDataURL(blob);
        resultImage.src = imageUrl;
        result.style.display = "block";

        // Gallery
        const box = document.createElement("div");

        const img = document.createElement("img");
        img.src = imageUrl;
        img.style.width = "100%";
        img.style.borderRadius = "10px";

        const favBtn = document.createElement("button");
        favBtn.innerText = "⭐ Favorite";
        favBtn.className = "favorite-btn";

        favBtn.onclick = () => {
            const favImg = document.createElement("img");
            favImg.src = imageUrl;
            favImg.style.width = "100%";
            favImg.style.borderRadius = "10px";
            favorites.prepend(favImg);
        };

        box.appendChild(img);
        box.appendChild(favBtn);

        gallery.prepend(box);
let images = JSON.parse(localStorage.getItem("gallery") || "[]");
images.unshift(imageUrl);
localStorage.setItem("gallery", JSON.stringify(images));

    } catch (err) {
        alert("Error: " + err.message);
        console.log(err);
    } finally {
        loading.style.display = "none";
        generateBtn.disabled = false;
        generateBtn.innerText = "🚀 Generate Image";
    }
});

downloadBtn.addEventListener("click", () => {
    const a = document.createElement("a");
    a.href = resultImage.src;
    a.download = "DreamForgeAI.png";
    a.click();
});
const randomPromptBtn = document.getElementById("randomPromptBtn");

const randomPrompts = [
  "A futuristic city at sunset",
  "A cute cat sitting on the moon",
  "A dragon flying over snowy mountains",
  "A cyberpunk motorcycle in Tokyo",
  "A robot exploring Mars",
  "A tiger walking in a jungle",
  "A fantasy castle in the clouds",
  "A beautiful waterfall in a forest"
];

function loadGallery() {
    gallery.innerHTML = "";

    const images = JSON.parse(localStorage.getItem("gallery") || "[]");

    images.forEach(imageUrl => {
        const box = document.createElement("div");

        const img = document.createElement("img");
        img.src = imageUrl;
        img.style.width = "100%";
        img.style.borderRadius = "10px";

        box.appendChild(img);

        gallery.appendChild(box);
    });
}

function loadFavorites() {
    favorites.innerHTML = "";

    const favs = JSON.parse(localStorage.getItem("favorites") || "[]");

    favs.forEach(imageUrl => {
        const img = document.createElement("img");
        img.src = imageUrl;
        img.style.width = "100%";
        img.style.borderRadius = "10px";

        favorites.appendChild(img);
    });
}

loadGallery();
loadFavorites();

randomPromptBtn.addEventListener("click", () => {
    const index = Math.floor(Math.random() * randomPrompts.length);
    prompt.value = randomPrompts[index];
});
clearGalleryBtn.addEventListener("click", () => {
    if (confirm("Gallery delete karni hai?")) {
        localStorage.removeItem("gallery");
        gallery.innerHTML = "";
    }
});

clearFavoritesBtn.addEventListener("click", () => {
    if (confirm("Favorites delete karne hain?")) {
        localStorage.removeItem("favorites");
        favorites.innerHTML = "";
    }
});
