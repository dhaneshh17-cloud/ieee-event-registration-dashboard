// script.js - Enhances GDG Event Registration Dashboard interactivity

// Utility Functions
function $(selector) { return document.querySelector(selector); }
function $all(selector) { return document.querySelectorAll(selector); }

// Load participants from LocalStorage or initialize empty array
let participants = JSON.parse(localStorage.getItem('gdg_devsummit_participants_2026') || localStorage.getItem('participants') || '[]');

// Update KPI counters
function updateKPIs() {
  const total = participants.length;
  const capacity = 150; // total seats
  const remaining = Math.max(0, capacity - total);
  const checkedIn = participants.filter(p => p.checkedIn || p.status === 'Checked-in').length;
  const checkedPct = total ? Math.round((checkedIn / total) * 100) : 0;

  if ($('#kpiTotal')) $('#kpiTotal').textContent = total;
  if ($('#kpiSeatsLeft')) $('#kpiSeatsLeft').textContent = remaining;
  if ($('#kpiCheckIn')) $('#kpiCheckIn').textContent = checkedIn;
  if ($('#kpiCheckInPct')) $('#kpiCheckInPct').textContent = `(${checkedPct}%)`;
  if ($('#heroSeatsText')) $('#heroSeatsText').textContent = `${total}/${capacity}`;
  if ($('#heroProgressBar')) {
    const progress = Math.min(100, (total / capacity) * 100);
    $('#heroProgressBar').style.width = `${progress}%`;
  }
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
      <tr class="${p.checkedIn || p.status === 'Checked-in' ? 'bg-emerald-900/30' : ''}">
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
  localStorage.setItem('gdg_devsummit_participants_2026', JSON.stringify(participants));
}

// Form validation helpers
function validateField(input, validator, errorMsg) {
  const errorEl = $(`#err-${input.id}`);
  if (validator(input.value)) {
    input.classList.remove('border-red-500');
    if (errorEl) errorEl.classList.add('hidden');
    return true;
  } else {
    input.classList.add('border-red-500');
    if (errorEl) {
      errorEl.textContent = errorMsg;
      errorEl.classList.remove('hidden');
    }
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
      agree.checked || (function(){ 
        const err = $('#err-agreeTerms');
        if (err) {
          err.textContent='You must accept the GDG Code of Conduct.'; 
          err.classList.remove('hidden'); 
        }
        return false; 
      })()
    ];

    if (validators.every(v => v)) {
      const participant = {
        id: 'GDG-2026-' + Math.floor(1000 + Math.random() * 9000),
        fullName: fullName.value.trim(),
        email: email.value.trim(),
        phone: phone.value.trim(),
        rollNumber: rollNumber.value.trim(),
        branch: branch.value,
        year: year.value,
        track: track.value,
        experience: experience.value,
        checkedIn: false,
        gdgMember: true,
        timestamp: Date.now()
      };
      participants.push(participant);
      saveData();
      updateKPIs();
      renderDirectory($('#searchInput')?.value || '');
      form.reset();
      if (typeof confetti === 'function') confetti();
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
      email: 'demo.student@mitsgwalior.in',
      phone: '9876543210',
      rollNumber: '0901CS221099',
      branch: 'Computer Science & Engineering',
      year: '2nd Year',
      track: 'Google Cloud & DevOps (GDG Cloud)',
      experience: 'Beginner'
    };
    if ($('#fullName')) $('#fullName').value = demo.fullName;
    if ($('#email')) $('#email').value = demo.email;
    if ($('#phone')) $('#phone').value = demo.phone;
    if ($('#rollNumber')) $('#rollNumber').value = demo.rollNumber;
    if ($('#branch')) $('#branch').value = demo.branch;
    if ($('#year')) $('#year').value = demo.year;
    if ($('#track')) $('#track').value = demo.track;
    if ($('#experience')) $('#experience').value = demo.experience;
  });
}
