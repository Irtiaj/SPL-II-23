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

router.patch('/:id/assign', verify, authorization('Councillor'), async(req,res) => {
    try{
        const { id } = req.params 
        const { inspector_id } = req.body

        if(!inspector_id){
            return res.status(403).json({
                success: false,
                message: "You must provide your ID"
            })
        }

        const allowreport = await pool.query(
            `UPDATE reports SET assigned_inspector_id = $1, status = 'Assigned', updated_at = NOW()
            where report_id = $2 AND status = 'Pending' RETURNING *`, 
            [inspector_id,id]
        )

        if(!allowreport.rowCount === 0){
            return res.status(404).json({
                success: false,
                message: "No previously report found"
            })
        }

        res.status(200).json({
            success: true,
            message: "Task Assigned successfully",
            data: updateReport.rows[0]
        })
    }catch(error){
        res.status(500).json({
            success: false,
            message: "Error Occured"
        })
    }
})

router.patch('/:id/verify', verify, authorization('Councillor','Master Admin'), async(req,res) => {
    try{
        const { id } = req.params
        const { is_approved, Councillors_note } = req.body

        const newStatus = is_approved ? 'Resolved' : 'Re-assigned'

        const updated_reports = await pool.query(
            `UPDATE reports SET status = $1, updated_at = NOW()
            WHERE reporting_id = $2 AND status = 'Pending Verification' RETURNING *`,
            [newStatus,id]
        );

        if(updated_reports.rows === 0){
            return res.status(404).json({
                success: false,
                message: "Report is not ready for verification."
            })
        }

        const message = is_approved ? "Cleanup verified & Hazard Resolved" : "Cleanup rejected & Re-assigned the task" 

        res.status(200).json({
            success: true,
            message,
            data: updated_reports[0]
        })

    }catch(error){
        res.status(500).json({
            success: false,
            message: "Error occured while verifying the task"
        })
    }
})

module.exports = router