const mongoose = require('mongoose')
require('dotenv').config()

const Hall = require('./models/Hall')

const halls = [
    {
        name: 'Royal Celebration Hall',
        location: 'Mangalore, Karnataka',
        capacity: 500,
        price: 25000,
        image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3'
    },
    {
        name: 'Grand Palace Hall',
        location: 'Udupi, Karnataka',
        capacity: 300,
        price: 18000,
        image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3'
    },
    {
        name: 'Green Garden Hall',
        location: 'Bangalore, Karnataka',
        capacity: 700,
        price: 35000,
        image: 'https://images.unsplash.com/photo-1511578314322-379afb476865'
    },
    {
        name: 'Crystal Convention Centre',
        location: 'Mysore, Karnataka',
        capacity: 600,
        price: 30000,
        image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3'
    },
    {
        name: 'Silver Crown Hall',
        location: 'Mangalore, Karnataka',
        capacity: 400,
        price: 22000,
        image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3'
    },
    {
        name: 'Royal Orchid Convention',
        location: 'Bangalore, Karnataka',
        capacity: 800,
        price: 45000,
        image: 'https://images.unsplash.com/photo-1511578314322-379afb476865'
    },
    {
        name: 'Ocean Pearl Hall',
        location: 'Udupi, Karnataka',
        capacity: 350,
        price: 20000,
        image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3'
    },
    {
        name: 'Celebration Grand Hall',
        location: 'Shivamogga, Karnataka',
        capacity: 500,
        price: 27000,
        image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3'
    },
    {
        name: 'Sunshine Function Hall',
        location: 'Hubli, Karnataka',
        capacity: 250,
        price: 15000,
        image: 'https://images.unsplash.com/photo-1511578314322-379afb476865'
    },
    {
        name: 'Diamond Palace Convention',
        location: 'Mysore, Karnataka',
        capacity: 900,
        price: 50000,
        image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3'
    }
]

const seedHalls = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI)

        await Hall.insertMany(halls)

        console.log('10 halls added successfully!')

    } catch (error) {
        console.error('Error adding halls:', error.message)

    } finally {
        await mongoose.disconnect()
    }
}

seedHalls()