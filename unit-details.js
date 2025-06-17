// Sayfa yüklendiğinde çalışacak
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Sayfayı başlat
        await loadUnitDetails();
    } catch (error) {
        console.error('Sayfa başlatılırken hata:', error);
        alert('Sayfa yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.');
    }
});

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
                    <a href="${doc.data}" download="${doc.name}" class="text-decoration-none">
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

        // Display maintenance history
        displayMaintenanceHistory(unit.maintenanceHistory);

        // Show edit button and maintenance button for admin
        if (isAdmin()) {
            document.querySelector('.admin-only').style.display = 'block';
            document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'block');
            
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
async function uploadImages() {
    const fileInput = document.getElementById('imageUpload');
    const files = fileInput.files;
    
    if (files.length === 0) return;

    // Validate file types
    const validTypes = ['image/jpeg', 'image/png'];
    const invalidFiles = Array.from(files).filter(file => !validTypes.includes(file.type));
    if (invalidFiles.length > 0) {
        alert('Sadece JPG ve PNG formatında görseller kabul edilmektedir.');
        return;
    }

    const preview = document.getElementById('imagePreview');
    preview.innerHTML = '<div class="text-center"><div class="spinner-border" role="status"></div><div>Yükleniyor...</div></div>';

    try {
        const imageUrls = [];

        for (const file of files) {
            try {
                // Create an image element for resizing
                const img = document.createElement('img');
                const reader = new FileReader();
                
                // Convert file to data URL
                await new Promise((resolve, reject) => {
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
                
                // Load image for resizing
                await new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = reject;
                    img.src = reader.result;
                });

                // Create canvas for resizing
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Calculate new dimensions (max 800px width/height)
                let width = img.width;
                let height = img.height;
                const maxSize = 800;
                
                if (width > height && width > maxSize) {
                    height *= maxSize / width;
                    width = maxSize;
                } else if (height > maxSize) {
                    width *= maxSize / height;
                    height = maxSize;
                }
                
                // Set canvas size and draw resized image
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                
                // Convert to JPEG with reduced quality
                const resizedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
                
                // Add to image URLs array
                imageUrls.push(resizedDataUrl);
                
                console.log('Görsel başarıyla yüklendi ve yeniden boyutlandırıldı');
            } catch (uploadError) {
                console.error('Görsel yükleme hatası:', uploadError);
                throw uploadError;
            }
        }

        // Show preview
        preview.innerHTML = imageUrls.map(url => `
            <div class="unit-image mb-3">
                <img src="${url}" class="img-fluid" alt="Preview">
            </div>
        `).join('');

        // Store image URLs temporarily
        preview.dataset.images = JSON.stringify(imageUrls);

        return imageUrls;

    } catch (error) {
        console.error('Görsel yüklenirken hata:', error);
        alert('Görseller yüklenirken bir hata oluştu: ' + error.message);
        preview.innerHTML = '';
        throw error;
    }
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
                // Ensure we're creating a proper data URL
                const base64Data = e.target.result;
                console.log('Uploaded PDF data:', {
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    dataPrefix: base64Data.substring(0, 50) + '...' // Log first 50 chars for debugging
                });
                
                resolve({
                    name: file.name,
                    data: base64Data,
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
        
        // Log stored documents for debugging
        console.log('Stored documents:', JSON.parse(documentList.dataset.documents).map(doc => ({
            name: doc.name,
            size: doc.size,
            type: doc.type,
            dataPrefix: doc.data.substring(0, 50) + '...' // Log first 50 chars for debugging
        })));
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
            const newImages = JSON.parse(preview.dataset.images);
            units[unitIndex].images = units[unitIndex].images || [];
            units[unitIndex].images = [...units[unitIndex].images, ...newImages];
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

// Show maintenance modal
function showMaintenanceModal() {
    // Set default date to today
    document.getElementById('maintenanceDate').value = new Date().toISOString().split('T')[0];
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('maintenanceModal'));
    modal.show();
}

// Save maintenance record
async function saveMaintenance() {
    const maintenanceData = {
        date: document.getElementById('maintenanceDate').value,
        type: document.getElementById('maintenanceType').value,
        details: document.getElementById('maintenanceDetails').value,
        status: document.getElementById('maintenanceStatus').value,
        technician: document.getElementById('technician').value,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };

    if (!maintenanceData.date || !maintenanceData.type || !maintenanceData.details || !maintenanceData.status || !maintenanceData.technician) {
        alert('Lütfen tüm alanları doldurun!');
        return;
    }

    try {
        const galleryId = localStorage.getItem('selectedGalleryId');
        const unitId = localStorage.getItem('selectedUnitId');
        const docRef = await db.collection('galleries').doc(galleryId).get();
        
        if (!docRef.exists) {
            alert('Galeri bulunamadı!');
            return;
        }

        const gallery = docRef.data();
        const units = gallery.units || [];
        const unitIndex = units.findIndex(u => String(u.id) === unitId);

        if (unitIndex === -1) {
            alert('Ünite bulunamadı!');
            return;
        }

        // Add maintenance record
        if (!units[unitIndex].maintenanceHistory) {
            units[unitIndex].maintenanceHistory = [];
        }
        units[unitIndex].maintenanceHistory.push(maintenanceData);

        // Update last maintenance date
        units[unitIndex].lastMaintenance = maintenanceData.date;

        // Update unit status if maintenance is completed
        if (maintenanceData.status === 'Tamamlandı') {
            units[unitIndex].status = 'Çalışıyor';
        }

        // Update Firestore
        await db.collection('galleries').doc(galleryId).update({
            units: units,
            faultyUnits: units.filter(u => u.status === 'Arızalı').length,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Close modal and reload details
        const modal = bootstrap.Modal.getInstance(document.getElementById('maintenanceModal'));
        modal.hide();
        document.getElementById('maintenanceForm').reset();
        
        // Reload unit details
        await loadUnitDetails();

    } catch (error) {
        console.error('Bakım kaydı eklenirken hata:', error);
        alert('Bakım kaydı eklenirken bir hata oluştu.');
    }
}

// Display maintenance history
function displayMaintenanceHistory(maintenanceHistory) {
    const tableBody = document.getElementById('maintenanceTable');
    
    if (!maintenanceHistory || maintenanceHistory.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted">
                    Henüz bakım kaydı bulunmamaktadır.
                </td>
            </tr>
        `;
        return;
    }

    // Sort maintenance records by date (newest first)
    const sortedHistory = [...maintenanceHistory].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
    );

    tableBody.innerHTML = sortedHistory.map(record => `
        <tr class="${record.status === 'Devam Ediyor' ? 'table-warning' : 
                   record.status === 'Beklemede' ? 'table-info' : ''}">
            <td>${formatDate(record.date)}</td>
            <td>${record.type}</td>
            <td>${record.details}</td>
            <td>
                <span class="badge ${
                    record.status === 'Tamamlandı' ? 'bg-success' :
                    record.status === 'Devam Ediyor' ? 'bg-warning' :
                    'bg-info'
                }">
                    ${record.status}
                </span>
            </td>
            <td>${record.technician}</td>
        </tr>
    `).join('');
} 