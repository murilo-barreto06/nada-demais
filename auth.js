// auth.js - Funções de autenticação compartilhadas

// ===== FUNÇÕES DE AUTENTICAÇÃO =====

// Verificar se usuário está logado
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
  if (confirm('Tem certeza que deseja sair?')) {
    localStorage.removeItem('currentUser');
    // Fecha o painel de configurações se estiver aberto
    const settingsPanel = document.getElementById('settingsPanel');
    if (settingsPanel) {
      settingsPanel.classList.remove('open');
    }
    window.location.href = 'index.html';
  }
}

// Redirecionar se não estiver logado (para páginas protegidas)
function requireAuth() {
  if (!isLoggedIn()) {
    alert('Você precisa fazer login para acessar esta página');
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

// Atualizar o painel de configurações
function updateSettingsPanel() {
  const settingsPanel = document.getElementById('settingsPanel');
  if (!settingsPanel) return;
  
  const user = getCurrentUser();
  const accountRow = settingsPanel.querySelector('.settings-row.account-row');
  
  if (accountRow) {
    if (user) {
      // Usuário logado - mostra Sair
      accountRow.innerHTML = `
        <label>Conta</label>
        <button onclick="logout()" class="small-btn">Sair</button>
      `;
    } else {
      // Usuário não logado - mostra Entrar / Cadastrar
      accountRow.innerHTML = `
        <label>Conta</label>
        <a href="login.html" class="small-btn">Entrar / Cadastrar</a>
      `;
    }
  }
}

// Renderizar o header baseado no estado de login
function renderAuthSection() {
  const authContainer = document.getElementById('auth-container');
  if (!authContainer) return;
  
  const user = getCurrentUser();
  const currentPage = window.location.pathname.split('/').pop();
  
  if (user) {
    // Usuário logado - mostrar link Meu Painel
    authContainer.innerHTML = `
      <div style="position: relative; display: inline-block;" class="user-menu-container">
        <a href="buyer-dashboard.html" class="meu-painel-link ${currentPage === 'buyer-dashboard.html' ? 'active' : ''}">Meu painel</a>
        <div class="user-dropdown" style="display: none;">
          <a href="buyer-dashboard.html"> Meu Painel</a>
          <a href="anuncie.html"> Anunciar</a>
          <a href="#" onclick="logout(); return false;"> Sair</a>
        </div>
      </div>
    `;
    
    // Adicionar eventos ao dropdown
    setTimeout(() => {
      const link = document.querySelector('.meu-painel-link');
      const dropdown = document.querySelector('.user-dropdown');
      const container = document.querySelector('.user-menu-container');
      
      if (link && dropdown && container) {
        link.addEventListener('click', function(e) {
          e.preventDefault();
          
          // Fecha outros dropdowns
          document.querySelectorAll('.user-dropdown').forEach(d => {
            if (d !== dropdown) d.style.display = 'none';
          });
          
          // Toggle deste dropdown
          dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
        });
        
        // Fecha ao clicar fora
        document.addEventListener('click', function(e) {
          if (!container.contains(e.target)) {
            dropdown.style.display = 'none';
          }
        });
      }
    }, 0);
    
  } else {
    // Usuário não logado - mostrar link Entrar
    authContainer.innerHTML = '<a href="login.html" class="login-link">Entrar</a>';
  }
  
  // Atualiza o painel de configurações
  updateSettingsPanel();
}

// Proteger páginas que exigem login
function protectPage() {
  const protectedPages = [
    'buyer-dashboard.html',
    'anuncie.html',
    'publicar-modelo.html',
    'inscricao-professionals.html'
  ];
  
  const currentPage = window.location.pathname.split('/').pop();
  console.log('Página atual:', currentPage);
  
  if (protectedPages.includes(currentPage)) {
    return requireAuth();
  }
  return true;
}

// Inicializar autenticação na página
function initAuth() {
  console.log('Inicializando auth...');
  
  // Primeiro protege a página (redireciona se necessário)
  const allowed = protectPage();
  if (!allowed) return false;
  
  // Renderiza a seção de autenticação
  renderAuthSection();
  
  return true;
}

// Executar quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
  initAuth();
});

// Também executar quando a página mudar (para SPA-like)
window.addEventListener('popstate', function() {
  renderAuthSection();
});