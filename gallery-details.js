// Firebase yüklenene kadar bekle
let db;

function initializeFirebase() {
    try {
        // Firebase'in başlatıldığından emin ol
        if (firebase && firebase.firestore) {
            db = firebase.firestore();
            console.log('Firebase başarıyla başlatıldı');
            // Sayfayı başlat
            loadGalleryDetails();
        } else {
            console.error('Firebase yüklenemedi');
        }
    } catch (error) {
        console.error('Firebase başlatılırken hata:', error);
    }
}

async function loadGalleryDetails() {
    const galleryId = localStorage.getItem('selectedGalleryId');
    if (!galleryId) {
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
    } catch (error) {
        console.error('Galeri detayları yüklenirken hata:', error);
        alert('Galeri detayları yüklenirken bir hata oluştu.');
    }
}

// Function to show unit details
function showUnitDetails(unitId) {
    localStorage.setItem('selectedUnitId', unitId);
    window.location.href = 'unit-details.html';
}

// Helper function to format dates
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR');
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    // Firebase'in yüklenmesi için kısa bir süre bekle
    setTimeout(initializeFirebase, 500);
}); 