function ImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const profileImage = document.getElementById('profile-image');
            profileImage.src = e.target.result;
            profileImage.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}
