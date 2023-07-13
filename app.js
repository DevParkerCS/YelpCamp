const express = require('express')
const app = express()
const mongoose = require('mongoose')
const path = require('path')
const Campground = require('./models/campground')
const methodOverride = require('method-override')
const campground = require('./models/campground')
const ejsMate = require('ejs-mate')
const catchAsync = require('./utils/catchAsync')
const ExpressError = require('./utils/ExpressError.js')
const Joi = require('joi')
const { campgroundSchema, reviewSchema } = require('./schemas.js')
const Review = require('./models/review')
require('dotenv').config()

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/YelpCamp')
    .then(() => {
        console.log('Mongo connected')
    }).catch(err => console.log(err))

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride("_method"))
app.engine('ejs', ejsMate)

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}
const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}

app.get('/', (req, res) => {
    res.render('home')
})

app.get('/campgrounds', catchAsync(async (req, res, next) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', { campgrounds })
}))

app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new')
})

app.get('/campgrounds/:id/edit', catchAsync(async (req, res, next) => {
    const { id } = req.params
    const foundCamp = await Campground.findById(id)
    res.render('campgrounds/edit', { foundCamp })
}))

app.get('/campgrounds/:id', catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const foundCamp = await Campground.findById(id).populate('reviews')
    console.log(foundCamp.reviews)
    res.render('campgrounds/show', { foundCamp })
}))

app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    const review = new Review(req.body.review)
    campground.reviews.push(review)
    await review.save()
    await campground.save()
    res.redirect(`/campgrounds/${campground._id}`)
}))

app.post('/campgrounds', validateCampground, catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground)
    await campground.save()
    res.redirect('/campgrounds')
}))

app.patch('/campgrounds/:id', validateCampground, catchAsync(async (req, res, next) => {
    const { id } = req.params
    await Campground.findByIdAndUpdate(id, { ...req.body.campground })
    res.redirect(`/campgrounds/${id}`)
}))

app.delete('/campgrounds/:id', catchAsync(async (req, res, next) => {
    console.log("RUHRUHRaggy")
    const { id } = req.params;
    await campground.findByIdAndDelete(id);
    res.redirect('/campgrounds')
}))

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { status = 500 } = err
    if (!err.message) err.message = "Oh No Something Went Wrong"
    res.status(status).render('partials/error', { err })
})

app.listen(3000, () => {
    console.log('Connected 3000')
})