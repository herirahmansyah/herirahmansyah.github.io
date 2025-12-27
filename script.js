// Toggle menu mobile (opsional)
const navToggle = document.querySelector('nav ul');
navToggle.addEventListener('click', () => {
  navToggle.classList.toggle('show');
});

// Intersection Observer untuk animasi scroll
const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
      }
    });
  },
  { threshold: 0.15 }
);

// Observe semua elemen animasi
document.querySelectorAll('.fade-up, .section').forEach(el => {
  observer.observe(el);
});
