const express = require('express')
const router = express.Router()
const pool = require('../config/db')
const verify = require('../middleware/authmiddleware')
const authorization = require('../middleware/rolemiddleware')

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

router.post('/', async(req,res) => {
    try{
        const{ description, longitude, latitude, ward_id, before_photo_url, after_photo_url } = req.body;

        const newReport = await pool.query(`insert into reports (description, location, ward_id, before_photo_url, after_photo_url, status, created_at, updated_at)
            values ($1,ST_SetSRID(ST_MAKEPOINT($2,$3), 4326), $4, $5, $6, 'Pending', NOW(), NOW()) RETURNING *`, 
        [description, longitude, latitude, ward_id, before_photo_url, after_photo_url || null]) ;

        res.status(201).json({
            success: true,
            message: "Report created successfully",
            data: newReport.rows[0]
        })
    }
    catch(error){
        console.error("Error occured while saving the report ",error.message)

        res.status(500).json({
            success: false,
            message: "Couldn't save"
        });
    }
});

router.patch('/:id', verify, authorization('Inspector'), async(req,res) => {
    try{
        const { id } = req.params;
        const { after_photo_url } = req.body;

        const updateReport = await pool.query(
            `UPDATE reports SET after_photo_url = $1, status = 'Pending Verification', updated_at = NOW()
            WHERE report_id = $2 RETURNING *
            `,
            [after_photo_url,id]
        )

        if(updateReport.rowCount === 0 ){
            return res.status(404).json({
                success: false,
                message: "Couldn't find the previously existing report"
            })
        }

        res.status(200).json({
            success: true, 
            message: "Hazard cleanup image received", 
            data: updateReport.rows[0]
        })
    }catch(error){
        res.status(500).json({
            success: false,
            message: "Didn't receive the Hazard cleanup image"
        })
    }
});



module.exports = router