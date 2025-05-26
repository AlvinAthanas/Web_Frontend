// sacraments.js - Shared functionality for all sacrament pages

// Global variables
let participants = {
  training: [],
  completed: [],
};

// DOM Elements
let addMemberBtn,
  overlay,
  searchDialog,
  closeDialogBtn,
  searchForm,
  searchInput;
let searchResults, trainingList, completedList, trainingCount, completedCount;
let trainingCountDisplay, completedCountDisplay;
let sacramentType; // Will be set by each page

// Initialize the page
function initSacramentPage(type) {
  sacramentType = type;

  // Get DOM elements
  addMemberBtn = document.getElementById("addMemberBtn");
  overlay = document.getElementById("overlay");
  searchDialog = document.getElementById("searchDialog");
  closeDialogBtn = document.getElementById("closeDialogBtn");
  searchForm = document.getElementById("searchForm");
  searchInput = document.getElementById("searchInput");
  searchResults = document.getElementById("searchResults");
  trainingList = document.getElementById("training-list");
  completedList = document.getElementById("completed-list");
  trainingCount = document.getElementById("training-count");
  completedCount = document.getElementById("completed-count");
  trainingCountDisplay = document.getElementById("training-count-display");
  completedCountDisplay = document.getElementById("completed-count-display");

  // Set up event listeners
  setupEventListeners();

  // Load initial data
  fetchParticipants();

  // Set initial state of add member button
  addMemberBtn.style.display = "flex"; // Show by default
}

function setupEventListeners() {
  // Tab switching functionality
  const tabs = document.querySelectorAll(".tab");

  tabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      // Remove active class from all tabs and content
      document
        .querySelectorAll(".tab")
        .forEach((t) => t.classList.remove("active"));
      document
        .querySelectorAll(".tab-content")
        .forEach((c) => c.classList.remove("active"));

      // Add active class to clicked tab
      this.classList.add("active");

      // Show corresponding content
      const tabId = this.getAttribute("data-tab");
      document.getElementById(tabId + "-content").classList.add("active");

      // Show/hide add member button based on active tab
      const addMemberBtn = document.getElementById("addMemberBtn");
      if (tabId === "completed") {
        addMemberBtn.style.display = "none";
      } else {
        addMemberBtn.style.display = "flex"; // Or 'block' depending on your CSS
      }
    });
  });

  // Add member button click handler
  addMemberBtn.addEventListener("click", function () {
    overlay.classList.add("active");
    searchDialog.classList.add("active");
    searchInput.focus();
  });

  // Close dialog button
  closeDialogBtn.addEventListener("click", closeSearchDialog);
  overlay.addEventListener("click", closeSearchDialog);

  // Search form submission
  searchForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const searchTerm = searchInput.value.trim();
    if (searchTerm) {
      searchUsers(searchTerm);
    }
  });

  // Real-time search as user types
  searchInput.addEventListener("input", function() {
    const searchTerm = this.value.trim();
    if (searchTerm) {
      searchUsers(searchTerm);
    } else {
      searchResults.innerHTML = "";
    }
  });
}

function closeSearchDialog() {
  overlay.classList.remove("active");
  searchDialog.classList.remove("active");
  searchResults.innerHTML = "";
  searchInput.value = "";
}

// Fetch all participants (using existing users endpoint)
async function fetchParticipants() {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("No authentication token found");
      return;
    }

    const response = await fetch("/users", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    const allUsers = await response.json();

    // Filter users based on sacrament type
    participants.training = allUsers.filter(
      (user) => user[`${sacramentType}Status`] === "training"
    );
    participants.completed = allUsers.filter(
      (user) => user[`${sacramentType}Status`] === "completed"
    );

    // Update UI
    updateParticipantsList();
    updateCounts();
  } catch (error) {
    console.error("Error fetching participants:", error);
  }
}

// Search users in the system
async function searchUsers(name) {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("No authentication token found");
      searchResults.innerHTML = '<div class="search-result-item">Authentication error</div>';
      return;
    }

    const response = await fetch(
      `http://localhost:8080/user/search?name=${encodeURIComponent(name)}`,
      {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      }
    );
    const users = await response.json();

    // Filter out users already in the lists
    const existingIds = [
      ...participants.training.map((p) => p.id),
      ...participants.completed.map((p) => p.id),
    ];

    const availableUsers = users.filter(
      (user) => !existingIds.includes(user.id)
    );

    // Display results
    displaySearchResults(availableUsers);
  } catch (error) {
    console.error("Error searching users:", error);
    searchResults.innerHTML =
      '<div class="search-result-item">Error searching users</div>';
  }
}

// Display search results
function displaySearchResults(users) {
  if (users.length === 0) {
    searchResults.innerHTML =
      '<div class="search-result-item">No users found</div>';
    return;
  }

  searchResults.innerHTML = users
    .map(
      (user) => `
    <div class="search-result-item">
      <div class="search-result-info">
        <div class="search-result-name">${user.name}</div>
        <div class="search-result-email">${user.email}</div>
        <div class="search-result-phone">${user.phone}</div>
      </div>
      <button class="add-btn" data-user-id="${user.id}">
        <span class="material-icons-outlined">add</span>
        Add
      </button>
    </div>
  `
    )
    .join("");

  // Add event listeners to add buttons
  document.querySelectorAll(".add-btn").forEach((btn) => {
    btn.addEventListener("click", async function () {
      const userId = this.getAttribute("data-user-id");
      const user = users.find((u) => u.id == userId);
      await addParticipant(user);
      closeSearchDialog();
    });
  });
}

// Add participant to training list using updateUser endpoint
async function addParticipant(user) {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("No authentication token found");
      alert("Authentication error. Please login again.");
      return;
    }

    const response = await fetch(`/user/${user.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        [`${sacramentType}Status`]: "training",
      }),
    });

    if (response.ok) {
      // Add to local list and update UI
      participants.training.push({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        status: "training",
      });

      updateParticipantsList();
      updateCounts();
    } else {
      console.error("Error adding participant:", await response.text());
      alert("Failed to add participant");
    }
  } catch (error) {
    console.error("Error adding participant:", error);
    alert("Error adding participant");
  }
}

// Move participant to completed using updateUser endpoint
async function completeTraining(participantId) {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("No authentication token found");
      alert("Authentication error. Please login again.");
      return;
    }

    const response = await fetch(`/user/${participantId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        [`${sacramentType}Status`]: "completed",
      }),
    });

    if (response.ok) {
      // Find and move the participant
      const participantIndex = participants.training.findIndex(
        (p) => p.id == participantId
      );
      if (participantIndex !== -1) {
        const participant = participants.training[participantIndex];
        participant.status = "completed";

        participants.training.splice(participantIndex, 1);
        participants.completed.push(participant);

        updateParticipantsList();
        updateCounts();
      }
    } else {
      console.error("Error completing training:", await response.text());
      alert("Failed to update status");
    }
  } catch (error) {
    console.error("Error completing training:", error);
    alert("Error updating status");
  }
}

// Update participants lists in UI
function updateParticipantsList() {
  // Training list
  trainingList.innerHTML = participants.training
    .map(
      (participant) => `
    <li class="participant-item">
      <div class="participant-info">
        <div class="participant-name">${participant.name}</div>
        <div class="participant-email">${participant.email}</div>
        <div class="participant-phone">${participant.phone}</div>
      </div>
      <span class="participant-status status-in-training">In Training</span>
      <button class="complete-btn" data-participant-id="${participant.id}">
        <span class="material-icons-outlined">check</span>
        Complete
      </button>
    </li>
  `
    )
    .join("");

  // Add event listeners to complete buttons
  document.querySelectorAll(".complete-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const participantId = this.getAttribute("data-participant-id");
      if (
        confirm(
          `Mark ${
            this.closest(".participant-item").querySelector(".participant-name")
              .textContent
          } as completed?`
        )
      ) {
        completeTraining(participantId);
      }
    });
  });

  // Completed list
  completedList.innerHTML = participants.completed
    .map(
      (participant) => `
    <li class="participant-item">
      <div class="participant-info">
        <div class="participant-name">${participant.name}</div>
        <div class="participant-email">${participant.email}</div>
        <div class="participant-phone">${participant.phone}</div>
      </div>
      <span class="participant-status status-completed">Completed</span>
    </li>
  `
    )
    .join("");
}

// Update counts in UI
function updateCounts() {
  const trainingCountValue = participants.training.length;
  const completedCountValue = participants.completed.length;

  trainingCount.textContent = trainingCountValue;
  completedCount.textContent = completedCountValue;
  trainingCountDisplay.textContent = trainingCountValue;
  completedCountDisplay.textContent = completedCountValue;
}
