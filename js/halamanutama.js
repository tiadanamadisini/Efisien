// Loading Screen Animation
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').classList.add('fade-out');
  }, 1000);
});

// Hero Slider Functionality
const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.slider-dot');
let currentSlide = 0;
let slideInterval;

function showSlide(n) {
  slides.forEach(slide => slide.classList.remove('active'));
  dots.forEach(dot => dot.classList.remove('active'));
  
  currentSlide = (n + slides.length) % slides.length;
  slides[currentSlide].classList.add('active');
  dots[currentSlide].classList.add('active');
}

function nextSlide() {
  showSlide(currentSlide + 1);
}

function startSlider() {
  slideInterval = setInterval(nextSlide, 2000); // Change slide every 2 seconds
}

function stopSlider() {
  clearInterval(slideInterval);
}

// Initialize slider
startSlider();

// Pause slider when hovering
const slider = document.querySelector('.hero-slider');
slider.addEventListener('mouseenter', stopSlider);
slider.addEventListener('mouseleave', startSlider);

// Dot navigation
dots.forEach((dot, index) => {
  dot.addEventListener('click', () => {
    stopSlider();
    showSlide(index);
    startSlider();
  });
});

// DOM Elements
const loader = document.getElementById('loader');
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const galleryItems = document.querySelectorAll('.gallery-item');
const zoomOverlay = document.getElementById('zoomOverlay');
const zoomImage = document.getElementById('zoomImage');
const scrollOverlay = document.getElementById('scrollOverlay');
const closeScroll = document.getElementById('closeScroll');
const commentSection = document.getElementById('commentSection');
const commentsList = document.getElementById('commentsList');
const commentInput = document.getElementById('commentInput');
const sendComment = document.getElementById('sendComment');
const closeComment = document.getElementById('closeComment');

// State variables
let currentImageIndex = null;
let pressTimer = null;
const PRESS_DURATION = 600; // 600ms for long press
let currentBlurredImage = null;
let commentsData = {};

// Initialize from localStorage
function initFromLocalStorage() {
  const savedComments = localStorage.getItem('exclusiveComments');
  if (savedComments) {
    commentsData = JSON.parse(savedComments);
  }
}

// Sidebar toggle
menuToggle.addEventListener('click', () => {
  sidebar.classList.toggle('show');
  menuToggle.innerHTML = sidebar.classList.contains('show') ? 
    '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
});

// Simulate loading content
setTimeout(() => {
    loader.classList.add('hidden');
  }, 2000);
  

// Optimized touch handling for mobile
function setupMobileTapHandler(item, index) {
  let tapTimer;
  let isScrolling = false;
  const img = item.querySelector('img');
  
  // Touch events for mobile
  item.addEventListener('touchstart', (e) => {
    tapTimer = setTimeout(() => {
      openZoomView(img.src);
    }, PRESS_DURATION);
    isScrolling = false;
  }, { passive: true });

  item.addEventListener('touchmove', () => {
    clearTimeout(tapTimer);
    isScrolling = true;
  }, { passive: true });

  item.addEventListener('touchend', (e) => {
    clearTimeout(tapTimer);
    if (!isScrolling) {
      e.preventDefault();
      openScrollView(index);
    }
  }, { passive: false });
}

// Gallery item interactions
galleryItems.forEach((item, index) => {
  const img = item.querySelector('img');
  
  // Setup mobile touch handler
  setupMobileTapHandler(item, index);
  
  // Click handler for desktop
  item.addEventListener('click', () => {
    if (!pressTimer) {
      openScrollView(index);
    }
  });
  
  // Mouse events for desktop
  item.addEventListener('mousedown', (e) => {
    e.preventDefault();
    pressTimer = setTimeout(() => {
      openZoomView(img.src);
      pressTimer = null;
    }, PRESS_DURATION);
  });
  
  item.addEventListener('mouseup', clearPressTimer);
  item.addEventListener('mouseleave', clearPressTimer);
});

function clearPressTimer() {
  if (pressTimer) {
    clearTimeout(pressTimer);
    pressTimer = null;
  }
}

// Open zoom view
function openZoomView(imgSrc) {
  zoomImage.src = imgSrc;
  zoomOverlay.classList.add('show');
}

// Close zoom view
zoomOverlay.addEventListener('click', () => {
  zoomOverlay.classList.remove('show');
});

// Open scroll view - optimized for mobile
function openScrollView(startIndex) {
  currentImageIndex = startIndex;
  scrollOverlay.classList.add('show');
  
  // Enable touch scrolling
  scrollOverlay.style.overflowY = 'auto';
  scrollOverlay.style.webkitOverflowScrolling = 'touch';
  
  scrollOverlay.innerHTML = `
    <button class="close-btn" id="closeScroll">
      <i class="fas fa-times"></i>
    </button>
  `;
  
  // Re-bind close button
  document.getElementById('closeScroll').addEventListener('click', () => {
    scrollOverlay.classList.remove('show');
  });

  // Create post containers for each image
  galleryItems.forEach((item, index) => {
    const img = item.querySelector('img');
    const itemInfo = item.querySelector('.item-info');
    
    const container = document.createElement('div');
    container.className = 'post-container';
    
    const content = document.createElement('div');
    content.className = 'post-content';
    
    const postImg = document.createElement('img');
    postImg.src = img.src;
    postImg.alt = img.alt;
    
    // Setup touch events for image in scroll view
    setupImageTouchEvents(postImg);
    
    const meta = document.createElement('div');
    meta.className = 'post-meta';
    
    const caption = document.createElement('div');
    caption.className = 'post-caption';
    caption.textContent = itemInfo ? itemInfo.querySelector('p').textContent : 'Kandungan eksklusif';
    
    const actions = document.createElement('div');
    actions.className = 'post-actions';
    
    const likeBtn = document.createElement('button');
    likeBtn.className = 'post-action';
    likeBtn.innerHTML = '<i class="far fa-heart"></i>';
    likeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      likeBtn.classList.toggle('liked');
      likeBtn.innerHTML = likeBtn.classList.contains('liked') ? 
        '<i class="fas fa-heart"></i>' : '<i class="far fa-heart"></i>';
    });
    
    const commentBtn = document.createElement('button');
    commentBtn.className = 'post-action';
    commentBtn.innerHTML = '<i class="far fa-comment"></i>';
    commentBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      currentImageIndex = index;
      openCommentSection();
    });
    
    actions.appendChild(likeBtn);
    actions.appendChild(commentBtn);
    meta.appendChild(caption);
    meta.appendChild(actions);
    content.appendChild(postImg);
    content.appendChild(meta);
    container.appendChild(content);
    scrollOverlay.appendChild(container);
  });
  
  // Scroll to the selected image with mobile-friendly behavior
  setTimeout(() => {
    const targetElement = scrollOverlay.children[startIndex + 1];
    if (targetElement) {
      targetElement.scrollIntoView({ 
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, 100);
}

// Setup touch events for images in scroll view
function setupImageTouchEvents(imgElement) {
  let pressTimer;
  
  imgElement.addEventListener('touchstart', (e) => {
    pressTimer = setTimeout(() => {
      currentBlurredImage = imgElement;
      document.querySelectorAll('.post-content img').forEach(img => {
        img.classList.add('blur');
      });
      openZoomView(imgElement.src);
    }, PRESS_DURATION);
  }, { passive: true });

  imgElement.addEventListener('touchend', () => {
    clearTimeout(pressTimer);
  }, { passive: true });

  imgElement.addEventListener('touchmove', () => {
    clearTimeout(pressTimer);
  }, { passive: true });
}

// Comment section functions
function openCommentSection() {
  loadComments();
  commentSection.classList.add('active');
}

function closeCommentSection() {
  commentSection.classList.remove('active');
}

function loadComments() {
  commentsList.innerHTML = '';
  const imageComments = commentsData[currentImageIndex] || [];
  
  if (imageComments.length === 0) {
    const emptyMsg = document.createElement('div');
    emptyMsg.className = 'comment-item';
    emptyMsg.textContent = 'Tiada komen lagi.';
    commentsList.appendChild(emptyMsg);
    return;
  }
  
  imageComments.forEach(comment => {
    const commentItem = document.createElement('div');
    commentItem.className = 'comment-item';
    commentItem.innerHTML = `
      <img src="/gambar/poster.jpg" width="25px" height="25px" style="border-radius:15px;position: fixed;">
      <div class="comment-user" style="position: relative; left:30px;">${comment.username}</div>
      <div class="comment-text">${comment.text}</div>
    `;
    commentsList.appendChild(commentItem);
  });
  
  // Scroll to bottom
  commentsList.scrollTop = commentsList.scrollHeight;
}

function addComment(text) {
  if (!text.trim()) return;
  
  const comment = {
    username: '5 EFI',
    text: text,
    timestamp: new Date().toISOString()
  };
  
  if (!commentsData[currentImageIndex]) {
    commentsData[currentImageIndex] = [];
  }
  
  commentsData[currentImageIndex].push(comment);
  localStorage.setItem('exclusiveComments', JSON.stringify(commentsData));
  loadComments();
  commentInput.value = '';
}

// Event listeners
closeComment.addEventListener('click', closeCommentSection);

sendComment.addEventListener('click', () => {
  addComment(commentInput.value);
});

commentInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    addComment(commentInput.value);
  }
});

// Logout functionality
document.getElementById('logoutBtn').addEventListener('click', function() {
  localStorage.removeItem('isLoggedIn');
  window.location.href = 'halamanutama.html';
});

// Check if user is logged in
if (localStorage.getItem('isLoggedIn') !== 'true') {
  window.location.href = 'halamanutama.html';
}

// Initialize
initFromLocalStorage();

// Debugging for mobile
console.log('Mobile touch support:', 'ontouchstart' in window);sidebar