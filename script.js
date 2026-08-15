const prompt = document.getElementById("prompt");
const negativePrompt = document.getElementById("negativePrompt");
const style = document.getElementById("style");
const size = document.getElementById("size");
const imageInput = document.getElementById("imageInput");

const generateBtn = document.getElementById("generateBtn");
const loading = document.getElementById("loading");

const result = document.getElementById("result");
const resultImage = document.getElementById("resultImage");
const downloadBtn = document.getElementById("downloadBtn");

const gallery = document.getElementById("gallery");
const favorites = document.getElementById("favorites");
const historyDiv = document.getElementById("history");

const randomPromptBtn = document.getElementById("randomPromptBtn");
const clearGalleryBtn = document.getElementById("clearGalleryBtn");
const clearFavoritesBtn = document.getElementById("clearFavoritesBtn");

const randomPrompts = [
    "A futuristic city at sunset",
    "A cute cat sitting on the moon",
    "A dragon flying over snowy mountains",
    "A cyberpunk motorcycle in Tokyo",
    "A robot exploring Mars",
    "A tiger walking in a jungle",
    "A fantasy castle in the clouds",
    "A beautiful waterfall"
];

randomPromptBtn.onclick = () => {
    prompt.value = randomPrompts[Math.floor(Math.random() * randomPrompts.length)];
};

generateBtn.onclick = async () => {

    if (!prompt.value.trim()) {
        alert("Prompt likho.");
        return;
    }

    generateBtn.disabled = true;
    loading.style.display = "block";
    result.style.display = "none";

    try {

        const formData = new FormData();

        formData.append("prompt", prompt.value);

        if (negativePrompt.value)
            formData.append("negative_prompt", negativePrompt.value);

        if (style.value)
            formData.append("style", style.value);

        if (size.value)
            formData.append("size", size.value);

        if (imageInput.files.length > 0) {
            formData.append("image", imageInput.files[0]);
        }

        const response = await fetch("https://dreamforgeai-3.onrender.com/generate", {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            throw new Error(await response.text());
        }

        const blob = await response.blob();

        const reader = new FileReader();

        reader.onloadend = () => {

            const image = reader.result;

            resultImage.src = image;
            result.style.display = "block";

            saveGallery(image);
            saveHistory(prompt.value);

        };

        reader.readAsDataURL(blob);

    } catch (e) {

        alert(e.message);

    } finally {

        loading.style.display = "none";
        generateBtn.disabled = false;

    }

};

downloadBtn.onclick = () => {

    const a = document.createElement("a");

    a.href = resultImage.src;
    a.download = "DreamForgeAI.png";

    a.click();

};

function saveGallery(img) {

    let data = JSON.parse(localStorage.getItem("gallery") || "[]");

    data.unshift(img);

    if (data.length > 20)
        data = data.slice(0, 20);

    localStorage.setItem("gallery", JSON.stringify(data));

    loadGallery();

}

function loadGallery() {

    gallery.innerHTML = "";

    let data = JSON.parse(localStorage.getItem("gallery") || "[]");

    data.forEach(img => {

        const box = document.createElement("div");

        const image = document.createElement("img");

        image.src = img;
        image.style.width = "100%";

        const fav = document.createElement("button");

        fav.innerText = "⭐ Favorite";

        fav.onclick = () => saveFavorite(img);

        box.appendChild(image);
        box.appendChild(fav);

        gallery.appendChild(box);

    });

}
function saveFavorite(img) {

    let data = JSON.parse(localStorage.getItem("favorites") || "[]");

    if (!data.includes(img))
        data.unshift(img);

    localStorage.setItem("favorites", JSON.stringify(data));

    loadFavorites();

}

function loadFavorites() {

    favorites.innerHTML = "";

    let data = JSON.parse(localStorage.getItem("favorites") || "[]");

    data.forEach(img => {

        const image = document.createElement("img");

        image.src = img;
        image.style.width = "100%";

        favorites.appendChild(image);

    });

}

function saveHistory(text) {

    let data = JSON.parse(localStorage.getItem("history") || "[]");

    data.unshift(text);

    if (data.length > 15)
        data = data.slice(0, 15);

    localStorage.setItem("history", JSON.stringify(data));

    loadHistory();

}

function loadHistory() {

    historyDiv.innerHTML = "";

    let data = JSON.parse(localStorage.getItem("history") || "[]");

    data.forEach(t => {

        const p = document.createElement("p");

        p.innerText = t;

        historyDiv.appendChild(p);

    });

}

clearGalleryBtn.onclick = () => {

    localStorage.removeItem("gallery");

    loadGallery();

};

clearFavoritesBtn.onclick = () => {

    localStorage.removeItem("favorites");

    loadFavorites();

};

loadGallery();
loadFavorites();
loadHistory();
