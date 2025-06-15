// Firebase referansı
let db;

// Firebase'i başlat
function initializeFirebase() {
    try {
        if (firebase && firebase.firestore) {
            db = firebase.firestore();
            console.log('Firebase başarıyla başlatıldı');
            // Sayfayı başlat
            displayGalleries();
        } else {
            console.error('Firebase yüklenemedi');
        }
    } catch (error) {
        console.error('Firebase başlatılırken hata:', error);
    }
}

// Check if user is admin
function checkAdminAccess() {
    const username = localStorage.getItem('username');
    if (username !== 'admin') {
        alert('Bu sayfaya erişim yetkiniz yok!');
        window.location.href = 'index.html';
    }
}

// Get galleries from Firestore
async function getGalleries() {
    if (!db) {
        console.error('Firebase henüz başlatılmadı');
        return [];
    }

    const galleries = [];
    try {
        const snapshot = await db.collection('galleries').get();
        snapshot.forEach(doc => {
            galleries.push({
                id: doc.id,
                ...doc.data()
            });
        });
        console.log('Galeriler başarıyla yüklendi:', galleries);
        return galleries;
    } catch (error) {
        console.error('Galeriler alınırken hata:', error);
        return [];
    }
}

// Save gallery to Firestore
async function saveGallery(gallery) {
    try {
        if (gallery.id) {
            // Update existing gallery
            await db.collection('galleries').doc(gallery.id.toString()).set(gallery);
        } else {
            // Add new gallery
            await db.collection('galleries').add(gallery);
        }
    } catch (error) {
        console.error('Galeri kaydedilirken hata:', error);
        throw error;
    }
}

// Display galleries in table
async function displayGalleries() {
    const galleries = await getGalleries();
    const tableBody = document.getElementById('galleriesTable');
    tableBody.innerHTML = '';

    galleries.forEach(gallery => {
        const row = document.createElement('tr');
        row.style.cursor = 'pointer';
        row.onclick = (e) => {
            // Prevent row click if clicking on action buttons
            if (!e.target.closest('.action-buttons')) {
                showGalleryUnits(gallery.id);
            }
        };
        
        row.innerHTML = `
            <td>${gallery.name}</td>
            <td>${gallery.totalUnits || 0}</td>
            <td>${gallery.faultyUnits || 0}</td>
            <td class="action-buttons">
                <button class="btn btn-sm btn-primary me-2" onclick="editGallery('${gallery.id}')">
                    <i class="bi bi-pencil"></i> Düzenle
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteGallery('${gallery.id}')">
                    <i class="bi bi-trash"></i> Sil
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Add new gallery
async function addGallery() {
    if (!db) {
        console.error('Firebase henüz başlatılmadı');
        alert('Sistem hazır değil, lütfen sayfayı yenileyin');
        return;
    }

    const name = document.getElementById('galleryName').value;
    const description = document.getElementById('galleryDescription').value;
    
    if (!name) {
        alert('Galeri adı zorunludur!');
        return;
    }

    try {
        const newGallery = {
            name: name,
            description: description,
            totalUnits: 0,
            faultyUnits: 0,
            units: [],
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        const docRef = await db.collection('galleries').add(newGallery);
        console.log('Yeni galeri eklendi. ID:', docRef.id);
        await displayGalleries();

        // Close modal and reset form
        const modal = bootstrap.Modal.getInstance(document.getElementById('addGalleryModal'));
        modal.hide();
        document.getElementById('addGalleryForm').reset();
    } catch (error) {
        console.error('Galeri eklenirken hata:', error);
        alert('Galeri eklenirken bir hata oluştu: ' + error.message);
    }
}

// Load gallery data for editing
async function editGallery(id) {
    if (!db) {
        console.error('Firebase henüz başlatılmadı');
        return;
    }

    try {
        const doc = await db.collection('galleries').doc(id).get();
        if (doc.exists) {
            const gallery = { id: doc.id, ...doc.data() };
            document.getElementById('editGalleryId').value = gallery.id;
            document.getElementById('editGalleryName').value = gallery.name;
            document.getElementById('editGalleryDescription').value = gallery.description || '';
            
            const modal = new bootstrap.Modal(document.getElementById('editGalleryModal'));
            modal.show();
        }
    } catch (error) {
        console.error('Galeri bilgileri alınırken hata:', error);
        alert('Galeri bilgileri alınırken bir hata oluştu');
    }
}

// Update gallery
async function updateGallery() {
    if (!db) {
        console.error('Firebase henüz başlatılmadı');
        return;
    }

    const id = document.getElementById('editGalleryId').value;
    const name = document.getElementById('editGalleryName').value;
    const description = document.getElementById('editGalleryDescription').value;

    if (!name) {
        alert('Galeri adı zorunludur!');
        return;
    }

    try {
        const docRef = db.collection('galleries').doc(id);
        await docRef.update({
            name: name,
            description: description,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        await displayGalleries();

        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('editGalleryModal'));
        modal.hide();
    } catch (error) {
        console.error('Galeri güncellenirken hata:', error);
        alert('Galeri güncellenirken bir hata oluştu');
    }
}

// Delete gallery
async function deleteGallery(id) {
    if (!db) {
        console.error('Firebase henüz başlatılmadı');
        return;
    }

    if (confirm('Bu galeriyi silmek istediğinizden emin misiniz?')) {
        try {
            await db.collection('galleries').doc(id).delete();
            await displayGalleries();
        } catch (error) {
            console.error('Galeri silinirken hata:', error);
            alert('Galeri silinirken bir hata oluştu');
        }
    }
}

// Show gallery units
async function showGalleryUnits(galleryId) {
    if (!db) {
        console.error('Firebase henüz başlatılmadı');
        return;
    }

    try {
        const doc = await db.collection('galleries').doc(galleryId).get();
        if (doc.exists) {
            const gallery = { id: doc.id, ...doc.data() };
            
            // Update UI
            document.getElementById('gallerySection').style.display = 'none';
            document.getElementById('unitsSection').style.display = 'block';
            document.getElementById('selectedGalleryName').textContent = `${gallery.name} - Üniteler`;
            
            // Store selected gallery ID
            localStorage.setItem('selectedGalleryId', galleryId);
            
            // Display units
            displayUnits(gallery.units || []);
        }
    } catch (error) {
        console.error('Galeri detayları alınırken hata:', error);
        alert('Galeri detayları alınırken bir hata oluştu');
    }
}

// Show gallery section
function showGallerySection() {
    document.getElementById('gallerySection').style.display = 'block';
    document.getElementById('unitsSection').style.display = 'none';
    localStorage.removeItem('selectedGalleryId');
}

// Display units in table
function displayUnits(units) {
    const tableBody = document.getElementById('unitsTable');
    tableBody.innerHTML = '';

    units.forEach(unit => {
        const row = document.createElement('tr');
        row.className = unit.status === 'Arızalı' ? 'table-danger' : '';
        row.innerHTML = `
            <td>${unit.name}</td>
            <td>
                <span class="badge ${unit.status === 'Arızalı' ? 'bg-danger' : 'bg-success'}">
                    ${unit.status}
                </span>
            </td>
            <td>${formatDate(unit.lastMaintenance)}</td>
            <td>
                <button class="btn btn-sm btn-primary me-2" onclick="editUnit(${unit.id})">
                    <i class="bi bi-pencil"></i> Düzenle
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteUnit(${unit.id})">
                    <i class="bi bi-trash"></i> Sil
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Add new unit
function addUnit() {
    const name = document.getElementById('unitName').value;
    const description = document.getElementById('unitDescription').value;
    
    if (!name) {
        alert('Ünite adı zorunludur!');
        return;
    }

    const galleries = getGalleries();
    const galleryId = parseInt(localStorage.getItem('selectedGalleryId'));
    const galleryIndex = galleries.findIndex(g => g.id === galleryId);
    
    if (galleryIndex !== -1) {
        const gallery = galleries[galleryIndex];
        const newId = gallery.units.length > 0 ? 
            Math.max(...gallery.units.map(u => u.id)) + 1 : 
            (galleryId * 100 + 1);

        const newUnit = {
            id: newId,
            name: name,
            description: description,
            status: "Çalışıyor",
            lastMaintenance: new Date().toISOString().split('T')[0]
        };

        gallery.units.push(newUnit);
        gallery.totalUnits = gallery.units.length;
        gallery.faultyUnits = gallery.units.filter(u => u.status === 'Arızalı').length;

        saveGalleries(galleries);
        displayUnits(gallery.units);

        // Close modal and reset form
        const modal = bootstrap.Modal.getInstance(document.getElementById('addUnitModal'));
        modal.hide();
        document.getElementById('addUnitForm').reset();
    }
}

// Edit unit
function editUnit(unitId) {
    const galleries = getGalleries();
    const galleryId = parseInt(localStorage.getItem('selectedGalleryId'));
    const gallery = galleries.find(g => g.id === galleryId);
    
    if (gallery) {
        const unit = gallery.units.find(u => u.id === unitId);
        if (unit) {
            document.getElementById('editUnitId').value = unit.id;
            document.getElementById('editUnitName').value = unit.name;
            document.getElementById('editUnitDescription').value = unit.description;
            document.getElementById('editUnitStatus').value = unit.status;
            
            const modal = new bootstrap.Modal(document.getElementById('editUnitModal'));
            modal.show();
        }
    }
}

// Update unit
function updateUnit() {
    const unitId = parseInt(document.getElementById('editUnitId').value);
    const name = document.getElementById('editUnitName').value;
    const description = document.getElementById('editUnitDescription').value;
    const status = document.getElementById('editUnitStatus').value;

    if (!name) {
        alert('Ünite adı zorunludur!');
        return;
    }

    const galleries = getGalleries();
    const galleryId = parseInt(localStorage.getItem('selectedGalleryId'));
    const galleryIndex = galleries.findIndex(g => g.id === galleryId);
    
    if (galleryIndex !== -1) {
        const gallery = galleries[galleryIndex];
        const unitIndex = gallery.units.findIndex(u => u.id === unitId);
        
        if (unitIndex !== -1) {
            gallery.units[unitIndex] = {
                ...gallery.units[unitIndex],
                name: name,
                description: description,
                status: status,
                lastMaintenance: new Date().toISOString().split('T')[0]
            };

            gallery.faultyUnits = gallery.units.filter(u => u.status === 'Arızalı').length;
            
            saveGalleries(galleries);
            displayUnits(gallery.units);

            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('editUnitModal'));
            modal.hide();
        }
    }
}

// Delete unit
function deleteUnit(unitId) {
    if (confirm('Bu üniteyi silmek istediğinizden emin misiniz?')) {
        const galleries = getGalleries();
        const galleryId = parseInt(localStorage.getItem('selectedGalleryId'));
        const galleryIndex = galleries.findIndex(g => g.id === galleryId);
        
        if (galleryIndex !== -1) {
            const gallery = galleries[galleryIndex];
            gallery.units = gallery.units.filter(u => u.id !== unitId);
            gallery.totalUnits = gallery.units.length;
            gallery.faultyUnits = gallery.units.filter(u => u.status === 'Arızalı').length;
            
            saveGalleries(galleries);
            displayUnits(gallery.units);
        }
    }
}

// Format date
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR');
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    checkAdminAccess();
    initializeFirebase();
}); 