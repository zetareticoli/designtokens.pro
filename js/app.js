document.addEventListener("DOMContentLoaded", function() {
  var blocks = document.querySelectorAll('.animate');
  window.addEventListener('scroll', function() {
    blocks.forEach(function(block) {
      if (isElementInViewport(block)) {
        block.classList.add('slide');
      }
    });
  });
});

function isElementInViewport(el) {
  var rect = el.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}
