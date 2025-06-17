// Get galleries from localStorage
function getGalleries() {
    const galleries = localStorage.getItem('galleries');
    return galleries ? JSON.parse(galleries) : [];
}

function loadGalleryDetails() {
    const galleryId = parseInt(localStorage.getItem('selectedGalleryId'));
    if (!galleryId) {
        window.location.href = 'index.html';
        return;
    }

    const galleries = getGalleries();
    const gallery = galleries.find(g => g.id === galleryId);
    
    if (!gallery) {
        alert('Galeri bulunamadı!');
        window.location.href = 'index.html';
        return;
    }

    // Update page title
    document.getElementById('galleryTitle').textContent = gallery.name;

    // Get units for the selected gallery
    const units = gallery.units || [];
    const tableBody = document.getElementById('unitsTable');
    tableBody.innerHTML = '';

    if (units.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center">
                    Bu galeride henüz ünite bulunmamaktadır.
                </td>
            </tr>
        `;
        return;
    }

    units.forEach(unit => {
        const row = document.createElement('tr');
        row.className = unit.status === 'Arızalı' ? 'table-danger' : '';
        row.style.cursor = 'pointer';
        row.onclick = () => showUnitDetails(unit.id);
        row.innerHTML = `
            <td>${unit.id}</td>
            <td>${unit.name}</td>
            <td>
                <span class="badge ${unit.status === 'Arızalı' ? 'bg-danger' : 'bg-success'}">
                    ${unit.status}
                </span>
            </td>
            <td>${formatDate(unit.lastMaintenance)}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Function to show unit details
function showUnitDetails(unitId) {
    localStorage.setItem('selectedUnitId', unitId);
    window.location.href = 'unit-details.html';
}

// Helper function to format dates
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR');
}

// Initialize the page
document.addEventListener('DOMContentLoaded', loadGalleryDetails); 