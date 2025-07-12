import { login, logout, getCurrentUser } from './api.js';

export const initAuth = () => {
  const user = getCurrentUser();
  updateUI(user);
  
  document.getElementById('btn-login')?.addEventListener('click', handleLogin);
  document.getElementById('btn-logout')?.addEventListener('click', handleLogout);
};

const updateUI = (user) => {
  const authSection = document.getElementById('auth-section');
  if (!authSection) return;

  if (user) {
    authSection.innerHTML = `
      <span>Olá, ${user.nome}</span>
      <button id="btn-logout" class="btn-auth">Sair</button>
    `;
    document.getElementById('btn-logout').addEventListener('click', handleLogout);
  } else {
    authSection.innerHTML = `
      <button id="btn-login" class="btn-auth">Entrar</button>
      <a href="./src/pages/registro.html" class="btn-auth">Cadastrar</a>
    `;
    document.getElementById('btn-login').addEventListener('click', handleLogin);
  }
};

const handleLogin = async () => {
  const email = prompt('E-mail:');
  const senha = prompt('Senha:');
  
  try {
    await login(email, senha);
    updateUI(getCurrentUser());
    window.location.reload();
  } catch (error) {
    alert('Login falhou: ' + error.message);
  }
};

const handleLogout = () => {
  logout();
  updateUI(null);
  window.location.href = '/';
};