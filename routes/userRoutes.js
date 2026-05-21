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

module.exports = router;