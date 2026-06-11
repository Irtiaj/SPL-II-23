const fs = require('fs')
const pool = require('./config/db')

async function seedsWards(){
    try{
        const rawData = fs.readFileSync('dhaka_wards.geojson', 'utf-8')
        const geojsonData = JSON.parse(rawData) 

        console.log(`Found ${geojsonData.features.length} features. Starting database injection...`);

        for(const feature of geojsonData.features){
            const wardNumber = feature.properties.ward_number || 999
            if (!feature.geometry) {
                console.log(`Skipping Ward ${wardNumber}: No geometry data found in JSON.`);
                continue;
            }

            const geoMetry = JSON.stringify(feature.geometry);

            const query = `
            INSERT INTO wards (ward_number, boundaries) VALUES ($1, ST_Multi(ST_SetSRID(ST_GeomFromGeoJSON($2::text), 4326)))
            `;

            await pool.query(query, [wardNumber,geoMetry])
            console.log(`Inserted Ward: ${wardNumber}`)
            
        }

        console.log("Data seeded in the database")
    }catch(error){
        console.log("Error during Seeding: ",error.message)
    }
}

seedsWards();