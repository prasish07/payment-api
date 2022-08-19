const express = require('express')
const router = express.Router()
const User = require('../models/signin')
const createError = require('http-errors')
const { authSchema } = require('../helpers/validation_schema')
const { signAccessToken,signRefreshToken, verifyRefreshToken } = require('../helpers/jwthelper')
const { verifyAccessToken } = require('../helpers/jwthelper')


router.route('/register').post(async (req, res, next) => {
    try {
        const result = await authSchema.validateAsync(req.body)
        console.log(result);
        const doesExist = await User.findOne({ email: result.email })
        if (doesExist) throw createError.Conflict(result.email + " Email already exist")
        const user = new User(result)
        const savedUser = await user.save()
        const accessToken = await signAccessToken(savedUser.id)
        res.json({msg:"your account has been created",
                account:result
    })
    } catch (error) {
        if (error.isJoi === true) error.status = 422
        next(error)
    }
})
router.route('/login').post(async (req, res, next) => {
    try {
        const result = await authSchema.validateAsync(req.body)
        const user = await User.findOne({ email: result.email })
        if (!user) throw createError.NotFound("user not registered")

        const isMatch = await user.isValidPassword(result.password)
        if (!isMatch) throw createError.Unauthorized('username/password not valid')
        const accessToken = await signAccessToken(user.id)
        const refreshToken = await signRefreshToken(user.id)
        res.send({msg:"you are succesfull signin",
                accessToken:accessToken, refreshToken
    })
    } catch (error) {
        if (error.isJoi === true) return next(createError.BadRequest('invalid username/password'))
        next(error)
    }
})
// app.get('/payment',verifyAccessToken, async (req,res,next)=>{

//     res.send('your payment is successfull')
// })
router.route('/payment' ).post(verifyAccessToken, async (req, res, next) => {
    const result = await authSchema.validateAsync(req.body)
    const user = await User.findOne({ email: result.email })
    if (!user) throw createError.NotFound("user not registered")
    
    const isMatch = await user.isValidPassword(result.password)
    if (!isMatch) throw createError.Unauthorized('username/password not valid')
    
    res.json({msg:'your payment is successfull',
    account:result                
})
})

router.route('/refresh-token').post(async (req, res, next) => {
    try {
        const {refreshToken} = req.body
        if(!refreshToken) throw createError.BadRequest()
        const userId = await verifyRefreshToken(refreshToken)
        const accessToken = await signAccessToken(userId)
        const RefreshToken = await signRefreshToken(userId)
        res.send({accessToken:accessToken,refreshToken:RefreshToken})

    } catch (error) {
        next(error)
    }
})

module.exports = router