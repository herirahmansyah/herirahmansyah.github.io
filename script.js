document.addEventListener("DOMContentLoaded", () => {

  /* =========================
     DARK MODE (DEFAULT + SAVE)
  ========================= */
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "light") {
    document.body.classList.remove("dark");
  } else {
    document.body.classList.add("dark"); // default DARK
  }

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
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
        }
      });
    },
    { threshold: 0.15 }
  );

  document.querySelectorAll(".fade-up, .section").forEach(el => {
    observer.observe(el);
  });

  /* =========================
     SKILL PROGRESS BAR
  ========================= */
  const skillSection = document.querySelector("#skills");
  const skillBars = document.querySelectorAll(".progress");

  if (skillSection && skillBars.length > 0) {
    const skillObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          skillBars.forEach(bar => {
            bar.style.width = bar.dataset.progress + "%";
          });
          skillObserver.disconnect();
        }
      });
    }, { threshold: 0.4 });

    skillObserver.observe(skillSection);
  }

  /* =========================
     CERTIFICATE MODAL
  ========================= */
  const modal = document.getElementById("certModal");
  const modalImg = document.getElementById("certImage");
  const closeBtn = document.querySelector(".cert-modal .close");

  document.querySelectorAll(".open-cert").forEach(btn => {
    btn.addEventListener("click", () => {
      if (modal && modalImg) {
        modal.style.display = "flex";
        modalImg.src = btn.dataset.img;
      }
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      modal.style.display = "none";
    });
  }

  if (modal) {
    modal.addEventListener("click", e => {
      if (e.target === modal) {
        modal.style.display = "none";
      }
    });
  }

});
/* =========================
   LIVE PREVIEW POPUP
========================= */
const previewModal = document.getElementById("previewModal");
const previewGif = document.getElementById("previewGif");
const closePreview = document.querySelector(".preview-modal .close");

document.querySelectorAll(".open-preview").forEach(btn => {
  btn.addEventListener("click", () => {
    previewModal.style.display = "flex";

    // Lazy load GIF
    if (!previewGif.src) {
      previewGif.src = btn.dataset.gif;
    }
  });
});

// Close button
closePreview.addEventListener("click", () => {
  previewModal.style.display = "none";
});

// Click outside image
previewModal.addEventListener("click", e => {
  if (e.target === previewModal) {
    previewModal.style.display = "none";
  }
});

// ESC key close
document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    previewModal.style.display = "none";
  }
});

