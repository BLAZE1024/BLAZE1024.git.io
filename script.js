// Theme toggle and small demo interaction
const themeToggle = document.getElementById("themeToggle");
const changeBtn = document.getElementById("changeBtn");
const intro = document.getElementById("intro");

// Initialize theme from localStorage
function applyTheme(theme) {
  if (theme === "dark") document.body.classList.add("dark");
  else document.body.classList.remove("dark");
}

const saved = localStorage.getItem("theme");
applyTheme(saved || "light");

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const isDark = document.body.classList.toggle("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    themeToggle.textContent = isDark ? "Day mode" : "Night mode";
  });
}

// small demo: change intro text
if (changeBtn && intro) {
  changeBtn.addEventListener("click", () => {
    intro.textContent = "Thanks for clicking — enjoy the shows!";
  });
}

// Gallery Posts with likes and comments
const galleryPosts = document.getElementById("galleryPosts");
const addPostForm = document.getElementById("addPostForm");

const POSTS_KEY = "galleryPosts";
const LIKES_KEY = "postLikes";
const COMMENTS_KEY = "postComments";

function loadPosts() {
  const saved = localStorage.getItem(POSTS_KEY);
  return saved ? JSON.parse(saved) : [];
}

function savePosts(posts) {
  localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
}

function loadPostLikes(postId) {
  const saved = localStorage.getItem(`${LIKES_KEY}_${postId}`);
  return saved ? JSON.parse(saved) : [];
}

function savePostLikes(postId, likerEmails) {
  localStorage.setItem(`${LIKES_KEY}_${postId}`, JSON.stringify(likerEmails));
}

function loadPostComments(postId) {
  const saved = localStorage.getItem(`${COMMENTS_KEY}_${postId}`);
  return saved ? JSON.parse(saved) : [];
}

function savePostComments(postId, comments) {
  localStorage.setItem(`${COMMENTS_KEY}_${postId}`, JSON.stringify(comments));
}

function renderPost(post) {
  const currentUser = getCurrentUser();
  const likers = loadPostLikes(post.id);
  const isLiked = currentUser && likers.includes(currentUser.email);
  const comments = loadPostComments(post.id);

  const postEl = document.createElement("div");
  postEl.className = "post";
  postEl.innerHTML = `
    <img src="${post.imageUrl}" alt="${escapeHtml(post.caption)}" class="post-image" />
    <div class="post-content">
      <div class="post-caption-header">
        <div class="post-caption" id="caption-display-${post.id}">${escapeHtml(post.caption) || "<em>No caption</em>"}</div>
        ${currentUser && currentUser.email === post.author ? `<button class="edit-caption-btn" data-post-id="${post.id}">✏️</button>` : ""}
      </div>
      <div class="post-stats">${likers.length} ${likers.length === 1 ? "like" : "likes"} · ${comments.length} ${comments.length === 1 ? "comment" : "comments"}</div>
      
      <div class="post-actions">
        <button class="post-btn like-btn ${isLiked ? "liked" : ""}" data-post-id="${post.id}">
          ❤️ Like
        </button>
        <button class="post-btn comment-toggle-btn" data-post-id="${post.id}">
          💬 Comment
        </button>
        <button class="post-btn share-btn" data-post-id="${post.id}">
          ➤ Share
        </button>
      </div>

      <div class="post-comments" id="comments-${post.id}" style="display: none;">
        <div id="comments-list-${post.id}"></div>
        <form class="comment-form" data-post-id="${post.id}">
          <input type="text" placeholder="Write a comment..." class="comment-input" required />
          <button type="submit">Post</button>
        </form>
      </div>
    </div>
  `;

  // Render existing comments
  const commentsList = postEl.querySelector(`#comments-list-${post.id}`);
  comments.forEach((comment) => {
    const commentEl = document.createElement("div");
    commentEl.className = "comment";
    commentEl.innerHTML = `<span class="comment-author">${escapeHtml(comment.author)}</span><span class="comment-text">${escapeHtml(comment.text)}</span>`;
    commentsList.appendChild(commentEl);
  });

  // Like button
  const likeBtn = postEl.querySelector(".like-btn");
  likeBtn.addEventListener("click", () => {
    if (!currentUser) {
      alert("Please log in to like posts.");
      return;
    }
    let updatedLikers = loadPostLikes(post.id);
    if (updatedLikers.includes(currentUser.email)) {
      updatedLikers = updatedLikers.filter((e) => e !== currentUser.email);
    } else {
      updatedLikers.push(currentUser.email);
    }
    savePostLikes(post.id, updatedLikers);
    renderGallery();
  });

  // Comment toggle
  const toggleBtn = postEl.querySelector(".comment-toggle-btn");
  const commentsSection = postEl.querySelector(`#comments-${post.id}`);
  toggleBtn.addEventListener("click", () => {
    commentsSection.style.display =
      commentsSection.style.display === "none" ? "block" : "none";
  });

  // Comment form
  const commentForm = postEl.querySelector(".comment-form");
  commentForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert("Please log in to comment.");
      return;
    }
    const input = postEl.querySelector(".comment-input");
    const text = input.value.trim();
    if (text) {
      const updatedComments = loadPostComments(post.id);
      updatedComments.push({
        author: currentUser.name || currentUser.email,
        text,
      });
      savePostComments(post.id, updatedComments);
      input.value = "";
      renderGallery();
    }
  });

  // Share button
  const shareBtn = postEl.querySelector(".share-btn");
  shareBtn.addEventListener("click", () => {
    const text = `Check out this post: "${post.caption}" - ${window.location.href}`;
    if (navigator.share) {
      navigator.share({ title: "C-Drama Post", text });
    } else {
      alert("Shared to clipboard: " + text);
      navigator.clipboard.writeText(text);
    }
  });

  // Edit caption button
  const editBtn = postEl.querySelector(".edit-caption-btn");
  if (editBtn) {
    editBtn.addEventListener("click", () => {
      const newCaption = prompt("Edit caption:", post.caption);
      if (newCaption !== null) {
        const posts = loadPosts();
        const postIndex = posts.findIndex((p) => p.id === post.id);
        if (postIndex !== -1) {
          posts[postIndex].caption = newCaption.trim();
          savePosts(posts);
          renderGallery();
        }
      }
    });
  }

  galleryPosts.appendChild(postEl);
}

function renderGallery() {
  galleryPosts.innerHTML = "";
  const posts = loadPosts();
  posts.reverse().forEach((post) => {
    renderPost(post);
  });
}

// Handle review form submissions and localStorage
const reviewForm = document.getElementById("reviewForm");
const reviewsList = document.getElementById("reviewsList");

// Helper: load reviews from localStorage
function loadReviews() {
  const saved = localStorage.getItem("reviews");
  return saved ? JSON.parse(saved) : [];
}

// Helper: save reviews to localStorage
function saveReviews(reviews) {
  localStorage.setItem("reviews", JSON.stringify(reviews));
}

// Helper: render review in the list
function renderReview(name, rating, text) {
  const li = document.createElement("li");
  li.innerHTML = `<strong>${escapeHtml(name)}</strong> — ${rating}/5<br>${escapeHtml(text)}`;
  reviewsList.prepend(li);
}

// Load and display saved reviews on page load
if (reviewsList) {
  const reviews = loadReviews();
  reviews.forEach((review) => {
    renderReview(review.name, review.rating, review.text);
  });
}

// Handle new review submissions
if (reviewForm && reviewsList) {
  reviewForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value.trim();
    const rating = document.getElementById("rating").value;
    const text = document.getElementById("review").value.trim();

    // Render new review
    renderReview(name, rating, text);

    // Save to localStorage
    const reviews = loadReviews();
    reviews.unshift({ name, rating, text });
    saveReviews(reviews);

    reviewForm.reset();
  });
}

// simple escape to avoid injecting HTML
function escapeHtml(str) {
  return str.replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[c],
  );
}

// Login modal logic with localStorage
const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const loginModal = document.getElementById("loginModal");
const closeLoginBtn = document.getElementById("closeLoginBtn");
const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");
const logoutBtn = document.getElementById("logoutBtn");
const protectedContent = document.getElementById("protectedContent");
const lockedMessage = document.getElementById("lockedMessage");

// Helper: save user to localStorage
function saveUser(email, name) {
  const user = { email, name, loginTime: new Date().toISOString() };
  localStorage.setItem("currentUser", JSON.stringify(user));
}

// Helper: get current user from localStorage
function getCurrentUser() {
  const saved = localStorage.getItem("currentUser");
  return saved ? JSON.parse(saved) : null;
}

// Helper: clear user (logout)
function clearUser() {
  localStorage.removeItem("currentUser");
}

const REGISTERED_USERS_KEY = "registeredUsers";

function loadRegisteredUsers() {
  const saved = localStorage.getItem(REGISTERED_USERS_KEY);
  return saved ? JSON.parse(saved) : [];
}

function saveRegisteredUsers(users) {
  localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
}

function findRegisteredUser(email) {
  return loadRegisteredUsers().find((user) => user.email === email);
}

function showProtectedContent(show) {
  if (protectedContent)
    protectedContent.style.display = show ? "block" : "none";
  if (lockedMessage) lockedMessage.style.display = show ? "none" : "block";
}

// Admin credentials
const ADMIN_EMAIL = "admin@cdrama.com";
const ADMIN_PASSWORD = "admin123";
const ADMIN_PASSWORD_KEY = "adminPassword";

function getAdminPassword() {
  return localStorage.getItem(ADMIN_PASSWORD_KEY) || ADMIN_PASSWORD;
}

function setAdminPassword(password) {
  localStorage.setItem(ADMIN_PASSWORD_KEY, password);
}

// Helper: check if email is admin
function isAdmin(email) {
  return email === ADMIN_EMAIL;
}

// Update login button text if user is already logged in
function updateLoginButtonUI() {
  const user = getCurrentUser();
  const adminBtn = document.getElementById("adminBtn");
  if (user && loginBtn) {
    loginBtn.textContent = `Logged in: ${user.email}`;
    loginBtn.disabled = true;
    if (logoutBtn) logoutBtn.style.display = "inline-block";
    if (registerBtn) registerBtn.style.display = "none";
    if (adminBtn)
      adminBtn.style.display = isAdmin(user.email) ? "inline-block" : "none";
    showProtectedContent(true);
  } else {
    if (loginBtn) {
      loginBtn.textContent = "Login";
      loginBtn.disabled = false;
    }
    if (logoutBtn) logoutBtn.style.display = "none";
    if (registerBtn) registerBtn.style.display = "inline-block";
    if (adminBtn) adminBtn.style.display = "none";
    showProtectedContent(false);
  }
}

// Check on page load
updateLoginButtonUI();

if (loginBtn) {
  loginBtn.addEventListener("click", () => {
    loginModal.style.display = "flex";
    loginMessage.textContent = "";
  });
}

if (closeLoginBtn) {
  closeLoginBtn.addEventListener("click", () => {
    loginModal.style.display = "none";
  });
}

if (loginModal) {
  loginModal.addEventListener("click", (e) => {
    if (e.target === loginModal) {
      loginModal.style.display = "none";
    }
  });
}

if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (email && password.length >= 6) {
      // Check if admin credentials
      if (email === ADMIN_EMAIL && password === getAdminPassword()) {
        saveUser(email, "Admin");
        loginMessage.textContent = "✓ Admin logged in!";
      } else {
        const registeredUser = findRegisteredUser(email);
        if (!registeredUser || registeredUser.password !== password) {
          loginMessage.textContent = "✗ Invalid email or password.";
          loginMessage.style.color = "#dc3545";
          return;
        }
        saveUser(email, registeredUser.name || email.split("@")[0]);
        loginMessage.textContent = `✓ Welcome, ${escapeHtml(registeredUser.name || email)}!`;
      }
      loginMessage.style.color = "#28a745";
      setTimeout(() => {
        loginModal.style.display = "none";
        loginForm.reset();
        updateLoginButtonUI();
      }, 1500);
    } else {
      loginMessage.textContent = "✗ Invalid email or password (min 6 chars)";
      loginMessage.style.color = "#dc3545";
    }
  });
}

// Registration modal logic
const registerModal = document.getElementById("registerModal");
const closeRegisterBtn = document.getElementById("closeRegisterBtn");
const registerForm = document.getElementById("registerForm");
const registerMessage = document.getElementById("registerMessage");

if (registerBtn) {
  registerBtn.addEventListener("click", () => {
    registerModal.style.display = "flex";
    registerMessage.textContent = "";
  });
}

if (closeRegisterBtn) {
  closeRegisterBtn.addEventListener("click", () => {
    registerModal.style.display = "none";
  });
}

if (registerModal) {
  registerModal.addEventListener("click", (e) => {
    if (e.target === registerModal) {
      registerModal.style.display = "none";
    }
  });
}

if (registerForm) {
  registerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("regName").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const password = document.getElementById("regPassword").value.trim();
    const confirm = document.getElementById("regConfirm").value.trim();

    if (!name) {
      registerMessage.textContent = "✗ Name is required";
      registerMessage.style.color = "#dc3545";
      return;
    }
    if (!email) {
      registerMessage.textContent = "✗ Email is required";
      registerMessage.style.color = "#dc3545";
      return;
    }
    if (password.length < 6) {
      registerMessage.textContent = "✗ Password must be at least 6 characters";
      registerMessage.style.color = "#dc3545";
      return;
    }
    if (password !== confirm) {
      registerMessage.textContent = "✗ Passwords do not match";
      registerMessage.style.color = "#dc3545";
      return;
    }

    const existingUser = findRegisteredUser(email);
    if (existingUser) {
      registerMessage.textContent = "✗ That email is already registered.";
      registerMessage.style.color = "#dc3545";
      return;
    }

    const users = loadRegisteredUsers();
    users.push({ name, email, password });
    saveRegisteredUsers(users);

    registerMessage.textContent = `✓ Account created for ${escapeHtml(name)}!`;
    registerMessage.style.color = "#28a745";

    // Save user to localStorage after registration
    saveUser(email, name);

    setTimeout(() => {
      registerModal.style.display = "none";
      registerForm.reset();
      updateLoginButtonUI();
    }, 1500);
  });
}

// Admin Panel Logic
const adminBtn = document.getElementById("adminBtn");
const adminModal = document.getElementById("adminModal");
const closeAdminBtn = document.getElementById("closeAdminBtn");
const clearReviewsBtn = document.getElementById("clearReviewsBtn");
const logoutAdminBtn = document.getElementById("logoutAdminBtn");
const adminEmail = document.getElementById("adminEmail");
const reviewCount = document.getElementById("reviewCount");

if (adminBtn) {
  adminBtn.addEventListener("click", () => {
    adminModal.style.display = "flex";
    const user = getCurrentUser();
    if (user && adminEmail) {
      adminEmail.textContent = user.email;
    }
    if (reviewCount) {
      const reviews = loadReviews();
      reviewCount.textContent = reviews.length;
    }
  });
}

if (closeAdminBtn) {
  closeAdminBtn.addEventListener("click", () => {
    adminModal.style.display = "none";
  });
}

if (adminModal) {
  adminModal.addEventListener("click", (e) => {
    if (e.target === adminModal) {
      adminModal.style.display = "none";
    }
  });
}

if (clearReviewsBtn) {
  clearReviewsBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to delete all reviews?")) {
      saveReviews([]);
      reviewsList.innerHTML = "";
      reviewCount.textContent = "0";
      alert("All reviews cleared!");
    }
  });
}

if (logoutAdminBtn) {
  logoutAdminBtn.addEventListener("click", () => {
    clearUser();
    adminModal.style.display = "none";
    updateLoginButtonUI();
    alert("Logged out!");
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    clearUser();
    updateLoginButtonUI();
    alert("Logged out!");
  });
}

const changeAdminPasswordBtn = document.getElementById(
  "changeAdminPasswordBtn",
);
const changePasswordModal = document.getElementById("changePasswordModal");
const closeChangePasswordBtn = document.getElementById(
  "closeChangePasswordBtn",
);
const changePasswordForm = document.getElementById("changePasswordForm");
const changePasswordMessage = document.getElementById("changePasswordMessage");

if (changeAdminPasswordBtn) {
  changeAdminPasswordBtn.addEventListener("click", () => {
    changePasswordModal.style.display = "flex";
    changePasswordMessage.textContent = "";
    changePasswordForm.reset();
  });
}

if (closeChangePasswordBtn) {
  closeChangePasswordBtn.addEventListener("click", () => {
    changePasswordModal.style.display = "none";
  });
}

if (changePasswordModal) {
  changePasswordModal.addEventListener("click", (e) => {
    if (e.target === changePasswordModal) {
      changePasswordModal.style.display = "none";
    }
  });
}

if (changePasswordForm) {
  changePasswordForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const currentPassword = document
      .getElementById("currentAdminPassword")
      .value.trim();
    const newPassword = document
      .getElementById("newAdminPassword")
      .value.trim();
    const confirmPassword = document
      .getElementById("confirmAdminPassword")
      .value.trim();

    if (currentPassword !== getAdminPassword()) {
      changePasswordMessage.textContent = "✗ Current password is incorrect.";
      changePasswordMessage.style.color = "#dc3545";
      return;
    }
    if (newPassword.length < 6) {
      changePasswordMessage.textContent =
        "✗ New password must be at least 6 characters.";
      changePasswordMessage.style.color = "#dc3545";
      return;
    }
    if (newPassword !== confirmPassword) {
      changePasswordMessage.textContent = "✗ New passwords do not match.";
      changePasswordMessage.style.color = "#dc3545";
      return;
    }

    setAdminPassword(newPassword);
    changePasswordMessage.textContent = "✓ Admin password updated.";
    changePasswordMessage.style.color = "#28a745";
    setTimeout(() => {
      changePasswordModal.style.display = "none";
      changePasswordForm.reset();
    }, 1400);
  });
}

// Add Post Form Handler
if (addPostForm) {
  addPostForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const currentUser = getCurrentUser();
    if (!currentUser) {
      alert("Please log in to post.");
      return;
    }

    const fileInput = document.getElementById("postImageFile");
    const caption = document.getElementById("postCaption").value.trim();

    if (!fileInput.files.length) {
      alert("Please select an image.");
      return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const imageUrl = event.target.result;
      const posts = loadPosts();
      const post = {
        id: Date.now().toString(),
        caption: caption || "",
        imageUrl,
        author: currentUser.email,
        createdAt: new Date().toISOString(),
      };
      posts.push(post);
      savePosts(posts);
      addPostForm.reset();
      renderGallery();
      alert("Post uploaded!");
    };

    reader.readAsDataURL(file);
  });
}

// Load and render gallery on page load
renderGallery();
