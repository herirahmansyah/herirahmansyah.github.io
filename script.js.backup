document.addEventListener("DOMContentLoaded", () => {

  /* =========================
     DARK MODE (DEFAULT + SAVE)
  ========================= */
  const savedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark = savedTheme ? savedTheme === "dark" : prefersDark;

  document.body.classList.toggle("dark", isDark);
  document.body.classList.toggle("light", !isDark);

  const darkToggle = document.getElementById("darkToggle");
  if (darkToggle) {
    darkToggle.addEventListener("click", () => {
      const nowDark = document.body.classList.toggle("dark");
      document.body.classList.toggle("light", !nowDark);
      localStorage.setItem("theme", nowDark ? "dark" : "light");
    });
  }

  /* =========================
     MOBILE NAV (hamburger for site-bar)
  ========================= */
  const nav = document.querySelector(".site-bar nav");
  const navList = nav?.querySelector("ul");
  if (nav && navList) {
    let hamburger = nav.querySelector(".hamburger");
    if (!hamburger) {
      hamburger = document.createElement("button");
      hamburger.className = "hamburger";
      hamburger.setAttribute("aria-label", "Toggle menu");
      hamburger.setAttribute("aria-expanded", "false");
      hamburger.innerHTML = '<i class="fa-solid fa-bars"></i>';
      nav.appendChild(hamburger);
    }
    hamburger.addEventListener("click", () => {
      const open = navList.classList.toggle("show");
      hamburger.setAttribute("aria-expanded", String(open));
      hamburger.innerHTML = open ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
    });
    // Close on link click
    navList.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
      navList.classList.remove("show");
      hamburger.setAttribute("aria-expanded", "false");
      hamburger.innerHTML = '<i class="fa-solid fa-bars"></i>';
    }));
  }

  /* =========================
     SKILL PROGRESS BARS
     Trigger when skills act enters viewport
  ========================= */
  const skillsAct = document.querySelector("#skills");
  const skillBars = document.querySelectorAll(".skill-card .progress");

  if (skillsAct && skillBars.length) {
    const skillsObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        skillBars.forEach(bar => {
          const target = parseInt(bar.dataset.progress, 10) || 0;
          bar.style.width = target + "%";
        });
        skillsObserver.disconnect();
      }
    }, { threshold: 0.3, rootMargin: "0px 0px -10% 0px" });

    skillsObserver.observe(skillsAct);
  }

  /* =========================
     CERTIFICATE MODAL
  ========================= */
  const certModal = document.getElementById("certModal");
  const certImg = document.getElementById("certImage");
  const certClose = document.querySelector("#certModal .close");

  function openCertModal(src) {
    certModal.style.display = "flex";
    certImg.src = src;
    certImg.alt = "Certificate Preview";
    document.body.style.overflow = "hidden";
  }
  function closeCertModal() {
    certModal.style.display = "none";
    certImg.src = "";
    document.body.style.overflow = "";
  }

  document.querySelectorAll(".open-cert").forEach(btn => {
    btn.addEventListener("click", () => openCertModal(btn.dataset.img));
  });

  certClose?.addEventListener("click", closeCertModal);
  certModal?.addEventListener("click", e => { if (e.target === certModal) closeCertModal(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeCertModal(); });

  /* =========================
     LIVE PREVIEW MODAL (GIF)
  ========================= */
  const previewModal = document.getElementById("previewModal");
  const previewGif = document.getElementById("previewGif");
  const previewClose = document.querySelector(".preview-modal .close");

  function openPreviewModal(src) {
    previewModal.style.display = "flex";
    previewGif.src = src;
    previewGif.alt = "Live Preview";
    document.body.style.overflow = "hidden";
  }
  function closePreviewModal() {
    previewModal.style.display = "none";
    previewGif.src = "";
    document.body.style.overflow = "";
  }

  document.querySelectorAll(".open-preview").forEach(btn => {
    btn.addEventListener("click", () => openPreviewModal(btn.dataset.gif));
  });

  previewClose?.addEventListener("click", closePreviewModal);
  previewModal?.addEventListener("click", e => { if (e.target === previewModal) closePreviewModal(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") closePreviewModal(); });

  /* =========================
     SMOOTH SCROLL for anchor links (fallback)
  ========================= */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function(e) {
      const targetId = this.getAttribute("href");
      if (targetId === "#") return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

});