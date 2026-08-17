/* ============================================================
   ADMIN-DASHBOARD.JS
   Estatísticas gerais e calendário completo (visão do admin,
   mostrando todos os agendamentos, não apenas os disponíveis).
   ============================================================ */

document.addEventListener("DOMContentLoaded", async () => {
  const perfil = await Auth.protegerPagina("admin");
  if (!perfil) return;

  document.getElementById("logout-btn").addEventListener("click", () => Auth.logout());

  try {
    const stats = await Admin.getEstatisticas();
    document.getElementById("stat-hoje").textContent = stats.consultasHoje;
    document.getElementById("stat-pendentes").textContent = stats.pendentes;
    document.getElementById("stat-pacientes").textContent = stats.pacientes;
    document.getElementById("stat-total").textContent = stats.totalConsultas;
  } catch (err) {
    showToast(err.message, "error");
  }

  await renderCalendario();
});

async function renderCalendario() {
  const calendarEl = document.getElementById("calendar-container");
  if (!calendarEl || !window.FullCalendar) return;

  const agendamentos = await Admin.listarAgendamentos();
  const eventos = agendamentos
    .filter(a => a.status !== "cancelado" && a.status !== "recusado")
    .map(a => ({
      title: `${a.horario} - ${a.usuarios?.nome || "Paciente"}`,
      date: a.data,
      color: a.status === "confirmado" ? "#3e9a6b" : "#d99a3d"
    }));

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    locale: "pt-br",
    height: "auto",
    headerToolbar: { left: "prev,next today", center: "title", right: "dayGridMonth,timeGridWeek" },
    events: eventos
  });
  calendar.render();
}
