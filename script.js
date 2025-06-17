// Sayfayı başlat
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // LocalStorage'dan Firestore'a veri aktarımını kontrol et
        await migrateGalleriesToFirestore();
        // Sayfayı başlat
        await createGalleryCards();
    } catch (error) {
        console.error('Sayfa başlatılırken hata:', error);
        alert('Sayfa yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.');
    }
});

// LocalStorage'dan galerileri al
function getLocalGalleries() {
    const galleries = localStorage.getItem('galleries');
    return galleries ? JSON.parse(galleries) : [];
}

// LocalStorage'dan Firestore'a galerileri aktar
async function migrateGalleriesToFirestore() {
    try {
        const localGalleries = getLocalGalleries();
        if (localGalleries.length === 0) {
            console.log('LocalStorage\'da galeri bulunamadı');
            return;
        }

        // Firestore'daki mevcut galerileri kontrol et
        const snapshot = await db.collection('galleries').get();
        if (!snapshot.empty) {
            console.log('Firestore\'da zaten galeriler var');
            return;
        }

        // Galerileri Firestore'a ekle
        for (const gallery of localGalleries) {
            await db.collection('galleries').doc(gallery.id.toString()).set({
                name: gallery.name,
                description: gallery.description,
                totalUnits: gallery.totalUnits || 0,
                faultyUnits: gallery.faultyUnits || 0,
                units: gallery.units || [],
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        console.log('Galeriler başarıyla Firestore\'a aktarıldı');
    } catch (error) {
        console.error('Galeri aktarımı sırasında hata:', error);
    }
}

// Galerileri Firestore'dan al
async function getGalleries() {
    try {
        const snapshot = await db.collection('galleries').get();
        const galleries = [];
        snapshot.forEach(doc => {
            galleries.push({
                id: doc.id,
                ...doc.data()
            });
        });
        console.log('Galeriler başarıyla yüklendi:', galleries);
        return galleries;
    } catch (error) {
        console.error('Galeriler yüklenirken hata:', error);
        throw error;
    }
}

// Galeri ekle
async function addGallery(gallery) {
    try {
        const docRef = await db.collection('galleries').add({
            name: gallery.name,
            totalUnits: gallery.totalUnits || 0,
            faultyUnits: gallery.faultyUnits || 0,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('Galeri başarıyla eklendi. ID:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('Galeri eklenirken hata:', error);
        throw error;
    }
}

// Galeri kartlarını oluştur
async function createGalleryCards() {
    const galleryContainer = document.getElementById('galleryCards');
    galleryContainer.innerHTML = '';

    try {
        const galleries = await getGalleries();

        galleries.forEach(gallery => {
            const card = document.createElement('div');
            card.className = 'col-md-4 mb-4';
            card.innerHTML = `
                <div class="card gallery-card" onclick="showGalleryDetails('${gallery.id}')">
                    <div class="card-body text-center">
                        <h5 class="card-title mb-4">${gallery.name}</h5>
                        <div class="stat-box total-units">
                            <div class="stat-label">Toplam Ünite Sayısı</div>
                            <div class="stat-value">${gallery.totalUnits || 0}</div>
                        </div>
                        <div class="stat-box faulty-units">
                            <div class="stat-label">Arızalı Ünite Sayısı</div>
                            <div class="stat-value">${gallery.faultyUnits || 0}</div>
                        </div>
                    </div>
                </div>
            `;
            galleryContainer.appendChild(card);
        });

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
    } catch (error) {
        console.error('Hata:', error);
        galleryContainer.innerHTML = `
            <div class="col-12 text-center">
                <div class="alert alert-danger">
                    Galeriler yüklenirken bir hata oluştu.
                </div>
            </div>
        `;
    }
}

// Galeri detaylarını göster
async function showGalleryDetails(galleryId) {
    localStorage.setItem('selectedGalleryId', galleryId);
    window.location.href = `gallery-details.html`;
}

// Test için galeri ekle
async function testAddGallery() {
    try {
        const galleryId = await addGallery({
            name: "Test Galerisi",
            totalUnits: 5,
            faultyUnits: 1
        });
        console.log('Test galerisi eklendi:', galleryId);
        createGalleryCards(); // Sayfayı yenile
    } catch (error) {
        console.error('Test galerisi eklenirken hata:', error);
    }
}