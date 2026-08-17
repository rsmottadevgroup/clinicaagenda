/* ============================================================
   PERFIL.JS
   Edição de dados pessoais e troca de senha do paciente logado.
   ============================================================ */

document.addEventListener("DOMContentLoaded", async () => {
  const perfil = await Auth.protegerPagina("cliente");
  if (!perfil) return;

  document.getElementById("logout-btn").addEventListener("click", () => Auth.logout());
  document.getElementById("nome").value = perfil.nome;
  document.getElementById("telefone").value = perfil.telefone || "";
  document.getElementById("email").value = perfil.email;
  maskPhone(document.getElementById("telefone"));

  document.getElementById("perfil-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      const { error } = await window.db.from("usuarios").update({
        nome: sanitizeInput(document.getElementById("nome").value),
        telefone: document.getElementById("telefone").value
      }).eq("id", perfil.id);
      if (error) throw error;
      showToast("Dados atualizados com sucesso!", "success");
    } catch (err) {
      showToast(err.message, "error");
    }
  });

  document.getElementById("senha-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const senha = document.getElementById("nova-senha");
    if (!isStrongPassword(senha.value)) { showFieldError(senha, "Mínimo 8 caracteres, com letras e números."); return; }
    clearFieldError(senha);
    try {
      await Auth.atualizarSenha(senha.value);
      showToast("Senha atualizada com sucesso!", "success");
      senha.value = "";
    } catch (err) {
      showToast(err.message, "error");
    }
  });
});
