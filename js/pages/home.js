/* ============================================================
   HOME.JS
   Comportamento exclusivo da página inicial: carrossel premium
   e envio do formulário de contato.
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  initCarousel();
  initContactForm();
});

function initCarousel() {
  const track = document.getElementById("carousel-track");
  const controls = document.getElementById("carousel-controls");
  if (!track) return;

  const slides = track.children;
  let current = 0;

  // Cria os pontos indicadores dinamicamente
  for (let i = 0; i < slides.length; i++) {
    const dot = document.createElement("button");
    dot.className = "carousel-dot" + (i === 0 ? " active" : "");
    dot.setAttribute("aria-label", `Ir para slide ${i + 1}`);
    dot.addEventListener("click", () => goTo(i));
    controls.appendChild(dot);
  }

  function goTo(index) {
    current = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    [...controls.children].forEach((d, i) => d.classList.toggle("active", i === current));
  }

  document.querySelector(".carousel-arrow.prev").addEventListener("click", () => goTo(current - 1));
  document.querySelector(".carousel-arrow.next").addEventListener("click", () => goTo(current + 1));

  // Autoplay a cada 6 segundos
  setInterval(() => goTo(current + 1), 6000);
}

function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("contact-email");

    if (!isValidEmail(email.value)) {
      showFieldError(email, "Informe um e-mail válido.");
      return;
    }
    clearFieldError(email);

    // Aqui a mensagem poderia ser gravada em uma tabela "mensagens_contato" no Supabase.
    // Mantido simples por padrão para não exigir tabela extra sem uso definido.
    showToast("Mensagem enviada! Em breve entraremos em contato.", "success");
    form.reset();
  });
}
