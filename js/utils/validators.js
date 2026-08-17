/* ============================================================
   VALIDATORS.JS
   Funções reutilizáveis de validação e sanitização de entradas.
   ============================================================ */

// Remove tags HTML e espaços extras de uma string (previne XSS básico em campos de texto livre)
function sanitizeInput(value) {
  if (typeof value !== "string") return value;
  return value.replace(/<[^>]*>?/gm, "").trim();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Valida telefone/WhatsApp brasileiro: (99) 99999-9999 ou (99) 9999-9999
function isValidPhone(phone) {
  return /^\(?\d{2}\)?[\s-]?\d{4,5}-?\d{4}$/.test(phone.replace(/\s/g, " ").trim());
}

// Exige mínimo de 8 caracteres, 1 letra e 1 número
function isStrongPassword(password) {
  return /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(password);
}

// Aplica máscara de telefone enquanto o usuário digita
function maskPhone(input) {
  input.addEventListener("input", () => {
    let v = input.value.replace(/\D/g, "").slice(0, 11);
    if (v.length > 6) v = v.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
    else if (v.length > 2) v = v.replace(/(\d{2})(\d{0,5})/, "($1) $2");
    input.value = v;
  });
}

// Exibe erro embaixo de um campo (espera um <span class="form-error"> logo após o input)
function showFieldError(inputEl, message) {
  const errorEl = inputEl.parentElement.querySelector(".form-error");
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.add("active");
  }
  inputEl.style.borderColor = "var(--color-danger)";
}

function clearFieldError(inputEl) {
  const errorEl = inputEl.parentElement.querySelector(".form-error");
  if (errorEl) errorEl.classList.remove("active");
  inputEl.style.borderColor = "";
}

window.sanitizeInput = sanitizeInput;
window.isValidEmail = isValidEmail;
window.isValidPhone = isValidPhone;
window.isStrongPassword = isStrongPassword;
window.maskPhone = maskPhone;
window.showFieldError = showFieldError;
window.clearFieldError = clearFieldError;
