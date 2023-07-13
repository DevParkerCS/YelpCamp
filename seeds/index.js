const mongoose = require('mongoose')
const Campground = require('../models/campground')
const cities = require('./cities')
const { places, descriptors } = require('./seedhelpers')
require('dotenv').config()

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/YelpCamp')
    .then(() => {
        console.log('Mongo connected')
    }).catch(err => console.log(err))

const sample = (array) => {
    return array[Math.floor(Math.random() * array.length)]
}

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000)
        const price = Math.floor(Math.random() * 30) + 10
        const camp = new Campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: 'https://source.unsplash.com/collection/483251',
            description: ' Lorem ipsum dolor, sit amet consectetur adipisicing elit. Velit, praesentium asperiores! Cupiditate praesentium assumenda laborum, aliquid voluptas quia! Tempora alias sequi perspiciatis, voluptatem deserunt dolorum ut obcaecati reprehenderit magnam eius.',
            price: price
        })
        await camp.save()
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})