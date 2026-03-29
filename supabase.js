// supabase.js — Camada de dados centralizada
// Substitui todos os acessos a localStorage para modelos, serviços, profissionais e compras.
// Dados de tema e sessão de usuário permanecem em localStorage (são locais por design).

// ── CONFIGURAÇÃO ──────────────────────────────────────────────────────────────
// Preencha estas variáveis com os valores do seu projeto Supabase.
// Elas ficam expostas no browser — isso é seguro para a chave "anon".
const SUPABASE_URL  = window.__SUPABASE_URL__  || 'https://ylyixbvlofluhgpcouil.supabase.co';
const SUPABASE_ANON = window.__SUPABASE_ANON__ || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlseWl4YnZsb2ZsdWhncGNvdWlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4MDIxMjYsImV4cCI6MjA5MDM3ODEyNn0.AXjRGcntgezjFgNv4lzr84Z6RcuAf_szsFckWrTMFcg';

const { createClient } = supabase;   // from CDN <script>
const db = createClient(SUPABASE_URL, SUPABASE_ANON);

// ── AUTENTICAÇÃO ──────────────────────────────────────────────────────────────

const Auth = {
  // Login com email/senha
  async signIn(email, password) {
    const { data, error } = await db.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data.user;
  },

  // Cadastro com email/senha
  async signUp(email, password, name) {
    const { data, error } = await db.auth.signUp({
      email, password,
      options: { data: { name } }
    });
    if (error) throw error;
    return data.user;
  },

  // Login com Google OAuth
  async signInWithGoogle() {
    const { error } = await db.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/buyer-dashboard.html' }
    });
    if (error) throw error;
  },

  // Logout
  async signOut() {
    const { error } = await db.auth.signOut();
    if (error) throw error;
    window.location.href = 'index.html';
  },

  // Usuário atual (sync — usa sessão em memória do Supabase)
  getUser() {
    return db.auth.getUser(); // Promise<{data:{user}}}>
  },

  // Escutar mudanças de autenticação
  onAuthChange(callback) {
    return db.auth.onAuthStateChange((_event, session) => {
      callback(session?.user ?? null);
    });
  }
};

// ── PERFIS DE USUÁRIO ─────────────────────────────────────────────────────────

const Profiles = {
  async get(userId) {
    const { data, error } = await db
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async upsert(userId, fields) {
    const { data, error } = await db
      .from('profiles')
      .upsert({ id: userId, ...fields, updated_at: new Date().toISOString() });
    if (error) throw error;
    return data;
  },

  // Upload de avatar para Supabase Storage
  async uploadAvatar(userId, file) {
    // Comprime antes de enviar
    const blob = await compressToBlob(file, 300, 0.88);
    const path = `avatars/${userId}.jpg`;
    const { error: upErr } = await db.storage
      .from('avatars')
      .upload(path, blob, { upsert: true, contentType: 'image/jpeg' });
    if (upErr) throw upErr;
    const { data } = db.storage.from('avatars').getPublicUrl(path);
    // Salva URL no perfil
    await Profiles.upsert(userId, { avatar_url: data.publicUrl });
    return data.publicUrl;
  }
};

// ── MODELOS ───────────────────────────────────────────────────────────────────

const Models = {
  async list() {
    const { data, error } = await db
      .from('models')
      .select('*, profiles(name, avatar_url)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async get(id) {
    const { data, error } = await db
      .from('models')
      .select('*, profiles(name, avatar_url)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(fields) {
    const { data: { user } } = await db.auth.getUser();
    const { data, error } = await db
      .from('models')
      .insert({ ...fields, user_id: user.id })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, fields) {
    const { data, error } = await db
      .from('models')
      .update(fields)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async remove(id) {
    const { error } = await db.from('models').delete().eq('id', id);
    if (error) throw error;
  },

  // Upload de mídia para Storage; retorna URL pública
  async uploadMedia(modelId, file, index) {
    const ext  = file.type.startsWith('video') ? 'mp4' : 'jpg';
    const path = `models/${modelId}/${index}.${ext}`;
    const blob = file.type.startsWith('image') ? await compressToBlob(file, 800, 0.75) : file;
    const { error } = await db.storage
      .from('media')
      .upload(path, blob, { upsert: true });
    if (error) throw error;
    const { data } = db.storage.from('media').getPublicUrl(path);
    return { url: data.publicUrl, type: file.type.startsWith('video') ? 'video' : 'image' };
  }
};

// ── SERVIÇOS ──────────────────────────────────────────────────────────────────

const Services = {
  async list() {
    const { data, error } = await db
      .from('services')
      .select('*, profiles(name, avatar_url)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async get(id) {
    const { data, error } = await db
      .from('services')
      .select('*, profiles(name, avatar_url)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(fields) {
    const { data: { user } } = await db.auth.getUser();
    const { data, error } = await db
      .from('services')
      .insert({ ...fields, user_id: user.id })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, fields) {
    const { data, error } = await db
      .from('services')
      .update(fields)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async remove(id) {
    const { error } = await db.from('services').delete().eq('id', id);
    if (error) throw error;
  }
};

// ── PROFISSIONAIS ─────────────────────────────────────────────────────────────

const Professionals = {
  async list() {
    const { data, error } = await db
      .from('professionals')
      .select('*, profiles(name, avatar_url)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async get(id) {
    const { data, error } = await db
      .from('professionals')
      .select('*, profiles(name, avatar_url)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(fields) {
    const { data: { user } } = await db.auth.getUser();
    const { data, error } = await db
      .from('professionals')
      .insert({ ...fields, user_id: user.id })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, fields) {
    const { data, error } = await db
      .from('professionals')
      .update(fields)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async remove(id) {
    const { error } = await db.from('professionals').delete().eq('id', id);
    if (error) throw error;
  }
};

// ── COMPRAS ───────────────────────────────────────────────────────────────────

const Purchases = {
  async list() {
    const { data: { user } } = await db.auth.getUser();
    if (!user) return [];
    const { data, error } = await db
      .from('purchases')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async create(fields) {
    const { data: { user } } = await db.auth.getUser();
    const { data, error } = await db
      .from('purchases')
      .insert({ ...fields, user_id: user.id })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async exists(itemId, type) {
    const { data: { user } } = await db.auth.getUser();
    if (!user) return false;
    const { data } = await db
      .from('purchases')
      .select('id')
      .eq('user_id', user.id)
      .eq('item_id', itemId)
      .eq('type', type)
      .maybeSingle();
    return !!data;
  }
};

// ── UTILITÁRIO: COMPRESSÃO ────────────────────────────────────────────────────

function compressToBlob(file, maxPx, quality) {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        let w = img.width, h = img.height;
        if (w > maxPx || h > maxPx) {
          if (w > h) { h = Math.round(h * maxPx / w); w = maxPx; }
          else { w = Math.round(w * maxPx / h); h = maxPx; }
        }
        const c = document.createElement('canvas');
        c.width = w; c.height = h;
        c.getContext('2d').drawImage(img, 0, 0, w, h);
        c.toBlob(b => b ? res(b) : rej(new Error('Canvas toBlob failed')), 'image/jpeg', quality);
      };
      img.onerror = rej;
      img.src = e.target.result;
    };
    reader.onerror = rej;
    reader.readAsDataURL(file);
  });
}

// Expõe globalmente
window.SupaDB  = { db, Auth, Profiles, Models, Services, Professionals, Purchases };
