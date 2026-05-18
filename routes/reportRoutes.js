const express = require('express')
const router = express.Router()
const pool = require('../config/db')

router.get('/', async(req,res) =>{
    try{
        const total_reports = await pool.query('select * from reports')

        res.status(200).json({
            success: true,
            count: total_reports.rowCount,
            data: total_reports.rows
        })
    }catch(error){
        console.error("Error catched while fetching reports ", error.message)
        res.status(500).json({
            success: false,
            message: "Failed to get the reports"
        })
    }
});

module.exports = router