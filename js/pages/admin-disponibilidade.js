/* ============================================================
   ADMIN-DISPONIBILIDADE.JS
   Renderiza um formulário por dia da semana e salva as regras
   de disponibilidade da clínica no Supabase.
   ============================================================ */

const DIAS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

document.addEventListener("DOMContentLoaded", async () => {
  const perfil = await Auth.protegerPagina("admin");
  if (!perfil) return;

  document.getElementById("logout-btn").addEventListener("click", () => Auth.logout());
  document.getElementById("salvar-btn").addEventListener("click", salvar);

  await render();
});

let regrasAtuais = [];

async function render() {
  const container = document.getElementById("dias-container");
  try {
    regrasAtuais = await Admin.getDisponibilidadeSemana();
    const porDia = {};
    regrasAtuais.forEach(r => (porDia[r.dia_semana] = r));

    container.innerHTML = DIAS.map((nome, i) => {
      const r = porDia[i] || { ativo: false, horario_inicio: "08:00", horario_fim: "18:00", intervalo_inicio: "", intervalo_fim: "" };
      return `
        <div class="availability-day" data-dia="${i}">
          <span>${nome}</span>
          <input type="time" class="form-control campo-inicio" value="${r.horario_inicio?.slice(0,5) || "08:00"}">
          <input type="time" class="form-control campo-fim" value="${r.horario_fim?.slice(0,5) || "18:00"}">
          <input type="text" class="form-control campo-almoco" placeholder="12:00-13:30" value="${r.intervalo_inicio ? r.intervalo_inicio.slice(0,5) + '-' + r.intervalo_fim.slice(0,5) : ''}">
          <label class="switch"><input type="checkbox" class="campo-ativo" ${r.ativo ? "checked" : ""}><span class="slider-toggle"></span></label>
        </div>
      `;
    }).join("");

    if (regrasAtuais.length) {
      document.getElementById("duracao-consulta").value = regrasAtuais[0].duracao_consulta_min || 30;
    }
  } catch (err) {
    container.innerHTML = "Erro ao carregar disponibilidade.";
    showToast(err.message, "error");
  }
}

async function salvar() {
  const duracao = parseInt(document.getElementById("duracao-consulta").value, 10) || 30;
  const linhas = document.querySelectorAll(".availability-day");
  const btn = document.getElementById("salvar-btn");
  btn.disabled = true;
  btn.textContent = "Salvando...";

  try {
    for (const linha of linhas) {
      const dia = parseInt(linha.dataset.dia, 10);
      const ativo = linha.querySelector(".campo-ativo").checked;
      const inicio = linha.querySelector(".campo-inicio").value;
      const fim = linha.querySelector(".campo-fim").value;
      const almoco = linha.querySelector(".campo-almoco").value.trim();

      let intervalo_inicio = null, intervalo_fim = null;
      if (almoco.includes("-")) {
        [intervalo_inicio, intervalo_fim] = almoco.split("-").map(s => s.trim());
      }

      await Admin.salvarDisponibilidade({
        dia_semana: dia,
        ativo,
        horario_inicio: inicio,
        horario_fim: fim,
        intervalo_inicio,
        intervalo_fim,
        duracao_consulta_min: duracao
      });
    }
    showToast("Disponibilidade salva com sucesso!", "success");
  } catch (err) {
    showToast(err.message, "error");
  } finally {
    btn.disabled = false;
    btn.textContent = "Salvar disponibilidade";
  }
}
