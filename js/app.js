/* ============================================================
   APP.JS
   Comportamentos globais compartilhados por todas as páginas:
   esconder loading screen, alternar dark mode e menu mobile.
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  // Esconde a tela de carregamento assim que o conteúdo estiver pronto
  const loading = document.getElementById("loading-screen");
  if (loading) setTimeout(() => loading.classList.add("hidden"), 300);

  // Dark mode: lê preferência salva e aplica
  const darkToggle = document.getElementById("dark-mode-toggle");
  if (localStorage.getItem("clinica_dark_mode") === "true") {
    document.body.classList.add("dark-mode");
  }
  if (darkToggle) {
    darkToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark-mode");
      localStorage.setItem("clinica_dark_mode", document.body.classList.contains("dark-mode"));
    });
  }

  // Menu mobile (header público)
  const navToggle = document.getElementById("nav-toggle");
  const mainNav = document.getElementById("main-nav");
  if (navToggle && mainNav) {
    navToggle.addEventListener("click", () => mainNav.classList.toggle("open"));
  }

  // Menu mobile (sidebar do dashboard/admin)
  const sidebarToggle = document.getElementById("sidebar-toggle");
  const sidebar = document.getElementById("sidebar");
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener("click", () => sidebar.classList.toggle("open"));
  }
});

/** Formata uma data ISO (YYYY-MM-DD) para exibição em pt-BR */
function formatarData(dataStr) {
  const [ano, mes, dia] = dataStr.split("-");
  return `${dia}/${mes}/${ano}`;
}

window.formatarData = formatarData;
