// Check if user is admin
function checkAdminAccess() {
    const username = localStorage.getItem('username');
    if (username !== 'admin') {
        alert('Bu sayfaya erişim yetkiniz yok!');
        window.location.href = 'index.html';
    }
}

// Get galleries from localStorage or initialize
function getGalleries() {
    const galleries = localStorage.getItem('galleries');
    return galleries ? JSON.parse(galleries) : [
        { 
            id: 1, 
            name: "Uzay Galerisi", 
            description: "Uzay ve astronomi sergisi", 
            totalUnits: 3, 
            faultyUnits: 1,
            units: [
                { id: 101, name: "Güneş Sistemi Modeli", description: "Güneş sistemi maket", status: "Çalışıyor", lastMaintenance: "2024-02-15" },
                { id: 102, name: "Mars Yüzeyi", description: "Mars yüzeyi simülasyonu", status: "Arızalı", lastMaintenance: "2024-01-20" },
                { id: 103, name: "Uzay İstasyonu", description: "ISS modeli", status: "Çalışıyor", lastMaintenance: "2024-02-10" }
            ]
        },
        { 
            id: 2, 
            name: "Dünya ve Yaşam Galerisi", 
            description: "Dünya ve yaşam formları sergisi", 
            totalUnits: 2, 
            faultyUnits: 0,
            units: [
                { id: 201, name: "Dinozor Fosilleri", description: "Dinozor fosil örnekleri", status: "Çalışıyor", lastMaintenance: "2024-02-12" },
                { id: 202, name: "DNA Modeli", description: "İnteraktif DNA modeli", status: "Çalışıyor", lastMaintenance: "2024-02-01" }
            ]
        }
    ];
}

// Save galleries to localStorage
function saveGalleries(galleries) {
    localStorage.setItem('galleries', JSON.stringify(galleries));
}

// Display galleries in table
function displayGalleries() {
    const galleries = getGalleries();
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
            <td>${gallery.id}</td>
            <td>${gallery.name}</td>
            <td>${gallery.totalUnits}</td>
            <td>${gallery.faultyUnits}</td>
            <td class="action-buttons">
                <button class="btn btn-sm btn-primary me-2" onclick="editGallery(${gallery.id})">
                    <i class="bi bi-pencil"></i> Düzenle
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteGallery(${gallery.id})">
                    <i class="bi bi-trash"></i> Sil
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Add new gallery
function addGallery() {
    const name = document.getElementById('galleryName').value;
    const description = document.getElementById('galleryDescription').value;
    
    if (!name) {
        alert('Galeri adı zorunludur!');
        return;
    }

    const galleries = getGalleries();
    const newId = galleries.length > 0 ? Math.max(...galleries.map(g => g.id)) + 1 : 1;

    const newGallery = {
        id: newId,
        name: name,
        description: description,
        totalUnits: 0,
        faultyUnits: 0,
        units: []
    };

    galleries.push(newGallery);
    saveGalleries(galleries);
    displayGalleries();

    // Close modal and reset form
    const modal = bootstrap.Modal.getInstance(document.getElementById('addGalleryModal'));
    modal.hide();
    document.getElementById('addGalleryForm').reset();
}

// Load gallery data for editing
function editGallery(id) {
    const galleries = getGalleries();
    const gallery = galleries.find(g => g.id === id);
    
    if (gallery) {
        document.getElementById('editGalleryId').value = gallery.id;
        document.getElementById('editGalleryName').value = gallery.name;
        document.getElementById('editGalleryDescription').value = gallery.description;
        
        const modal = new bootstrap.Modal(document.getElementById('editGalleryModal'));
        modal.show();
    }
}

// Update gallery
function updateGallery() {
    const id = parseInt(document.getElementById('editGalleryId').value);
    const name = document.getElementById('editGalleryName').value;
    const description = document.getElementById('editGalleryDescription').value;

    if (!name) {
        alert('Galeri adı zorunludur!');
        return;
    }

    const galleries = getGalleries();
    const index = galleries.findIndex(g => g.id === id);
    
    if (index !== -1) {
        galleries[index] = {
            ...galleries[index],
            name: name,
            description: description
        };
        
        saveGalleries(galleries);
        displayGalleries();

        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('editGalleryModal'));
        modal.hide();
    }
}

// Delete gallery
function deleteGallery(id) {
    if (confirm('Bu galeriyi silmek istediğinizden emin misiniz?')) {
        const galleries = getGalleries();
        const filteredGalleries = galleries.filter(g => g.id !== id);
        saveGalleries(filteredGalleries);
        displayGalleries();
    }
}

// Show gallery units
function showGalleryUnits(galleryId) {
    const galleries = getGalleries();
    const gallery = galleries.find(g => g.id === galleryId);
    
    if (gallery) {
        // Update UI
        document.getElementById('gallerySection').style.display = 'none';
        document.getElementById('unitsSection').style.display = 'block';
        document.getElementById('selectedGalleryName').textContent = `${gallery.name} - Üniteler`;
        
        // Store selected gallery ID
        localStorage.setItem('selectedGalleryId', galleryId);
        
        // Display units
        displayUnits(gallery.units);
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
            <td>${unit.id}</td>
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

// Helper function to format dates
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR');
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    checkAdminAccess();
    
    // Check if we need to show units section
    const selectedGalleryId = localStorage.getItem('selectedGalleryId');
    if (selectedGalleryId) {
        showGalleryUnits(parseInt(selectedGalleryId));
    } else {
        displayGalleries();
    }
}); 