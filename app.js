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
firebase.auth().onAuthStateChanged(async (user) => {
  // Show loading spinner
  novelListContainer.innerHTML = `<span class="loading loading-dots loading-lg m-auto"></span>`;

  if (user) {
    loginContainer.classList.add("hidden");
    novelPostContainer.classList.remove("hidden");
    profileContainer.classList.remove("hidden");

    profilePic.src = user.photoURL;
    profileName.textContent = user.displayName;
    authStatus.innerHTML = `<p id="lgctn" class="text-gray-700 flex flex-col">Welcome, ${user.displayName}! <button id="logout-btn" class="btn btn-error py-2 px-4 bg-red-500 text-white font-semibold rounded-lg">Logout</button></p>`;

    const logoutBtn = document.getElementById("logout-btn");
    logoutBtn.addEventListener("click", () => {
      firebase.auth().signOut();
    });

    // Load novels after showing spinner
    await loadNovels();
  } else {
    loginContainer.classList.remove("hidden");
    novelPostContainer.classList.add("hidden");
    profileContainer.classList.add("hidden");

    // Clear the spinner and show login message
    novelListContainer.innerHTML = `<p class="text-gray-700">Please log in to post novels.</p>`;
  }
});










// After successful user authentication
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    const usersRef = firebase.database().ref("users");
    const userId = user.uid;
    const userData = {
      displayName: user.displayName || user.email,
      email: user.email,
      photoURL: user.photoURL || "default-profile-pic-url", // Store the user's profile image URL
    };
    usersRef.child(userId).set(userData); // Save user data, including the profile image URL
  }
});

// Fetch list of users
const usersRef = firebase.database().ref("users");
usersRef.once("value").then((snapshot) => {
  // Handle the snapshot containing users data
  snapshot.forEach((userSnapshot) => {
    const user = userSnapshot.val();
    const userName = user.displayName || user.email;
    const userPic = user.photoURL || "default-profile-pic-url"; // Fetch the user's profile picture

    // Populate dropdown with user names and profile pictures
    if (userName.toLowerCase().includes(query.toLowerCase())) {
      const userOption = document.createElement("div");
      userOption.classList.add(
        "cursor-pointer",
        "p-2",
        "flex",
        "items-center",
        "gap-2"
      );

      // Create an image element for the user profile picture
      const userImg = document.createElement("img");
      userImg.src = userPic;
      userImg.alt = `${userName}'s avatar`;
      userImg.classList.add("w-6", "h-6", "rounded-full"); // Adjust the size of the profile picture

      // Add the profile picture and user name to the dropdown item
      userOption.appendChild(userImg);
      userOption.appendChild(document.createTextNode(userName));

      // Attach click event to select user
      userOption.onclick = () => selectUser(novelId, userName, userPic);

      dropdown.appendChild(userOption);
    }
  });
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
searchBarContainer.id = "searchcontain";

const searchBar = document.createElement("input");
searchBar.type = "text";
searchBar.id = "search-bar"; // Added id
searchBar.placeholder = "Search Novels...";
searchBar.className =
  "p-2 border border-gray-300 rounded w-full mr-2 text-white";
searchBarContainer.appendChild(searchBar);

const searchButton = document.createElement("button");
searchButton.id = "search-button"; // Added id
searchButton.textContent = "Search";
searchButton.className = "p-2 bg-blue-500 text-white rounded hover:bg-blue-700";
searchBarContainer.appendChild(searchButton);

novelListContainer.parentElement.insertBefore(
  searchBarContainer,
  novelListContainer
);

// Toggle Like functionality
async function toggleLike(novelId) {
  const user = firebase.auth().currentUser;
  if (!user) {
    alert("Please log in to like a novel.");
    return;
  }

  const novelRef = firebase.database().ref("novels/" + novelId);
  const snapshot = await novelRef.once("value");
  if (snapshot.exists()) {
    const novel = snapshot.val();
    const userLikesRef = firebase
      .database()
      .ref(`novels/${novelId}/likes/${user.uid}`);

    // Check if the user has already liked the novel
    const userLiked = novel.likes && user.uid in novel.likes;
    if (userLiked) {
      // If user has liked, remove their like
      userLikesRef.remove();
    } else {
      // If user hasn't liked, add their like
      userLikesRef.set(true);
    }

    // Reload the novels after toggling like
    loadNovels();
  }
}

const filterNovels = async () => {
  const searchQuery = searchBar.value.toLowerCase();
  const novelsRef = firebase.database().ref("novels");
  const snapshot = await novelsRef.once("value");

  if (snapshot.exists()) {
    const novels = snapshot.val();
    novelListContainer.innerHTML = ""; // Clear the list before appending filtered results

    let foundMatch = false; // Track if any novel matches the search query

    for (let key in novels) {
      const novel = novels[key];

      // Check if the search query matches any part of the novel's title
      if (novel.title.toLowerCase().includes(searchQuery)) {
        foundMatch = true; // Set to true if a match is found

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
         <h3 class="text-lg font-extrabold cursor-pointer mb-2 underline text-blue-500" data-id="${key}">
            ${novel.title}
          </h3>
          <p class="italic mb-4 text-gray-500">by ${novel.userName}</p>
          <button class="btn btn-outline mt-2 like-btn transition-colors duration-300 hover:bg-cyan-400 text-black" data-id="${key}">
            ${userLiked ? "👍🏻 Liked" : "👍🏻 Like"} (${likeCount})
          </button>
        `;
        novelListContainer.appendChild(novelItem);

        // Add click event for viewing chapters
        novelItem
          .querySelector("h3[data-id]")
          .addEventListener("click", (e) => {
            const novelId = e.target.getAttribute("data-id");
            viewChapters(novelId);
          });
      }
    }

    // If no matches were found, show the "No novels" message
    if (!foundMatch) {
      novelListContainer.innerHTML = `<p class="text-gray-700">No novels Named "<i>${searchQuery}</i>"</p>`;
    }

    attachEventListeners(); // Re-attach event listeners for like buttons
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
        <h3 class="text-xl font-extrabold cursor-pointer mb-2 underline text-blue-500" data-id="${key}">
          ${novel.title}
        </h3>
        <p class="italic mb-4 text-gray-500">by ${novel.userName}</p>
        <button class="btn btn-outline mt-2 like-btn transition-colors duration-300 hover:bg-cyan-400 text-black" data-id="${key}">
          ${userLiked ? "👍🏻 Liked" : "👍🏻 Like"} (${likeCount})
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
    novelListContainer.innerHTML = `<p class="text-gray-700">No novels available. Upload A novel</p>`;
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
        <h3 class="text-xl font-extrabold cursor-pointer mb-2 underline text-blue-500" data-id="${key}">
          ${novel.title}
        </h3>
        <p class="italic mb-4 text-gray-500">by ${novel.userName}</p>
        <button class="btn btn-outline mt-2 like-btn transition-colors duration-300 hover:bg-cyan-400    text-black" data-id="${key}">
          ${userLiked ? "👍🏻 Liked" : "👍🏻 Like"} (${likeCount})
        </button>
      `;

      // Add edit and delete buttons if the logged-in user is the owner of the novel
      const user = firebase.auth().currentUser;
      if (user && novel.userId === user.uid) {
        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.classList.add("btn", "btn-outline", "mt-2", "text-blue-500");
        editButton.addEventListener("click", () => editNovel(key));

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.classList.add(
          "btn",
          "btn-outline",
          "mt-2",
          "text-red-500"
        );
        deleteButton.addEventListener("click", () => deleteNovel(key));

        novelItem.appendChild(editButton);
        novelItem.appendChild(deleteButton);
      }

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

function editNovel(novelId) {
  const novelRef = firebase.database().ref("novels/" + novelId);
  novelRef.once("value").then((snapshot) => {
    if (snapshot.exists()) {
      const novel = snapshot.val();
      // Pre-fill the form with the current novel data
      novelTitle.value = novel.title;
      novelContent.value = novel.chapters[0]?.content || "";

      // Update the post button to save changes
      postBtn.textContent = "Update Novel";
      postBtn.removeEventListener("click", postNovel); // Remove the original event listener
      postBtn.addEventListener("click", () => updateNovel(novelId)); // Add new listener for update
    }
  });
}

function updateNovel(novelId) {
  const title = novelTitle.value.trim();
  const content = novelContent.value.trim();
  if (title && content) {
    const user = firebase.auth().currentUser;
    const novelRef = firebase.database().ref("novels/" + novelId);

    // Get the current data for the chapters
    novelRef.once("value").then((snapshot) => {
      if (snapshot.exists()) {
        const novel = snapshot.val();
        const updatedChapters = novel.chapters || [];

        // Update the first chapter (or append a new chapter if necessary)
        updatedChapters[0] = { content: content }; // If you want to update the first chapter

        // If you want to add a new chapter instead, you can push to the array
        // updatedChapters.push({ content: content });

        // Update the novel data
        novelRef
          .update({
            title: title,
            chapters: updatedChapters,
          })
          .then(() => {
            // Reload novels after update
            loadNovels();

            // Reset the form and button
            novelTitle.value = "";
            novelContent.value = "";
            postBtn.textContent = "Post Novel"; // Reset button text to "Post Novel"
          })
          .catch((error) => {
            console.error("Error updating novel:", error);
          });
      }
    });
  }
}

function deleteNovel(novelId) {
  const confirmDelete = confirm("Are you sure you want to delete this novel?");
  if (confirmDelete) {
    const novelRef = firebase.database().ref("novels/" + novelId);
    novelRef.remove();
    loadNovels(); // Reload the novels after deletion
  }
}

function displayChapter(chapters, index) {
  // Convert the novel content to HTML by replacing line breaks with <br> tags
  const contentWithLineBreaks = chapters[index].content.replace(/\n/g, "<br>");

  // Display the content with line breaks
  chapterList.innerHTML = `<p><h1 class="font-semibold italic text-lg">~Start~</h1> <br>${contentWithLineBreaks}</p>`;
}
