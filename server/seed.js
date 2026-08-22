const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');
const Item = require('./models/Item');
const Claim = require('./models/Claim');
const AIMatch = require('./models/AIMatch');
const Notification = require('./models/Notification');
const Conversation = require('./models/Conversation');
const Message = require('./models/Message');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campus_lost_found';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for Seeding...');

    // Clear existing collections
    await User.deleteMany();
    await Item.deleteMany();
    await Claim.deleteMany();
    await AIMatch.deleteMany();
    await Notification.deleteMany();
    await Conversation.deleteMany();
    await Message.deleteMany();

    console.log('Cleared existing database records.');

    // Password hashes
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('Admin@123', salt);
    const studentPassword = await bcrypt.hash('Student@123', salt);

    // Create Users
    const adminUser = await User.create({
      name: 'Campus Admin',
      email: 'admin@ksrce.ac.in',
      studentId: 'ADM-001',
      department: 'Student Affairs',
      phone: '9876543210',
      password: adminPassword,
      role: 'admin',
    });

    const student1 = await User.create({
      name: 'Alex Johnson',
      email: 'alex.johnson@ksrce.ac.in',
      studentId: 'CS-2024-042',
      department: 'Computer Science',
      phone: '9876543211',
      password: studentPassword,
      role: 'student',
    });

    const student2 = await User.create({
      name: 'Sarah Smith',
      email: 'sarah.smith@ksrce.ac.in',
      studentId: 'EE-2023-118',
      department: 'Electrical Engineering',
      phone: '9876543212',
      password: studentPassword,
      role: 'student',
    });

    console.log('Users created successfully.');

    // Create Items
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

    const item4 = await Item.create({
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

    const item5 = await Item.create({
      title: 'Car & Dorm Key Set',
      type: 'found',
      category: 'Keys',
      description: 'Keyring with Honda key fob, 2 silver house keys, and a metallic red bottle opener keychain.',
      location: 'Sports Complex Basketball Court',
      currentLocation: 'Sports Complex Reception Desk',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      time: '18:20',
      image: 'https://images.unsplash.com/photo-1584679109597-c656b19974c9?w=600&auto=format&fit=crop&q=80',
      contactPreference: 'portal',
      status: 'resolved',
      user: student2._id,
    });

    const item6 = await Item.create({
      title: 'Silver Analog Wrist Watch',
      type: 'lost',
      category: 'Accessories',
      description: 'Fossil brand silver stainless steel watch with a blue dial. Sentimental graduation gift.',
      location: 'Gymnasium Locker Room',
      date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      time: '16:00',
      image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&auto=format&fit=crop&q=80',
      contactPreference: 'phone',
      status: 'active',
      user: student1._id,
    });

    console.log('Sample Lost & Found Items created.');

    // Create Sample Claim
    await Claim.create({
      item: item2._id,
      claimant: student1._id,
      message: 'I left my Hydro Flask on the bench after my 10 AM Chemistry lab! It has my custom GitHub sticker on the back.',
      identifyingDetails: 'The sticker on the bottom left says "Eat Sleep Code Repeat" and there is a small dent on the stainless steel bottom.',
      status: 'pending',
    });

    // Sample AI Match
    const match1 = await AIMatch.create({
      lostItem: item3._id,
      foundItem: item4._id,
      overallScore: 78,
      matchGrade: 'Possible Match',
      summaryExplanation: 'Possible match identified (78%). Compatible accessory descriptions and nearby student transit zone.',
      factors: {
        category: { score: 70, weight: 20, matched: true, detail: 'Related electronics and bag contents' },
        nameDescription: { score: 75, weight: 20, matched: true, detail: 'Overlapping campus transit reports' },
        brandModel: { score: 80, weight: 15, matched: true, detail: 'Compatible accessories and notebooks' },
        color: { score: 70, weight: 10, matched: true, detail: 'Neutral tones' },
        location: { score: 85, weight: 10, matched: true, detail: 'Nearby academic cluster zone' },
        dateTime: { score: 85, weight: 10, matched: true, detail: 'Reported within 24 hours of each other' },
        imageSimilarity: { score: 80, weight: 15, matched: true, detail: 'Photos attached' },
      },
      status: 'pending',
    });

    // Sample Notification
    await Notification.create({
      recipient: student2._id,
      sender: student1._id,
      type: 'ai_match',
      title: '🔔 Possible Match: Apple AirPods Pro Case',
      message: 'Your lost item (Apple AirPods Pro Case) may match a found item (78% match score).',
      item: item3._id,
      matchingItem: item4._id,
      matchId: match1._id,
      matchScore: 78,
      matchGrade: 'Possible Match',
      isRead: false,
    });

    // Sample Conversation & Message
    const conv1 = await Conversation.create({
      participants: [student1._id, student2._id],
      item: item2._id,
      lastMessageText: 'Hey Alex, is this your Hydro Flask? You can collect it from Science Block B!',
      lastMessageAt: new Date(),
      unreadCount: new Map([[student1._id.toString(), 1]]),
      blockedUsers: [],
    });

    const msg1 = await Message.create({
      conversation: conv1._id,
      sender: student2._id,
      recipient: student1._id,
      content: 'Hey Alex, is this your Hydro Flask? You can collect it from Science Block B!',
      status: 'sent',
    });

    conv1.lastMessage = msg1._id;
    await conv1.save();

    console.log('Sample Claims, AI Matches & Conversations created.');
    console.log('\n--- SEED COMPLETE ---');
    console.log('Demo Credentials:');
    console.log('Admin: admin@ksrce.ac.in / Admin@123');
    console.log('Student 1: alex.johnson@ksrce.ac.in / Student@123');
    console.log('Student 2: sarah.smith@ksrce.ac.in / Student@123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
