const bcrypt = require('bcryptjs');

class MemoryStore {
  constructor() {
    this.users = [];
    this.items = [];
    this.claims = [];
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;

    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('Admin@123', salt);
    const studentPassword = await bcrypt.hash('Student@123', salt);

    const admin = {
      _id: 'usr_admin_001',
      name: 'Campus Admin',
      email: 'admin@ksrce.ac.in',
      studentId: 'ADM-001',
      department: 'Student Affairs',
      phone: '9876543210',
      password: adminPassword,
      role: 'admin',
      createdAt: new Date(),
    };

    const student1 = {
      _id: 'usr_student_001',
      name: 'Alex Johnson',
      email: 'alex.johnson@ksrce.ac.in',
      studentId: 'CS-2024-042',
      department: 'Computer Science',
      phone: '9876543211',
      password: studentPassword,
      role: 'student',
      createdAt: new Date(),
    };

    const student2 = {
      _id: 'usr_student_002',
      name: 'Sarah Smith',
      email: 'sarah.smith@ksrce.ac.in',
      studentId: 'EE-2023-118',
      department: 'Electrical Engineering',
      phone: '9876543212',
      password: studentPassword,
      role: 'student',
      createdAt: new Date(),
    };

    this.users.push(admin, student1, student2);

    const item1 = {
      _id: 'itm_001',
      title: 'Student ID Card & Lanyard',
      type: 'lost',
      category: 'ID Card',
      description: 'Blue campus lanyard with student ID card for Alex Johnson. Lost near the Central Library 2nd floor reading area.',
      color: 'Blue',
      model: 'Campus Lanyard',
      location: 'Central Library, 2nd Floor',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      time: '14:30',
      image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
      contactPreference: 'portal',
      status: 'active',
      user: student1,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    };

    const item2 = {
      _id: 'itm_002',
      title: 'Hydro Flask Water Bottle',
      type: 'found',
      category: 'Water Bottle',
      description: 'Stainless steel blue 32oz Hydro Flask with several stickers (GitHub, React, NASA). Left on the bench outside Science Block B.',
      color: 'Blue',
      model: 'Hydro Flask',
      location: 'Science Block B Benches',
      currentLocation: 'Main Security Desk Desk A',
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      time: '11:15',
      image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80',
      contactPreference: 'portal',
      status: 'active',
      user: student2,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    };

    const item3 = {
      _id: 'itm_003',
      title: 'Apple AirPods Pro Case',
      type: 'lost',
      category: 'Electronics',
      description: 'White wireless charging case with a translucent protective silicone sleeve. Might have fallen out in Student Union Cafeteria.',
      color: 'White',
      model: 'AirPods Pro',
      location: 'Student Union Cafeteria',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      time: '17:45',
      image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&auto=format&fit=crop&q=80',
      contactPreference: 'email',
      status: 'active',
      user: student2,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    };

    const item4 = {
      _id: 'itm_004',
      title: 'Black Jansport Backpack',
      type: 'found',
      category: 'Bag',
      description: 'Black backpack containing two spiral notebooks, an engineering calculator, and a blue pencil pouch.',
      color: 'Black',
      model: 'Jansport',
      location: 'Engineering Auditorium Room 101',
      currentLocation: 'Department Office Room 104',
      date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      time: '09:00',
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80',
      contactPreference: 'portal',
      status: 'active',
      user: student1,
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    };

    this.items.push(item1, item2, item3, item4);

    const claim1 = {
      _id: 'clm_001',
      item: item2,
      claimant: student1,
      message: 'I left my Hydro Flask on the bench after my 10 AM Chemistry lab! It has my custom GitHub sticker on the back.',
      identifyingDetails: 'The sticker on the bottom left says "Eat Sleep Code Repeat" and there is a small dent on the stainless steel bottom.',
      proofImage: '',
      status: 'pending',
      createdAt: new Date(),
    };

    this.claims.push(claim1);
    this.initialized = true;
    console.log('⚡ Fallback Memory Data Store Initialized');
  }
}

const memoryStore = new MemoryStore();
memoryStore.init();

module.exports = memoryStore;
