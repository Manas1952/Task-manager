const express = require("express")
const userRouter = require('./routers/users')
const taskRouter = require('./routers/tasks')
require('./db/mongoose')

const app = express()
const port = process.env.PORT

// middlewares
app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

app.listen(port, () => {
  console.log('Server is up on the port:', port)
})

// const main = async () => {
  // method 1
  // const task = await Task.findById('627a44cbc372e3b6c87ceaf1')
  // await task.populate('owner')
  // console.log(task.owner)
  
  // method 2: here virtual connection is made i.e. there is no such user.myTasks field
  // const user = await User.findById('627a7379cada1ae2f7a74644')
  // await user.populate('myTasks')
  // console.log(user.myTasks)
  
// }

// main()