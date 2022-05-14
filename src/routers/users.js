const express = require("express");
const User = require('../models/user')
const auth = require('../middleware/auth')
const sharp = require('sharp')
const router = new express.Router()
const multer = require('multer')

router.get('/users/me', auth, async (req, res) => {
  res.send(req.user)
})

router.post('/users', async (req, res) => {
  const user = new User(req.body)
  try {
    await user.save()
    const token = await user.generateAuthToken()
    res.status(201).send({ user, token })
  } catch (e) {
    res.status(400).send()
  }
})

router.get('/users/:id/avater', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user || !user.avater) {
      throw new Error('User not found!!')
    }
    res.set('Content-Type', 'image/png')
    res.send(user.avater)
  } catch (e) {
    res.status(501).send()
  }
})

const upload = multer({
  limits: {
    fileSize: 1000000
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      cb(new Error('Please upload image only!!'))
    }
    cb(undefined, true)
  }
})
router.post('/users/me/avater', auth, upload.single('avater'), async (req, res) => {
  const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
  req.user.avater = buffer  // we have acces to .fie.buffer because we remove 'dest' in 'upload' middleware
  await req.user.save()
  res.send()
}, (error, req, res, next) => {  // passing 4 parameters so that express get to know that this function is to handle errors
  res.send({ error: error.message })
})

router.delete('/users/me/avater', auth, async (req, res) => {
  try {
    req.user.avater = undefined
    await req.user.save()
    res.send()
  } catch (e) {
    res.status(501).send(e)
  }
})

router.post('/users/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password)
    const token = await user.generateAuthToken()
    res.send({ user, token })
  } catch (e) {
    res.status(400).send()
  }
})

router.patch('/users/me', auth, async (req, res) => {
  const updates = Object.keys(req.body)
  const allowedUpadtes = ['name', 'email', 'password', 'age']
  const isValidOperation = updates.every(update => allowedUpadtes.includes(update))
  if (!isValidOperation) {
    return res.status(400).send('Invalid Updates !!!')
  }
  try {
    // const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })  // findByIdAndUpdate() bypasses mongoose middleware as it peforms direct operation to database. That's why we set option -> runRalidators: true.

    updates.forEach(update => req.user[update] = req.body[update])
    await req.user.save()

    res.send(req.user)
  } catch (e) {
    res.status(400).send(e)
  }
})

router.delete('/users/me', auth, async (req, res) => {
  try {
    await req.user.remove()  // here we have access to .user because we used auth middleware
    res.send(req.user)
  } catch (e) {
    res.status(500).send()
  }
})

router.post('/users/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token
    })
    await req.user.save()
    res.send()
  } catch (e) {
    res.status(500).send()
  }
})

router.post('/users/logoutAll', auth, async (req, res) => {
  try {
    req.user.tokens = []
    await req.user.save()
    res.send()
  } catch (e) {
    res.status(500).send()
  }
})

module.exports = router