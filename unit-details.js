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
function loadUnitDetails() {
    const unitId = parseInt(localStorage.getItem('selectedUnitId'));
    if (!unitId) {
        window.location.href = 'index.html';
        return;
    }

    const result = findUnit(unitId);
    if (!result) {
        alert('Ünite bulunamadı!');
        window.location.href = 'index.html';
        return;
    }

    const { unit, gallery } = result;

    // Update page title
    document.getElementById('unitTitle').textContent = unit.name;

    // Fill unit information
    document.getElementById('unitId').textContent = unit.id;
    document.getElementById('unitName').textContent = unit.name;
    document.getElementById('galleryName').textContent = gallery.name;
    document.getElementById('unitStatus').innerHTML = `
        <span class="badge ${unit.status === 'Arızalı' ? 'bg-danger' : 'bg-success'}">
            ${unit.status}
        </span>
    `;
    document.getElementById('lastMaintenance').textContent = formatDate(unit.lastMaintenance);

    // Fill technical details
    const technicalDetails = document.getElementById('technicalDetails');
    if (unit.technicalDetails) {
        technicalDetails.innerHTML = `<pre class="technical-details">${unit.technicalDetails}</pre>`;
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
        document.getElementById('editUnitStatus').value = unit.status;
        document.getElementById('editTechnicalDetails').value = unit.technicalDetails || '';
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

// Save unit details
function saveUnitDetails() {
    const unitId = parseInt(localStorage.getItem('selectedUnitId'));
    const galleries = getGalleries();
    
    // Find unit and gallery
    let targetGallery, targetUnit;
    for (const gallery of galleries) {
        const unit = gallery.units.find(u => u.id === unitId);
        if (unit) {
            targetGallery = gallery;
            targetUnit = unit;
            break;
        }
    }

    if (!targetUnit || !targetGallery) {
        alert('Ünite bulunamadı!');
        return;
    }

    // Update unit details
    targetUnit.name = document.getElementById('editUnitName').value;
    targetUnit.status = document.getElementById('editUnitStatus').value;
    targetUnit.technicalDetails = document.getElementById('editTechnicalDetails').value;
    targetUnit.lastMaintenance = new Date().toISOString().split('T')[0];

    // Update images if new ones were uploaded
    const preview = document.getElementById('imagePreview');
    if (preview.dataset.images) {
        targetUnit.images = JSON.parse(preview.dataset.images);
    }

    // Update gallery stats
    targetGallery.faultyUnits = targetGallery.units.filter(u => u.status === 'Arızalı').length;

    // Save changes
    saveGalleries(galleries);

    // Switch back to view mode and reload details
    toggleEditMode();
    loadUnitDetails();
}

// Helper function to format dates
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR');
}

// Initialize page
document.addEventListener('DOMContentLoaded', loadUnitDetails); 