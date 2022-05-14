const express = require("express");
const Task = require("../models/task");
const auth = require('../middleware/auth')
const router = express.Router()

router.get('/tasks', auth, async (req, res) => {
  const match = {}
  const sort = {}
  if (req.query.isCompleted) {
    match.isCompleted = req.query.isCompleted === 'true'  // we are changing string('true') to boolean(true) 
  }
  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(':')
    sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    console.log(sort)
  }
  try {
    await req.user.populate({
      path: 'myTasks',
      match,
      options: {
        limit: req.query.limit,
        skip: req.query.skip,
        sort
      }
    })
    res.send(req.user.myTasks)
  } catch (e) {
    res.status(500).send()
  }
})

router.post('/tasks', auth, async (req, res) => {
  const task = new Task({
    ...req.body,
    owner: req.user._id
  })
  try {
    await task.save()
    res.send(task)
  } catch (e) {
    res.status(500).send(e)
  }
})

router.get('/tasks/:id', auth, async (req, res) => {
  const _id = req.params.id
  try {
    const task = await Task.findOne({ _id, owner: req.user._id })
    if (!task) {
      return res.status(404).send()
    }
    res.send(task)
  } catch (e) {
    res.send(500).send()
  }
})

router.patch('/tasks/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body)
  const allowedUpdates = ['description', 'isCompleted']
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

  if (!isValidOperation) {
      return res.status(400).send({ error: 'Invalid updates!' })
  }
  try {
      const task = await Task.findOne({ _id: req.params.id, owner: req.user._id })

      if (!task) {
          return res.status(404).send()
      }
      
      updates.forEach((update) => task[update] = req.body[update])
      await task.save()
      res.send(task)
      console.log('updated task -->', task)
  } catch (e) {
      res.status(400).send(e)
  }
})

router.delete('/tasks/:id', auth, async (req, res) => {
  try {
      const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id })

      if (!task) {
          res.status(404).send()
      }

      res.send(task)
  } catch (e) {
      res.status(500).send()
  }
})

module.exports = router