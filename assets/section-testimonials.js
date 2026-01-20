document.addEventListener('DOMContentLoaded', function() {
  // Find all testimonial sections on the page
  var sections = document.querySelectorAll('.testimonials-section');

  sections.forEach(function(section) {
    var grid = section.querySelector('.testimonials-grid');
    var prevBtn = section.querySelector('.slider-prev');
    var nextBtn = section.querySelector('.slider-next');
    var cards = grid.querySelectorAll('.testimonial-card');
    
    if (!grid || !prevBtn || !nextBtn || cards.length === 0) return;

    var scrollAmount = cards[0].offsetWidth + 20;

    // Arrow click handlers
    prevBtn.addEventListener('click', function() {
      grid.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });

    nextBtn.addEventListener('click', function() {
      grid.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });

    // Hide/show arrows based on scroll position and content
    function updateArrows() {
      var maxScroll = grid.scrollWidth - grid.clientWidth;

      // If content doesn't overflow, hide both arrows
      if (maxScroll <= 5) {
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
      } else {
        // Show/hide based on scroll position
        prevBtn.style.display = grid.scrollLeft <= 5 ? 'none' : 'flex';
        nextBtn.style.display = grid.scrollLeft >= maxScroll - 5 ? 'none' : 'flex';
      }
    }

    // Run on load
    updateArrows();

    // Run on scroll
    grid.addEventListener('scroll', updateArrows);

    // Run on window resize
    window.addEventListener('resize', updateArrows);

    // Check which quotes are truncated and show "See More" only for those
    var quotes = section.querySelectorAll('.testimonial-quote');
    var seeMoreBtns = section.querySelectorAll('.see-more-btn');

    quotes.forEach(function(quote, index) {
      if (quote.scrollHeight > quote.clientHeight) {
        seeMoreBtns[index].classList.add('visible');
      }
    });

    // Modal functionality
    var modal = section.querySelector('.modal-overlay');
    var modalQuote = modal.querySelector('.modal-quote');
    var modalAuthor = modal.querySelector('.modal-author');
    var modalClose = modal.querySelector('.modal-close');

    seeMoreBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        var quote = this.getAttribute('data-quote');
        var author = this.getAttribute('data-author');
        modalQuote.textContent = '"' + quote + '"';
        modalAuthor.textContent = '- ' + author;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    });

    function closeModal() {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }

    modalClose.addEventListener('click', closeModal);

    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        closeModal();
      }
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
      }
    });
  });
});