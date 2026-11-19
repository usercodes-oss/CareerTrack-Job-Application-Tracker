// CareerTrack - simplified beginner JavaScript
var jobs = [];
var activities = [];
var currentEmail = "";

// Load the accounts saved in this browser.
function getAccounts() {
    return JSON.parse(localStorage.getItem("accounts") || "{}");
}


// Show login or dashboard.
function showDashboard(email) {
    currentEmail = email;
    localStorage.setItem("loggedIn", email);
    document.getElementById("authScreen").hidden = true;
    document.getElementById("dashboard").hidden = false;
    document.getElementById("authActions").hidden = false;
    document.getElementById("signedInLabel").textContent = "Signed in: " + email;
    loadUserData();
}
function logout() {
    localStorage.removeItem("loggedIn");
    currentEmail = "";
    jobs = [];
    activities = [];
    document.getElementById("dashboard").hidden = true;
    document.getElementById("authScreen").hidden = false;
    document.getElementById("authActions").hidden = true;
    document.getElementById("signInForm").reset();
    document.getElementById("signUpForm").reset();
    switchMode("signin");
}

// Switch between Sign in and Create account forms.
function switchMode(mode) {
    var signingIn = mode === "signin";
    document.getElementById("signInForm").hidden = !signingIn;
    document.getElementById("signUpForm").hidden = signingIn;
    document.getElementById("signInTab").classList.toggle("active", signingIn);
    document.getElementById("signUpTab").classList.toggle("active", !signingIn);
    document.getElementById("authHeading").textContent = signingIn ? "Sign in to your account" : "Create your account";
    document.getElementById("authMessage").textContent = "";
}

// Create a new account.
document.getElementById("signUpForm").addEventListener("submit", function(event) {
    event.preventDefault();
    var name = document.getElementById("signUpName").value.trim();
    var email = document.getElementById("signUpEmail").value.trim().toLowerCase();
    var password = document.getElementById("signUpPassword").value;
    var confirmPassword = document.getElementById("signUpConfirm").value;
    var accounts = getAccounts();

    if (password !== confirmPassword) {
        document.getElementById("authMessage").textContent = "Passwords do not match.";
        return;
    }
    if (accounts[email]) {
        document.getElementById("authMessage").textContent = "This email already has an account. Please sign in.";
        return;
    }

    accounts[email] = { name: name, password: password };
    localStorage.setItem("accounts", JSON.stringify(accounts));
    localStorage.setItem("profile_" + email, JSON.stringify({ name: name, email: email, skills: "" }));
    showDashboard(email);
});

// Sign in to an existing account.
document.getElementById("signInForm").addEventListener("submit", function(event) {
    event.preventDefault();
    var email = document.getElementById("signInEmail").value.trim().toLowerCase();
    var password = document.getElementById("signInPassword").value;
    var accounts = getAccounts();

    if (accounts[email] && accounts[email].password === password) {
        showDashboard(email);
    } else {
        document.getElementById("authMessage").textContent = "Email or password is incorrect.";
    }
});

document.getElementById("signInTab").addEventListener("click", function() { switchMode("signin"); });
document.getElementById("signUpTab").addEventListener("click", function() { switchMode("signup"); });
document.getElementById("logoutButton").addEventListener("click", logout);

// Save and load each user's profile, jobs, and activity separately.
function loadUserData() {
    jobs = JSON.parse(localStorage.getItem("jobs_" + currentEmail) || "[]");
    activities = JSON.parse(localStorage.getItem("activities_" + currentEmail) || "[]");
    var profile = JSON.parse(localStorage.getItem("profile_" + currentEmail) || "{}");
    document.getElementById("fullName").value = profile.name || "";
    document.getElementById("email").value = profile.email || currentEmail;
    document.getElementById("skills").value = profile.skills || "";
    showJobs();
    showActivities();
    updateCounts();
}
function saveUserData() {
    localStorage.setItem("jobs_" + currentEmail, JSON.stringify(jobs));
    localStorage.setItem("activities_" + currentEmail, JSON.stringify(activities));
}
function addActivity(text) {
    activities.unshift(text);
    saveUserData();
    showActivities();
}

// Save profile information.
document.getElementById("profileForm").addEventListener("submit", function(event) {
    event.preventDefault();
    var profile = {
        name: document.getElementById("fullName").value.trim(),
        email: document.getElementById("email").value.trim(),
        skills: document.getElementById("skills").value.trim()
    };
    localStorage.setItem("profile_" + currentEmail, JSON.stringify(profile));
    document.getElementById("profileMessage").textContent = "Profile saved.";
});

// Add a job to the list.
document.getElementById("jobForm").addEventListener("submit", function(event) {
    event.preventDefault();
    var job = {
        company: document.getElementById("company").value.trim(),
        title: document.getElementById("jobTitle").value.trim(),
        location: document.getElementById("location").value.trim(),
        type: document.getElementById("jobType").value,
        date: document.getElementById("applicationDate").value,
        status: document.getElementById("jobStatus").value,
        notes: document.getElementById("notes").value.trim(),
        saved: false
    };
    jobs.push(job);
    saveUserData();
    addActivity("Added " + job.title + " at " + job.company + ".");
    document.getElementById("jobForm").reset();
    document.getElementById("formMessage").textContent = "Application added.";
    showJobs();
    updateCounts();
});

// Display jobs, with search and status filter.
function showJobs() {
    var search = document.getElementById("searchBox").value.toLowerCase();
    var filter = document.getElementById("filterStatus").value;
    var table = document.getElementById("jobTable");
    var shown = 0;
    var output = "";

    for (var i = 0; i < jobs.length; i++) {
        var job = jobs[i];
        var matchesSearch = (job.company + " " + job.title + " " + job.location).toLowerCase().includes(search);
        var matchesFilter = filter === "All" || job.status === filter;
        if (matchesSearch && matchesFilter) {
            shown++;
            output += "<tr><td><b>" + job.company + "</b><br>" + job.title + "</td>";
            output += "<td>" + job.location + "</td><td>" + job.type + "</td>";
            output += "<td><select onchange='changeStatus(" + i + ", this.value)'>" + statusOptions(job.status) + "</select></td>";
            output += "<td><button class='secondary' onclick='saveJob(" + i + ")'>" + (job.saved ? "Unsave" : "Save") + "</button>";
            output += "<button class='delete-button' onclick='deleteJob(" + i + ")'>Delete</button></td></tr>";
        }
    }
    if (output === "") output = "<tr><td colspan='5' class='empty-state'>No matching applications found.</td></tr>";
    table.innerHTML = output;
    document.getElementById("showingCount").textContent = "Showing " + shown + " of " + jobs.length + " applications";
}
function statusOptions(current) {
    var statuses = ["Wishlist", "Applied", "Under Review", "Interview", "Offer", "Rejected", "Withdrawn"];
    var options = "";
    for (var i = 0; i < statuses.length; i++) {
        options += "<option " + (statuses[i] === current ? "selected" : "") + ">" + statuses[i] + "</option>";
    }
    return options;
}
function changeStatus(index, newStatus) {
    jobs[index].status = newStatus;
    saveUserData();
    addActivity("Changed " + jobs[index].title + " to " + newStatus + ".");
    showJobs();
    updateCounts();
}
function saveJob(index) {
    jobs[index].saved = !jobs[index].saved;
    saveUserData();
    addActivity(jobs[index].saved ? "Saved " + jobs[index].title + "." : "Removed " + jobs[index].title + " from saved jobs.");
    showJobs();
    updateCounts();
}
function deleteJob(index) {
    if (confirm("Delete this job application?")) {
        var title = jobs[index].title;
        jobs.splice(index, 1);
        saveUserData();
        addActivity("Deleted " + title + ".");
        showJobs();
        updateCounts();
    }
}
function showActivities() {
    var list = document.getElementById("activityList");
    var output = "";
    for (var i = 0; i < activities.length; i++) output += "<li>" + activities[i] + "</li>";
    list.innerHTML = output || "<li>No activity yet.</li>";
}
function updateCounts() {
    var interviews = 0, offers = 0, saved = 0;
    for (var i = 0; i < jobs.length; i++) {
        if (jobs[i].status === "Interview") interviews++;
        if (jobs[i].status === "Offer") offers++;
        if (jobs[i].saved) saved++;
    }
    document.getElementById("totalCount").textContent = jobs.length;
    document.getElementById("interviewCount").textContent = interviews;
    document.getElementById("offerCount").textContent = offers;
    document.getElementById("savedCount").textContent = saved;
}

document.getElementById("searchBox").addEventListener("input", showJobs);
document.getElementById("filterStatus").addEventListener("change", showJobs);

// Keep the user signed in after refresh.
var savedEmail = localStorage.getItem("loggedIn");
if (savedEmail && getAccounts()[savedEmail]) showDashboard(savedEmail);
else logout();
