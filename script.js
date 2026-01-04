// Default DARK MODE saat pertama kali buka
document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("dark");
});

document.addEventListener("DOMContentLoaded", () => {

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
     DARK MODE
  ========================= */
 document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "light") {
    document.body.classList.remove("dark");
  } else {
    document.body.classList.add("dark"); // default
  }
});

const darkToggle = document.getElementById("darkToggle");

darkToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");

  if (document.body.classList.contains("dark")) {
    localStorage.setItem("theme", "dark");
  } else {
    localStorage.setItem("theme", "light");
  }
});


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
            const value = bar.dataset.progress;
            bar.style.width = value + "%";
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

