// Toggle menu untuk mobile
const navToggle = document.querySelector('nav ul');
navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('show');
});

// Animasi fade-in saat scroll
const sections = document.querySelectorAll('.section');
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
        }
    });
}, { threshold: 0.1 });


sections.forEach(section => observer.observe(section));

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('show');
    }
  });
});

document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
