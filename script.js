document.addEventListener("DOMContentLoaded", () => {

  /* =========================
     DARK MODE (DEFAULT + SAVE)
  ========================= */
  const savedTheme = localStorage.getItem("theme");
  document.body.classList.toggle("dark", savedTheme !== "light");

  const darkToggle = document.getElementById("darkToggle");
  if (darkToggle) {
    darkToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark");
      localStorage.setItem(
        "theme",
        document.body.classList.contains("dark") ? "dark" : "light"
      );
    });
  }

  /* =========================
     MOBILE NAV
  ========================= */
  const navToggle = document.querySelector("nav ul");
  if (navToggle) {
    navToggle.addEventListener("click", () => {
      navToggle.classList.toggle("show");
    });
  }

  /* =========================
     SCROLL ANIMATION
  ========================= */
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll(".fade-up, .section").forEach(el => observer.observe(el));

  /* =========================
     SKILL PROGRESS BAR
  ========================= */
  const skillSection = document.querySelector("#skills");
  const skillBars = document.querySelectorAll(".progress");

  if (skillSection && skillBars.length) {
    const skillObserver = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        skillBars.forEach(bar => {
          bar.style.width = bar.dataset.progress + "%";
        });
        skillObserver.disconnect();
      }
    }, { threshold: 0.4 });

    skillObserver.observe(skillSection);
  }

  /* =========================
     CERTIFICATE MODAL
  ========================= */
  const certModal = document.getElementById("certModal");
  const certImage = document.getElementById("certImage");

  document.querySelectorAll(".open-cert").forEach(btn => {
    btn.addEventListener("click", () => {
      certModal.style.display = "flex";
      certImage.src = btn.dataset.img;
    });
  });

  certModal?.addEventListener("click", e => {
    if (e.target === certModal) certModal.style.display = "none";
  });

  /* =========================
     LIVE PREVIEW POPUP (GIF)
  ========================= */
  const previewModal = document.getElementById("previewModal");
  const previewGif = document.getElementById("previewGif");
  const closePreview = document.querySelector(".preview-modal .close");

  document.querySelectorAll(".open-preview").forEach(btn => {
    btn.addEventListener("click", () => {
      previewModal.style.display = "flex";
      previewGif.src = btn.dataset.gif; // lazy load
    });
  });

  closePreview?.addEventListener("click", () => {
    previewModal.style.display = "none";
    previewGif.src = "";
  });

  previewModal?.addEventListener("click", e => {
    if (e.target === previewModal) {
      previewModal.style.display = "none";
      previewGif.src = "";
    }
  });

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      previewModal.style.display = "none";
      previewGif.src = "";
    }
  });

});
