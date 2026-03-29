// ===== THEME PERSISTENCE =====
function applyTheme() {
  const savedTheme = localStorage.getItem('theme');
  const html = document.documentElement;
  
  if (savedTheme === 'dark') {
    html.classList.add('dark-mode');
  } else {
    html.classList.remove('dark-mode');
    // Se não houver tema ou for 'light', garante claro (padrão)
    localStorage.setItem('theme', 'light');
  }
}

function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.classList.contains('dark-mode');
  
  if (isDark) {
    html.classList.remove('dark-mode');
    localStorage.setItem('theme', 'light');
  } else {
    html.classList.add('dark-mode');
    localStorage.setItem('theme', 'dark');
  }
}

// Settings panel
function toggleSettings() {
  document.getElementById('settingsPanel').classList.toggle('open');
  // Atualiza o painel sempre que abrir
  if (typeof updateSettingsPanel === 'function') {
    updateSettingsPanel();
  }
}

function goHome() { 
  location.href = 'index.html'; 
}

// Mock data for store
const PRODUCTS = [
  { id:1, title:'IA Atendimento para WhatsApp', price:'R$ 199,00', seller:'BotLabs', short:'Atendente automático para mensagens', img: '' },
  { id:2, title:'Analisador de Documentos', price:'R$ 299,00', seller:'DocAI', short:'Extrai e classifica documentos', img: '' },
  { id:3, title:'Recomendador de Produtos', price:'R$ 149,00', seller:'RecoSys', short:'Sistema de recomendações para e‑commerce', img: '' },
  { id:4, title:'Detector de Qualidade (Visão)', price:'R$ 349,00', seller:'VisionWorks', short:'Detecta defeitos em produção', img: '' }
];

// Populate store carousel on store.html
function renderStore() {
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

// Open product details
function openProduct(id) {
  const prod = PRODUCTS.find(p => p.id === id);
  if(prod) {
    sessionStorage.setItem('selectedProduct', JSON.stringify(prod));
    location.href = 'model.html';
  }
}

// Open product sample
function openProductSample(i) {
  const p = PRODUCTS[i] || PRODUCTS[0];
  openProduct(p.id);
}

// Populate model page from sessionStorage
function renderModel() {
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
  
  const rel = document.getElementById('relatedGrid');
  if(rel) {
    rel.innerHTML = '';
    PRODUCTS.filter(x => x.id !== p.id).slice(0,3).forEach(r => {
      const c = document.createElement('div');
      c.className = 'small-card';
      c.innerHTML = `<h4>${r.title}</h4><p>${r.seller}</p>`;
      rel.appendChild(c);
    });
  }
}

// Mock login
function mockLogin() {
  alert('Login mock — aqui você integraria com backend');
  location.href = 'buyer-dashboard.html';
}

// Carousel functions
function moveCarousel(dir) {
  const carousel = document.querySelector(".carousel");
  carousel.scrollBy({
    left: dir * 300,
    behavior: "smooth"
  });
}

function toggleSearch(){

  const panel = document.getElementById("searchPanel")
  const content = document.getElementById("storeContent")

  panel.classList.toggle("open")
  content.classList.toggle("shift")

}

async function loadFeatured() {
  try {
    let userModels = [];
    if (window.SupaDB) {
      userModels = await SupaDB.Models.list();
      // normalize field names
      userModels = userModels.map(m => ({
        ...m,
        image: m.media?.[0]?.url || '',
        description: m.description || ''
      }));
    }
    const carousel = document.getElementById("carouselContainer");
    if (!carousel) return;
    carousel.innerHTML = "";
    if (userModels.length === 0) {
      carousel.innerHTML = '<div class="carousel-item" style="text-align:center;padding:2rem;min-width:260px;">Nenhum modelo disponível</div>';
      return;
    }
    userModels.forEach(model => {
      const card = document.createElement("a");
      card.href = `model.html?id=${model.id}`;
      card.className = "carousel-item";
      const imageUrl = model.image || model.media?.[0]?.url || '';
      card.innerHTML = `
        <div class="carousel-thumb" style="${imageUrl ? `background-image:url('${imageUrl}')` : 'background:#2d5a7a'}"></div>
        <h3>${model.title}</h3>
        <p>${(model.description||'').substring(0,70)}...</p>
      `;
      carousel.appendChild(card);
    });
  } catch (error) {
    console.error("Erro ao carregar modelos:", error);
  }
}

// Função para carregar profissionais na home
async function loadHomeProfessionals() {
  let professionals = [];
  if (window.SupaDB) {
    professionals = await SupaDB.Professionals.list();
    professionals = professionals.map(p => ({
      ...p,
      hourlyRate: p.hourly_rate,
      avatar: p.media?.[0]?.url || p.profiles?.avatar_url || ''
    }));
  }
  const carousel = document.getElementById('professionalsCarouselHome');
  if (!carousel) return;
  carousel.innerHTML = '';
  if (professionals.length === 0) {
    carousel.innerHTML = '<div class="carousel-item professionals" style="text-align:center;padding:2rem;min-width:280px;width:100%;">Nenhum profissional cadastrado. <a href="inscricao-professionals.html" style="color:var(--accent);font-weight:600;">Cadastrar agora</a></div>';
    return;
  }
  professionals.slice(0,8).forEach(prof => {
    const card = document.createElement('a');
    card.href = `professional.html?id=${prof.id}`;
    card.className = 'carousel-item professionals';
    const avatarHTML = prof.avatar
      ? `<div class="avatar" style="background-image:url('${prof.avatar}')"></div>`
      : `<div class="avatar-placeholder">${(prof.name||'?').charAt(0)}</div>`;
    card.innerHTML = `${avatarHTML}<h3>${prof.name}</h3><p class="specialty">${prof.specialty||''}</p>`;
    carousel.appendChild(card);
  });
}

function nextSlide() {
  const container = document.getElementById("carouselContainer");
  if (container) container.scrollLeft += 300;
}

function prevSlide() {
  const container = document.getElementById("carouselContainer");
  if (container) container.scrollLeft -= 300;
}

// Carregar profissional individual na página professional.html
function loadProfessional() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = parseInt(urlParams.get('id'));
  
  if (!id) {
    window.location.href = 'professionals.html';
    return;
  }
  
  // Tenta encontrar nos profissionais do localStorage (criados pelo usuário)
  const userProfessionals = JSON.parse(localStorage.getItem('professionals') || '[]');
  let professional = userProfessionals.find(p => p.id == id);
  
  if (!professional) {
    // Se não encontrar, tenta nos pré-definidos
    fetch("professionals.json")
      .then(res => res.json())
      .then(predefined => {
        professional = predefined.find(p => p.id == id);
        if (professional) {
          renderProfessional(professional);
        } else {
          window.location.href = 'professionals.html';
        }
      })
      .catch(() => {
        window.location.href = 'professionals.html';
      });
    return;
  }
  
  renderProfessional(professional);
}

// ===== CARROSSEL DE PROFISSIONAIS =====
let professionals = [];

// Carregar profissionais na página store.html (APENAS criados)
async function loadStoreProfessionals() {
  let professionals = [];
  if (window.SupaDB) {
    professionals = await SupaDB.Professionals.list();
    professionals = professionals.map(p => ({
      ...p,
      hourlyRate: p.hourly_rate,
      avatar: p.media?.[0]?.url || p.profiles?.avatar_url || ''
    }));
  }
  const carousel = document.getElementById("professionalsCarousel");
  if (!carousel) return;
  carousel.innerHTML = "";
  if (professionals.length === 0) {
    carousel.innerHTML = '<div class="carousel-item professionals" style="text-align:center;padding:2rem;">Nenhum profissional cadastrado. <a href="inscricao-professionals.html" style="color:var(--accent);">Cadastrar agora</a></div>';
    return;
  }
  professionals.forEach(prof => {
    const card = document.createElement('a');
    card.href = `professional.html?id=${prof.id}`;
    card.className = 'carousel-item professionals';
    const avatarHTML = prof.avatar
      ? `<div class="avatar" style="background-image:url('${prof.avatar}')"></div>`
      : `<div class="avatar-placeholder">${(prof.name||'?').charAt(0)}</div>`;
    card.innerHTML = `${avatarHTML}<h3>${prof.name}</h3><p class="specialty">${prof.specialty||''}</p>`;
    carousel.appendChild(card);
  });
}

function renderModel() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');
  
  if (id) {
    // Tenta encontrar nos modelos
    const models = JSON.parse(localStorage.getItem('models') || '[]');
    const model = models.find(m => m.id == id);
    
    if (model) {
      preencherPaginaModelo(model);
      return;
    }
    
    // Se não encontrar, tenta nos profissionais
    const professionals = JSON.parse(localStorage.getItem('professionals') || '[]');
    const prof = professionals.find(p => p.id == id);
    
    if (prof) {
      preencherPaginaProfissional(prof);
      return;
    }
  }
  
  // Fallback para dados mockados
  const sessionData = sessionStorage.getItem('selectedProduct');
  if (sessionData) {
    const p = JSON.parse(sessionData);
    preencherPaginaModelo(p);
  }
}

function preencherPaginaModelo(model) {
  const title = document.getElementById('productTitle');
  const short = document.getElementById('productShort');
  const price = document.getElementById('productPrice');
  const seller = document.getElementById('productSeller');
  const img = document.getElementById('productImage');
  const docs = document.getElementById('productDocs');
  
  if(title) title.textContent = model.title;
  if(short) short.textContent = model.description || model.short;
  if(price) price.textContent = model.price || 'R$ 0,00';
  if(seller) seller.textContent = model.seller || 'Vendedor';
  
  if(img) {
    if (model.image) {
      img.style.backgroundImage = `url('${model.image}')`;
      img.style.backgroundSize = 'cover';
    } else {
      img.style.background = 'linear-gradient(180deg,#cfeeff,#9fd8ff,#7bc35b)';
    }
  }
  
  if(docs) {
    docs.innerHTML = '<li>Instalação via Docker</li><li>API REST - Exemplo</li><li>Exemplos de integração</li>';
  }
  
  // Modelos relacionados
  const rel = document.getElementById('relatedGrid');
  if(rel) {
    rel.innerHTML = '';
    const models = JSON.parse(localStorage.getItem('models') || '[]');
    models.filter(x => x.id != model.id).slice(0,3).forEach(r => {
      const c = document.createElement('div');
      c.className = 'small-card';
      c.innerHTML = `<h4>${r.title}</h4><p>${r.seller || ''}</p>`;
      rel.appendChild(c);
    });
  }
}

function preencherPaginaProfissional(prof) {
  const title = document.getElementById('productTitle');
  const short = document.getElementById('productShort');
  const price = document.getElementById('productPrice');
  const seller = document.getElementById('productSeller');
  const img = document.getElementById('productImage');
  const docs = document.getElementById('productDocs');
  
  if(title) title.textContent = prof.name;
  if(short) short.textContent = prof.description || `${prof.specialty} - ${prof.projects} projetos`;
  if(price) price.textContent = 'Consultar';
  if(seller) seller.textContent = 'Profissional independente';
  
  if(img) {
    if (prof.avatar) {
      img.style.backgroundImage = `url('${prof.avatar}')`;
      img.style.backgroundSize = 'cover';
    } else {
      img.style.background = 'linear-gradient(180deg,#cfeeff,#9fd8ff,#7bc35b)';
    }
  }
  
  if(docs) {
    docs.innerHTML = '<li>Consultoria especializada</li><li>Instalação remota</li><li>Treinamento incluso</li>';
  }
}

function renderProfessionals() {
  const carousel = document.getElementById("professionalsCarousel");
  if (!carousel) return;
  
  carousel.innerHTML = "";
  
  professionals.forEach(prof => {
    const card = document.createElement("a");
    card.href = `professional.html?id=${prof.id}`;
    card.className = "carousel-item";
    
    const avatarHTML = prof.avatar
      ? `<div class="avatar" style="background-image: url('${prof.avatar}')"></div>`
      : `<div class="avatar-placeholder">${prof.name.charAt(0)}</div>`;
    
    card.innerHTML = `
      ${avatarHTML}
      <h3>${prof.name}</h3>
      <p class="specialty">${prof.specialty}</p>
      <div class="rating">${prof.rating.toFixed(1)}</div>
      <p class="projects">${prof.projects} projetos</p>
    `;
    
    carousel.appendChild(card);
  });
}

// Profissionais carousel na store.html
function nextSlideProfessionals() {
  const container = document.getElementById("professionalsCarousel");
  if (container) container.scrollLeft += 300;
}

function prevSlideProfessionals() {
  const container = document.getElementById("professionalsCarousel");
  if (container) container.scrollLeft -= 300;
}

function renderProfessional(prof) {
  // Avatar
  const avatarEl = document.getElementById('professionalAvatar');
  if (avatarEl) {
    if (prof.avatar) {
      avatarEl.style.backgroundImage = `url('${prof.avatar}')`;
      avatarEl.style.backgroundSize = 'cover';
      avatarEl.style.backgroundPosition = 'center';
    } else {
      avatarEl.style.background = `linear-gradient(135deg, var(--accent), #4ade80)`;
      avatarEl.innerHTML = `<span style="font-size: 3rem; color: white; line-height: 150px;">${prof.name.charAt(0)}</span>`;
    }
  }
  
  // Nome
  const nameEl = document.getElementById('professionalName');
  if (nameEl) nameEl.textContent = prof.name;
  
  // Especialidade
  const specialtyEl = document.getElementById('professionalSpecialty');
  if (specialtyEl) specialtyEl.textContent = prof.specialty;
  
  // Rating
  const ratingEl = document.getElementById('professionalRating');
  if (ratingEl) ratingEl.innerHTML = `⭐ ${prof.rating.toFixed(1)}`;
  
  // Bio
  const bioEl = document.getElementById('professionalBio');
  if (bioEl) bioEl.textContent = prof.bio || `${prof.name} é especialista em ${prof.specialty} com ${prof.projects} projetos realizados.`;
  
  // Projetos
  const projectsEl = document.getElementById('professionalProjects');
  if (projectsEl) projectsEl.textContent = prof.projects;
  
  // Rating no stats
  const ratingStatsEl = document.getElementById('professionalRating');
  if (ratingStatsEl) ratingStatsEl.textContent = prof.rating.toFixed(1);
  
  // Hourly rate
  const rateEl = document.getElementById('professionalHourlyRate');
  if (rateEl) rateEl.textContent = prof.hourlyRate ? `R$ ${prof.hourlyRate}` : 'Consultar';
  
  // Serviços
  const servicesEl = document.getElementById('professionalServices');
  if (servicesEl && prof.services) {
    servicesEl.innerHTML = '';
    prof.services.forEach(service => {
      const li = document.createElement('li');
      li.textContent = service;
      servicesEl.appendChild(li);
    });
  }
  
  // Modelos do profissional
  const modelsEl = document.getElementById('professionalModels');
  if (modelsEl && prof.portfolio) {
    modelsEl.innerHTML = '';
    
    // Filtra os modelos que pertencem a este profissional
    const professionalModels = PRODUCTS.filter(p => prof.portfolio.includes(p.id));
    
    if (professionalModels.length > 0) {
      professionalModels.forEach(model => {
        const card = document.createElement('div');
        card.className = 'small-card';
        card.innerHTML = `<h4>${model.title}</h4><p>${model.seller}</p>`;
        card.onclick = () => openProduct(model.id);
        card.style.cursor = 'pointer';
        modelsEl.appendChild(card);
      });
    } else {
      modelsEl.innerHTML = '<p class="no-items">Nenhum modelo publicado ainda.</p>';
    }
  }
}

// Funções de ação
function contactProfessional() {
  alert('Funcionalidade de contato será implementada em breve!');
  // Aqui você pode redirecionar para uma página de mensagem ou abrir modal
}

function viewPortfolio() {
  alert('Portfólio completo será exibido aqui!');
  // Pode abrir um modal com todos os projetos
}

// ===== GERENCIAMENTO DE PROFISSIONAIS (CRUD) =====

// Chave para localStorage
const PROFESSIONALS_STORAGE_KEY = 'ai_store_professionals';

// Mostra mensagem de sucesso após cadastro
function showSuccessMessage() {
  const container = document.querySelector('.form-container');
  if (!container) return;
  
  container.innerHTML = `
    <div class="success-message">
      <i class="fas fa-check-circle"></i>
      <h2>Cadastro realizado com sucesso!</h2>
      <p>Seu perfil já aparece no carrossel de profissionais da loja.</p>
      <div class="form-actions" style="justify-content: center;">
        <button class="cta" onclick="window.location.href='store.html'">Ver na loja</button>
        <button class="cta outline" onclick="window.location.href='anuncie.html'">Voltar</button>
      </div>
    </div>
  `;
}

// Função auxiliar para voltar
function goBack() {
  window.history.back();
}

// Sobrescreve a função loadProfessionals original para usar a nova
// (comente ou remova a função loadProfessionals antiga e use esta)
async function loadProfessionals() {
  await loadAllProfessionals();
}

// Para a página individual, precisa buscar em todos (fixos + cadastrados)
async function loadProfessional() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = parseInt(urlParams.get('id'));
  
  if (!id) {
    window.location.href = 'professionals.html';
    return;
  }
  
  try {
    // Carrega todos os profissionais (fixos + cadastrados)
    const allProfessionals = await loadAllProfessionals();
    const professional = allProfessionals.find(p => p.id === id);
    
    if (professional) {
      renderProfessional(professional);
    } else {
      window.location.href = 'professionals.html';
    }
  } catch (error) {
    console.error("Erro ao carregar profissional:", error);
  }
}

// ===== FUNÇÕES ESPECÍFICAS PARA store.html =====

// Carregar modelos na página store.html
async function loadStoreModels() {
  let models = [];
  if (window.SupaDB) {
    models = await SupaDB.Models.list();
    models = models.map(m => ({...m, image: m.media?.[0]?.url || ''}));
  }
  const carousel = document.getElementById("modelsCarousel");
  if (!carousel) return;
  carousel.innerHTML = "";
  if (models.length === 0) {
    carousel.innerHTML = '<div class="carousel-item" style="text-align:center;padding:2rem;">Nenhum modelo publicado ainda. <a href="publicar-modelo.html" style="color:var(--accent);">Publicar agora</a></div>';
    return;
  }
  models.forEach(model => {
    const card = document.createElement("a");
    card.href = `model.html?id=${model.id}`;
    card.className = "carousel-item";
    const imageUrl = model.image || '';
    card.innerHTML = `
      <div class="carousel-thumb" style="${imageUrl ? `background-image:url('${imageUrl}')` : 'background:#2d5a7a'}"></div>
      <h3>${model.title}</h3>
      <p>${(model.description||'').substring(0,70)}...</p>
      <p style="color:var(--accent);font-weight:bold;margin-top:.5rem;">${model.price||'Consultar'}</p>
    `;
    carousel.appendChild(card);
  });
}

// Carregar profissionais na página store.html (reutiliza a função existente, mas aponta para o ID correto)
function loadStoreProfessionals() {
  // Carrega APENAS profissionais criados pelo usuário
  const professionals = JSON.parse(localStorage.getItem('professionals') || '[]');
  const carousel = document.getElementById("professionalsCarousel");
  if (!carousel) return;
  
  carousel.innerHTML = "";
  
  if (professionals.length === 0) {
    carousel.innerHTML = '<div class="carousel-item professionals" style="text-align: center; padding: 2rem;">Nenhum profissional cadastrado ainda. <a href="inscricao-professionals.html" style="color: var(--accent);">Cadastrar agora</a></div>';
    return;
  }
  
  professionals.forEach(prof => {
    const card = document.createElement("a");
    card.href = `professional.html?id=${prof.id}`;
    card.className = "carousel-item professionals";
    
    const avatarHTML = prof.avatar
      ? `<div class="avatar" style="background-image: url('${prof.avatar}')"></div>`
      : `<div class="avatar-placeholder">${prof.name.charAt(0)}</div>`;
    
    card.innerHTML = `
      ${avatarHTML}
      <h3>${prof.name}</h3>
      <p class="specialty">${prof.specialty}</p>
      <div class="rating">⭐ ${prof.rating.toFixed(1)}</div>
      <p class="projects">${prof.projects || 0} projetos</p>
    `;
    
    carousel.appendChild(card);
  });
}

// Funções de navegação específicas para store.html
function nextSlideModels() {
  const container = document.getElementById("modelsCarousel");
  if (container) container.scrollLeft += 300;
}

function prevSlideModels() {
  const container = document.getElementById("modelsCarousel");
  if (container) container.scrollLeft -= 300;
}

// Profissionais carousel na store.html (ID: professionalsCarousel)
function nextSlideProfessionals() {
  const container = document.getElementById("professionalsCarousel");
  if (container) container.scrollLeft += 300;
}

function prevSlideProfessionals() {
  const container = document.getElementById("professionalsCarousel");
  if (container) container.scrollLeft -= 300;
}

// Profissionais carousel na index.html (ID: professionalsCarouselHome)
function nextSlideProfessionalsHome() {
  const container = document.getElementById("professionalsCarouselHome");
  if (container) container.scrollLeft += 300;
}

function prevSlideProfessionalsHome() {
  const container = document.getElementById("professionalsCarouselHome");
  if (container) container.scrollLeft -= 300;
}

// Services carousel (home)
function nextSlideServices() {
  const container = document.getElementById("servicesCarouselHome");
  if (container) container.scrollLeft += 300;
}
function prevSlideServices() {
  const container = document.getElementById("servicesCarouselHome");
  if (container) container.scrollLeft -= 300;
}

// Load services on home page
async function loadHomeServices() {
  let services = [];
  if (window.SupaDB) {
    services = await SupaDB.Services.list();
  }
  const carousel = document.getElementById('servicesCarouselHome');
  if (!carousel) return;
  carousel.innerHTML = '';
  if (services.length === 0) {
    carousel.innerHTML = '<div class="carousel-item" style="text-align:center;padding:2rem;min-width:280px;width:100%;">Nenhum serviço disponível. <a href="publicar-servico.html" style="color:#6366f1;font-weight:600;">Publicar agora</a></div>';
    return;
  }
  services.slice(0,8).forEach(svc => {
    const card = document.createElement('a');
    card.href = `service.html?id=${svc.id}`;
    card.className = 'carousel-item';
    const imageUrl = svc.media?.[0]?.url || '';
    card.innerHTML = `
      <div class="carousel-thumb" style="${imageUrl ? `background-image:url('${imageUrl}')` : 'background:linear-gradient(135deg,#312e81,#4f46e5)'}"></div>
      <h3>${svc.title}</h3>
      <p>${(svc.description||'').substring(0,70)}...</p>
      <p style="color:#6366f1;font-weight:700;padding:0 1rem .8rem;">${svc.price||'Consultar'}</p>
    `;
    carousel.appendChild(card);
  });
}
function isLoggedIn() {
  return localStorage.getItem('currentUser') !== null;
}

// Obter usuário atual
function getCurrentUser() {
  const user = localStorage.getItem('currentUser');
  return user ? JSON.parse(user) : null;
}

// Fazer logout
function logout() {
  localStorage.removeItem('currentUser');
  window.location.href = 'index.html';
}

// Redirecionar se não estiver logado (para páginas protegidas)
function requireAuth() {
  if (!isLoggedIn()) {
    window.location.href = 'login.html';
  }
}

// Mostrar nome do usuário no header (opcional)
function updateUserDisplay() {
  const user = getCurrentUser();
  const nav = document.querySelector('nav');
  
  if (user && nav) {
    // Remove link de entrar se existir
    const loginLink = nav.querySelector('a[href="login.html"]');
    if (loginLink) {
      loginLink.remove();
    }
    
    // Adiciona link de dashboard com nome
    const dashboardLink = document.createElement('a');
    dashboardLink.href = 'buyer-dashboard.html';
    dashboardLink.textContent = `👤 ${user.name.split(' ')[0]}`;
    nav.insertBefore(dashboardLink, nav.querySelector('button'));
  }
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  applyTheme();
  
  const path = window.location.pathname;
  const filename = path.split('/').pop() || 'index.html';
  
  if (filename === 'index.html' || filename === '') {
    console.log('Carregando index.html');
    loadFeatured(); // Modelos
    loadHomeProfessionals(); // Profissionais na home
    loadHomeServices(); // Serviços na home
  } else if (filename === 'store.html') {
    console.log('Carregando store.html');
    // store.html tem seu próprio script
  } else if (filename === 'model.html') {
    console.log('Carregando model.html');
    renderModel();
  } else if (filename === 'professional.html') {
    console.log('Carregando professional.html');
  }
  
  renderStore();
  renderModel();
});// ===== THEME PERSISTENCE =====
function applyTheme() {
  const savedTheme = localStorage.getItem('theme');
  const html = document.documentElement;
  
  if (savedTheme === 'dark') {
    html.classList.add('dark-mode');
  } else {
    html.classList.remove('dark-mode');
    // Se não houver tema ou for 'light', garante claro (padrão)
    localStorage.setItem('theme', 'light');
  }
}

function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.classList.contains('dark-mode');
  
  if (isDark) {
    html.classList.remove('dark-mode');
    localStorage.setItem('theme', 'light');
  } else {
    html.classList.add('dark-mode');
    localStorage.setItem('theme', 'dark');
  }
}

// Settings panel
function toggleSettings() {
  document.getElementById('settingsPanel').classList.toggle('open');
  // Atualiza o painel sempre que abrir
  if (typeof updateSettingsPanel === 'function') {
    updateSettingsPanel();
  }
}

function goHome() { 
  location.href = 'index.html'; 
}

// Mock data for store
const PRODUCTS = [
  { id:1, title:'IA Atendimento para WhatsApp', price:'R$ 199,00', seller:'BotLabs', short:'Atendente automático para mensagens', img: '' },
  { id:2, title:'Analisador de Documentos', price:'R$ 299,00', seller:'DocAI', short:'Extrai e classifica documentos', img: '' },
  { id:3, title:'Recomendador de Produtos', price:'R$ 149,00', seller:'RecoSys', short:'Sistema de recomendações para e‑commerce', img: '' },
  { id:4, title:'Detector de Qualidade (Visão)', price:'R$ 349,00', seller:'VisionWorks', short:'Detecta defeitos em produção', img: '' }
];

// Populate store carousel on store.html
function renderStore() {
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

// Open product details
function openProduct(id) {
  const prod = PRODUCTS.find(p => p.id === id);
  if(prod) {
    sessionStorage.setItem('selectedProduct', JSON.stringify(prod));
    location.href = 'model.html';
  }
}

// Open product sample
function openProductSample(i) {
  const p = PRODUCTS[i] || PRODUCTS[0];
  openProduct(p.id);
}

// Populate model page from sessionStorage
function renderModel() {
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
  
  const rel = document.getElementById('relatedGrid');
  if(rel) {
    rel.innerHTML = '';
    PRODUCTS.filter(x => x.id !== p.id).slice(0,3).forEach(r => {
      const c = document.createElement('div');
      c.className = 'small-card';
      c.innerHTML = `<h4>${r.title}</h4><p>${r.seller}</p>`;
      rel.appendChild(c);
    });
  }
}

// Mock login
function mockLogin() {
  alert('Login mock — aqui você integraria com backend');
  location.href = 'buyer-dashboard.html';
}

// Carousel functions
function moveCarousel(dir) {
  const carousel = document.querySelector(".carousel");
  carousel.scrollBy({
    left: dir * 300,
    behavior: "smooth"
  });
}

function toggleSearch(){

  const panel = document.getElementById("searchPanel")
  const content = document.getElementById("storeContent")

  panel.classList.toggle("open")
  content.classList.toggle("shift")

}

async function loadFeatured() {
  try {
    // Carrega APENAS modelos criados pelo usuário (sem pré-definidos)
    const userModels = JSON.parse(localStorage.getItem('models') || '[]');
    
    const carousel = document.getElementById("carouselContainer");
    if (!carousel) return;
    
    carousel.innerHTML = "";
    
    if (userModels.length === 0) {
      carousel.innerHTML = '<div class="carousel-item" style="text-align: center; padding: 2rem; min-width: 260px;">Nenhum modelo disponível</div>';
      return;
    }
    
    userModels.forEach(model => {
      const card = document.createElement("a");
      card.href = `model.html?id=${model.id}`;
      card.className = "carousel-item";
      
      const imageUrl = model.image || 'assets/placeholder.jpg';
      
      card.innerHTML = `
        <div class="carousel-thumb" style="background-image:url('${imageUrl}')"></div>
        <h3>${model.title}</h3>
        <p>${model.description || model.short || ''}</p>
      `;
      
      carousel.appendChild(card);
    });
  } catch (error) {
    console.error("Erro ao carregar modelos:", error);
  }
}

// Função para carregar profissionais na home
function loadHomeProfessionals() {
  const professionals = JSON.parse(localStorage.getItem('professionals') || '[]');
  const carousel = document.getElementById('professionalsCarouselHome');
  if (!carousel) return;
  
  carousel.innerHTML = '';
  
  if (professionals.length === 0) {
    carousel.innerHTML = '<div class="carousel-item professionals" style="text-align:center;padding:2rem;min-width:280px;width:100%;">Nenhum profissional cadastrado. <a href="inscricao-professionals.html" style="color:var(--accent);font-weight:600;">Cadastrar agora</a></div>';
    return;
  }
  
  professionals.slice(0, 8).forEach(prof => {
    const card = document.createElement('a');
    card.href = `professional.html?id=${prof.id}`;
    card.className = 'carousel-item professionals';
    
    const avatarHTML = prof.avatar
      ? `<div class="avatar" style="background-image: url('${prof.avatar}')"></div>`
      : `<div class="avatar-placeholder">${prof.name.charAt(0)}</div>`;
    
    card.innerHTML = `
      ${avatarHTML}
      <h3>${prof.name}</h3>
      <p class="specialty">${prof.specialty}</p>
      <div class="rating">⭐ ${prof.rating.toFixed(1)}</div>
    `;
    
    carousel.appendChild(card);
  });
}

function nextSlide() {
  const container = document.getElementById("carouselContainer");
  if (container) container.scrollLeft += 300;
}

function prevSlide() {
  const container = document.getElementById("carouselContainer");
  if (container) container.scrollLeft -= 300;
}

// Carregar profissional individual na página professional.html
function loadProfessional() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = parseInt(urlParams.get('id'));
  
  if (!id) {
    window.location.href = 'professionals.html';
    return;
  }
  
  // Tenta encontrar nos profissionais do localStorage (criados pelo usuário)
  const userProfessionals = JSON.parse(localStorage.getItem('professionals') || '[]');
  let professional = userProfessionals.find(p => p.id == id);
  
  if (!professional) {
    // Se não encontrar, tenta nos pré-definidos
    fetch("professionals.json")
      .then(res => res.json())
      .then(predefined => {
        professional = predefined.find(p => p.id == id);
        if (professional) {
          renderProfessional(professional);
        } else {
          window.location.href = 'professionals.html';
        }
      })
      .catch(() => {
        window.location.href = 'professionals.html';
      });
    return;
  }
  
  renderProfessional(professional);
}

// ===== CARROSSEL DE PROFISSIONAIS =====
let professionals = [];

// Carregar profissionais na página store.html (APENAS criados)
function loadStoreProfessionals() {
  console.log('Carregando profissionais para a loja...');
  
  // Carrega profissionais do localStorage
  let professionals = [];
  try {
    const saved = localStorage.getItem('professionals');
    professionals = saved ? JSON.parse(saved) : [];
    console.log('Profissionais encontrados:', professionals.length);
  } catch (error) {
    console.error('Erro ao parsear profissionais:', error);
  }
  
  const carousel = document.getElementById("professionalsCarousel");
  if (!carousel) {
    console.log('Elemento professionalsCarousel não encontrado');
    return;
  }
  
  carousel.innerHTML = "";
  
  if (professionals.length === 0) {
    console.log('Nenhum profissional cadastrado');
    carousel.innerHTML = '<div class="carousel-item professionals" style="text-align: center; padding: 2rem;">Nenhum profissional cadastrado ainda. <a href="inscricao-professionals.html" style="color: var(--accent);">Cadastrar agora</a></div>';
    return;
  }
  
  // Mostra cada profissional
  professionals.forEach((prof, index) => {
    console.log(`Renderizando profissional ${index}:`, prof.name);
    
    const card = document.createElement("a");
    card.href = `professional.html?id=${prof.id}`;
    card.className = 'carousel-item professionals';
    
    const avatarHTML = prof.avatar
      ? `<div class="avatar" style="background-image: url('${prof.avatar}'); background-size: cover; background-position: center;"></div>`
      : `<div class="avatar-placeholder">${prof.name.charAt(0).toUpperCase()}</div>`;
    
    card.innerHTML = `
      ${avatarHTML}
      <h3>${prof.name}</h3>
      <p class="specialty">${prof.specialty}</p>
      <div class="rating">⭐ ${prof.rating.toFixed(1)}</div>
    `;
    
    carousel.appendChild(card);
  });

}

function renderModel() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');
  
  if (id) {
    // Tenta encontrar nos modelos
    const models = JSON.parse(localStorage.getItem('models') || '[]');
    const model = models.find(m => m.id == id);
    
    if (model) {
      preencherPaginaModelo(model);
      return;
    }
    
    // Se não encontrar, tenta nos profissionais
    const professionals = JSON.parse(localStorage.getItem('professionals') || '[]');
    const prof = professionals.find(p => p.id == id);
    
    if (prof) {
      preencherPaginaProfissional(prof);
      return;
    }
  }
  
  // Fallback para dados mockados
  const sessionData = sessionStorage.getItem('selectedProduct');
  if (sessionData) {
    const p = JSON.parse(sessionData);
    preencherPaginaModelo(p);
  }
}

function preencherPaginaModelo(model) {
  const title = document.getElementById('productTitle');
  const short = document.getElementById('productShort');
  const price = document.getElementById('productPrice');
  const seller = document.getElementById('productSeller');
  const img = document.getElementById('productImage');
  const docs = document.getElementById('productDocs');
  
  if(title) title.textContent = model.title;
  if(short) short.textContent = model.description || model.short;
  if(price) price.textContent = model.price || 'R$ 0,00';
  if(seller) seller.textContent = model.seller || 'Vendedor';
  
  if(img) {
    if (model.image) {
      img.style.backgroundImage = `url('${model.image}')`;
      img.style.backgroundSize = 'cover';
    } else {
      img.style.background = 'linear-gradient(180deg,#cfeeff,#9fd8ff,#7bc35b)';
    }
  }
  
  if(docs) {
    docs.innerHTML = '<li>Instalação via Docker</li><li>API REST - Exemplo</li><li>Exemplos de integração</li>';
  }
  
  // Modelos relacionados
  const rel = document.getElementById('relatedGrid');
  if(rel) {
    rel.innerHTML = '';
    const models = JSON.parse(localStorage.getItem('models') || '[]');
    models.filter(x => x.id != model.id).slice(0,3).forEach(r => {
      const c = document.createElement('div');
      c.className = 'small-card';
      c.innerHTML = `<h4>${r.title}</h4><p>${r.seller || ''}</p>`;
      rel.appendChild(c);
    });
  }
}

function preencherPaginaProfissional(prof) {
  const title = document.getElementById('productTitle');
  const short = document.getElementById('productShort');
  const price = document.getElementById('productPrice');
  const seller = document.getElementById('productSeller');
  const img = document.getElementById('productImage');
  const docs = document.getElementById('productDocs');
  
  if(title) title.textContent = prof.name;
  if(short) short.textContent = prof.description || `${prof.specialty} - ${prof.projects} projetos`;
  if(price) price.textContent = 'Consultar';
  if(seller) seller.textContent = 'Profissional independente';
  
  if(img) {
    if (prof.avatar) {
      img.style.backgroundImage = `url('${prof.avatar}')`;
      img.style.backgroundSize = 'cover';
    } else {
      img.style.background = 'linear-gradient(180deg,#cfeeff,#9fd8ff,#7bc35b)';
    }
  }
  
  if(docs) {
    docs.innerHTML = '<li>Consultoria especializada</li><li>Instalação remota</li><li>Treinamento incluso</li>';
  }
}

function renderProfessionals() {
  const carousel = document.getElementById("professionalsCarousel");
  if (!carousel) return;
  
  carousel.innerHTML = "";
  
  professionals.forEach(prof => {
    const card = document.createElement("a");
    card.href = `professional.html?id=${prof.id}`;
    card.className = "carousel-item";
    
    const avatarHTML = prof.avatar
      ? `<div class="avatar" style="background-image: url('${prof.avatar}')"></div>`
      : `<div class="avatar-placeholder">${prof.name.charAt(0)}</div>`;
    
    card.innerHTML = `
      ${avatarHTML}
      <h3>${prof.name}</h3>
      <p class="specialty">${prof.specialty}</p>
      <div class="rating">${prof.rating.toFixed(1)}</div>
      <p class="projects">${prof.projects} projetos</p>
    `;
    
    carousel.appendChild(card);
  });
}

// Profissionais carousel na store.html
function nextSlideProfessionals() {
  const container = document.getElementById("professionalsCarousel");
  if (container) container.scrollLeft += 300;
}

function prevSlideProfessionals() {
  const container = document.getElementById("professionalsCarousel");
  if (container) container.scrollLeft -= 300;
}

function renderProfessional(prof) {
  // Avatar
  const avatarEl = document.getElementById('professionalAvatar');
  if (avatarEl) {
    if (prof.avatar) {
      avatarEl.style.backgroundImage = `url('${prof.avatar}')`;
      avatarEl.style.backgroundSize = 'cover';
      avatarEl.style.backgroundPosition = 'center';
    } else {
      avatarEl.style.background = `linear-gradient(135deg, var(--accent), #4ade80)`;
      avatarEl.innerHTML = `<span style="font-size: 3rem; color: white; line-height: 150px;">${prof.name.charAt(0)}</span>`;
    }
  }
  
  // Nome
  const nameEl = document.getElementById('professionalName');
  if (nameEl) nameEl.textContent = prof.name;
  
  // Especialidade
  const specialtyEl = document.getElementById('professionalSpecialty');
  if (specialtyEl) specialtyEl.textContent = prof.specialty;
  
  // Rating
  const ratingEl = document.getElementById('professionalRating');
  if (ratingEl) ratingEl.innerHTML = `⭐ ${prof.rating.toFixed(1)}`;
  
  // Bio
  const bioEl = document.getElementById('professionalBio');
  if (bioEl) bioEl.textContent = prof.bio || `${prof.name} é especialista em ${prof.specialty} com ${prof.projects} projetos realizados.`;
  
  // Projetos
  const projectsEl = document.getElementById('professionalProjects');
  if (projectsEl) projectsEl.textContent = prof.projects;
  
  // Rating no stats
  const ratingStatsEl = document.getElementById('professionalRating');
  if (ratingStatsEl) ratingStatsEl.textContent = prof.rating.toFixed(1);
  
  // Hourly rate
  const rateEl = document.getElementById('professionalHourlyRate');
  if (rateEl) rateEl.textContent = prof.hourlyRate ? `R$ ${prof.hourlyRate}` : 'Consultar';
  
  // Serviços
  const servicesEl = document.getElementById('professionalServices');
  if (servicesEl && prof.services) {
    servicesEl.innerHTML = '';
    prof.services.forEach(service => {
      const li = document.createElement('li');
      li.textContent = service;
      servicesEl.appendChild(li);
    });
  }
  
  // Modelos do profissional
  const modelsEl = document.getElementById('professionalModels');
  if (modelsEl && prof.portfolio) {
    modelsEl.innerHTML = '';
    
    // Filtra os modelos que pertencem a este profissional
    const professionalModels = PRODUCTS.filter(p => prof.portfolio.includes(p.id));
    
    if (professionalModels.length > 0) {
      professionalModels.forEach(model => {
        const card = document.createElement('div');
        card.className = 'small-card';
        card.innerHTML = `<h4>${model.title}</h4><p>${model.seller}</p>`;
        card.onclick = () => openProduct(model.id);
        card.style.cursor = 'pointer';
        modelsEl.appendChild(card);
      });
    } else {
      modelsEl.innerHTML = '<p class="no-items">Nenhum modelo publicado ainda.</p>';
    }
  }
}

// Funções de ação
function contactProfessional() {
  alert('Funcionalidade de contato será implementada em breve!');
  // Aqui você pode redirecionar para uma página de mensagem ou abrir modal
}

function viewPortfolio() {
  alert('Portfólio completo será exibido aqui!');
  // Pode abrir um modal com todos os projetos
}

// ===== GERENCIAMENTO DE PROFISSIONAIS (CRUD) =====

// Chave para localStorage
const PROFESSIONALS_STORAGE_KEY = 'ai_store_professionals';

// Mostra mensagem de sucesso após cadastro
function showSuccessMessage() {
  const container = document.querySelector('.form-container');
  if (!container) return;
  
  container.innerHTML = `
    <div class="success-message">
      <i class="fas fa-check-circle"></i>
      <h2>Cadastro realizado com sucesso!</h2>
      <p>Seu perfil já aparece no carrossel de profissionais da loja.</p>
      <div class="form-actions" style="justify-content: center;">
        <button class="cta" onclick="window.location.href='store.html'">Ver na loja</button>
        <button class="cta outline" onclick="window.location.href='anuncie.html'">Voltar</button>
      </div>
    </div>
  `;
}

// Função auxiliar para voltar
function goBack() {
  window.history.back();
}

// Sobrescreve a função loadProfessionals original para usar a nova
// (comente ou remova a função loadProfessionals antiga e use esta)
async function loadProfessionals() {
  await loadAllProfessionals();
}

// Para a página individual, precisa buscar em todos (fixos + cadastrados)
async function loadProfessional() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = parseInt(urlParams.get('id'));
  
  if (!id) {
    window.location.href = 'professionals.html';
    return;
  }
  
  try {
    // Carrega todos os profissionais (fixos + cadastrados)
    const allProfessionals = await loadAllProfessionals();
    const professional = allProfessionals.find(p => p.id === id);
    
    if (professional) {
      renderProfessional(professional);
    } else {
      window.location.href = 'professionals.html';
    }
  } catch (error) {
    console.error("Erro ao carregar profissional:", error);
  }
}

// ===== FUNÇÕES ESPECÍFICAS PARA store.html =====

// Carregar modelos na página store.html
function loadStoreModels() {
  // Carrega APENAS modelos criados pelo usuário
  const models = JSON.parse(localStorage.getItem('models') || '[]');
  const carousel = document.getElementById("modelsCarousel");
  if (!carousel) return;
  
  carousel.innerHTML = "";
  
  if (models.length === 0) {
    carousel.innerHTML = '<div class="carousel-item" style="text-align: center; padding: 2rem;">Nenhum modelo publicado ainda. <a href="publicar-modelo.html" style="color: var(--accent);">Publicar agora</a></div>';
    return;
  }
  
  models.forEach(model => {
    const card = document.createElement("a");
    card.href = `model.html?id=${model.id}`;
    card.className = "carousel-item";
    
    const imageUrl = model.image || 'assets/placeholder.jpg';
    
    card.innerHTML = `
      <div class="carousel-thumb" style="background-image:url('${imageUrl}')"></div>
      <h3>${model.title}</h3>
      <p>${model.description || model.short || ''}</p>
      <p style="color: var(--accent); font-weight: bold; margin-top: 0.5rem;">${model.price || 'Consultar'}</p>
    `;
    
    carousel.appendChild(card);
  });
}

// Carregar profissionais na página store.html (reutiliza a função existente, mas aponta para o ID correto)
function loadStoreProfessionals() {
  // Carrega APENAS profissionais criados pelo usuário
  const professionals = JSON.parse(localStorage.getItem('professionals') || '[]');
  const carousel = document.getElementById("professionalsCarousel");
  if (!carousel) return;
  
  carousel.innerHTML = "";
  
  if (professionals.length === 0) {
    carousel.innerHTML = '<div class="carousel-item professionals" style="text-align: center; padding: 2rem;">Nenhum profissional cadastrado ainda. <a href="inscricao-professionals.html" style="color: var(--accent);">Cadastrar agora</a></div>';
    return;
  }
  
  professionals.forEach(prof => {
    const card = document.createElement("a");
    card.href = `professional.html?id=${prof.id}`;
    card.className = "carousel-item professionals";
    
    const avatarHTML = prof.avatar
      ? `<div class="avatar" style="background-image: url('${prof.avatar}')"></div>`
      : `<div class="avatar-placeholder">${prof.name.charAt(0)}</div>`;
    
    card.innerHTML = `
      ${avatarHTML}
      <h3>${prof.name}</h3>
      <p class="specialty">${prof.specialty}</p>
      <div class="rating">⭐ ${prof.rating.toFixed(1)}</div>
      <p class="projects">${prof.projects || 0} projetos</p>
    `;
    
    carousel.appendChild(card);
  });
}

// Funções de navegação específicas para store.html
function nextSlideModels() {
  const container = document.getElementById("modelsCarousel");
  if (container) container.scrollLeft += 300;
}

function prevSlideModels() {
  const container = document.getElementById("modelsCarousel");
  if (container) container.scrollLeft -= 300;
}

// Profissionais carousel na store.html (ID: professionalsCarousel)
function nextSlideProfessionals() {
  const container = document.getElementById("professionalsCarousel");
  if (container) container.scrollLeft += 300;
}

function prevSlideProfessionals() {
  const container = document.getElementById("professionalsCarousel");
  if (container) container.scrollLeft -= 300;
}

// Profissionais carousel na index.html (ID: professionalsCarouselHome)
function nextSlideProfessionalsHome() {
  const container = document.getElementById("professionalsCarouselHome");
  if (container) container.scrollLeft += 300;
}

function prevSlideProfessionalsHome() {
  const container = document.getElementById("professionalsCarouselHome");
  if (container) container.scrollLeft -= 300;
}

// Services carousel (home)
function nextSlideServices() {
  const container = document.getElementById("servicesCarouselHome");
  if (container) container.scrollLeft += 300;
}
function prevSlideServices() {
  const container = document.getElementById("servicesCarouselHome");
  if (container) container.scrollLeft -= 300;
}

// Load services on home page
function loadHomeServices() {
  const services = JSON.parse(localStorage.getItem('services') || '[]');
  const carousel = document.getElementById('servicesCarouselHome');
  if (!carousel) return;
  carousel.innerHTML = '';
  if (services.length === 0) {
    carousel.innerHTML = '<div class="carousel-item" style="text-align:center;padding:2rem;min-width:280px;width:100%;">Nenhum serviço disponível. <a href="publicar-servico.html" style="color:#6366f1;font-weight:600;">Publicar agora</a></div>';
    return;
  }
  const CAT_SVC = {atendimento:'💬',analise:'📊',automacao:'⚙️',marketing:'📣',rh:'🧑‍💼',seguranca:'🛡️',personalizado:'🛠️',outro:'✨'};
  services.slice(0,8).forEach(svc => {
    const card = document.createElement('a');
    card.href = `service.html?id=${svc.id}`;
    card.className = 'carousel-item';
    const icon = CAT_SVC[svc.category] || '🤖';
    const imageUrl = svc.media?.[0]?.data || svc.image || '';
    card.innerHTML = `
      <div class="carousel-thumb" style="${imageUrl?`background-image:url('${imageUrl}');`:`background:linear-gradient(135deg,#312e81,#4f46e5);display:flex;align-items:center;justify-content:center;font-size:2.5rem;`}">
        ${imageUrl?'':icon}
      </div>
      <h3>${svc.title}</h3>
      <p>${(svc.description||'').substring(0,70)}${(svc.description||'').length>70?'...':''}</p>
      <p style="color:#6366f1;font-weight:700;padding:0 1rem .8rem;">${svc.price||'Consultar'}</p>
    `;
    carousel.appendChild(card);
  });
}
function isLoggedIn() {
  return localStorage.getItem('currentUser') !== null;
}

// Obter usuário atual
function getCurrentUser() {
  const user = localStorage.getItem('currentUser');
  return user ? JSON.parse(user) : null;
}

// Fazer logout
function logout() {
  localStorage.removeItem('currentUser');
  window.location.href = 'index.html';
}

// Redirecionar se não estiver logado (para páginas protegidas)
function requireAuth() {
  if (!isLoggedIn()) {
    window.location.href = 'login.html';
  }
}

// Mostrar nome do usuário no header (opcional)
function updateUserDisplay() {
  const user = getCurrentUser();
  const nav = document.querySelector('nav');
  
  if (user && nav) {
    // Remove link de entrar se existir
    const loginLink = nav.querySelector('a[href="login.html"]');
    if (loginLink) {
      loginLink.remove();
    }
    
    // Adiciona link de dashboard com nome
    const dashboardLink = document.createElement('a');
    dashboardLink.href = 'buyer-dashboard.html';
    dashboardLink.textContent = `👤 ${user.name.split(' ')[0]}`;
    nav.insertBefore(dashboardLink, nav.querySelector('button'));
  }
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  applyTheme();
  
  const path = window.location.pathname;
  const filename = path.split('/').pop() || 'index.html';
  
  if (filename === 'index.html' || filename === '') {
    console.log('Carregando index.html');
    loadFeatured(); // Modelos
    loadHomeProfessionals(); // Profissionais na home
    loadHomeServices(); // Serviços na home
  } else if (filename === 'store.html') {
    console.log('Carregando store.html');
    // store.html tem seu próprio script
  } else if (filename === 'model.html') {
    console.log('Carregando model.html');
    renderModel();
  } else if (filename === 'professional.html') {
    console.log('Carregando professional.html');
  }
  
  renderStore();
  renderModel();
});