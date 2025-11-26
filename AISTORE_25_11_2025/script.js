// Tema
function toggleTheme() {
    const body = document.body;
    const current = body.classList.contains("dark") ? "dark" : "light";

    if (current === "light") {
        body.classList.remove("light");
        body.classList.add("dark");
    } else {
        body.classList.remove("dark");
        body.classList.add("light");
    }
}

// Configurações
function openSettings() {
    document.getElementById("settingsPanel").classList.add("open");
}
function closeSettings() {
    document.getElementById("settingsPanel").classList.remove("open");
}

// Carrossel básico
let scrollIndex = 0;

function moveCarousel(dir) {
    const cards = document.querySelectorAll(".card");
    scrollIndex += dir;

    if (scrollIndex < 0) scrollIndex = cards.length - 3;
    if (scrollIndex > cards.length - 3) scrollIndex = 0;

    document.querySelector(".carousel").style.transform =
        `translateX(${-scrollIndex * 300}px)`;
}
