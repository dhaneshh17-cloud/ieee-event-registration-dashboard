// script.js - Enhances IEEE Event Registration Dashboard interactivity

// Utility Functions
function $(selector) { return document.querySelector(selector); }
function $all(selector) { return document.querySelectorAll(selector); }

// Load participants from LocalStorage or initialize empty array
let participants = JSON.parse(localStorage.getItem('participants') || '[]');

// Update KPI counters
function updateKPIs() {
  const total = participants.length;
  const capacity = 150; // total seats
  const remaining = capacity - total;
  const checkedIn = participants.filter(p => p.checkedIn).length;
  const checkedPct = total ? Math.round((checkedIn / total) * 100) : 0;

  $('#kpiTotal').textContent = total;
  $('#kpiSeatsLeft').textContent = remaining;
  $('#kpiCheckIn').textContent = checkedIn;
  $('#kpiCheckInPct').textContent = `(${checkedPct}%)`;
  $('#heroSeatsText').textContent = `${total}/${capacity}`;
  const progress = Math.min(100, (total / capacity) * 100);
  $('#heroProgressBar').style.width = `${progress}%`;
}

// Render participant directory
function renderDirectory(filter = '') {
  const container = $('#participantTableBody');
  if (!container) return;
  const rows = participants
    .filter(p => {
      const term = filter.toLowerCase();
      return (
        p.fullName.toLowerCase().includes(term) ||
        p.email.toLowerCase().includes(term) ||
        p.branch.toLowerCase().includes(term) ||
        p.track.toLowerCase().includes(term)
      );
    })
    .map(p => `
      <tr class="${p.checkedIn ? 'bg-emerald-900/30' : ''}">
        <td class="px-4 py-2">${p.fullName}</td>
        <td class="px-4 py-2">${p.email}</td>
        <td class="px-4 py-2">${p.branch}</td>
        <td class="px-4 py-2">${p.track}</td>
        <td class="px-4 py-2 text-center">
          <button data-id="${p.id}" class="checkinBtn px-2 py-1 rounded bg-sky-600 hover:bg-sky-500 text-xs">${p.checkedIn ? 'Undo Check‑in' : 'Check‑in'}</button>
        </td>
      </tr>`)
    .join('');
  container.innerHTML = rows || `<tr><td colspan="5" class="text-center py-4 text-slate-400">No participants found.</td></tr>`;
  attachCheckinHandlers();
}

// Attach check‑in button listeners
function attachCheckinHandlers() {
  $all('.checkinBtn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const participant = participants.find(p => p.id === id);
      if (participant) {
        participant.checkedIn = !participant.checkedIn;
        saveData();
        renderDirectory($('#searchInput')?.value || '');
        updateKPIs();
      }
    });
  });
}

// Save participants to LocalStorage
function saveData() {
  localStorage.setItem('participants', JSON.stringify(participants));
}

// Form validation helpers
function validateField(input, validator, errorMsg) {
  const errorEl = $(`#err-${input.id}`);
  if (validator(input.value)) {
    input.classList.remove('border-red-500');
    errorEl.classList.add('hidden');
    return true;
  } else {
    input.classList.add('border-red-500');
    errorEl.textContent = errorMsg;
    errorEl.classList.remove('hidden');
    return false;
  }
}

function setupFormValidation() {
  const form = $('#registrationForm');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const fullName = $('#fullName');
    const email = $('#email');
    const phone = $('#phone');
    const rollNumber = $('#rollNumber');
    const branch = $('#branch');
    const year = $('#year');
    const track = $('#track');
    const experience = $('#experience');
    const agree = $('#agreeTerms');

    const validators = [
      validateField(fullName, v => /^[A-Za-z ]{3,}$/.test(v), 'Enter a valid name (min 3 letters).'),
      validateField(email, v => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v), 'Enter a valid email address.'),
      validateField(phone, v => /^\d{10}$/.test(v), 'Enter a 10‑digit phone number.'),
      validateField(rollNumber, v => /^[A-Za-z0-9]+$/.test(v), 'Enter a valid roll number.'),
      validateField(branch, v => v !== '', 'Select a branch.'),
      validateField(year, v => v !== '', 'Select year of study.'),
      validateField(track, v => v !== '', 'Select a track.'),
      validateField(experience, v => v !== '', 'Select experience level.'),
      agree.checked || (function(){ $('#err-agreeTerms').textContent='You must accept the terms.'; $('#err-agreeTerms').classList.remove('hidden'); return false; })()
    ];

    if (validators.every(v => v)) {
      const participant = {
        id: crypto.randomUUID(),
        fullName: fullName.value.trim(),
        email: email.value.trim(),
        phone: phone.value.trim(),
        rollNumber: rollNumber.value.trim(),
        branch: branch.value,
        year: year.value,
        track: track.value,
        experience: experience.value,
        checkedIn: false,
        timestamp: Date.now()
      };
      participants.push(participant);
      saveData();
      updateKPIs();
      renderDirectory($('#searchInput')?.value || '');
      form.reset();
      // optional confetti
      confetti();
    }
  });
}

// Demo autofill button
function setupDemoFill() {
  const btn = $('#btnAutoFill');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const demo = {
      fullName: 'Demo Student',
      email: 'demo.student@example.com',
      phone: '9876543210',
      rollNumber: '2022CS123456',
      branch: 'Computer Science & Engineering',
      year: '2nd Year',
      track: 'Robotics & Hardware (IEEE RAS Track)',
      experience: 'Beginner'
    };
    $('#fullName').value = demo.fullName;
    $('#email').value = demo.email;
    $('#phone').value = demo.phone;
    $('#rollNumber').value = demo.rollNumber;
    $('#branch').value = demo.branch;
    $('#year').value = demo.year;
    $('#track').value = demo.track;
    $('#experience').value = demo.experience;
  });
}

// Search/filter for directory
function setupSearch() {
  const input = $('#searchInput');
  if (!input) return;
  input.addEventListener('input', () => {
    renderDirectory(input.value);
  });
}

// Export CSV
function setupExport() {
  const btn = $('#btnExportCsv');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const csv = ['Full Name,Email,Phone,Roll Number,Branch,Year,Track,Experience,CheckedIn'].concat(
      participants.map(p => `${p.fullName},${p.email},${p.phone},${p.rollNumber},${p.branch},${p.year},${p.track},${p.experience},${p.checkedIn}`)
    ).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'participants.csv';
    a.click();
    URL.revokeObjectURL(url);
  });
}

// Toggle charts visibility (placeholder – you can hook actual Chart.js later)
function setupChartToggle() {
  const btn = $('#btnToggleCharts');
  const label = $('#chartsBtnLabel');
  const chartContainer = $('#chartsContainer');
  if (!btn || !label) return;
  btn.addEventListener('click', () => {
    if (chartContainer) {
      const visible = chartContainer.classList.toggle('hidden');
      label.textContent = visible ? 'Hide Charts' : 'Show Charts';
    }
  });
}

// Reset data to seed (clears localStorage)
function setupReset() {
  const btn = $('#btnResetData');
  if (!btn) return;
  btn.addEventListener('click', () => {
    if (confirm('Reset all participant data? This cannot be undone.')) {
      participants = [];
      saveData();
      updateKPIs();
      renderDirectory();
    }
  });
}

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  updateKPIs();
  renderDirectory();
  setupFormValidation();
  setupDemoFill();
  setupSearch();
  setupExport();
  setupChartToggle();
  setupReset();
});

// Simple confetti fallback using canvas‑confetti CDN (already loaded in HTML)
function confetti() {
  if (typeof confetti === 'function') {
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
  }
}
