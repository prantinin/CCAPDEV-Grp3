function openSidebar() {
    document.querySelector(".sidebar").classList.add("active");
}

function closeSidebar() {
    document.querySelector(".sidebar").classList.remove("active");
}

function goBack() {
    window.history.back();
}