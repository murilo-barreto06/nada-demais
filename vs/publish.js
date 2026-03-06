// publish.js - Funções específicas da página de publicação

// Funções do formulário
window.toggleTypeFields = function() {
  const type = document.getElementById('modelType').value;
  const modelFields = document.getElementById('modelFields');
  const profFields = document.getElementById('professionalFields');
  const formTitle = document.getElementById('formTitle');
  
  if (type === 'model') {
    modelFields.style.display = 'block';
    profFields.style.display = 'none';
    formTitle.textContent = 'Publicar Novo Modelo';
    
    // Remover required dos campos de profissional
    document.getElementById('profName').required = false;
    document.getElementById('profSpecialty').required = false;
    
    // Adicionar required nos campos de modelo
    document.getElementById('modelTitle').required = true;
    document.getElementById('modelPrice').required = true;
    document.getElementById('modelSeller').required = true;
  } else {
    modelFields.style.display = 'none';
    profFields.style.display = 'block';
    formTitle.textContent = 'Publicar Perfil Profissional';
    
    // Remover required dos campos de modelo
    document.getElementById('modelTitle').required = false;
    document.getElementById('modelPrice').required = false;
    document.getElementById('modelSeller').required = false;
    
    // Adicionar required nos campos de profissional
    document.getElementById('profName').required = true;
    document.getElementById('profSpecialty').required = true;
  }
};

window.updateCharCounter = function() {
  const desc = document.getElementById('modelDescription');
  const count = desc.value.length;
  document.getElementById('charCount').textContent = count;
  
  if (count > 500) {
    desc.value = desc.value.substring(0, 500);
    document.getElementById('charCount').textContent = 500;
  }
};

window.previewImage = function() {
  const url = document.getElementById('modelImage').value;
  const preview = document.getElementById('imagePreview');
  
  if (url) {
    preview.style.backgroundImage = `url('${url}')`;
    preview.classList.add('show');
  } else {
    preview.style.backgroundImage = '';
    preview.classList.remove('show');
  }
};

window.saveModel = function(e) {
  e.preventDefault();
  
  const type = document.getElementById('modelType').value;
  const id = document.getElementById('modelId').value || Date.now();
  const description = document.getElementById('modelDescription').value;
  const image = document.getElementById('modelImage').value || '';
  
  if (!description) {
    alert('Por favor, preencha a descrição');
    return;
  }
  
  if (type === 'model') {
    const title = document.getElementById('modelTitle').value;
    const price = document.getElementById('modelPrice').value;
    const seller = document.getElementById('modelSeller').value;
    
    if (!title || !price || !seller) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }
    
    const model = {
      id: parseInt(id),
      title: title,
      price: `R$ ${parseFloat(price).toFixed(2)}`,
      seller: seller,
      description: description,
      short: description.substring(0, 100) + '...',
      image: image,
      type: 'model'
    };
    
    let models = JSON.parse(localStorage.getItem('models') || '[]');
    
    const existingIndex = models.findIndex(m => m.id === model.id);
    if (existingIndex >= 0) {
      models[existingIndex] = model;
    } else {
      models.push(model);
    }
    
    localStorage.setItem('models', JSON.stringify(models));
    alert('✅ Modelo publicado com sucesso!');
    
  } else {
    const name = document.getElementById('profName').value;
    const specialty = document.getElementById('profSpecialty').value;
    const rating = parseFloat(document.getElementById('profRating').value) || 5.0;
    const projects = parseInt(document.getElementById('profProjects').value) || 0;
    
    if (!name || !specialty) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }
    
    const professional = {
      id: parseInt(id),
      name: name,
      specialty: specialty,
      rating: rating,
      projects: projects,
      description: description,
      avatar: image,
      type: 'professional'
    };
    
    let professionals = JSON.parse(localStorage.getItem('professionals') || '[]');
    
    const existingIndex = professionals.findIndex(p => p.id === professional.id);
    if (existingIndex >= 0) {
      professionals[existingIndex] = professional;
    } else {
      professionals.push(professional);
    }
    
    localStorage.setItem('professionals', JSON.stringify(professionals));
    alert('✅ Perfil profissional publicado com sucesso!');
  }
  
  window.clearForm();
  
  // Oferece link para ir à loja
  if (confirm('Publicado com sucesso! Deseja ir para a loja ver o resultado?')) {
    window.location.href = 'store.html';
  }
};

window.clearForm = function() {
  document.getElementById('modelForm').reset();
  document.getElementById('modelId').value = '';
  document.getElementById('imagePreview').classList.remove('show');
  document.getElementById('deleteBtn').style.display = 'none';
  document.getElementById('charCount').textContent = '0';
  window.toggleTypeFields();
};

window.deleteCurrent = function() {
  if (!confirm('Tem certeza que deseja excluir?')) return;
  
  const type = document.getElementById('modelType').value;
  const id = document.getElementById('modelId').value;
  
  if (type === 'model') {
    let models = JSON.parse(localStorage.getItem('models') || '[]');
    models = models.filter(m => m.id != id);
    localStorage.setItem('models', JSON.stringify(models));
  } else {
    let professionals = JSON.parse(localStorage.getItem('professionals') || '[]');
    professionals = professionals.filter(p => p.id != id);
    localStorage.setItem('professionals', JSON.stringify(professionals));
  }
  
  window.clearForm();
  alert('Excluído com sucesso!');
};

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
  // Configurar o formulário
  document.getElementById('modelForm').addEventListener('submit', window.saveModel);
  
  // Inicializar com tipo padrão (modelo)
  window.toggleTypeFields();
  
  // Verificar se veio para editar (via localStorage)
  const editData = localStorage.getItem('editItem');
  if (editData) {
    const item = JSON.parse(editData);
    window.editItem(item.type, item.id);
    localStorage.removeItem('editItem');
  }
});

// Função para editar (chamada de outras páginas)
window.editItem = function(type, id) {
  if (type === 'model') {
    const models = JSON.parse(localStorage.getItem('models') || '[]');
    const model = models.find(m => m.id == id);
    if (!model) return;
    
    document.getElementById('modelType').value = 'model';
    window.toggleTypeFields();
    document.getElementById('modelId').value = model.id;
    document.getElementById('modelTitle').value = model.title;
    document.getElementById('modelPrice').value = parseFloat(model.price.replace('R$', ''));
    document.getElementById('modelSeller').value = model.seller;
    document.getElementById('modelDescription').value = model.description;
    document.getElementById('modelImage').value = model.image || '';
    
    if (model.image) window.previewImage();
    document.getElementById('deleteBtn').style.display = 'inline-block';
    
  } else {
    const professionals = JSON.parse(localStorage.getItem('professionals') || '[]');
    const prof = professionals.find(p => p.id == id);
    if (!prof) return;
    
    document.getElementById('modelType').value = 'professional';
    window.toggleTypeFields();
    document.getElementById('modelId').value = prof.id;
    document.getElementById('profName').value = prof.name;
    document.getElementById('profSpecialty').value = prof.specialty;
    document.getElementById('profRating').value = prof.rating;
    document.getElementById('profProjects').value = prof.projects;
    document.getElementById('modelDescription').value = prof.description || '';
    document.getElementById('modelImage').value = prof.avatar || '';
    
    if (prof.avatar) window.previewImage();
    document.getElementById('deleteBtn').style.display = 'inline-block';
  }
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
};