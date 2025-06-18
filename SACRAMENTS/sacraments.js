// sacraments.js - Shared functionality for all sacrament pages

// Global variables
let participants = {
    training: [],
    completed: []
};

// DOM Elements
let addMemberBtn, overlay, searchDialog, closeDialogBtn, searchForm, searchInput;
let searchResults, trainingList, completedList, trainingCount, completedCount;
let trainingCountDisplay, completedCountDisplay;
let sacramentType;
let addMemberForm, newMemberName, newMemberEmail, newMemberPhone;
let searchTab, addTab, searchContent, addContent;

// Base URL for API endpoints
const API_BASE_URL = "http://localhost:8080";

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
    addMemberForm = document.getElementById("addMemberForm");
    newMemberName = document.getElementById("newMemberName");
    newMemberEmail = document.getElementById("newMemberEmail");
    newMemberPhone = document.getElementById("newMemberPhone");
    searchTab = document.getElementById("searchTab");
    addTab = document.getElementById("addTab");
    searchContent = document.getElementById("searchContent");
    addContent = document.getElementById("addContent");

    // Set up event listeners
    setupEventListeners();

    // Load initial data
    fetchParticipants();
}

function setupEventListeners() {
    // Tab switching functionality
    document.querySelectorAll(".tab").forEach(tab => {
        tab.addEventListener("click", function() {
            document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
            document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
            this.classList.add("active");
            document.getElementById(this.getAttribute("data-tab") + "-content").classList.add("active");
            addMemberBtn.style.display = this.getAttribute("data-tab") === "completed" ? "none" : "flex";
        });
    });

    // Dialog tab switching
    searchTab.addEventListener("click", () => switchDialogTab("search"));
    addTab.addEventListener("click", () => switchDialogTab("add"));

    // Add member button
    addMemberBtn.addEventListener("click", () => {
        overlay.classList.add("active");
        searchDialog.classList.add("active");
        switchDialogTab("search");
        searchInput.focus();
    });

    // Close dialog
    closeDialogBtn.addEventListener("click", closeSearchDialog);
    overlay.addEventListener("click", closeSearchDialog);

    // Search form
    searchForm.addEventListener("submit", e => {
        e.preventDefault();
        const searchTerm = searchInput.value.trim();
        if (searchTerm) searchUsers(searchTerm);
    });

    // Real-time search
    searchInput.addEventListener("input", function() {
        const searchTerm = this.value.trim();
        searchResults.innerHTML = searchTerm ? "" : "";
        if (searchTerm) searchUsers(searchTerm);
    });

    // Add member form
    addMemberForm.addEventListener("submit", async e => {
        e.preventDefault();
        await addNewMember();
    });
}

function switchDialogTab(tabType) {
    searchTab.classList.remove("active");
    addTab.classList.remove("active");
    searchContent.classList.remove("active");
    addContent.classList.remove("active");

    if (tabType === "search") {
        searchTab.classList.add("active");
        searchContent.classList.add("active");
    } else {
        addTab.classList.add("active");
        addContent.classList.add("active");
    }
}

function closeSearchDialog() {
    overlay.classList.remove("active");
    searchDialog.classList.remove("active");
    searchResults.innerHTML = "";
    searchInput.value = "";
    addMemberForm.reset();
}

async function addNewMember() {
    const name = newMemberName.value.trim();
    const email = newMemberEmail.value.trim();
    const phone = newMemberPhone.value.trim();

    if (!name || !email || !phone) {
        alert("Please fill in all fields");
        return;
    }

    try {
        const token = localStorage.getItem("authToken");
        if (!token) {
            alert("Authentication error. Please login again.");
            return;
        }

        // Create new user
        const response = await fetch(`${API_BASE_URL}/user`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                name,
                email,
                phone,
                baptismStatus: "training"
            })
        });

        if (response.ok) {
            const newUser = await response.json();
            participants.training.push({
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                phone: newUser.phone,
                status: "training"
            });

            updateParticipantsList();
            updateCounts();
            closeSearchDialog();
            alert(`${name} has been added successfully!`);
        } else {
            alert("Failed to add new member: " + await response.text());
        }
    } catch (error) {
        console.error("Error adding new member:", error);
        alert("Error adding new member");
    }
}

async function fetchParticipants() {
    try {
        const token = localStorage.getItem("authToken");
        if (!token) {
            console.error("No authentication token found");
            return;
        }

        const response = await fetch(`${API_BASE_URL}/users`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (response.ok) {
            const allUsers = await response.json();
            participants.training = allUsers.filter(user => user.baptismStatus === "training");
            participants.completed = allUsers.filter(user => user.baptismStatus === "completed");
            updateParticipantsList();
            updateCounts();
        } else {
            console.error("Error fetching participants:", await response.text());
        }
    } catch (error) {
        console.error("Error fetching participants:", error);
    }
}

async function searchUsers(name) {
    try {
        const token = localStorage.getItem("authToken");
        if (!token) {
            searchResults.innerHTML = '<div class="search-result-item">Authentication error</div>';
            return;
        }

        const response = await fetch(`${API_BASE_URL}/user/search?name=${encodeURIComponent(name)}`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (response.ok) {
            const users = await response.json();
            const existingIds = [...participants.training, ...participants.completed].map(p => p.id);
            const availableUsers = users.filter(user => !existingIds.includes(user.id));
            displaySearchResults(availableUsers);
        } else {
            searchResults.innerHTML = '<div class="search-result-item">Error searching users</div>';
        }
    } catch (error) {
        console.error("Error searching users:", error);
        searchResults.innerHTML = '<div class="search-result-item">Error searching users</div>';
    }
}

function displaySearchResults(users) {
    searchResults.innerHTML = users.length === 0
        ? '<div class="search-result-item">No users found</div>'
        : users.map(user => `
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
        `).join("");

    document.querySelectorAll(".add-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
            const userId = btn.getAttribute("data-user-id");
            const user = users.find(u => u.id == userId);
            await addParticipant(user);
            closeSearchDialog();
        });
    });
}

async function addParticipant(user) {
    try {
        const token = localStorage.getItem("authToken");
        if (!token) {
            alert("Authentication error. Please login again.");
            return;
        }

        const response = await fetch(`${API_BASE_URL}/user/${user.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ baptismStatus: "training" })
        });

        if (response.ok) {
            participants.training.push({
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                status: "training"
            });
            updateParticipantsList();
            updateCounts();
        } else {
            alert("Failed to add participant: " + await response.text());
        }
    } catch (error) {
        console.error("Error adding participant:", error);
        alert("Error adding participant");
    }
}

async function completeTraining(participantId) {
    try {
        const token = localStorage.getItem("authToken");
        if (!token) {
            alert("Authentication error. Please login again.");
            return;
        }

        const response = await fetch(`${API_BASE_URL}/user/${participantId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ baptismStatus: "completed" })
        });

        if (response.ok) {
            const participantIndex = participants.training.findIndex(p => p.id == participantId);
            if (participantIndex !== -1) {
                const participant = participants.training[participantIndex];
                participant.status = "completed";
                participants.training.splice(participantIndex, 1);
                participants.completed.push(participant);
                updateParticipantsList();
                updateCounts();
            }
        } else {
            alert("Failed to update status: " + await response.text());
        }
    } catch (error) {
        console.error("Error completing training:", error);
        alert("Error updating status");
    }
}

function updateParticipantsList() {
    trainingList.innerHTML = participants.training.map(participant => `
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
    `).join("");

    document.querySelectorAll(".complete-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const participantId = btn.getAttribute("data-participant-id");
            const name = btn.closest(".participant-item").querySelector(".participant-name").textContent;
            if (confirm(`Mark ${name} as completed?`)) {
                completeTraining(participantId);
            }
        });
    });

    completedList.innerHTML = participants.completed.map(participant => `
        <li class="participant-item">
            <div class="participant-info">
                <div class="participant-name">${participant.name}</div>
                <div class="participant-email">${participant.email}</div>
                <div class="participant-phone">${participant.phone}</div>
            </div>
            <span class="participant-status status-completed">Completed</span>
        </li>
    `).join("");
}

function updateCounts() {
    const trainingCountValue = participants.training.length;
    const completedCountValue = participants.completed.length;

    trainingCount.textContent = trainingCountValue;
    completedCount.textContent = completedCountValue;
    trainingCountDisplay.textContent = trainingCountValue;
    completedCountDisplay.textContent = completedCountValue;
}