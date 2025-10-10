// Firebase Authentication for Static HTML Sites
// Administradora Mutual - Sistema de Autenticação

// Configuração Firebase (mesma do projeto principal)
const firebaseConfig = {
  apiKey: "AIzaSyDMvvp4_0oLhOJ6F-2TQnA",
  authDomain: "administradoramutual.firebaseapp.com",
  projectId: "administradoramutual",
  storageBucket: "administradoramutual.firebasestorage.app",
  messagingSenderId: "1049556784632",
  appId: "1:1049556784632:web:8c3d5f5e5e5e5e5e5e5e5e"
};

// Lista de e-mails autorizados
const AUTHORIZED_EMAILS = [
  'junioftosta@gmail.com',
  'adrielemmbr@gmail.com',
  'alessandro@pizzolatto.com.br',
  'alessandro.pizzolatto@gmail.com'
];

// Inicializar Firebase
let auth;
let db;

async function initFirebase() {
  try {
    // Importar Firebase
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
    const { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
    const { getFirestore, doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    
    // Inicializar app
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    
    // Retornar funções necessárias
    return { auth, db, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut, doc, getDoc };
  } catch (error) {
    console.error('Erro ao inicializar Firebase:', error);
    throw error;
  }
}

// Verificar se usuário está autorizado
async function isUserAuthorized(email) {
  // Verificar whitelist
  if (AUTHORIZED_EMAILS.includes(email)) {
    return true;
  }
  
  // Verificar no Firestore
  try {
    const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    const userDoc = await getDoc(doc(db, 'users', email));
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.approved === true;
    }
  } catch (error) {
    console.error('Erro ao verificar usuário no Firestore:', error);
  }
  
  return false;
}

// Criar página de login
function createLoginPage() {
  const loginHTML = `
    <div id="auth-container" style="
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    ">
      <div style="
        background: white;
        padding: 3rem;
        border-radius: 1rem;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        text-align: center;
        max-width: 400px;
        width: 90%;
      ">
        <div style="margin-bottom: 2rem;">
          <h1 style="
            font-size: 2rem;
            color: #333;
            margin-bottom: 0.5rem;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          ">Sistemas Internos</h1>
          <p style="
            color: #666;
            font-size: 1.1rem;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          ">Administradora Mutual</p>
        </div>
        
        <div id="auth-loading" style="display: none; margin: 2rem 0;">
          <div style="
            border: 4px solid #f3f3f3;
            border-top: 4px solid #667eea;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto;
          "></div>
          <p style="margin-top: 1rem; color: #666;">Verificando autenticação...</p>
        </div>
        
        <div id="auth-login" style="display: none;">
          <button id="google-login-btn" style="
            background: white;
            border: 2px solid #ddd;
            padding: 1rem 2rem;
            border-radius: 0.5rem;
            font-size: 1rem;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
            width: 100%;
            transition: all 0.3s;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          " onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.15)'" onmouseout="this.style.boxShadow='none'">
            <svg width="20" height="20" viewBox="0 0 20 20">
              <path fill="#4285F4" d="M19.6 10.23c0-.82-.1-1.42-.25-2.05H10v3.72h5.5c-.15.96-.74 2.31-2.04 3.22v2.45h3.16c1.89-1.73 2.98-4.3 2.98-7.34z"/>
              <path fill="#34A853" d="M13.46 15.13c-.83.59-1.96 1-3.46 1-2.64 0-4.88-1.74-5.68-4.15H1.07v2.52C2.72 17.75 6.09 20 10 20c2.7 0 4.96-.89 6.62-2.42l-3.16-2.45z"/>
              <path fill="#FBBC05" d="M3.99 10c0-.69.12-1.35.32-1.97V5.51H1.07A9.973 9.973 0 000 10c0 1.61.39 3.14 1.07 4.49l3.24-2.52c-.2-.62-.32-1.28-.32-1.97z"/>
              <path fill="#EA4335" d="M10 3.88c1.88 0 3.13.81 3.85 1.48l2.84-2.76C14.96.99 12.7 0 10 0 6.09 0 2.72 2.25 1.07 5.51l3.24 2.52C5.12 5.62 7.36 3.88 10 3.88z"/>
            </svg>
            Entrar com Google
          </button>
          
          <p style="
            margin-top: 1.5rem;
            color: #666;
            font-size: 0.9rem;
            line-height: 1.5;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          ">
            Acesso restrito a usuários autorizados.<br>
            Caso não tenha acesso, entre em contato com o administrador.
          </p>
        </div>
        
        <div id="auth-waiting" style="display: none;">
          <div style="
            background: #fff3cd;
            border: 1px solid #ffc107;
            border-radius: 0.5rem;
            padding: 1.5rem;
            margin-bottom: 1rem;
          ">
            <h3 style="color: #856404; margin-bottom: 0.5rem;">⏳ Aguardando Aprovação</h3>
            <p style="color: #856404; font-size: 0.9rem;">
              Seu acesso está pendente de aprovação pelo administrador.
            </p>
          </div>
          <button id="logout-btn" style="
            background: #dc3545;
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            cursor: pointer;
            font-size: 1rem;
          ">Sair</button>
        </div>
      </div>
    </div>
    
    <style>
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    </style>
  `;
  
  // Inserir no body
  const container = document.createElement('div');
  container.innerHTML = loginHTML;
  document.body.appendChild(container);
  
  return container;
}

// Mostrar loading
function showLoading() {
  document.getElementById('auth-loading').style.display = 'block';
  document.getElementById('auth-login').style.display = 'none';
  document.getElementById('auth-waiting').style.display = 'none';
}

// Mostrar login
function showLogin() {
  document.getElementById('auth-loading').style.display = 'none';
  document.getElementById('auth-login').style.display = 'block';
  document.getElementById('auth-waiting').style.display = 'none';
}

// Mostrar aguardando aprovação
function showWaiting() {
  document.getElementById('auth-loading').style.display = 'none';
  document.getElementById('auth-login').style.display = 'none';
  document.getElementById('auth-waiting').style.display = 'block';
}

// Remover tela de autenticação
function removeAuthScreen() {
  const authContainer = document.getElementById('auth-container');
  if (authContainer) {
    authContainer.remove();
  }
}

// Inicializar autenticação
async function initAuth() {
  try {
    // Criar página de login
    createLoginPage();
    showLoading();
    
    // Inicializar Firebase
    const { auth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } = await initFirebase();
    
    // Monitorar estado de autenticação
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Usuário logado - verificar se está autorizado
        const authorized = await isUserAuthorized(user.email);
        
        if (authorized) {
          // Autorizado - remover tela de login
          removeAuthScreen();
        } else {
          // Não autorizado - mostrar aguardando aprovação
          showWaiting();
          
          // Configurar botão de logout
          document.getElementById('logout-btn').addEventListener('click', async () => {
            await signOut(auth);
            showLogin();
          });
        }
      } else {
        // Não logado - mostrar botão de login
        showLogin();
        
        // Configurar botão de login
        document.getElementById('google-login-btn').addEventListener('click', async () => {
          try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
          } catch (error) {
            console.error('Erro ao fazer login:', error);
            alert('Erro ao fazer login. Tente novamente.');
          }
        });
      }
    });
    
  } catch (error) {
    console.error('Erro ao inicializar autenticação:', error);
    alert('Erro ao carregar sistema de autenticação. Recarregue a página.');
  }
}

// Executar quando o DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAuth);
} else {
  initAuth();
}

