// Function to show the previous page
document.addEventListener('keydown', function(event) {
  if(event.key === 'ArrowLeft') {
    showPrevPage();
  } else if(event.key === 'ArrowRight') {
    showNextPage();
  }
});


// mobaile devices 

let touchStartX = 0;
let touchEndX = 0;

function handleGesture() {
  if (touchEndX < touchStartX - 50) {
    // Swipe left (next page)
    showNextPage();
  }
  if (touchEndX > touchStartX + 50) {
    // Swipe right (previous page)
    showPrevPage();
  }
}

document.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].screenX;
}, false);

document.addEventListener('touchend', (e) => {
  touchEndX = e.changedTouches[0].screenX;
  handleGesture();
}, false);
