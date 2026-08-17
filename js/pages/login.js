/* ============================================================
   LOGIN.JS
   Lida com o envio do formulário de login e redireciona o
   usuário conforme sua role (cliente ou admin).
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("login-form");
  const toggleSenha = document.getElementById("toggle-senha");
  const senhaInput = document.getElementById("senha");
  const submitBtn = document.getElementById("submit-btn");

  toggleSenha?.addEventListener("click", () => {
    const isPassword = senhaInput.type === "password";
    senhaInput.type = isPassword ? "text" : "password";
    toggleSenha.classList.toggle("fa-eye-slash", isPassword);
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email");
    const senha = senhaInput;

    if (!isValidEmail(email.value)) {
      showFieldError(email, "Informe um e-mail válido.");
      return;
    }
    clearFieldError(email);

    submitBtn.disabled = true;
    submitBtn.textContent = "Entrando...";

    try {
      await Auth.login({ email: email.value.trim(), senha: senha.value });
      const perfil = await Auth.getPerfil();
      showToast("Login realizado com sucesso!", "success");

      setTimeout(() => {
        window.location.href = perfil?.role === "admin" ? "admin-dashboard.html" : "dashboard.html";
      }, 600);
    } catch (err) {
      showToast(err.message === "Invalid login credentials" ? "E-mail ou senha incorretos." : err.message, "error");
      submitBtn.disabled = false;
      submitBtn.textContent = "Entrar";
    }
  });
});
