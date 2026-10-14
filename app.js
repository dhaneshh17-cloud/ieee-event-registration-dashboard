/**
 * Google Developer Groups (GDG) On Campus • MITS Gwalior - DevSummit 2026
 * Core Application Logic, Form Validation, Directory Search/Filtering, and Ticket Generator
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // State
  let currentFilters = {
    search: '',
    track: 'ALL',
    year: 'ALL',
    status: 'ALL',
    sort: 'newest'
  };

  // DOM Elements
  const form = document.getElementById('registrationForm');
  const btnAutoFill = document.getElementById('btnAutoFill');
  const gdgMemberCheckbox = document.getElementById('gdgMember') || document.getElementById('ieeeMember');
  const membershipIdContainer = document.getElementById('membershipIdContainer');
  const participantTableBody = document.getElementById('participantTableBody');
  const participantCardsContainer = document.getElementById('participantCardsContainer');
  const emptyState = document.getElementById('emptyState');
  const filterResultCount = document.getElementById('filterResultCount');
  
  // Search & Filter elements
  const searchInput = document.getElementById('searchInput');
  const filterTrack = document.getElementById('filterTrack');
  const filterYear = document.getElementById('filterYear');
  const filterStatus = document.getElementById('filterStatus');
  const sortBy = document.getElementById('sortBy');
  const btnClearFilters = document.getElementById('btnClearFilters');

  // Dashboard Action elements
  const btnToggleCharts = document.getElementById('btnToggleCharts');
  const chartsBtnLabel = document.getElementById('chartsBtnLabel');
  const analyticsChartsWrapper = document.getElementById('analyticsChartsWrapper');
  const btnExportCsv = document.getElementById('btnExportCsv');
  const btnResetData = document.getElementById('btnResetData');

  // Ticket Modal elements
  const ticketModal = document.getElementById('ticketModal');
  const btnCloseTicketModal = document.getElementById('btnCloseTicketModal');
  const btnCloseTicketBtn = document.getElementById('btnCloseTicketBtn');
  const btnPrintTicket = document.getElementById('btnPrintTicket');

  // Toast Notification
  const toastNotification = document.getElementById('toastNotification');
  const toastTitle = document.getElementById('toastTitle');
  const toastMessage = document.getElementById('toastMessage');

  // Form Fields map for validation
  const fields = {
    fullName: {
      el: document.getElementById('fullName'),
      errEl: document.getElementById('err-fullName'),
      validate: (val) => {
        if (!val || val.trim().length < 3) return 'Please enter your full name (minimum 3 characters)';
        if (!/^[a-zA-Z\s.]+$/.test(val.trim())) return 'Name should contain only alphabets and spaces';
        return '';
      }
    },
    email: {
      el: document.getElementById('email'),
      errEl: document.getElementById('err-email'),
      validate: (val, isSubmitting = false) => {
        if (!val || !val.trim()) return 'Email address is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(val.trim())) return 'Please enter a valid email address (e.g. name@mitsgwalior.in)';
        if (isSubmitting) {
          const existing = window.participantStore.getByEmail(val);
          if (existing) return 'This email address is already registered for this event';
        }
        return '';
      }
    },
    phone: {
      el: document.getElementById('phone'),
      errEl: document.getElementById('err-phone'),
      validate: (val) => {
        if (!val || !val.trim()) return '10-digit phone number is required';
        const cleaned = val.replace(/\D/g, '');
        if (cleaned.length !== 10) return 'Phone number must be exactly 10 digits';
        if (!/^[6-9]\d{9}$/.test(cleaned)) return 'Please enter a valid 10-digit Indian mobile number';
        return '';
      }
    },
    college: {
      el: document.getElementById('college'),
      errEl: document.getElementById('err-college'),
      validate: (val) => {
        if (!val || val.trim().length < 3) return 'Please specify your institution name';
        return '';
      }
    },
    rollNumber: {
      el: document.getElementById('rollNumber'),
      errEl: document.getElementById('err-rollNumber'),
      validate: (val, isSubmitting = false) => {
        if (!val || !val.trim()) return 'Enrollment / Roll number is required';
        if (val.trim().length < 4) return 'Please enter a valid Roll Number';
        if (isSubmitting) {
          const existing = window.participantStore.getByRollNumber(val);
          if (existing) return 'A registration with this Roll Number already exists';
        }
        return '';
      }
    },
    branch: {
      el: document.getElementById('branch'),
      errEl: document.getElementById('err-branch'),
      validate: (val) => (!val ? 'Please select your department / branch' : '')
    },
    year: {
      el: document.getElementById('year'),
      errEl: document.getElementById('err-year'),
      validate: (val) => (!val ? 'Please select your current year of study' : '')
    },
    track: {
      el: document.getElementById('track'),
      errEl: document.getElementById('err-track'),
      validate: (val) => (!val ? 'Please select a specialization track' : '')
    },
    agreeTerms: {
      el: document.getElementById('agreeTerms'),
      errEl: document.getElementById('err-agreeTerms'),
      validate: (val, isSubmitting, el) => (!el.checked ? 'You must agree to the GDG Community Guidelines & Code of Conduct' : '')
    }
  };

  // --- Real-time Field Validation Listeners ---
  Object.keys(fields).forEach(key => {
    const field = fields[key];
    if (!field.el) return;

    const runValidation = (isSubmitting = false) => {
      const err = field.validate(field.el.value, isSubmitting, field.el);
      if (err) {
        field.el.classList.add('input-invalid');
        field.el.classList.remove('input-valid');
        if (field.errEl) {
          field.errEl.textContent = err;
          field.errEl.classList.remove('hidden');
        }
        return false;
      } else {
        field.el.classList.remove('input-invalid');
        if (field.el.value && field.el.type !== 'checkbox') {
          field.el.classList.add('input-valid');
        }
        if (field.errEl) {
          field.errEl.textContent = '';
          field.errEl.classList.add('hidden');
        }
        return true;
      }
    };

    field.el.addEventListener('input', () => runValidation(false));
    field.el.addEventListener('blur', () => runValidation(false));
    field.el.addEventListener('change', () => runValidation(false));
  });

  // Toggle GDG membership ID input
  if (gdgMemberCheckbox) {
    gdgMemberCheckbox.addEventListener('change', (e) => {
      if (membershipIdContainer) {
        if (e.target.checked) {
          membershipIdContainer.classList.remove('hidden');
        } else {
          membershipIdContainer.classList.add('hidden');
        }
      }
    });
  }

  // --- Demo Autofill Helper for Evaluators ---
  const DEMO_NAMES = [
    { name: 'Aditya Gupta', roll: '0901CS221008', branch: 'Computer Science & Engineering', year: '3rd Year', track: 'Applied AI & Machine Learning (GDG AI)', phone: '9826012345' },
    { name: 'Megha Singhal', roll: '0901EC231024', branch: 'Electronics & Communication', year: '2nd Year', track: 'Google Cloud & DevOps (GDG Cloud)', phone: '9425098765' },
    { name: 'Utkarsh Trivedi', roll: '0901EE221056', branch: 'Electrical Engineering', year: '3rd Year', track: 'Android & Flutter Development (GDG Mobile)', phone: '9754123456' },
    { name: 'Tanvi Saxena', roll: '0901IT241019', branch: 'Information Technology', year: '1st Year', track: 'Modern Web & Cloud Systems (GDG Web)', phone: '9981234567' }
  ];

  if (btnAutoFill) {
    btnAutoFill.addEventListener('click', () => {
      const randomDemo = DEMO_NAMES[Math.floor(Math.random() * DEMO_NAMES.length)];
      const randSuffix = Math.floor(100 + Math.random() * 899);

      document.getElementById('fullName').value = randomDemo.name;
      document.getElementById('email').value = `${randomDemo.name.toLowerCase().replace(' ', '.')}${randSuffix}@mitsgwalior.in`;
      document.getElementById('phone').value = randomDemo.phone;
      document.getElementById('college').value = 'Madhav Institute of Technology & Science, Gwalior';
      document.getElementById('rollNumber').value = `${randomDemo.roll.slice(0, -3)}${randSuffix}`;
      document.getElementById('branch').value = randomDemo.branch;
      document.getElementById('year').value = randomDemo.year;
      document.getElementById('track').value = randomDemo.track;
      document.getElementById('experience').value = 'Intermediate';
      document.getElementById('agreeTerms').checked = true;

      // Clear any errors
      Object.keys(fields).forEach(key => {
        const f = fields[key];
        if (f.el) {
          f.el.classList.remove('input-invalid');
          f.el.classList.add('input-valid');
        }
        if (f.errEl) f.errEl.classList.add('hidden');
      });

      showToast('Form Autofilled!', 'Demo student data populated for quick testing.');
    });
  }

  // --- Form Submit Handler ---
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      let hasErrors = false;
      let firstInvalidEl = null;

      // Validate all fields
      Object.keys(fields).forEach(key => {
        const field = fields[key];
        if (!field.el) return;
        const err = field.validate(field.el.value, true, field.el);
        if (err) {
          hasErrors = true;
          field.el.classList.add('input-invalid');
          field.el.classList.remove('input-valid');
          if (field.errEl) {
            field.errEl.textContent = err;
            field.errEl.classList.remove('hidden');
          }
          if (!firstInvalidEl) firstInvalidEl = field.el;
        } else {
          field.el.classList.remove('input-invalid');
          if (field.errEl) field.errEl.classList.add('hidden');
        }
      });

      if (hasErrors) {
        if (firstInvalidEl) {
          firstInvalidEl.focus();
          firstInvalidEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        const card = document.getElementById('registrationCard');
        if (card) {
          card.classList.add('animate-shake');
          setTimeout(() => card.classList.remove('animate-shake'), 500);
        }
        showToast('Validation Error', 'Please check and complete all required fields.', true);
        return;
      }

      // Collect form data
      const isMemberChecked = gdgMemberCheckbox ? gdgMemberCheckbox.checked : false;
      const participantData = {
        fullName: document.getElementById('fullName').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        college: document.getElementById('college').value.trim(),
        rollNumber: document.getElementById('rollNumber').value.trim().toUpperCase(),
        branch: document.getElementById('branch').value,
        year: document.getElementById('year').value,
        track: document.getElementById('track').value,
        experience: document.getElementById('experience').value,
        gdgMember: isMemberChecked,
        ieeeMember: isMemberChecked,
        membershipId: document.getElementById('membershipId') ? document.getElementById('membershipId').value.trim() : ''
      };

      // Add to store
      const newParticipant = window.participantStore.add(participantData);

      // Trigger Confetti Celebration
      if (typeof confetti === 'function') {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      }

      // Refresh UI
      refreshDashboard();

      // Show Admit Pass Modal immediately
      openTicketModal(newParticipant);

      // Reset form
      form.reset();
      Object.keys(fields).forEach(key => {
        const f = fields[key];
        if (f.el) f.el.classList.remove('input-valid', 'input-invalid');
      });
      if (membershipIdContainer) membershipIdContainer.classList.add('hidden');

      showToast('Registration Successful!', 'Your seat has been reserved & admit pass generated.');
    });
  }

  // --- Live Search, Filtering, and Sorting Handlers ---
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentFilters.search = e.target.value.trim().toLowerCase();
      renderParticipantDirectory();
    });
  }

  if (filterTrack) {
    filterTrack.addEventListener('change', (e) => {
      currentFilters.track = e.target.value;
      renderParticipantDirectory();
    });
  }

  if (filterYear) {
    filterYear.addEventListener('change', (e) => {
      currentFilters.year = e.target.value;
      renderParticipantDirectory();
    });
  }

  if (filterStatus) {
    filterStatus.addEventListener('change', (e) => {
      currentFilters.status = e.target.value;
      renderParticipantDirectory();
    });
  }

  if (sortBy) {
    sortBy.addEventListener('change', (e) => {
      currentFilters.sort = e.target.value;
      renderParticipantDirectory();
    });
  }

  if (btnClearFilters) {
    btnClearFilters.addEventListener('click', () => {
      currentFilters = { search: '', track: 'ALL', year: 'ALL', status: 'ALL', sort: 'newest' };
      if (searchInput) searchInput.value = '';
      if (filterTrack) filterTrack.value = 'ALL';
      if (filterYear) filterYear.value = 'ALL';
      if (filterStatus) filterStatus.value = 'ALL';
      if (sortBy) sortBy.value = 'newest';
      renderParticipantDirectory();
      showToast('Filters Cleared', 'Displaying all registered participants.');
    });
  }

  // --- Toggle Analytics Charts ---
  if (btnToggleCharts) {
    btnToggleCharts.addEventListener('click', () => {
      const isHidden = analyticsChartsWrapper.classList.contains('hidden');
      if (isHidden) {
        analyticsChartsWrapper.classList.remove('hidden');
        chartsBtnLabel.textContent = 'Hide Charts';
        if (window.initCharts) window.initCharts();
      } else {
        analyticsChartsWrapper.classList.add('hidden');
        chartsBtnLabel.textContent = 'Show Charts';
      }
    });
  }

  // --- Filter and Sort Core Engine ---
  function getFilteredParticipants() {
    let list = window.participantStore.getAll();

    // 1. Text Search query
    if (currentFilters.search) {
      const q = currentFilters.search;
      list = list.filter(p => 
        p.fullName.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.rollNumber.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q)
      );
    }

    // 2. Track Filter
    if (currentFilters.track !== 'ALL') {
      const ft = currentFilters.track;
      list = list.filter(p => {
        if (p.track === ft) return true;
        if (ft.includes('Cloud') && (p.track.includes('Cloud') || p.track.includes('Robotics') || p.track.includes('RAS'))) return true;
        if (ft.includes('AI') && (p.track.includes('AI') || p.track.includes('Vision'))) return true;
        if (ft.includes('Mobile') && (p.track.includes('Mobile') || p.track.includes('Flutter') || p.track.includes('IoT') || p.track.includes('IAS'))) return true;
        if (ft.includes('Web') && (p.track.includes('Web') || p.track.includes('RoboCode'))) return true;
        return false;
      });
    }

    // 3. Year Filter
    if (currentFilters.year !== 'ALL') {
      list = list.filter(p => p.year === currentFilters.year);
    }

    // 4. Status Filter
    if (currentFilters.status !== 'ALL') {
      list = list.filter(p => p.status === currentFilters.status);
    }

    // 5. Sorting
    list.sort((a, b) => {
      if (currentFilters.sort === 'newest') {
        return new Date(b.registrationDate) - new Date(a.registrationDate);
      } else if (currentFilters.sort === 'oldest') {
        return new Date(a.registrationDate) - new Date(b.registrationDate);
      } else if (currentFilters.sort === 'name_asc') {
        return a.fullName.localeCompare(b.fullName);
      } else if (currentFilters.sort === 'name_desc') {
        return b.fullName.localeCompare(a.fullName);
      }
      return 0;
    });

    return list;
  }

  // --- Render Participant Directory Table & Cards ---
  function renderParticipantDirectory() {
    const list = getFilteredParticipants();
    const totalCount = window.participantStore.getAll().length;

    // Filter feedback count
    if (filterResultCount) {
      if (list.length === totalCount) {
        filterResultCount.textContent = `Showing all ${list.length} participants`;
      } else {
        filterResultCount.textContent = `Showing ${list.length} of ${totalCount} participants (Filtered)`;
      }
    }

    // Handle Empty State
    if (list.length === 0) {
      if (participantTableBody) participantTableBody.innerHTML = '';
      if (participantCardsContainer) participantCardsContainer.innerHTML = '';
      if (emptyState) emptyState.classList.remove('hidden');
      return;
    } else {
      if (emptyState) emptyState.classList.add('hidden');
    }

    // 1. Render Table for Desktop View
    if (participantTableBody) {
      participantTableBody.innerHTML = list.map(p => {
        const initials = p.fullName
          .split(' ')
          .map(n => n[0])
          .slice(0, 2)
          .join('')
          .toUpperCase();

        const statusBadge = p.status === 'Checked-in'
          ? `<span class="badge-checked-in text-xs px-2.5 py-1 rounded-full font-semibold inline-flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full bg-sky-400"></span>Checked-in</span>`
          : `<span class="badge-confirmed text-xs px-2.5 py-1 rounded-full font-semibold inline-flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>Confirmed</span>`;

        return `
          <tr class="hover:bg-slate-900/60 transition-colors">
            <td class="py-3.5 px-4">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-sm flex-shrink-0">
                  ${initials}
                </div>
                <div>
                  <div class="font-bold text-white text-sm hover:text-sky-400 cursor-pointer" onclick="window.handleViewTicket('${p.id}')">
                    ${escapeHtml(p.fullName)}
                  </div>
                  <div class="text-xs text-slate-400 font-mono flex items-center gap-2">
                    <span>${escapeHtml(p.rollNumber)}</span>
                    <span class="text-slate-600">•</span>
                    <span class="text-sky-400/80">${p.id}</span>
                  </div>
                </div>
              </div>
            </td>
            <td class="py-3.5 px-4">
              <div class="text-slate-200 font-medium">${escapeHtml(p.branch)}</div>
              <div class="text-xs text-slate-400">${escapeHtml(p.year)}</div>
            </td>
            <td class="py-3.5 px-4">
              <span class="text-xs font-medium text-slate-300 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg inline-block">
                ${escapeHtml(p.track)}
              </span>
            </td>
            <td class="py-3.5 px-4">
              ${p.gdgMember || p.ieeeMember 
                ? `<span class="text-emerald-400 text-xs font-semibold flex items-center gap-1"><i data-lucide="check-circle" class="w-3.5 h-3.5"></i> GDG Member</span>`
                : `<span class="text-slate-500 text-xs">Non-Member</span>`
              }
            </td>
            <td class="py-3.5 px-4">
              ${statusBadge}
            </td>
            <td class="py-3.5 px-4 text-right">
              <div class="flex items-center justify-end gap-1.5">
                <button 
                  type="button" 
                  onclick="window.handleCheckIn('${p.id}')"
                  class="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-sky-400 border border-slate-800 transition-colors"
                  title="${p.status === 'Checked-in' ? 'Mark Confirmed' : 'Mark Checked-in'}"
                >
                  <i data-lucide="user-check" class="w-4 h-4"></i>
                </button>
                <button 
                  type="button" 
                  onclick="window.handleViewTicket('${p.id}')"
                  class="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-emerald-400 border border-slate-800 transition-colors"
                  title="View Admit Pass / Ticket"
                >
                  <i data-lucide="ticket" class="w-4 h-4"></i>
                </button>
                <button 
                  type="button" 
                  onclick="window.handleDeleteParticipant('${p.id}')"
                  class="p-1.5 rounded-lg bg-slate-900 hover:bg-red-950/60 text-slate-400 hover:text-red-400 border border-slate-800 transition-colors"
                  title="Delete Registration"
                >
                  <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    }

    // 2. Render Cards for Mobile View
    if (participantCardsContainer) {
      participantCardsContainer.innerHTML = list.map(p => {
        const statusBadge = p.status === 'Checked-in'
          ? `<span class="badge-checked-in text-[10px] px-2 py-0.5 rounded-full font-semibold">Checked-in</span>`
          : `<span class="badge-confirmed text-[10px] px-2 py-0.5 rounded-full font-semibold">Confirmed</span>`;

        return `
          <div class="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3">
            <div class="flex items-start justify-between">
              <div>
                <div class="text-xs font-mono text-sky-400">${p.id}</div>
                <h4 class="font-bold text-white text-base">${escapeHtml(p.fullName)}</h4>
                <div class="text-xs text-slate-400 font-mono">${escapeHtml(p.rollNumber)}</div>
              </div>
              ${statusBadge}
            </div>
            
            <div class="text-xs text-slate-300 space-y-1 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
              <div><strong>Branch:</strong> ${escapeHtml(p.branch)} (${escapeHtml(p.year)})</div>
              <div><strong>Track:</strong> <span class="text-sky-300">${escapeHtml(p.track)}</span></div>
              <div><strong>Email:</strong> ${escapeHtml(p.email)}</div>
            </div>

            <div class="flex items-center justify-between pt-1">
              <span class="text-[11px] text-slate-400">
                ${p.gdgMember || p.ieeeMember ? '★ GDG Member' : 'Non-Member'}
              </span>
              <div class="flex items-center gap-2">
                <button 
                  type="button" 
                  onclick="window.handleCheckIn('${p.id}')"
                  class="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 flex items-center gap-1"
                >
                  <i data-lucide="user-check" class="w-3.5 h-3.5 text-sky-400"></i> Check-in
                </button>
                <button 
                  type="button" 
                  onclick="window.handleViewTicket('${p.id}')"
                  class="px-2.5 py-1.5 rounded-lg bg-sky-600/30 border border-sky-500/40 text-xs text-sky-300 flex items-center gap-1"
                >
                  <i data-lucide="ticket" class="w-3.5 h-3.5"></i> Pass
                </button>
                <button 
                  type="button" 
                  onclick="window.handleDeleteParticipant('${p.id}')"
                  class="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-red-400"
                >
                  <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    // Re-initialize Lucide Icons on newly rendered elements
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  // --- Update Dashboard KPIs and Analytics ---
  function updateDashboardKPIs() {
    const analytics = window.participantStore.getAnalytics();

    const kpiTotal = document.getElementById('kpiTotal');
    const kpiSeatsLeft = document.getElementById('kpiSeatsLeft');
    const kpiCheckIn = document.getElementById('kpiCheckIn');
    const kpiCheckInPct = document.getElementById('kpiCheckInPct');
    const kpiMembers = document.getElementById('kpiMembers');
    const navCounterBadge = document.getElementById('navCounterBadge');
    const heroSeatsText = document.getElementById('heroSeatsText');
    const heroProgressBar = document.getElementById('heroProgressBar');

    if (kpiTotal) kpiTotal.textContent = analytics.total;
    if (kpiSeatsLeft) kpiSeatsLeft.textContent = analytics.seatsRemaining;
    if (kpiCheckIn) kpiCheckIn.textContent = analytics.checkedIn;
    if (kpiMembers) kpiMembers.textContent = analytics.gdgMembers !== undefined ? analytics.gdgMembers : analytics.ieeeMembers;

    if (kpiCheckInPct) {
      const pct = analytics.total > 0 ? Math.round((analytics.checkedIn / analytics.total) * 100) : 0;
      kpiCheckInPct.textContent = `(${pct}%)`;
    }

    if (navCounterBadge) {
      navCounterBadge.textContent = analytics.total;
    }

    if (heroSeatsText && heroProgressBar) {
      heroSeatsText.textContent = `${analytics.total} Registered / ${analytics.seatsRemaining} Left`;
      const fillPct = Math.min(100, Math.round((analytics.total / analytics.totalCapacity) * 100));
      heroProgressBar.style.width = `${Math.max(5, fillPct)}%`;
    }
  }

  function refreshDashboard() {
    updateDashboardKPIs();
    renderParticipantDirectory();
    if (window.updateCharts) window.updateCharts();
  }

  // --- Export Filtered Directory to CSV ---
  if (btnExportCsv) {
    btnExportCsv.addEventListener('click', () => {
      const list = getFilteredParticipants();
      if (list.length === 0) {
        showToast('Export Empty', 'No participants match the selected filter criteria.', true);
        return;
      }

      const headers = ['Registration ID', 'Full Name', 'Email', 'Phone', 'College', 'Roll Number', 'Branch', 'Year', 'Track', 'Experience', 'GDG Member', 'Status', 'Registered At'];
      const csvRows = [headers.join(',')];

      list.forEach(p => {
        const isMem = p.gdgMember || p.ieeeMember;
        const row = [
          `"${p.id}"`,
          `"${p.fullName.replace(/"/g, '""')}"`,
          `"${p.email}"`,
          `"${p.phone}"`,
          `"${(p.college || '').replace(/"/g, '""')}"`,
          `"${p.rollNumber}"`,
          `"${p.branch}"`,
          `"${p.year}"`,
          `"${p.track}"`,
          `"${p.experience || ''}"`,
          `"${isMem ? 'Yes' : 'No'}"`,
          `"${p.status}"`,
          `"${new Date(p.registrationDate).toLocaleString()}"`
        ];
        csvRows.push(row.join(','));
      });

      const blob = new Blob(['\uFEFF' + csvRows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `GDG_DevSummit_Participants_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast('CSV Downloaded', `Successfully exported ${list.length} participant records.`);
    });
  }

  // --- Reset to Default Seeds ---
  if (btnResetData) {
    btnResetData.addEventListener('click', () => {
      if (confirm('Reset participant records to default sample students from MITS Gwalior?')) {
        window.participantStore.resetToDefault();
        refreshDashboard();
        showToast('Data Reset', 'Participants restored to default GDG MITS student list.');
      }
    });
  }

  // --- Digital Pass / Ticket Modal ---
  function openTicketModal(participant) {
    document.getElementById('ticketId').textContent = participant.id;
    document.getElementById('ticketName').textContent = participant.fullName;
    document.getElementById('ticketRoll').textContent = participant.rollNumber;
    document.getElementById('ticketBranchYear').textContent = `${participant.branch.split(' ')[0]} • ${participant.year}`;
    document.getElementById('ticketTrack').textContent = participant.track;

    // Render realistic SVG QR code pattern
    renderSvgQrCode(participant.id);

    ticketModal.classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons();
  }

  function closeTicketModal() {
    ticketModal.classList.add('hidden');
  }

  if (btnCloseTicketModal) btnCloseTicketModal.addEventListener('click', closeTicketModal);
  if (btnCloseTicketBtn) btnCloseTicketBtn.addEventListener('click', closeTicketModal);
  if (btnPrintTicket) {
    btnPrintTicket.addEventListener('click', () => {
      window.print();
    });
  }

  // Click outside modal to close
  window.addEventListener('click', (e) => {
    if (e.target === ticketModal) closeTicketModal();
  });

  // --- Dynamic QR Code SVG Generator ---
  function renderSvgQrCode(text) {
    const container = document.getElementById('ticketQrCode');
    if (!container) return;

    // Generate high contrast scannable-looking matrix pattern based on seed text
    const size = 21;
    let seed = 0;
    for (let i = 0; i < text.length; i++) seed += text.charCodeAt(i);

    let rects = '';
    // Standard 3 position detection patterns (corners)
    function addPositionPattern(x, y) {
      rects += `<rect x="${x}" y="${y}" width="7" height="7" fill="#0F172A" />`;
      rects += `<rect x="${x + 1}" y="${y + 1}" width="5" height="5" fill="#FFFFFF" />`;
      rects += `<rect x="${x + 2}" y="${y + 2}" width="3" height="3" fill="#0F172A" />`;
    }

    addPositionPattern(0, 0);
    addPositionPattern(size - 7, 0);
    addPositionPattern(0, size - 7);

    // Fill pseudo data modules
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        // Skip corner finder patterns
        if ((r < 7 && c < 7) || (r < 7 && c >= size - 7) || (r >= size - 7 && c < 7)) continue;
        
        // Pseudo random bit
        const bit = ((r * 13 + c * 7 + seed) % 5 === 0) || ((r + c + (seed % 3)) % 2 === 0);
        if (bit) {
          rects += `<rect x="${c}" y="${r}" width="1" height="1" fill="#0F172A" />`;
        }
      }
    }

    container.innerHTML = `
      <svg viewBox="0 0 ${size} ${size}" class="w-full h-full" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
        <rect width="${size}" height="${size}" fill="#FFFFFF" />
        ${rects}
      </svg>
    `;
  }

  // --- Toast Notification Service ---
  let toastTimer = null;
  function showToast(title, message, isError = false) {
    if (!toastNotification) return;

    toastTitle.textContent = title;
    toastMessage.textContent = message;

    if (isError) {
      toastNotification.classList.remove('border-emerald-500/40');
      toastNotification.classList.add('border-red-500/60');
    } else {
      toastNotification.classList.remove('border-red-500/60');
      toastNotification.classList.add('border-emerald-500/40');
    }

    toastNotification.classList.remove('translate-y-24', 'opacity-0', 'pointer-events-none');

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastNotification.classList.add('translate-y-24', 'opacity-0', 'pointer-events-none');
    }, 4000);
  }

  // --- Safe Countdown Handler (GDG Crew Photo featured on hero) ---
  let countdownInterval;
  function initCountdown() {
    if (countdownInterval) clearInterval(countdownInterval);

    const elDays = document.getElementById('countdownDays');
    if (!elDays) return;

    const targetDateStr = window.participantStore.eventConfig?.targetDate || '2026-10-24T09:30:00+05:30';
    const targetDate = new Date(targetDateStr).getTime();

    function update() {
      const now = new Date().getTime();
      const distance = targetDate - now;

      const d = document.getElementById('countdownDays');
      const h = document.getElementById('countdownHours');
      const m = document.getElementById('countdownMinutes');
      const s = document.getElementById('countdownSeconds');
      if (!d || !h || !m || !s) return;

      if (distance < 0) {
        d.textContent = '00';
        h.textContent = '00';
        m.textContent = '00';
        s.textContent = '00';
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      d.textContent = String(days).padStart(2, '0');
      h.textContent = String(hours).padStart(2, '0');
      m.textContent = String(minutes).padStart(2, '0');
      s.textContent = String(seconds).padStart(2, '0');
    }

    update();
    countdownInterval = setInterval(update, 1000);
  }

  // Bind real-time data sync from Firebase to UI
  window.participantStore.onDataChange = () => {
    initCountdown();
    refreshDashboard();
  };

  // Helper escape HTML
  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Global Handlers attached to window for table action buttons
  window.handleCheckIn = (id) => {
    const updated = window.participantStore.toggleCheckIn(id);
    if (updated) {
      refreshDashboard();
      showToast('Status Updated', `${updated.fullName} is now marked as ${updated.status}.`);
    }
  };

  window.handleViewTicket = (id) => {
    const participant = window.participantStore.getById(id);
    if (participant) {
      openTicketModal(participant);
    }
  };

  window.handleDeleteParticipant = (id) => {
    const p = window.participantStore.getById(id);
    if (p && confirm(`Are you sure you want to remove registration ${p.id} (${p.fullName})?`)) {
      window.participantStore.remove(id);
      refreshDashboard();
      showToast('Registration Removed', `Participant ${p.fullName} deleted.`);
    }
  };

  // --- Initial Launch ---
  initCountdown();
  refreshDashboard();
});
