const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Item = require('./models/Item');
const Claim = require('./models/Claim');

const seedDataInline = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) return; // Already seeded

    console.log('Seeding initial campus data into database...');

    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('Admin@123', salt);
    const studentPassword = await bcrypt.hash('Student@123', salt);

    // Admin User
    await User.create({
      name: 'Campus Admin',
      email: 'admin@campus.edu',
      studentId: 'ADM-001',
      department: 'Student Affairs',
      password: adminPassword,
      role: 'admin',
    });

    // Student 1
    const student1 = await User.create({
      name: 'Alex Johnson',
      email: 'alex.johnson@student.campus.edu',
      studentId: 'CS-2024-042',
      department: 'Computer Science',
      password: studentPassword,
      role: 'student',
    });

    // Student 2
    const student2 = await User.create({
      name: 'Sarah Smith',
      email: 'sarah.smith@student.campus.edu',
      studentId: 'EE-2023-118',
      department: 'Electrical Engineering',
      password: studentPassword,
      role: 'student',
    });

    // Items
    const item1 = await Item.create({
      title: 'Student ID Card & Lanyard',
      type: 'lost',
      category: 'ID Card',
      description: 'Blue campus lanyard with student ID card for Alex Johnson. Lost near the Central Library 2nd floor reading area.',
      location: 'Central Library, 2nd Floor',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      time: '14:30',
      image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
      contactPreference: 'portal',
      status: 'active',
      user: student1._id,
    });

    const item2 = await Item.create({
      title: 'Hydro Flask Water Bottle',
      type: 'found',
      category: 'Water Bottle',
      description: 'Stainless steel blue 32oz Hydro Flask with several stickers (GitHub, React, NASA). Left on the bench outside Science Block B.',
      location: 'Science Block B Benches',
      currentLocation: 'Main Security Desk Desk A',
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      time: '11:15',
      image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80',
      contactPreference: 'portal',
      status: 'active',
      user: student2._id,
    });

    const item3 = await Item.create({
      title: 'Apple AirPods Pro Case',
      type: 'lost',
      category: 'Electronics',
      description: 'White wireless charging case with a translucent protective silicone sleeve. Might have fallen out in Student Union Cafeteria.',
      location: 'Student Union Cafeteria',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      time: '17:45',
      image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&auto=format&fit=crop&q=80',
      contactPreference: 'email',
      status: 'active',
      user: student2._id,
    });

    await Item.create({
      title: 'Black Jansport Backpack',
      type: 'found',
      category: 'Bag',
      description: 'Black backpack containing two spiral notebooks, an engineering calculator, and a blue pencil pouch.',
      location: 'Engineering Auditorium Room 101',
      currentLocation: 'Department Office Room 104',
      date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      time: '09:00',
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80',
      contactPreference: 'portal',
      status: 'active',
      user: student1._id,
    });

    // Sample Claim
    await Claim.create({
      item: item2._id,
      claimant: student1._id,
      message: 'I left my Hydro Flask on the bench after my 10 AM Chemistry lab! It has my custom GitHub sticker on the back.',
      identifyingDetails: 'The sticker on the bottom left says "Eat Sleep Code Repeat" and there is a small dent on the stainless steel bottom.',
      status: 'pending',
    });

    console.log('Database seeded successfully with initial records.');
  } catch (err) {
    console.error('Inline Seeding Error:', err.message);
  }
};

module.exports = seedDataInline;
