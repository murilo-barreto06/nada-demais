// Simple frontend JS for demo interactions

// Theme + settings
function toggleTheme(){
  document.body.classList.toggle('light');
}
function toggleSettings(){
  document.getElementById('settingsPanel').classList.toggle('open');
}
function goHome(){ location.href = 'index.html'; }

// Mock data for store
const PRODUCTS = [
  { id:1, title:'IA Atendimento para WhatsApp', price:'R$ 199,00', seller:'BotLabs', short:'Atendente automático para mensagens', img: '' },
  { id:2, title:'Analisador de Documentos', price:'R$ 299,00', seller:'DocAI', short:'Extrai e classifica documentos', img: '' },
  { id:3, title:'Recomendador de Produtos', price:'R$ 149,00', seller:'RecoSys', short:'Sistema de recomendações para e‑commerce', img: '' },
  { id:4, title:'Detector de Qualidade (Visão)', price:'R$ 349,00', seller:'VisionWorks', short:'Detecta defeitos em produção', img: '' }
];

// Carousel control (used in index and store pages)
let carouselX = 0;
function moveCarousel(dir){
  // try storeCarousel first, otherwise #carousel
  const el = document.getElementById('storeCarousel') || document.getElementById('carousel');
  if(!el) return;
  const step = 260 * dir;
  carouselX += step;
  const max = Math.max(0, (el.children.length * 250) - el.parentElement.offsetWidth + 40);
  if(carouselX < -max) carouselX = 0;
  if(carouselX > 0) carouselX = -max;
  el.style.transform = `translateX(${carouselX}px)`;
}

// Populate store carousel on store.html
function renderStore(){
  const el = document.getElementById('storeCarousel');
  if(!el) return;
  el.innerHTML = '';
  PRODUCTS.forEach(p => {
    const d = document.createElement('div');
    d.className = 'card';
    d.innerHTML = `<div class="img"></div><p>${p.title}</p>`;
    d.onclick = () => openProduct(p.id);
    el.appendChild(d);
  });
}

// Open product details (mock navigation using query param)
function openProduct(id){
  // save selected product to sessionStorage and go to model page
  const prod = PRODUCTS.find(p => p.id === id);
  if(prod){
    sessionStorage.setItem('selectedProduct', JSON.stringify(prod));
    location.href = 'model.html';
  }
}

// On index sample open product by index
function openProductSample(i){
  const p = PRODUCTS[i] || PRODUCTS[0];
  openProduct(p.id);
}

// Populate model page from sessionStorage
function renderModel(){
  const data = sessionStorage.getItem('selectedProduct');
  if(!data) return;
  const p = JSON.parse(data);
  const title = document.getElementById('productTitle');
  const short = document.getElementById('productShort');
  const price = document.getElementById('productPrice');
  const seller = document.getElementById('productSeller');
  const img = document.getElementById('productImage');
  const docs = document.getElementById('productDocs');
  if(title) title.textContent = p.title;
  if(short) short.textContent = p.short;
  if(price) price.textContent = p.price;
  if(seller) seller.textContent = p.seller;
  if(img) img.style.background = 'linear-gradient(180deg,#cfeeff,#9fd8ff,#7bc35b)';
  if(docs) docs.innerHTML = '<li>Instalação via Docker</li><li>API REST - Exemplo</li><li>Exemplos de integração</li>';
  // related (simple)
  const rel = document.getElementById('relatedGrid');
  if(rel){
    rel.innerHTML = '';
    PRODUCTS.filter(x => x.id !== p.id).slice(0,3).forEach(r=>{
      const c = document.createElement('div');
      c.className = 'small-card';
      c.innerHTML = `<h4>${r.title}</h4><p>${r.seller}</p>`;
      rel.appendChild(c);
    });
  }
}

// Mock login action
function mockLogin(){
  alert('Login mock — aqui você integraria com backend');
  // example redirect
  location.href = 'buyer-dashboard.html';
}

// Run renderers on DOMContentLoaded
document.addEventListener('DOMContentLoaded', ()=>{
  renderStore();
  renderModel();
});

function moveCarousel(dir) {
  const carousel = document.querySelector(".carousel");
  carousel.scrollBy({
    left: dir * 300,
    behavior: "smooth"
  });
}

async function loadFeatured() {
  const res = await fetch("models.json");
  const models = await res.json();

  const carousel = document.querySelector(".carousel");
  carousel.innerHTML = "";  // limpa os cards anteriores

  models.forEach(model => {
    const card = document.createElement("a");
    card.href = `model.html?id=${model.id}`;
    card.className = "carousel-item";

    card.innerHTML = `
      <div class="carousel-thumb" style="background-image:url('${model.image}')"></div>
      <h3>${model.title}</h3>
      <p>${model.description}</p>
    `;

    carousel.appendChild(card);
  });
}

loadFeatured();

function nextSlide() {
  const container = document.getElementById("carouselContainer");
  container.scrollLeft += 300;
}

function prevSlide() {
  const container = document.getElementById("carouselContainer");
  container.scrollLeft -= 300;
}
