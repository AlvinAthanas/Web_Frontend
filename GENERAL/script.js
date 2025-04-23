// Accessing Header, Sidebar and Main

document.addEventListener("DOMContentLoaded", function () {
  loadComponent("../GENERAL/General.html", "containerId", function () {
    modeToogle();
    setupDropdowns();
    openSidebar();
    closeSidebar();
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
  const body = document.querySelector("body"),
    toogle = body.querySelector(".toogle"),
    modeSwitch = body.querySelector(".toogle-switch"),
    modeText = body.querySelector(".mode-text");

  modeSwitch.addEventListener("click", () => {
    body.classList.toggle("dark");

    if (body.classList.contains("dark")) {
      modeText.innerText = "Light Mode";
    } else {
      modeText.innerText = "Dark Mode";
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
