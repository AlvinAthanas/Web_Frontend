// Accessing Header, Sidebar and Main

document.addEventListener("DOMContentLoaded", function () {
  loadComponent("../GENERAL/General.html", "containerId", function () {
    modeToogle();
    setupDropdowns();
    openSidebar();
    closeSidebar();
    loadParishName(); // <-- Call after sidebar is loaded
    setupLogout();    // <-- Add logout logic here
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
      `http://localhost:8080/parish/${user.parishId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      }
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
