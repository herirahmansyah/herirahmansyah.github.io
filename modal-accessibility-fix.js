/**
 * P0.2: Modal Focus Trap & Accessibility Fix
 * Jalankan setelah DOM ready
 */

function setupModalAccessibility() {
  // 1. Fix aria-labelledby pada modal elements
  const modals = document.querySelectorAll('[class*="modal"], [role="dialog"]');
  
  modals.forEach((modal, idx) => {
    // Set unique ID jika belum ada
    if (!modal.id) {
      modal.id = `modal-${idx}`;
    }
    
    // Add role & aria attributes
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    
    // Cari title element untuk aria-labelledby
    const title = modal.querySelector('h1, h2, h3, [class*="title"]');
    if (title && !title.id) {
      title.id = `modal-${idx}-title`;
      modal.setAttribute('aria-labelledby', `modal-${idx}-title`);
    }
    
    // 2. Focus trap logic
    const focusableElements = modal.querySelectorAll(
      'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length > 0) {
      const firstEl = focusableElements[0];
      const lastEl = focusableElements[focusableElements.length - 1];
      
      // Trap Tab key
      modal.addEventListener('keydown', (e) => {
        if (e.key !== 'Tab') return;
        
        if (e.shiftKey) {
          // Shift+Tab on first element → loop to last
          if (document.activeElement === firstEl) {
            e.preventDefault();
            lastEl.focus();
          }
        } else {
          // Tab on last element → loop to first
          if (document.activeElement === lastEl) {
            e.preventDefault();
            firstEl.focus();
          }
        }
      });
      
      // Close modal on Escape
      modal.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          modal.classList.remove('active', 'show');
          // Restore focus ke trigger button (optional)
          window.lastFocusedElement?.focus();
        }
      });
    }
  });
  
  console.log('✅ Modal accessibility fixed:', modals.length, 'modals configured');
}

// Run when DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupModalAccessibility);
} else {
  setupModalAccessibility();
}
