let slideIndex = 0;
showSlide(slideIndex);

function showSlide(index) {
  const slides = document.getElementsByClassName("carousel-slide");
  if (slides.length === 0) return;

  // wrap index
  if (index >= slides.length) slideIndex = 0;
  if (index < 0) slideIndex = slides.length - 1;

  // hide all slides
  for (let i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }

  // show current
  slides[slideIndex].style.display = "block";
}

function nextSlide() {
  slideIndex++;
  showSlide(slideIndex);
}

function prevSlide() {
  slideIndex--;
  showSlide(slideIndex);
}

// Optional: auto-slide every 5 seconds
setInterval(() => {
  nextSlide();
}, 5000);
