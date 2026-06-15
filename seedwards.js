const fs = require('fs')
const pool = require('./config/db')

async function seedsWards(){
    try{
        const rawData = fs.readFileSync('./dhaka_wards.geojson', 'utf-8')
        const geojsonData = JSON.parse(rawData) 

        console.log(`Found ${geojsonData.features.length} features. Starting database injection...`);

        let insertionCount = 0
        let fallbackNumber = 1000;

        for(const feature of geojsonData.features){
            const props = feature.properties || {}
            let wardNumber = null
            const rawWardNo = props.ward_no || props.WARD_NO;

            if (rawWardNo) {
                wardNumber = parseInt(rawWardNo, 10);
            }

            else if (props.name) {
                const match = props.name.match(/\d+/); 
                if (match) {
                    wardNumber = parseInt(match[0], 10);
                }
            }

            if (!wardNumber) {
                wardNumber = fallbackNumber;
                fallbackNumber++;
            }

            if(!feature.geometry) {
                console.log(`Skipping Area ${props.name}: Missing geometry definition.`);
                continue;
            }

            const geometryType = feature.geometry.type
            if(geometryType != 'Polygon' && geometryType != 'MultiPolygon'){
                continue;
            }
            
            const geometryString = JSON.stringify(feature.geometry)

            const query = `
                    INSERT INTO wards (ward_number, boundaries)
                    VALUES ($1, ST_Multi(ST_SetSRID(ST_GeomFromGeoJSON($2::text), 4326)))
                    ON CONFLICT (ward_number) DO NOTHING
                `;

            await pool.query(query, [wardNumber,geometryString])
            insertionCount++
            console.log(`Inserted Ward: ${wardNumber}`)

            }            

        console.log(`Data seeded in the database. Total Number ${insertionCount}`);
    }catch(error){
        console.error("Error during Seeding: ",error.message)
    }
    finally{
        pool.end()
    }
}

seedsWards();