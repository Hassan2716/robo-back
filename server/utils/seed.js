import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Barber from '../models/Barber.js';
import Service from '../models/Service.js';
import Product from '../models/Product.js';
import dotenv from 'dotenv';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await User.deleteMany({});
    await Barber.deleteMany({});
    await Service.deleteMany({});
    await Product.deleteMany({});
    console.log('Cleared existing data');

    const plainPassword = 'password123';

    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@robocutz.com',
      password: plainPassword,
      role: 'admin',
      phone: '555-0001'
    });

    const receptionistUser = await User.create({
      name: 'Receptionist User',
      email: 'reception@robocutz.com',
      password: plainPassword,
      role: 'receptionist',
      phone: '555-0002'
    });

    const barberUsers = await User.create([
      {
        name: 'Mike Johnson',
        email: 'mike@robocutz.com',
        password: plainPassword,
        role: 'barber',
        phone: '555-0101'
      },
      {
        name: 'Sarah Williams',
        email: 'sarah@robocutz.com',
        password: plainPassword,
        role: 'barber',
        phone: '555-0102'
      },
      {
        name: 'David Chen',
        email: 'david@robocutz.com',
        password: plainPassword,
        role: 'barber',
        phone: '555-0103'
      },
      {
        name: 'Marcus Thompson',
        email: 'marcus@robocutz.com',
        password: plainPassword,
        role: 'barber',
        phone: '555-0104'
      },
      {
        name: 'Elena Rodriguez',
        email: 'elena@robocutz.com',
        password: plainPassword,
        role: 'barber',
        phone: '555-0105'
      },
      {
        name: 'Tyler Brooks',
        email: 'tyler@robocutz.com',
        password: plainPassword,
        role: 'barber',
        phone: '555-0106'
      },
      {
        name: 'Aisha Patel',
        email: 'aisha@robocutz.com',
        password: plainPassword,
        role: 'barber',
        phone: '555-0107'
      }
    ]);

    const standardWeek = [
      { day: 'monday', isWorking: true, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
      { day: 'tuesday', isWorking: true, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
      { day: 'wednesday', isWorking: true, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
      { day: 'thursday', isWorking: true, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
      { day: 'friday', isWorking: true, startTime: '09:00', endTime: '19:00', breakStart: '13:00', breakEnd: '14:00' },
      { day: 'saturday', isWorking: true, startTime: '09:00', endTime: '16:00', breakStart: '12:00', breakEnd: '13:00' },
      { day: 'sunday', isWorking: false }
    ];

    const barbers = await Barber.create([
      {
        user: barberUsers[0]._id,
        name: 'Mike Johnson',
        photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&h=600&fit=crop',
        specialties: ['Classic Cuts', 'Fade Specialist', 'Beard Trimming'],
        experience: 8,
        bio: 'Master barber with 8+ years experience. Specializes in classic cuts and modern fades.',
        workingHours: [
          { day: 'monday', isWorking: true, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
          { day: 'tuesday', isWorking: true, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
          { day: 'wednesday', isWorking: true, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
          { day: 'thursday', isWorking: true, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
          { day: 'friday', isWorking: true, startTime: '09:00', endTime: '19:00', breakStart: '13:00', breakEnd: '14:00' },
          { day: 'saturday', isWorking: true, startTime: '09:00', endTime: '16:00', breakStart: '12:00', breakEnd: '13:00' },
          { day: 'sunday', isWorking: false }
        ]
      },
      {
        user: barberUsers[1]._id,
        name: 'Sarah Williams',
        photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=600&fit=crop',
        specialties: ['Women\'s Cuts', 'Color', 'Styling'],
        experience: 6,
        bio: 'Creative stylist specializing in women\'s cuts, color, and modern styling techniques.',
        workingHours: [
          { day: 'monday', isWorking: false },
          { day: 'tuesday', isWorking: true, startTime: '10:00', endTime: '19:00', breakStart: '14:00', breakEnd: '15:00' },
          { day: 'wednesday', isWorking: true, startTime: '10:00', endTime: '19:00', breakStart: '14:00', breakEnd: '15:00' },
          { day: 'thursday', isWorking: true, startTime: '10:00', endTime: '19:00', breakStart: '14:00', breakEnd: '15:00' },
          { day: 'friday', isWorking: true, startTime: '10:00', endTime: '20:00', breakStart: '14:00', breakEnd: '15:00' },
          { day: 'saturday', isWorking: true, startTime: '09:00', endTime: '17:00', breakStart: '13:00', breakEnd: '14:00' },
          { day: 'sunday', isWorking: true, startTime: '10:00', endTime: '16:00', breakStart: '13:00', breakEnd: '14:00' }
        ]
      },
      {
        user: barberUsers[2]._id,
        name: 'David Chen',
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop',
        specialties: ['Precision Cuts', 'Hot Towel Shaves', 'Beard Design'],
        experience: 10,
        bio: 'Award-winning barber with 10 years precision cutting and traditional hot towel shaves.',
        workingHours: [
          { day: 'monday', isWorking: true, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
          { day: 'tuesday', isWorking: true, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
          { day: 'wednesday', isWorking: true, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
          { day: 'thursday', isWorking: true, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
          { day: 'friday', isWorking: true, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
          { day: 'saturday', isWorking: true, startTime: '09:00', endTime: '15:00', breakStart: '12:00', breakEnd: '13:00' },
          { day: 'sunday', isWorking: false }
        ]
      },
      {
        user: barberUsers[3]._id,
        name: 'Marcus Thompson',
        photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&h=600&fit=crop',
        specialties: ['Fade Specialist', 'Beard Design', 'Classic Cuts'],
        experience: 7,
        bio: 'Fade specialist known for razor-sharp skin fades and creative beard designs. 7 years in the game.',
        workingHours: standardWeek.map(d => ({ ...d }))
      },
      {
        user: barberUsers[4]._id,
        name: 'Elena Rodriguez',
        photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=600&fit=crop',
        specialties: ['Women\'s Cuts', 'Color', 'Styling'],
        experience: 9,
        bio: 'Color specialist and styling expert with 9 years of experience. Balayage, highlights, and bold transformations.',
        workingHours: [
          { day: 'monday', isWorking: true, startTime: '10:00', endTime: '19:00', breakStart: '14:00', breakEnd: '15:00' },
          { day: 'tuesday', isWorking: true, startTime: '10:00', endTime: '19:00', breakStart: '14:00', breakEnd: '15:00' },
          { day: 'wednesday', isWorking: false },
          { day: 'thursday', isWorking: true, startTime: '10:00', endTime: '20:00', breakStart: '14:00', breakEnd: '15:00' },
          { day: 'friday', isWorking: true, startTime: '10:00', endTime: '20:00', breakStart: '14:00', breakEnd: '15:00' },
          { day: 'saturday', isWorking: true, startTime: '09:00', endTime: '17:00', breakStart: '13:00', breakEnd: '14:00' },
          { day: 'sunday', isWorking: true, startTime: '10:00', endTime: '16:00', breakStart: '13:00', breakEnd: '14:00' }
        ]
      },
      {
        user: barberUsers[5]._id,
        name: 'Tyler Brooks',
        photo: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=600&h=600&fit=crop',
        specialties: ['Hot Towel Shaves', 'Beard Trimming', 'Precision Cuts'],
        experience: 5,
        bio: 'Traditional grooming specialist. Master of the straight razor and luxurious hot towel shaves.',
        workingHours: [
          { day: 'monday', isWorking: false },
          { day: 'tuesday', isWorking: true, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
          { day: 'wednesday', isWorking: true, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
          { day: 'thursday', isWorking: true, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
          { day: 'friday', isWorking: true, startTime: '09:00', endTime: '19:00', breakStart: '13:00', breakEnd: '14:00' },
          { day: 'saturday', isWorking: true, startTime: '09:00', endTime: '17:00', breakStart: '12:00', breakEnd: '13:00' },
          { day: 'sunday', isWorking: true, startTime: '10:00', endTime: '15:00', breakStart: '12:00', breakEnd: '13:00' }
        ]
      },
      {
        user: barberUsers[6]._id,
        name: 'Aisha Patel',
        photo: 'https://images.unsplash.com/photo-1580489944761-15a32d82e9d3?w=600&h=600&fit=crop',
        specialties: ['Styling', 'Women\'s Cuts', 'Precision Cuts'],
        experience: 6,
        bio: 'Versatile stylist fluent in both men\'s precision cuts and women\'s styling. Editorial work background.',
        workingHours: [
          { day: 'monday', isWorking: true, startTime: '09:00', endTime: '17:00', breakStart: '12:00', breakEnd: '13:00' },
          { day: 'tuesday', isWorking: true, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
          { day: 'wednesday', isWorking: true, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
          { day: 'thursday', isWorking: true, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
          { day: 'friday', isWorking: true, startTime: '09:00', endTime: '19:00', breakStart: '13:00', breakEnd: '14:00' },
          { day: 'saturday', isWorking: true, startTime: '09:00', endTime: '16:00', breakStart: '12:00', breakEnd: '13:00' },
          { day: 'sunday', isWorking: false }
        ]
      }
    ]);

    await User.findByIdAndUpdate(barberUsers[0]._id, { barberProfile: barbers[0]._id });
    await User.findByIdAndUpdate(barberUsers[1]._id, { barberProfile: barbers[1]._id });
    await User.findByIdAndUpdate(barberUsers[2]._id, { barberProfile: barbers[2]._id });
    await User.findByIdAndUpdate(barberUsers[3]._id, { barberProfile: barbers[3]._id });
    await User.findByIdAndUpdate(barberUsers[4]._id, { barberProfile: barbers[4]._id });
    await User.findByIdAndUpdate(barberUsers[5]._id, { barberProfile: barbers[5]._id });
    await User.findByIdAndUpdate(barberUsers[6]._id, { barberProfile: barbers[6]._id });

    const services = await Service.create([
      {
        name: 'Classic Haircut',
        description: 'Traditional scissor cut with styling',
        price: 35,
        duration: 30,
        barbers: [barbers[0]._id, barbers[2]._id, barbers[3]._id, barbers[6]._id],
        category: 'haircut'
      },
      {
        name: 'Fade Cut',
        description: 'Modern fade with precision blending',
        price: 40,
        duration: 45,
        barbers: [barbers[0]._id, barbers[2]._id, barbers[3]._id],
        category: 'haircut'
      },
      {
        name: 'Women\'s Cut & Style',
        description: 'Custom cut with blowout and styling',
        price: 55,
        duration: 60,
        barbers: [barbers[1]._id, barbers[4]._id, barbers[6]._id],
        category: 'haircut'
      },
      {
        name: 'Beard Trim',
        description: 'Precision beard shaping and trim',
        price: 20,
        duration: 20,
        barbers: [barbers[0]._id, barbers[1]._id, barbers[2]._id, barbers[3]._id, barbers[5]._id, barbers[6]._id],
        category: 'beard'
      },
      {
        name: 'Hot Towel Shave',
        description: 'Traditional straight razor shave with hot towels',
        price: 35,
        duration: 30,
        barbers: [barbers[2]._id, barbers[5]._id],
        category: 'beard'
      },
      {
        name: 'Beard Design',
        description: 'Custom beard sculpting and design',
        price: 30,
        duration: 25,
        barbers: [barbers[2]._id, barbers[3]._id],
        category: 'beard'
      },
      {
        name: 'Hair Color',
        description: 'Full color or highlights',
        price: 75,
        duration: 90,
        barbers: [barbers[1]._id, barbers[4]._id],
        category: 'styling'
      },
      {
        name: 'Scalp Treatment',
        description: 'Deep conditioning scalp massage',
        price: 25,
        duration: 20,
        barbers: [barbers[0]._id, barbers[1]._id, barbers[2]._id, barbers[3]._id, barbers[4]._id, barbers[5]._id, barbers[6]._id],
        category: 'treatment'
      }
    ]);

    await Product.create([
      {
        name: 'Premium Pomade',
        description: 'Strong hold, matte finish pomade',
        price: 18,
        stock: 50,
        category: 'styling'
      },
      {
        name: 'Beard Oil',
        description: 'Organic blend for soft, healthy beard',
        price: 22,
        stock: 40,
        category: 'beardcare'
      },
      {
        name: 'Sea Salt Spray',
        description: 'Texturizing spray for beach waves',
        price: 16,
        stock: 35,
        category: 'styling'
      },
      {
        name: 'Shampoo & Conditioner Set',
        description: 'Sulfate-free daily care set',
        price: 28,
        stock: 30,
        category: 'haircare'
      },
      {
        name: 'Boar Bristle Brush',
        description: 'Premium brush for beard and hair',
        price: 24,
        stock: 25,
        category: 'accessories'
      },
      {
        name: 'Styling Clay',
        description: 'Medium hold, natural finish',
        price: 20,
        stock: 45,
        category: 'styling'
      }
    ]);

    console.log('Seed data created successfully!');
    console.log('\nDefault Login Credentials:');
    console.log('Admin: admin@robocutz.com / password123');
    console.log('Receptionist: reception@robocutz.com / password123');
    console.log('Barbers: mike@, sarah@, david@, marcus@, elena@, tyler@, aisha@robocutz.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();