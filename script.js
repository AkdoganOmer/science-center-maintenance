// Get galleries from localStorage
function getGalleries() {
    const galleries = localStorage.getItem('galleries');
    return galleries ? JSON.parse(galleries) : [];
}

// Function to create gallery cards
function createGalleryCards() {
    const galleryContainer = document.getElementById('galleryCards');
    galleryContainer.innerHTML = '';

    const galleries = getGalleries();

    galleries.forEach(gallery => {
        const card = document.createElement('div');
        card.className = 'col-md-4 mb-4';
        card.innerHTML = `
            <div class="card gallery-card" onclick="showGalleryDetails(${gallery.id})">
                <div class="card-body">
                    <h5 class="card-title">${gallery.name}</h5>
                    <div class="stat-box total-units">
                        <div class="stat-label">Toplam Ünite Sayısı</div>
                        <div class="stat-value">${gallery.totalUnits}</div>
                    </div>
                    <div class="stat-box faulty-units">
                        <div class="stat-label">Arızalı Ünite Sayısı</div>
                        <div class="stat-value">${gallery.faultyUnits}</div>
                    </div>
                </div>
            </div>
        `;
        galleryContainer.appendChild(card);
    });

    // Eğer hiç galeri yoksa bilgilendirme mesajı göster
    if (galleries.length === 0) {
        galleryContainer.innerHTML = `
            <div class="col-12 text-center">
                <div class="alert alert-info">
                    Henüz hiç galeri eklenmemiş.
                    ${isAdmin() ? ' Galeri eklemek için "Galeri Yönetimi" sayfasını kullanabilirsiniz.' : ''}
                </div>
            </div>
        `;
    }
}

// Function to handle gallery card click
function showGalleryDetails(galleryId) {
    // Store the selected gallery ID in localStorage
    localStorage.setItem('selectedGalleryId', galleryId);
    // Navigate to the gallery details page
    window.location.href = `gallery-details.html`;
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    createGalleryCards();
}); 