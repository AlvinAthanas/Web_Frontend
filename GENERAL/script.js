// Accessing Header, Sidebar and Main

document.addEventListener("DOMContentLoaded", function () {
  loadComponent("../GENERAL/General.html", "containerId", function () {
    modeToogle();
    setupDropdowns();
    openSidebar();
    closeSidebar();
    loadParishName(); // <-- Call after sidebar is loaded
    setupLogout(); // <-- Add logout logic here

    restrictSidebarByRole(); // Restrict sidebar based on user role
  });
});

function loadComponent(file, containerId, callback) {
  fetch(file)
    .then((response) => response.text())
    .then((data) => {
      document
        .getElementById(containerId)
        .insertAdjacentHTML("beforeend", data);
      if (callback) callback(); //Run additional setup
    })
    .catch((error) => console.error("error loading component", error));
}

// Dropdown Styling
function setupDropdowns() {
  document.querySelectorAll(".dropdown-toggle").forEach((item) => {
    item.addEventListener("click", function () {
      const parent = this.parentElement;
      parent.classList.toggle("active");
    });
  });
}

// Dark Mode and Light mode toogle
function modeToogle() {
  const body = document.querySelector("body");
  if (!body) return;

  const toogle = body.querySelector(".toogle"),
    modeSwitch = body.querySelector(".toogle-switch"),
    modeText = body.querySelector(".mode-text");

  if (!modeSwitch) {
    console.warn("Mode switch element not found");
    return;
  }

  modeSwitch.addEventListener("click", () => {
    body.classList.toggle("dark");

    if (modeText) {
      if (body.classList.contains("dark")) {
        modeText.innerText = "Light Mode";
      } else {
        modeText.innerText = "Dark Mode";
      }
    }
  });
}

// Opening the sidebar
function openSidebar() {
  const sidebar = document.getElementById("sidebar");
  if (sidebar) {
    sidebar.classList.add("sidebar-responsive");
  }
}

// Closing the sidebar
function closeSidebar() {
  const sidebar = document.getElementById("sidebar");
  if (sidebar) {
    sidebar.classList.remove("sidebar-responsive");
  }
}

// Function to extract user info from localStorage
function getUserFromStorage() {
  try {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  } catch (e) {
    return null;
  }
}

// Function to fetch and display parish name
async function loadParishName() {
  try {
    const authToken = localStorage.getItem("authToken");
    const user = getUserFromStorage();
    if (!authToken || !user || !user.parishId) {
      const el = document.getElementById("parish-name");
      if (el) el.textContent = "PARISH";
      return;
    }

    const parishResponse = await fetch(
      `http://76.13.14.56:8080/api/parish/${user.parishId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (parishResponse.ok) {
      const parish = await parishResponse.json();
      const el = document.getElementById("parish-name");
      if (el) el.textContent = parish.name || "PARISH";
    } else {
      const el = document.getElementById("parish-name");
      if (el) el.textContent = "PARISH";
    }
  } catch (error) {
    const el = document.getElementById("parish-name");
    if (el) el.textContent = "PARISH";
  }
}

// Move logout logic here
function setupLogout() {
  document.querySelectorAll(".logout").forEach((item) => {
    item.addEventListener("click", function (event) {
      event.preventDefault();
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      window.location.href = this.getAttribute("href");
    });
  });
}

// After getting the logged-in user info
const user = getUserFromStorage();
if (user && user.parishId) {
  localStorage.setItem("parishId", user.parishId);
}

// Store the user's community group in localStorage
if (user && Array.isArray(user.groups)) {
  const communityGroup = user.groups.find((g) => g.description === "community");
  if (communityGroup) {
    localStorage.setItem("currentCommunity", JSON.stringify(communityGroup));
  } else {
    // Remove any previous community if user has none
    localStorage.removeItem("currentCommunity");
  }
} else {
  // Remove any previous community if user has none
  localStorage.removeItem("currentCommunity");
}

function parseJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Failed to parse JWT:", e);
    return null;
  }
}

function restrictSidebarByRole() {
  const token = localStorage.getItem("authToken");
  if (!token) {
    console.warn("No authToken found.");
    return;
  }

  const payload = parseJwt(token);
  console.log("Parsed JWT:", payload);
  const roles = payload?.roles || [];

  const allPages = [
    "dashboard.html",
    "about_church.html",
    "roles.html",
    "members.html",
    "contribution.html",
    "schedules.html",
    "events.html",
    "community.html",
    "projects.html",
    "sacraments.html",
    "announcement.html",
    "reports.html",
    "feedback.html",
    "index.html", // Logout
  ];

  // Role-based access map
  const visibilityRules = {
    ROLE_CATECHIST: [
      "sacraments.html",
      "feedback.html",
      "announcement.html",
      // "index.html"
    ],
    ROLE_COMMUNITY_CHAIRPERSON: [
      "trial.html",
      "feedback.html",
      // "index.html"
    ],
    ROLE_COMMUNITY_SECRETARY: [
      "trial.html",
      "feedback.html",
      // "index.html"
    ],
    ROLE_COMMUNITY_TREASURER: [
      "trial.html",
      "feedback.html",
      // "index.html"
    ],
    ROLE_COMMITTEE_TREASURER: [
      "Treasurer_dashboard.html",
      "contribution.html",
      "projects.html",
      "feedback.html",
      "expenses.html",
      // "index.html"
    ],
    ROLE_COMMITTEE_SECRETARY: [
      "dashboard.html",
      "members.html",
      "events.html",
      "schedules.html",
      "projects.html",
      "feedback.html",
      "announcement.html",
      "index.html",
    ],
    ROLE_COMMITTEE_CHAIRPERSON: [
      "dashboard.html",
      "members.html",
      "roles.html",
      "contribution.html",
      "reports.html",
      "events.html",
      "schedules.html",
      "projects.html",
      "feedback.html",
      "announcement.html",
      "index.html",
    ],
    ROLE_PARISHIONER: [
      "dashboard.html",
      "about_church.html",
      "members.html",
      "roles.html",
      "community.html",
      "contribution.html",
      "Schedules.html",
      "Events.html",
      "projects.html",
      "sacraments.html",
      "reports.html",
      "announcement.html",
      "feedback.html",
      "index.html",
    ],
  };

  // Find the first matching role in the rules
  const userRole = roles.find((role) => visibilityRules[role]);

  if (!userRole) {
    console.log("No restrictions for this role.");
    return;
  }

  const allowedPages = visibilityRules[userRole];
  console.log(`User role: ${userRole}`);
  console.log("Allowed pages:", allowedPages);

  // Restrict sidebar
  document.querySelectorAll(".sidebar-list a").forEach((link) => {
    const href = link.getAttribute("href");
    const page = href?.split("/").pop();
    if (!allowedPages.includes(page)) {
      console.log("Hiding link:", page);
      link.style.display = "none";
    }
  });

  // Restrict bottom (logout section)
  document.querySelectorAll(".bottom-content a").forEach((link) => {
    const href = link.getAttribute("href");
    const page = href?.split("/").pop();
    if (!allowedPages.includes(page)) {
      link.style.display = "none";
    }
  });
}

// Helper: Parse JWT and extract email
function getEmailFromJWT(token) {
  if (!token) return null;
  try {
    const payload = parseJwt(token);
    return payload?.sub || payload?.email || null;
  } catch (e) {
    return null;
  }
}

// Helper: Get initials from name
function getInitials(name) {
  if (!name) return "";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Fetch user info using email from JWT and set header name (first and last only)
async function setHeaderUserNameFromAPI() {
  const authToken = localStorage.getItem("authToken");
  const email = getEmailFromJWT(authToken);
  if (!email) return;

  try {
    const res = await fetch(
      `http://76.13.14.56:8080/api/user?email=${encodeURIComponent(email)}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      },
    );
    if (res.ok) {
      const user = await res.json();
      // Only show first and last name
      let name = user.name || "";
      let initials = "U";
      if (name) {
        const parts = name.trim().split(" ");
        name =
          parts[0] + (parts.length > 1 ? " " + parts[parts.length - 1] : "");
        initials = getInitials(name);
      }
      const userNameEl = document.getElementById("userName");
      const profileAvatarEl = document.getElementById("profileAvatar");
      if (userNameEl) userNameEl.textContent = name || "User";
      if (profileAvatarEl) {
        if (user.profilePictureUrl) {
          profileAvatarEl.innerHTML = `<img src="${user.profilePictureUrl}" alt="Profile" style="width:38px;height:38px;border-radius:50%;">`;
        } else {
          profileAvatarEl.textContent = initials;
        }
      }
    }
  } catch (e) {
    // fallback: do nothing
  }
}

// Call this after loading the header (after loadComponent)
document.addEventListener("DOMContentLoaded", function () {
  // ...existing code...
  // After loadComponent and its callback:
  setTimeout(setHeaderUserNameFromAPI, 500); // Delay to ensure header is loaded
});
