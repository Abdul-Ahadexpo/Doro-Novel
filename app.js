// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyA3kVwiDyZM172-vMdlP8asqv8bE55_E_8",
  authDomain: "doro-novel.firebaseapp.com",
  databaseURL: "https://doro-novel-default-rtdb.firebaseio.com",
  projectId: "doro-novel",
  storageBucket: "doro-novel.firebasestorage.app",
  messagingSenderId: "920808024384",
  appId: "1:920808024384:web:c01add4641e996030c32a5",
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

// Now you can use `auth` and `db` as needed.

// DOM elements
const loginBtn = document.getElementById("login-btn");
const authStatus = document.getElementById("auth-status");
const loginContainer = document.getElementById("login-container");
const profileContainer = document.getElementById("profile-container");
const profilePic = document.getElementById("profile-pic");
const profileName = document.getElementById("profile-name");
const novelPostContainer = document.getElementById("novel-post-container");
const novelTitle = document.getElementById("novel-title");
const novelContent = document.getElementById("novel-content");
const postBtn = document.getElementById("post-btn");
const novelListContainer = document.getElementById("novel-list");
const chapterContainer = document.getElementById("chapter-container");
const chapterTitle = document.getElementById("chapter-title");
const chapterList = document.getElementById("chapter-list");
const nextBtn = document.getElementById("next-btn");
const backBtn = document.getElementById("back-btn");
const uploadNovelBtn = document.getElementById("upload-novel");
const viewMyNovelsBtn = document.getElementById("view-my-novels");

// Google login handler
loginBtn.addEventListener("click", async () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  try {
    await firebase.auth().signInWithPopup(provider);
  } catch (error) {
    console.error(error);
  }
});
// Firebase Authentication State Change
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    loginContainer.classList.add("hidden");
    novelPostContainer.classList.remove("hidden");
    profileContainer.classList.remove("hidden");

    profilePic.src = user.photoURL;
    profileName.textContent = user.displayName;
    authStatus.innerHTML = `<p id="lgctn"  class="text-gray-700 flex flex-col">Welcome, ${user.displayName}! <button id="logout-btn" class="btn btn-error py-2 px-4 bg-red-500 text-white font-semibold rounded-lg">Logout</button></p>`;

    const logoutBtn = document.getElementById("logout-btn");
    logoutBtn.addEventListener("click", () => {
      firebase.auth().signOut();
    });

    loadNovels();
  } else {
    loginContainer.classList.remove("hidden");
    novelPostContainer.classList.add("hidden");
    profileContainer.classList.add("hidden");
    authStatus.innerHTML = `<p class="text-gray-700">Please log in to post novels.</p>`;
  }
});

// Event listener for "Upload New Novel"
uploadNovelBtn.addEventListener("click", () => {
  novelPostContainer.classList.remove("hidden");
  novelListContainer.classList.add("hidden");
  chapterContainer.classList.add("hidden");
});

// Add a search bar and button above the novel list
const searchBarContainer = document.createElement("div");
searchBarContainer.className = "flex items-center mb-4";

const searchBar = document.createElement("input");
searchBar.type = "text";
searchBar.placeholder = "Search Novels...";
searchBar.className =
  "p-2 border border-gray-300 rounded w-full mr-2 text-white";
searchBarContainer.appendChild(searchBar);

const searchButton = document.createElement("button");
searchButton.textContent = "Search";
searchButton.className = "p-2 bg-blue-500 text-white rounded hover:bg-blue-700";
searchBarContainer.appendChild(searchButton);

novelListContainer.parentElement.insertBefore(
  searchBarContainer,
  novelListContainer
);

// Function to filter novels
const filterNovels = async () => {
  const searchQuery = searchBar.value.toLowerCase();
  const novelsRef = firebase.database().ref("novels");
  const snapshot = await novelsRef.once("value");
  if (snapshot.exists()) {
    const novels = snapshot.val();
    novelListContainer.innerHTML = ""; // Clear the list before appending filtered results
    for (let key in novels) {
      const novel = novels[key];
      if (novel.title.toLowerCase().includes(searchQuery)) {
        const likeCount = novel.likes ? Object.keys(novel.likes).length : 0;
        const userLiked =
          novel.likes && firebase.auth().currentUser?.uid in novel.likes;

        const novelItem = document.createElement("div");
        novelItem.classList.add(
          "p-6",
          "bg-gradient-to-r",
          "from-purple-700",
          "via-pink-500",
          "to-red-500",
          "text-white",
          "rounded-lg",
          "shadow-2xl",
          "mb-6",
          "transition-transform",
          "transform",
          "hover:scale-110",
          "hover:shadow-2xl",
          "hover:border-4",
          "hover:border-cyan-400",
          "hover:bg-gradient-to-r",
          "hover:from-green-400",
          "hover:via-blue-500",
          "hover:to-purple-600"
        );
        novelItem.innerHTML = `
          <h3 class="text-black text-2xl font-extrabold cursor-pointer mb-2 underline text-blue-500" data-id="${key}">
            ${novel.title}
          </h3>
          <p class="italic mb-4 text-gray-500">by ${novel.userName}</p>
          <button class="btn btn-outline mt-2 like-btn transition-colors duration-300 hover:bg-cyan-400 hover:text-black" data-id="${key}">
            ${userLiked ? "👎🏿 Unlike" : "👍🏻 Like"} (${likeCount})
          </button>
        `;
        novelListContainer.appendChild(novelItem);
      }
    }
    attachEventListeners(); // Re-attach event listeners for titles and like buttons
  }
};

// Add event listeners
searchBar.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    filterNovels();
  }
});

searchButton.addEventListener("click", filterNovels);

// Event listener for "View My Novels"
viewMyNovelsBtn.addEventListener("click", async () => {
  const user = firebase.auth().currentUser;
  const novelsRef = firebase.database().ref("novels");
  const snapshot = await novelsRef
    .orderByChild("userId")
    .equalTo(user.uid)
    .once("value");
  if (snapshot.exists()) {
    const novels = snapshot.val();
    novelListContainer.innerHTML = "";
    for (let key in novels) {
      const novel = novels[key];
      const likeCount = novel.likes ? Object.keys(novel.likes).length : 0;
      const userLiked =
        novel.likes && firebase.auth().currentUser.uid in novel.likes;

      const novelItem = document.createElement("div");
      novelItem.classList.add(
        "p-6",
        "bg-gradient-to-r",
        "from-purple-700",
        "via-pink-500",
        "to-red-500",
        "text-white",
        "rounded-lg",
        "shadow-2xl",
        "mb-6",
        "transition-transform",
        "transform",
        "hover:scale-110",
        "hover:shadow-2xl",
        "hover:border-4",
        "hover:border-cyan-400",
        "hover:bg-gradient-to-r",
        "hover:from-green-400",
        "hover:via-blue-500",
        "hover:to-purple-600"
      );
      novelItem.innerHTML = `
        <h3 class="text-black text-2xl font-extrabold cursor-pointer mb-2 underline text-blue-500" data-id="${key}">
          ${novel.title}
        </h3>
        <p class="italic mb-4 text-gray-500">by ${novel.userName}</p>
        <button class="btn btn-outline mt-2 like-btn transition-colors duration-300 hover:bg-cyan-400 hover:text-black" data-id="${key}">
          ${userLiked ? "👎🏿 Unlike" : "👍🏻 Like"} (${likeCount})
        </button>
      `;
      novelListContainer.appendChild(novelItem);
    }

    // Add event listeners to novel titles
    document.querySelectorAll("h3[data-id]").forEach((title) => {
      title.addEventListener("click", (e) => {
        const novelId = e.target.getAttribute("data-id");
        viewChapters(novelId);
      });
    });

    // Add event listeners for like buttons
    document.querySelectorAll(".like-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const novelId = e.target.getAttribute("data-id");
        toggleLike(novelId);
      });
    });
  } else {
    novelListContainer.innerHTML = `<p class="text-gray-700">No novels available.</p>`;
  }
  novelListContainer.classList.remove("hidden");
  novelPostContainer.classList.add("hidden");
  chapterContainer.classList.add("hidden");
});

// Post Novel
postBtn.addEventListener("click", () => {
  const title = novelTitle.value.trim();
  const content = novelContent.value.trim();
  if (title && content) {
    const user = firebase.auth().currentUser;
    const newNovelRef = firebase.database().ref("novels").push();
    newNovelRef.set({
      userId: user.uid,
      userName: user.displayName,
      title: title,
      chapters: [{ content: content }],
      likes: 0,
    });
    novelTitle.value = "";
    novelContent.value = "";
    loadNovels();
  }
});

// Load Novels
async function loadNovels() {
  const novelsRef = firebase.database().ref("novels");
  const snapshot = await novelsRef.once("value");
  if (snapshot.exists()) {
    const novels = snapshot.val();
    novelListContainer.innerHTML = "";
    for (let key in novels) {
      const novel = novels[key];
      const likeCount = novel.likes ? Object.keys(novel.likes).length : 0;
      const userLiked =
        novel.likes && firebase.auth().currentUser.uid in novel.likes;

      const novelItem = document.createElement("div");
      novelItem.classList.add(
        "p-6",
        "bg-gradient-to-r",
        "from-purple-700",
        "via-pink-500",
        "to-red-500",
        "text-white",
        "rounded-lg",
        "shadow-2xl",
        "mb-6",
        "transition-transform",
        "transform",
        "hover:scale-110",
        "hover:shadow-2xl",
        "hover:border-4",
        "hover:border-cyan-400",
        "hover:bg-gradient-to-r",
        "hover:from-green-400",
        "hover:via-blue-500",
        "hover:to-purple-600"
      );
      novelItem.innerHTML = `
        <h3 class="text-black text-2xl font-extrabold cursor-pointer mb-2 underline text-blue-500" data-id="${key}">
          ${novel.title}
        </h3>
        <p class="italic mb-4 text-gray-500">by ${novel.userName}</p>
        <button class="btn btn-outline mt-2 like-btn transition-colors duration-300 hover:bg-cyan-400 hover:text-black" data-id="${key}">
          ${userLiked ? "👎🏿 Unlike" : "👍🏻 Like"} (${likeCount})
        </button>
      `;
      novelListContainer.appendChild(novelItem);
    }

    // Add event listeners to novel titles
    document.querySelectorAll("h3[data-id]").forEach((title) => {
      title.addEventListener("click", (e) => {
        const novelId = e.target.getAttribute("data-id");
        viewChapters(novelId);
      });
    });

    // Add event listeners for like buttons
    document.querySelectorAll(".like-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const novelId = e.target.getAttribute("data-id");
        toggleLike(novelId);
      });
    });
  } else {
    novelListContainer.innerHTML = `<p class="text-gray-700">No novels available.</p>`;
  }
}

// View Chapters
let currentChapterIndex = 0;

async function viewChapters(novelId) {
  const novelRef = firebase.database().ref("novels/" + novelId);
  const snapshot = await novelRef.once("value");
  if (snapshot.exists()) {
    const novel = snapshot.val();
    novelListContainer.classList.add("hidden");
    novelPostContainer.classList.add("hidden");
    chapterContainer.classList.remove("hidden");

    chapterTitle.textContent = novel.title;
    chapterList.innerHTML = "";
    currentChapterIndex = 0;

    displayChapter(novel.chapters, currentChapterIndex);

    nextBtn.addEventListener("click", () => {
      currentChapterIndex++;
      if (currentChapterIndex < novel.chapters.length) {
        displayChapter(novel.chapters, currentChapterIndex);
      }
    });

    backBtn.addEventListener("click", () => {
      chapterContainer.classList.add("hidden");
      novelListContainer.classList.remove("hidden");
      novelPostContainer.classList.remove("hidden");
    });
  }
}

function displayChapter(chapters, index) {
  chapterList.innerHTML = `<p>Chapter ${index + 1}: ${
    chapters[index].content
  }</p>`;
}
