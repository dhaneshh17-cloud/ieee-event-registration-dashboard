/**
 * IEEE IAS & RAS MITS Gwalior - InnovateX 2026
 * Data Management & LocalStorage Persistence Service
 */

const STORAGE_KEY = 'ieee_innovatex_participants_2026';

// Realistic pre-seeded participants from MITS Gwalior for instant testing & evaluation
const DEFAULT_PARTICIPANTS = [
  {
    id: 'INX-2026-1001',
    fullName: 'Aarav Sharma',
    email: 'aarav.sharma22@mitsgwalior.in',
    phone: '9827103456',
    college: 'Madhav Institute of Technology & Science, Gwalior',
    rollNumber: '0901CS221012',
    branch: 'Computer Science & Engineering',
    year: '3rd Year',
    track: 'Robotics & Hardware (RAS)',
    experience: 'Intermediate',
    ieeeMember: true,
    membershipId: '98451230',
    status: 'Checked-in',
    registrationDate: '2026-10-01T10:30:00.000Z'
  },
  {
    id: 'INX-2026-1002',
    fullName: 'Priya Sen',
    email: 'priya.sen23@mitsgwalior.in',
    phone: '9425187654',
    college: 'Madhav Institute of Technology & Science, Gwalior',
    rollNumber: '0901EC231045',
    branch: 'Electronics & Communication',
    year: '2nd Year',
    track: 'Industrial IoT & Automation (IAS)',
    experience: 'Beginner',
    ieeeMember: false,
    membershipId: '',
    status: 'Confirmed',
    registrationDate: '2026-10-02T14:15:00.000Z'
  },
  {
    id: 'INX-2026-1003',
    fullName: 'Rohan Gupta',
    email: 'rohan.gupta21@mitsgwalior.in',
    phone: '9752314567',
    college: 'Madhav Institute of Technology & Science, Gwalior',
    rollNumber: '0901EE211088',
    branch: 'Electrical Engineering',
    year: '4th Year',
    track: 'Industrial IoT & Automation (IAS)',
    experience: 'Advanced',
    ieeeMember: true,
    membershipId: '95123478',
    status: 'Checked-in',
    registrationDate: '2026-10-02T16:45:00.000Z'
  },
  {
    id: 'INX-2026-1004',
    fullName: 'Ananya Verma',
    email: 'ananya.ai23@mitsgwalior.in',
    phone: '9111456789',
    college: 'Madhav Institute of Technology & Science, Gwalior',
    rollNumber: '0901AI231015',
    branch: 'Artificial Intelligence & Data Science',
    year: '2nd Year',
    track: 'Applied AI & Computer Vision',
    experience: 'Intermediate',
    ieeeMember: true,
    membershipId: '99214755',
    status: 'Confirmed',
    registrationDate: '2026-10-03T09:20:00.000Z'
  },
  {
    id: 'INX-2026-1005',
    fullName: 'Devendra Patel',
    email: 'devendra.me24@mitsgwalior.in',
    phone: '9685123490',
    college: 'Madhav Institute of Technology & Science, Gwalior',
    rollNumber: '0901ME241032',
    branch: 'Mechanical Engineering',
    year: '1st Year',
    track: 'Robotics & Hardware (RAS)',
    experience: 'Beginner',
    ieeeMember: false,
    membershipId: '',
    status: 'Confirmed',
    registrationDate: '2026-10-04T11:00:00.000Z'
  },
  {
    id: 'INX-2026-1006',
    fullName: 'Ishita Jain',
    email: 'ishita.it22@mitsgwalior.in',
    phone: '9893456712',
    college: 'Madhav Institute of Technology & Science, Gwalior',
    rollNumber: '0901IT221074',
    branch: 'Information Technology',
    year: '3rd Year',
    track: 'RoboCode & Web Systems',
    experience: 'Advanced',
    ieeeMember: true,
    membershipId: '97845612',
    status: 'Checked-in',
    registrationDate: '2026-10-04T15:30:00.000Z'
  },
  {
    id: 'INX-2026-1007',
    fullName: 'Vikram Rajput',
    email: 'vikram.cs23@mitsgwalior.in',
    phone: '9301234567',
    college: 'Madhav Institute of Technology & Science, Gwalior',
    rollNumber: '0901CS231120',
    branch: 'Computer Science & Engineering',
    year: '2nd Year',
    track: 'Applied AI & Computer Vision',
    experience: 'Beginner',
    ieeeMember: false,
    membershipId: '',
    status: 'Confirmed',
    registrationDate: '2026-10-05T12:10:00.000Z'
  },
  {
    id: 'INX-2026-1008',
    fullName: 'Sneha Chourasia',
    email: 'sneha.ec22@mitsgwalior.in',
    phone: '9584127890',
    college: 'Madhav Institute of Technology & Science, Gwalior',
    rollNumber: '0901EC221098',
    branch: 'Electronics & Communication',
    year: '3rd Year',
    track: 'Robotics & Hardware (RAS)',
    experience: 'Intermediate',
    ieeeMember: true,
    membershipId: '96325874',
    status: 'Confirmed',
    registrationDate: '2026-10-05T18:05:00.000Z'
  }
];

class ParticipantStore {
  constructor() {
    this.participants = [];
    this.eventConfig = {
      totalCapacity: 150,
      targetDate: '2026-10-24T09:30:00+05:30'
    };
    this.onDataChange = null;

    this.loadInitialData();

    // Initialize Firebase listeners if configured
    if (window.isFirebaseConfigured) {
      this.db = firebase.firestore();
      this.setupFirebaseListeners();
    }
  }

  loadInitialData() {
    try {
      const storedConfig = localStorage.getItem(STORAGE_KEY + '_config');
      if (storedConfig) {
        this.eventConfig = JSON.parse(storedConfig);
      }

      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.participants = parsed;
          return;
        }
      }
    } catch (e) {
      console.warn('Failed to load from localStorage:', e);
    }
    // Initialize with default seeds
    this.participants = [...DEFAULT_PARTICIPANTS];
    this.persistLocal();
  }

  persistLocal() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.participants));
      localStorage.setItem(STORAGE_KEY + '_config', JSON.stringify(this.eventConfig));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }

  setupFirebaseListeners() {
    // Listen to dynamic event config
    this.db.collection('config').doc('eventDetails').onSnapshot(doc => {
      if (doc.exists) {
        this.eventConfig = { ...this.eventConfig, ...doc.data() };
        this.persistLocal();
        if (this.onDataChange) this.onDataChange();
      }
    });

    // Listen to real-time participant registrations
    this.db.collection('participants').onSnapshot(snapshot => {
      const serverParticipants = [];
      snapshot.forEach(doc => {
        serverParticipants.push(doc.data());
      });
      
      serverParticipants.sort((a, b) => new Date(b.registrationDate) - new Date(a.registrationDate));
      
      if (serverParticipants.length > 0) {
         this.participants = serverParticipants;
         this.persistLocal();
         if (this.onDataChange) this.onDataChange();
      }
    }, err => {
      console.error("Firebase sync error:", err);
    });
  }

  getAll() {
    return [...this.participants];
  }

  getById(id) {
    return this.participants.find(p => p.id === id);
  }

  getByEmail(email) {
    return this.participants.find(p => p.email.trim().toLowerCase() === email.trim().toLowerCase());
  }

  getByRollNumber(rollNumber) {
    return this.participants.find(p => p.rollNumber.trim().toUpperCase() === rollNumber.trim().toUpperCase());
  }

  add(participantData) {
    const nextNum = 1000 + this.participants.length + 1 + Math.floor(Math.random() * 50);
    const newParticipant = {
      id: `INX-2026-${nextNum}`,
      status: 'Confirmed',
      registrationDate: new Date().toISOString(),
      ...participantData
    };
    
    // Optimistic UI Update
    this.participants.unshift(newParticipant);
    this.persistLocal();

    // Push to Firebase
    if (window.isFirebaseConfigured) {
      this.db.collection('participants').doc(newParticipant.id).set(newParticipant)
        .catch(err => console.error("Firebase save error:", err));
    }

    return newParticipant;
  }

  toggleCheckIn(id) {
    const participant = this.participants.find(p => p.id === id);
    if (participant) {
      participant.status = participant.status === 'Checked-in' ? 'Confirmed' : 'Checked-in';
      this.persistLocal();
      
      if (window.isFirebaseConfigured) {
        this.db.collection('participants').doc(id).update({ status: participant.status });
      }
      return participant;
    }
    return null;
  }

  remove(id) {
    const initialLen = this.participants.length;
    this.participants = this.participants.filter(p => p.id !== id);
    this.persistLocal();
    
    if (window.isFirebaseConfigured) {
      this.db.collection('participants').doc(id).delete();
    }
    return this.participants.length < initialLen;
  }

  resetToDefault() {
    this.participants = [...DEFAULT_PARTICIPANTS];
    this.persistLocal();
    
    if (window.isFirebaseConfigured) {
      DEFAULT_PARTICIPANTS.forEach(p => {
        this.db.collection('participants').doc(p.id).set(p);
      });
    }
    return this.participants;
  }

  clearAll() {
    this.participants = [];
    this.persistLocal();
    return [];
  }

  getAnalytics() {
    const total = this.participants.length;
    const checkedIn = this.participants.filter(p => p.status === 'Checked-in').length;
    const ieeeMembers = this.participants.filter(p => p.ieeeMember).length;
    
    // Dynamic config bound from Firebase or LocalStorage
    const totalCapacity = this.eventConfig.totalCapacity || 150;
    const seatsRemaining = Math.max(0, totalCapacity - total);

    const trackCounts = {
      'Robotics & Hardware (RAS)': 0,
      'Industrial IoT & Automation (IAS)': 0,
      'Applied AI & Computer Vision': 0,
      'RoboCode & Web Systems': 0
    };

    const yearCounts = {
      '1st Year': 0,
      '2nd Year': 0,
      '3rd Year': 0,
      '4th Year': 0
    };

    this.participants.forEach(p => {
      if (trackCounts[p.track] !== undefined) trackCounts[p.track]++;
      if (yearCounts[p.year] !== undefined) yearCounts[p.year]++;
    });

    return {
      total,
      checkedIn,
      ieeeMembers,
      totalCapacity,
      seatsRemaining,
      trackCounts,
      yearCounts
    };
  }
}

// Global store instance
window.participantStore = new ParticipantStore();
