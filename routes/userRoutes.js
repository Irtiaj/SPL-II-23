const express = require('express')
const bcrypt = require('bcrypt')
const jsonwebtoken = require('jsonwebtoken')
const pool = require('../config/db')

const router = express.Router()

router.post('/register', async(req,res) => {
    try{
        const {full_name,email,phone_number,role,password} = req.body

        const saltRounds = 12
        const password_hash = await bcrypt.hash(password, saltRounds)

        const newUser = await pool.query(
            `INSERT INTO users (full_name, email, phone_number, role, password_hash, created_at)
            VALUES($1,$2,$3,$4,$5,NOW())
            RETURNING user_id, full_name, email, role`,
            [full_name,email,phone_number,role,password_hash]
        )

        res.status(201).json({
            success: true,
            message: "User registration completed",
            data: newUser.rows[0]
        })
    }
    catch(error){
        res.status(500).json({
            success: false,
            message: "Error occuresd while saving user info"
        })
    }
})

router.post('/login', async(req,res) => {
    try{
        const {email, phone_number, password} = req.body

        const uniqe_identifier = email || phone_number

        const userInput = await pool.query('SELECT * FROM users WHERE email = $1 OR phone_number = $1', [uniqe_identifier])

        if(userInput.rows.length === 0){
            return res.status(401).json({
                success: false,
                message: "Invalid userId or Password"
            })
        }

        const user = userInput.rows[0]

        const matchedPass = await bcrypt.compare(password, user.password_hash)

        if(!matchedPass){
            return res.status(401).json({
                success: false,
                message: "Invalid userId or Password"
            })
        }

        const tokeninfo = {
            user_id: user.user_id,
            role: user.role
        }

        const token = jsonwebtoken.sign(tokeninfo,process.env.Jeson_Web_Token, {expiresIn: '1d'})

        res.status(200).json({
            success: true,
            message: "Successfully Logged In",
            token: token,
            user: {
                user_id: user.user_id,
                full_name: user.full_name,
                role: user.role
            }
        })
    }
    catch(error){
        res.status(500).json({
            success: false,
            message: "Failed to log in"
        })
    }
})

module.exports = router;