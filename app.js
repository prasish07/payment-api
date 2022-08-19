const express = require('express')
const app = express()
const morgan = require('morgan')
const createError = require('http-errors')
require('dotenv').config()
const connectDB= require('./db/signin')
const port = process.env.PORT || 3000

app.use(express.json())
app.use(express.urlencoded({extended:true}))

const router = require('./Routes/router')


app.use('/api/v1',router)

app.use(morgan('dev'))

app.use(async(req,res,next)=>{
    // const error = new Error("not found")
    // error.status = 404
    // next(error)
    next(createError.NotFound('this route doesnot exist'))
}
)

app.use((err,req,res,next)=>{
    res.status(err.status || 500)
    res.send({
        error:{
            status: err.status || 500,
            message:err.message
        }
    })
})

const start = async ()=>{
    try {
        await connectDB(process.env.MONGO_URL);
        app.listen(port,()=>{
            console.log(`server listening on port ${port}`);
        })
        
    } catch (error) {
        
    }
}
start()
