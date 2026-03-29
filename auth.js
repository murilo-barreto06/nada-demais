// auth.js — Autenticação via Supabase
// Depende de supabase.js carregado antes.

// ── ESTADO ─────────────────────────────────────────────────────────────────────
let _currentUser = null;

async function _loadUser() {
  try {
    const { data: { user } } = await SupaDB.db.auth.getUser();
    if (!user) { _currentUser = null; return null; }
    const profile = await SupaDB.Profiles.get(user.id);
    _currentUser = {
      id:         user.id,
      name:       profile?.name || user.user_metadata?.name || user.email.split('@')[0],
      email:      user.email,
      avatar_url: profile?.avatar_url || null
    };
    return _currentUser;
  } catch {
    _currentUser = null;
    return null;
  }
}

function isLoggedIn()    { return _currentUser !== null; }
function getCurrentUser(){ return _currentUser; }

async function logout() {
  if (!confirm('Tem certeza que deseja sair?')) return;
  await SupaDB.Auth.signOut();
}

async function requireAuth() {
  await _loadUser();
  if (!_currentUser) {
    alert('Você precisa fazer login para acessar esta página.');
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

function updateSettingsPanel() {
  const panel = document.getElementById('settingsPanel');
  if (!panel) return;
  const row = panel.querySelector('.settings-row.account-row');
  if (!row) return;
  if (_currentUser) {
    row.innerHTML = '<label>Conta</label><button onclick="logout()" class="small-btn">Sair</button>';
  } else {
    row.innerHTML = '<label>Conta</label><a href="login.html" class="small-btn">Entrar / Cadastrar</a>';
  }
}

function renderAuthSection() {
  const container = document.getElementById('auth-container');
  if (!container) return;
  const currentPage = window.location.pathname.split('/').pop();
  if (_currentUser) {
    container.innerHTML = '<div style="position:relative;display:inline-block;" class="user-menu-container">' +
      '<a href="buyer-dashboard.html" class="meu-painel-link ' + (currentPage==='buyer-dashboard.html'?'active':'') + '">Meu painel</a>' +
      '<div class="user-dropdown" style="display:none;">' +
        '<a href="buyer-dashboard.html">Meu Painel</a>' +
        '<a href="#" onclick="logout();return false;">Sair</a>' +
      '</div></div>';
    setTimeout(() => {
      const link = document.querySelector('.meu-painel-link');
      const dropdown = document.querySelector('.user-dropdown');
      const cont = document.querySelector('.user-menu-container');
      if (!link||!dropdown||!cont) return;
      link.addEventListener('click', e => {
        e.preventDefault();
        dropdown.style.display = dropdown.style.display==='none'?'block':'none';
      });
      document.addEventListener('click', e => { if(!cont.contains(e.target)) dropdown.style.display='none'; });
    }, 0);
  } else {
    container.innerHTML = '<a href="login.html" class="login-link">Entrar</a>';
  }
  updateActiveLink();
  updateSettingsPanel();
}

async function protectPage() {
  const protectedPages = ['buyer-dashboard.html','anuncie.html','publicar-modelo.html','inscricao-professionals.html','publicar-servico.html'];
  const currentPage = window.location.pathname.split('/').pop();
  if (protectedPages.includes(currentPage)) return await requireAuth();
  return true;
}

async function initAuth() {
  await _loadUser();
  const allowed = await protectPage();
  if (!allowed) return false;
  renderAuthSection();
  return true;
}

document.addEventListener('DOMContentLoaded', () => { initAuth(); });
window.addEventListener('popstate', () => { renderAuthSection(); });

SupaDB.Auth.onAuthChange(async user => {
  if (user) await _loadUser(); else _currentUser = null;
  renderAuthSection();
});

function updateActiveLink() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const anunciePages = ['anuncie.html','publicar-modelo.html','inscricao-professionals.html','publicar-servico.html'];
  const storePages   = ['store.html','model.html','professional.html','service.html'];
  document.querySelectorAll('nav a').forEach(link => {
    const href = link.getAttribute('href');
    if (href===currentPage) link.classList.add('active');
    else if (anunciePages.includes(currentPage) && href==='anuncie.html') link.classList.add('active');
    else if (storePages.includes(currentPage)   && href==='store.html')   link.classList.add('active');
    else link.classList.remove('active');
  });
}