/* ============================================================
   AGENDAR.JS
   Conecta o calendário (Booking.iniciarCalendario) ao modal de
   horários e envia a solicitação de agendamento ao Supabase.
   ============================================================ */

let perfilAtual = null;
let dataEscolhida = null;
let horarioEscolhido = null;

document.addEventListener("DOMContentLoaded", async () => {
  perfilAtual = await Auth.protegerPagina("cliente");
  if (!perfilAtual) return;

  document.getElementById("logout-btn").addEventListener("click", () => Auth.logout());

  await Booking.iniciarCalendario(abrirModalHorarios);

  document.getElementById("fechar-modal").addEventListener("click", fecharModal);
  document.getElementById("confirmar-agendamento").addEventListener("click", confirmarAgendamento);
});

async function abrirModalHorarios(dataStr) {
  dataEscolhida = dataStr;
  horarioEscolhido = null;
  document.getElementById("modal-data-titulo").textContent = `Horários para ${formatarData(dataStr)}`;
  document.getElementById("confirmar-agendamento").disabled = true;

  const container = document.getElementById("time-slots");
  container.innerHTML = "Carregando...";

  const horarios = await Booking.getHorariosDisponiveis(dataStr);
  if (!horarios.length) {
    container.innerHTML = "<p>Nenhum horário configurado para este dia.</p>";
  } else {
    container.innerHTML = horarios.map(h => `
      <button class="time-slot" data-horario="${h.horario}" ${h.disponivel ? "" : "disabled"}>${h.horario}</button>
    `).join("");
    container.querySelectorAll(".time-slot:not(:disabled)").forEach(btn => {
      btn.addEventListener("click", () => {
        container.querySelectorAll(".time-slot").forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
        horarioEscolhido = btn.dataset.horario;
        document.getElementById("confirmar-agendamento").disabled = false;
      });
    });
  }

  document.getElementById("modal-horarios").classList.remove("hidden");
}

function fecharModal() {
  document.getElementById("modal-horarios").classList.add("hidden");
}

async function confirmarAgendamento() {
  const btn = document.getElementById("confirmar-agendamento");
  const observacoes = document.getElementById("observacoes").value;

  btn.disabled = true;
  btn.textContent = "Agendando...";

  try {
    await Booking.criarAgendamento({
      pacienteId: perfilAtual.id,
      data: dataEscolhida,
      horario: horarioEscolhido,
      observacoes
    });
    showToast("Consulta solicitada! Aguarde a confirmação da clínica.", "success");
    fecharModal();
    setTimeout(() => (window.location.href = "dashboard.html"), 1200);
  } catch (err) {
    showToast(err.message.includes("duplicate") ? "Este horário acabou de ser reservado. Escolha outro." : err.message, "error");
    btn.disabled = false;
    btn.textContent = "Confirmar agendamento";
  }
}
