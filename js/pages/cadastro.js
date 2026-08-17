/* ============================================================
   CADASTRO.JS
   Validação e envio do formulário de cadastro de novo paciente.
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("cadastro-form");
  const telefoneInput = document.getElementById("telefone");
  const senhaInput = document.getElementById("senha");
  const submitBtn = document.getElementById("submit-btn");

  maskPhone(telefoneInput);

  document.getElementById("toggle-senha")?.addEventListener("click", (e) => {
    const isPassword = senhaInput.type === "password";
    senhaInput.type = isPassword ? "text" : "password";
    e.target.classList.toggle("fa-eye-slash", isPassword);
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome = document.getElementById("nome");
    const email = document.getElementById("email");
    let valido = true;

    if (nome.value.trim().length < 3) { showFieldError(nome, "Informe seu nome completo."); valido = false; } else clearFieldError(nome);
    if (!isValidPhone(telefoneInput.value)) { showFieldError(telefoneInput, "Telefone inválido."); valido = false; } else clearFieldError(telefoneInput);
    if (!isValidEmail(email.value)) { showFieldError(email, "E-mail inválido."); valido = false; } else clearFieldError(email);
    if (!isStrongPassword(senhaInput.value)) { showFieldError(senhaInput, "Mínimo 8 caracteres, com letras e números."); valido = false; } else clearFieldError(senhaInput);

    if (!valido) return;

    submitBtn.disabled = true;
    submitBtn.textContent = "Criando conta...";

    try {
      await Auth.cadastrar({
        nome: sanitizeInput(nome.value),
        email: email.value.trim(),
        telefone: telefoneInput.value,
        senha: senhaInput.value
      });
      showToast("Conta criada! Verifique seu e-mail para confirmar.", "success");
      setTimeout(() => (window.location.href = "login.html"), 1200);
    } catch (err) {
      showToast(err.message.includes("already registered") ? "Este e-mail já está cadastrado." : err.message, "error");
      submitBtn.disabled = false;
      submitBtn.textContent = "Criar conta";
    }
  });
});
