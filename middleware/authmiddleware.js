const jsonwebtoken = require("jsonwebtoken")
require('dotenv').config()

const verifyToken = (req,res,next) => {
    const authHeader = req.header('Authorization')

    if(!authHeader){
        res.status(401).json({
            success: false,
            message: "Access Denied. No token provided"
        })
    }

    const token = authHeader.split(' ')[1]

    if(!token){
        res.status(401).json({ //Unauthorized Access Denied
            success: false,
            message: "Invalid Token Format"
        })
    }

    try{
        const verified = jsonwebtoken.verify(token, process.env.Jeson_Web_Token)
        req.user = verified
        next()
    }catch(error){
        res.status(403).json({ //
            success: false,
            message: "Invalid or Expired Token"
        })
    }
}

module.exports = verifyToken