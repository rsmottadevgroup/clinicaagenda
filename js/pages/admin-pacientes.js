/* ============================================================
   ADMIN-PACIENTES.JS
   Lista e busca pacientes cadastrados no sistema.
   ============================================================ */

document.addEventListener("DOMContentLoaded", async () => {
  const perfil = await Auth.protegerPagina("admin");
  if (!perfil) return;

  document.getElementById("logout-btn").addEventListener("click", () => Auth.logout());

  let timeoutId;
  document.getElementById("busca-paciente").addEventListener("input", (e) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => carregar(e.target.value), 350);
  });

  await carregar();
});

async function carregar(termo = "") {
  const tbody = document.getElementById("pacientes-tbody");
  try {
    const pacientes = await Admin.listarPacientes(termo);
    if (!pacientes.length) {
      tbody.innerHTML = `<tr><td colspan="4">Nenhum paciente encontrado.</td></tr>`;
      return;
    }
    tbody.innerHTML = pacientes.map(p => `
      <tr>
        <td>${p.nome}</td>
        <td>${p.email}</td>
        <td>${p.telefone || "—"}</td>
        <td>${new Date(p.criado_em).toLocaleDateString("pt-BR")}</td>
      </tr>
    `).join("");
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="4">Erro ao carregar.</td></tr>`;
    showToast(err.message, "error");
  }
}
