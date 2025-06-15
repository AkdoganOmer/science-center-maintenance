// Firebase referansları
let db;
let storage;

function initializeFirebase() {
    try {
        // Firebase'in başlatıldığından emin ol
        if (firebase && firebase.firestore && firebase.storage) {
            db = firebase.firestore();
            storage = firebase.storage();
            console.log('Firebase başarıyla başlatıldı');
            // Sayfayı başlat
            loadUnitDetails();
        } else {
            console.error('Firebase yüklenemedi');
            alert('Firebase bağlantısı kurulamadı. Lütfen sayfayı yenileyin.');
        }
    } catch (error) {
        console.error('Firebase başlatılırken hata:', error);
        alert('Firebase başlatılırken bir hata oluştu: ' + error.message);
    }
}

// Get galleries from localStorage
function getGalleries() {
    const galleries = localStorage.getItem('galleries');
    return galleries ? JSON.parse(galleries) : [];
}

// Save galleries to localStorage
function saveGalleries(galleries) {
    localStorage.setItem('galleries', JSON.stringify(galleries));
}

// Find unit by ID
function findUnit(unitId) {
    const galleries = getGalleries();
    for (const gallery of galleries) {
        const unit = gallery.units.find(u => u.id === unitId);
        if (unit) {
            return { unit, gallery };
        }
    }
    return null;
}

// Load unit details
async function loadUnitDetails() {
    const galleryId = localStorage.getItem('selectedGalleryId');
    const unitId = localStorage.getItem('selectedUnitId');
    
    if (!galleryId || !unitId) {
        window.location.href = 'index.html';
        return;
    }

    try {
        const docRef = await db.collection('galleries').doc(galleryId).get();
        
        if (!docRef.exists) {
            alert('Galeri bulunamadı!');
            window.location.href = 'index.html';
            return;
        }

        const gallery = docRef.data();
        const unit = gallery.units.find(u => String(u.id) === unitId);

        if (!unit) {
            alert('Ünite bulunamadı!');
            window.location.href = 'index.html';
            return;
        }

        // Update page title
        document.getElementById('unitTitle').textContent = unit.name;

        // Fill unit information
        document.getElementById('unitId').textContent = unit.id;
        document.getElementById('unitName').textContent = unit.name;
        document.getElementById('galleryName').textContent = gallery.name;
        document.getElementById('unitStatus').innerHTML = `
            <span class="badge ${unit.status === 'Arızalı' ? 'bg-danger' : 'bg-success'}">
                ${unit.status || 'Çalışıyor'}
            </span>
        `;
        document.getElementById('lastMaintenance').textContent = formatDate(unit.lastMaintenance);

        // Fill technical details
        const technicalDetails = document.getElementById('technicalDetails');
        if (unit.technicalDetails) {
            technicalDetails.innerHTML = `<pre class="technical-details">${unit.technicalDetails}</pre>`;
        }

        // Display technical documents
        const technicalDocuments = document.getElementById('technicalDocuments');
        if (unit.documents && unit.documents.length > 0) {
            technicalDocuments.innerHTML = unit.documents.map(doc => `
                <div class="document-item d-flex align-items-center mb-2">
                    <i class="bi bi-file-pdf text-danger me-2"></i>
                    <a href="${doc.data}" target="_blank" class="text-decoration-none" download="${doc.name}">
                        ${doc.name}
                    </a>
                    <small class="text-muted ms-2">(${formatFileSize(doc.size)})</small>
                </div>
            `).join('');
        }

        // Display images
        const unitImages = document.getElementById('unitImages');
        if (unit.images && unit.images.length > 0) {
            unitImages.innerHTML = unit.images.map(image => `
                <div class="unit-image mb-3">
                    <img src="${image}" class="img-fluid" alt="${unit.name}">
                </div>
            `).join('');
        }

        // Show edit button for admin
        if (isAdmin()) {
            document.querySelector('.admin-only').style.display = 'block';
            
            // Fill edit form
            document.getElementById('editUnitName').value = unit.name;
            document.getElementById('editUnitStatus').value = unit.status || 'Çalışıyor';
            document.getElementById('editTechnicalDetails').value = unit.technicalDetails || '';
        }
    } catch (error) {
        console.error('Ünite detayları yüklenirken hata:', error);
        alert('Ünite detayları yüklenirken bir hata oluştu.');
    }
}

// Toggle edit mode
function toggleEditMode() {
    const viewMode = document.getElementById('viewMode');
    const editMode = document.getElementById('editMode');
    
    if (viewMode.style.display !== 'none') {
        viewMode.style.display = 'none';
        editMode.style.display = 'block';
    } else {
        viewMode.style.display = 'block';
        editMode.style.display = 'none';
    }
}

// Handle image upload
function uploadImages() {
    const fileInput = document.getElementById('imageUpload');
    const files = fileInput.files;
    
    if (files.length === 0) return;

    const imagePromises = Array.from(files).map(file => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(file);
        });
    });

    Promise.all(imagePromises).then(images => {
        const preview = document.getElementById('imagePreview');
        preview.innerHTML = images.map(image => `
            <div class="unit-image mb-3">
                <img src="${image}" class="img-fluid" alt="Preview">
            </div>
        `).join('');

        // Store images temporarily
        preview.dataset.images = JSON.stringify(images);
    });
}

// Handle document upload
function uploadDocuments() {
    const fileInput = document.getElementById('documentUpload');
    const files = Array.from(fileInput.files);
    
    if (files.length === 0) return;

    // Validate file types
    const invalidFiles = files.filter(file => file.type !== 'application/pdf');
    if (invalidFiles.length > 0) {
        alert('Sadece PDF formatında dokümanlar kabul edilmektedir.');
        return;
    }

    // Validate file sizes (max 5MB per file)
    const maxSize = 5 * 1024 * 1024; // 5MB
    const oversizedFiles = files.filter(file => file.size > maxSize);
    if (oversizedFiles.length > 0) {
        alert('Her bir PDF dosyası en fazla 5MB boyutunda olabilir.');
        return;
    }

    const documentPromises = files.map(file => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                resolve({
                    name: file.name,
                    data: e.target.result,
                    size: file.size,
                    type: file.type
                });
            };
            reader.readAsDataURL(file);
        });
    });

    Promise.all(documentPromises).then(documents => {
        const documentList = document.getElementById('documentList');
        documentList.innerHTML = documents.map(doc => `
            <div class="document-item d-flex align-items-center mb-2">
                <i class="bi bi-file-pdf text-danger me-2"></i>
                <span>${doc.name}</span>
                <small class="text-muted ms-2">(${formatFileSize(doc.size)})</small>
            </div>
        `).join('');

        // Store documents temporarily
        documentList.dataset.documents = JSON.stringify(documents);
    });
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Save unit details
async function saveUnitDetails() {
    const galleryId = localStorage.getItem('selectedGalleryId');
    const unitId = parseInt(localStorage.getItem('selectedUnitId'));

    if (!galleryId || !unitId) {
        alert('Galeri veya ünite bilgisi bulunamadı!');
        return;
    }

    try {
        const docRef = await db.collection('galleries').doc(galleryId).get();
        
        if (!docRef.exists) {
            alert('Galeri bulunamadı!');
            return;
        }

        const gallery = docRef.data();
        const units = gallery.units || [];
        const unitIndex = units.findIndex(u => u.id === unitId);

        if (unitIndex === -1) {
            alert('Ünite bulunamadı!');
            return;
        }

        // Update unit details
        units[unitIndex] = {
            ...units[unitIndex],
            name: document.getElementById('editUnitName').value,
            status: document.getElementById('editUnitStatus').value,
            technicalDetails: document.getElementById('editTechnicalDetails').value,
            lastMaintenance: new Date().toISOString().split('T')[0]
        };

        // Update images if new ones were uploaded
        const preview = document.getElementById('imagePreview');
        if (preview.dataset.images) {
            units[unitIndex].images = JSON.parse(preview.dataset.images);
        }

        // Update documents if new ones were uploaded
        const documentList = document.getElementById('documentList');
        if (documentList.dataset.documents) {
            units[unitIndex].documents = JSON.parse(documentList.dataset.documents);
        }

        // Update Firestore
        await db.collection('galleries').doc(galleryId).update({
            units: units,
            faultyUnits: units.filter(u => u.status === 'Arızalı').length,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Switch back to view mode and reload details
        toggleEditMode();
        loadUnitDetails();

        console.log('Ünite başarıyla güncellendi');
    } catch (error) {
        console.error('Ünite güncellenirken hata:', error);
        alert('Ünite güncellenirken bir hata oluştu');
    }
}

// Helper function to format dates
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR');
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Firebase'in yüklenmesi için kısa bir süre bekle
    setTimeout(initializeFirebase, 500);
}); 