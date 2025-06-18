function openSidebar() {
    document.querySelector(".sidebar").classList.add("active");
    document.addEventListener("click", handleOutsideClick);
}

function closeSidebar() {
    document.querySelector(".sidebar").classList.remove("active");
    document.removeEventListener("click", handleOutsideClick);
}

function handleOutsideClick(event) {
    const sidebar = document.querySelector(".sidebar");
    const openButton = document.querySelector(".open-menu");

    if (
        !sidebar.contains(event.target) &&
        !openButton.contains(event.target)
    ) {
        closeSidebar();
    }
}