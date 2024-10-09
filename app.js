/*
    SETUP
*/
var express = require('express');
var app = express();
var PORT = 2002;

app.use('./style.css', (req, res, next) => { 
    res.type('text/css');  // Ensure response has correct content type for stylesheet
    next();
});


// Enable express to handle JSON data and static files
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));


// Handlebars setup
const { engine } = require('express-handlebars');
var exphbs = require('express-handlebars');     // Import express-handlebars
app.engine('.hbs', engine({extname: ".hbs"}));  // Create an instance of the handlebars engine to process templates
app.set('view engine', '.hbs');                 // Tell express to use the handlebars engine whenever it encounters a *.hbs file.

var db = require('./database/db-connector')

/*
    ROUTES
*/
// GET route for Homepage
app.get('/', function(req, res)
    {  
        res.render('index', {title: "Home"}); // Render the index.hbs file
                                                             
    });  

// GET route for Members page    
app.get('/members', function(req, res)
    {  
        let query1 = `SELECT member_id, first_name, last_name, email, phone, DATE_FORMAT(birth_date, "%b-%d-%Y") AS birth_date, DATE_FORMAT(join_date, "%b-%d-%Y")
        AS join_date FROM Members;`;

        db.pool.query(query1, function(error, rows, fields){          // Execute the query
            res.render('members', {title: "Members", data: rows});    // Render the members.hbs file
        })                                                      
    }); 

// GET route for Visits page 
app.get('/visits', function(req, res)
    {  
        let query1 = `SELECT Visits.visit_id, DATE_FORMAT(Visits.visit_date, "%b-%d-%Y %I:%i %p") AS visit_date, Members.first_name, Members.last_name, Locations.city
            FROM Visits 
            INNER JOIN Members ON Visits.member_id = Members.member_id INNER JOIN Locations ON Visits.location_id = Locations.location_id;`;

        let query2 = `SELECT * FROM Members;` // Query to populate options for Members dropdown for INSERT form

        let query3 = `SELECT * FROM Locations;` // Query to populate options for Locations dropdown for INSERT form

        db.pool.query(query1, function(error, rows, fields){              
            let visits = rows;
            db.pool.query(query2, function(error, rows, fields){              
                let members = rows;
                db.pool.query(query3, function(error, rows, fields){              
                    locations = rows;
                    res.render('visits', {title: "Visits", data: visits, members: members, locations: locations});        // Render the visits.hbs file
                })                                                      
            })                                                      
        })                                                      
    }); 

// GET route for Locations page 
app.get('/locations', function(req, res)
    {  
        let query1 = "SELECT * FROM Locations;";

        db.pool.query(query1, function(error, rows, fields){              
            res.render('locations', {title: "Locations", data: rows});    // Render the locations.hbs file
        })                                                      
    }); 

// GET route for Trainers page 
app.get('/trainers', function(req, res)
    {  
        let query1 = `SELECT Trainers.trainer_id, Trainers.first_name, Trainers.last_name, Trainers.email, Trainers.phone, DATE_FORMAT(Trainers.birth_date, "%b-%d-%Y") AS birth_date, 
        DATE_FORMAT(Trainers.start_date, "%b-%d-%Y") AS start_date, Locations.address, Locations.city, Trainers.salary 
            FROM Trainers 
            INNER JOIN Locations ON Trainers.location_id = Locations.location_id;`;  // Query for Trainers table

        let query2 = `SELECT * FROM Locations;`;  // Query to populate options for Location dropdown for forms

        db.pool.query(query1, function(error, rows, fields){        // Execute query1     
            let trainers = rows;
            db.pool.query(query2, function(error, rows, fields){    // Execute query2
                let locations = rows;
                res.render('trainers', {title: "Trainers", data: trainers, locations: locations});  // Render the trainers.hbs file
            })                         
        })                                                      
    }); 

// GET route for Equipment page 
app.get('/equipment', function(req, res)
    {  
        let query1 = "SELECT * FROM Equipment;";

        db.pool.query(query1, function(error, rows, fields){            // Execute the query

            res.render('equipment', {title: "Equipment", data: rows});  // Render the equipment.hbs file
        })                                                      
    }); 

// GET route for Equipment Locations page 
app.get('/equipment_locations', function(req, res)
    {  
        let query1 = `SELECT Equipment_Locations.location_id, Equipment_Locations.equipment_id, Locations.address, Locations.city, Equipment.equipment_name, Equipment_Locations.equipment_count
            FROM Equipment_Locations
            INNER JOIN Equipment ON Equipment_Locations.equipment_id = Equipment.equipment_id
            INNER JOIN Locations ON Equipment_Locations.location_id = Locations.location_id;`;  // Query for Equipment_Locations table

        let query2 = `SELECT * FROM Equipment;` // Query to populate options for Equipment dropdown for INSERT form

        let query3 = `SELECT * FROM Locations;` // Query to populate options for Location dropdown for INSERT form

        let query4 = `SELECT Equipment_Locations.location_id, Equipment_Locations.equipment_id, Locations.address, Locations.city, Equipment.equipment_name, Equipment_Locations.equipment_count
            FROM Equipment_Locations
            INNER JOIN Equipment ON Equipment_Locations.equipment_id = Equipment.equipment_id
            INNER JOIN Locations ON Equipment_Locations.location_id = Locations.location_id;`;  // Query for Deletion form

        let query5 = `SELECT UNIQUE Equipment.* FROM Equipment INNER JOIN Equipment_Locations ON Equipment_Locations.equipment_id = Equipment.equipment_id;` // Query to populate options for Equipment dropdown for UPDATE form

        let query6 = `SELECT UNIQUE Locations.* FROM Locations INNER JOIN Equipment_Locations ON Equipment_Locations.location_id = Locations.location_id;` // Query to populate options for Location dropdown for UPDATE form

        db.pool.query(query1, function(error, rows, fields){            // Execute query1

            let equipment_locations = rows;

            db.pool.query(query2, (error, rows, fields) => {            // Execute query2

                let equipment = rows;

                db.pool.query(query3, (error, rows, fields) => {    // Execute query3

                    let locations = rows;

                    db.pool.query(query4, (error, rows, fields) => {    // Execute query3

                        let deleteQuery = rows;

                        db.pool.query(query5, (error, rows, fields) => {    // Execute query3

                            let updateEquip = rows;

                            db.pool.query(query6, (error, rows, fields) => {    // Execute query3

                                let updateLocs = rows;
                                res.render('equipment_locations', {title: "Equipment Locations", data: equipment_locations, equipment: equipment, locations: locations, deleteQuery: deleteQuery, updateEquip: updateEquip, updateLocs: updateLocs});  // Render the equipment_locations.hbs file

                            })
                        })
                    })
                })
            })
        })                                                      
    }); 


// POST route to add an Equipment_Location to the database from the Equipment Locations page's add form 
app.post('/add-equipment-location-ajax', function(req, res) 
{
    // Capture the incoming data and parse it back to a JS object
    let data = req.body;

    // Create the query and run it on the database
    query1 = `INSERT INTO Equipment_Locations (location_id, equipment_id, equipment_count) VALUES ('${data.location_id}', '${data.equipment_id}', '${data.equipment_count}')`;
    db.pool.query(query1, function(error, rows, fields){

        // Check to see if there was an error
        if (error) {

            // Log the error to the terminal so we know what went wrong, and send the visitor an HTTP response 400 indicating it was a bad request.
            console.log(error)
            res.sendStatus(400);
        }
        else
        {
            // If there was no error, perform a SELECT * on Equipment_Locations
            query2 = `SELECT Equipment_Locations.location_id, Equipment_Locations.equipment_id, Locations.address, Locations.city, Equipment.equipment_name, Equipment_Locations.equipment_count
            FROM Equipment_Locations
            INNER JOIN Equipment ON Equipment_Locations.equipment_id = Equipment.equipment_id
            INNER JOIN Locations ON Equipment_Locations.location_id = Locations.location_id
            WHERE Equipment_Locations.location_id = '${data.location_id}' AND Equipment_Locations.equipment_id = '${data.equipment_id}';`;
            db.pool.query(query2, function(error, rows, fields){

                // If there was an error on the second query, send a 400
                if (error) {
                    
                    // Log the error to the terminal so we know what went wrong, and send the visitor an HTTP response 400 indicating it was a bad request.
                    console.log(error);
                    res.sendStatus(400);
                }
                // If all went well, send the results of the query back.
                else
                {
                    res.send(rows);
                }
            })
        }
    })
});

// POST route to add a Member to the database from the Member page's add form 
app.post('/add-member-ajax', function(req, res) 
{
    // Capture the incoming data and parse it back to a JS object
    let data = req.body;

    // Create the query and run it on the database
    query1 = `INSERT INTO Members (first_name, last_name, email, phone, birth_date, join_date) VALUES ('${data.first_name}', '${data.last_name}', '${data.email}', '${data.phone}', '${data.birth_date}', '${data.join_date}')`;
    db.pool.query(query1, function(error, rows, fields){

        // Check to see if there was an error
        if (error) {

            // Log the error to the terminal so we know what went wrong, and send the visitor an HTTP response 400 indicating it was a bad request.
            console.log(error)
            res.sendStatus(400);
        }
        else
        {
            // If there was no error, perform a SELECT * on Members
            query2 = `SELECT member_id, first_name, last_name, email, phone, DATE_FORMAT(birth_date, "%b-%d-%Y") AS birth_date, DATE_FORMAT(join_date, "%b-%d-%Y")
            AS join_date FROM Members;`;
            db.pool.query(query2, function(error, rows, fields){

                // If there was an error on the second query, send a 400
                if (error) {
                    
                    // Log the error to the terminal so we know what went wrong, and send the visitor an HTTP response 400 indicating it was a bad request.
                    console.log(error);
                    res.sendStatus(400);
                }
                // If all went well, send the results of the query back.
                else
                {
                    res.send(rows);
                }
            })
        }
    })
});

// POST route to add a Trainer to the database from the Trainers page's add form
app.post('/add-trainer-ajax', function(req, res) 
{
    // Capture the incoming data and parse it back to a JS object
    let data = req.body;

    // Create the query and run it on the database
    query1 = `INSERT INTO Trainers (first_name, last_name, email, phone, birth_date, start_date, location_id, salary) VALUES ('${data.first_name}', '${data.last_name}', '${data.email}', '${data.phone}', '${data.birth_date}', '${data.start_date}', '${data.location_id}', '${data.salary}')`;
    db.pool.query(query1, function(error, rows, fields){

        // Check to see if there was an error
        if (error) {

            // Log the error to the terminal so we know what went wrong, and send the visitor an HTTP response 400 indicating it was a bad request.
            console.log(error)
            res.sendStatus(400);
        }
        else
        {
            // If there was no error, perform a SELECT * on Trainers
            let query2 = `SELECT Trainers.trainer_id, Trainers.first_name, Trainers.last_name, Trainers.email, Trainers.phone, DATE_FORMAT(Trainers.birth_date, "%b-%d-%Y") AS birth_date, DATE_FORMAT(Trainers.start_date, "%b-%d-%Y") AS start_date, Locations.address, Locations.city, Trainers.salary FROM Trainers INNER JOIN Locations ON Trainers.location_id = Locations.location_id;`;  // Query for INSERT
            db.pool.query(query2, function(error, rows, fields){

                // If there was an error on the second query, send a 400
                if (error) {
                    
                    // Log the error to the terminal so we know what went wrong, and send the visitor an HTTP response 400 indicating it was a bad request.
                    console.log(error);
                    res.sendStatus(400);
                }
                // If all went well, send the results of the query back.
                else
                {
                    res.send(rows);
                }
            })
        }
    })
});

// POST route to add an Equipment to the database from the Equipment page's add form
app.post('/add-equipment-ajax', function(req, res) 
{
    // Capture the incoming data and parse it back to a JS object
    let data = req.body;

    // Create the query and run it on the database
    query1 = `INSERT INTO Equipment (equipment_name, cost_per_unit) VALUES ('${data.equipment_name}', '${data.cost_per_unit}')`;
    db.pool.query(query1, function(error, rows, fields){

        // Check to see if there was an error
        if (error) {

            // Log the error to the terminal so we know what went wrong, and send the visitor an HTTP response 400 indicating it was a bad request.
            console.log(error)
            res.sendStatus(400);
        }
        else
        {
            // If there was no error, perform a SELECT * on Equipment
            query2 = `SELECT * FROM Equipment;`;
            db.pool.query(query2, function(error, rows, fields){

                // If there was an error on the second query, send a 400
                if (error) {
                    
                    // Log the error to the terminal so we know what went wrong, and send the visitor an HTTP response 400 indicating it was a bad request.
                    console.log(error);
                    res.sendStatus(400);
                }
                // If all went well, send the results of the query back.
                else
                {
                    res.send(rows);
                }
            })
        }
    })
});

// POST route to add a Location to the database from the Locations page's add form
app.post('/add-location-ajax', function(req, res) 
{
    // Capture the incoming data and parse it back to a JS object
    let data = req.body;

    // Create the query and run it on the database
    query1 = `INSERT INTO Locations (address, city, state, zip) VALUES ('${data.address}', '${data.city}', '${data.state}', '${data.zip}')`;
    db.pool.query(query1, function(error, rows, fields){

        // Check to see if there was an error
        if (error) {

            // Log the error to the terminal so we know what went wrong, and send the visitor an HTTP response 400 indicating it was a bad request.
            console.log(error)
            res.sendStatus(400);
        }
        else
        {
            // If there was no error, perform a SELECT * on Locations
            query2 = `SELECT * FROM Locations;`;
            db.pool.query(query2, function(error, rows, fields){

                // If there was an error on the second query, send a 400
                if (error) {
                    
                    // Log the error to the terminal so we know what went wrong, and send the visitor an HTTP response 400 indicating it was a bad request.
                    console.log(error);
                    res.sendStatus(400);
                }
                // If all went well, send the results of the query back.
                else
                {
                    res.send(rows);
                }
            })
        }
    })
});

// POST route to add a Visit to the database from the Visits page's add form
app.post('/add-visit-ajax', function(req, res) 
{
    // Capture the incoming data and parse it back to a JS object
    let data = req.body;

    // Create the query and run it on the database
    query1 = `INSERT INTO Visits (visit_date, member_id, location_id) VALUES ('${data.visit_date}', '${data.member_id}', '${data.location_id}')`;
    db.pool.query(query1, function(error, rows, fields){

        // Check to see if there was an error
        if (error) {

            // Log the error to the terminal so we know what went wrong, and send the visitor an HTTP response 400 indicating it was a bad request.
            console.log(error)
            res.sendStatus(400);
        }
        else
        {
            // If there was no error, perform a SELECT * on Visits
            query2 = `SELECT Visits.visit_id, DATE_FORMAT(Visits.visit_date, "%b-%d-%Y %I:%i %p") AS visit_date, Members.first_name, Members.last_name, Locations.city 
            FROM Visits 
            INNER JOIN Members ON Visits.member_id = Members.member_id INNER JOIN Locations ON Visits.location_id = Locations.location_id;`;
            db.pool.query(query2, function(error, rows, fields){

                // If there was an error on the second query, send a 400
                if (error) {
                    
                    // Log the error to the terminal so we know what went wrong, and send the visitor an HTTP response 400 indicating it was a bad request.
                    console.log(error);
                    res.sendStatus(400);
                }
                // If all went well, send the results of the query back.
                else
                {
                    res.send(rows);
                }
            })
        }
    })
});

// DELETE FROM Equipment_Locations
app.delete('/delete-equipment-location-ajax/', function(req,res,next){
    let data = req.body;
    let locationID = parseInt(data.location_id);
    let equipmentID = parseInt(data.equipment_id);
    let deleteEquipLocation = `DELETE FROM Equipment_Locations WHERE location_id = ? AND equipment_id = ?;`;
    
        // Run the second query
        db.pool.query(deleteEquipLocation , [locationID, equipmentID], function(error, rows, fields) {

            if (error) {
                console.log(error);
                res.sendStatus(400);
            } else {
                res.sendStatus(204);
            }
        })
  });

// UPDATE Equipment_Locations
app.put('/put-equipment-location-ajax', function(req,res,next){
    console.log('PUT request received');
    console.log('Request body:', req.body);
    let data = req.body;
    console.log(data);

    // Converting data to integers, then setting to new variables
    let locationID = parseInt(data.location_id);            
    let equipmentID = parseInt(data.equipment_id);          
    let equipmentCount = parseInt(data.equipment_count);

    // Defining queries to update the selected Equipment_Locations entry
    let queryUpdateCount = `UPDATE Equipment_Locations SET equipment_count = ? WHERE location_id = ? AND equipment_id = ?`;
    let selectEquipLoc = `SELECT * FROM Equipment_Locations WHERE location_id = ? AND equipment_id = ?`;

            // Run the 1st query
            db.pool.query(queryUpdateCount, [equipmentCount, locationID, equipmentID], function(error, rows, fields){
                if (error) {

                // Log the error to the terminal so we know what went wrong, and send the visitor an HTTP response 400 indicating it was a bad request.
                console.log(error);
                res.sendStatus(400);
                }
                else
                {
                    // If there was no error, perform a SELECT * on Equipment_Locations
                    query2 = `SELECT * FROM Equipment_Locations;`;
                    db.pool.query(selectEquipLoc, [locationID, equipmentID], function(error, rows, fields){

                        // If there was an error on the second query, send a 400
                        if (error) {
                            
                            // Log the error to the terminal so we know what went wrong, and send the visitor an HTTP response 400 indicating it was a bad request.
                            console.log(error);
                            res.sendStatus(400);
                        }
                        // If all went well, send the results of the query back.
                        else
                        {
                            res.send(rows);
                        }
                    })
                }
        })
    });

// UPDATE Trainers
app.put('/put-trainer-ajax', express.json(), function(req,res,next){
    let data = req.body;
    console.log(data);
    
    // Converting data to integers, then setting to new variables
    let trainerID = parseInt(data.trainer_id);
    let locationID = parseInt(data.location_id);
    
    // Defining queries to update the selected Trainers entry with the new Location
    let queryUpdateLocation = `UPDATE Trainers SET location_id = ? WHERE trainer_id = ?;`;
    let selectLocation = `SELECT Locations.address, Locations.city FROM Locations WHERE location_id = ?;`;
    
            // Run the 1st query
            db.pool.query(queryUpdateLocation, [locationID, trainerID], function(error, rows, fields){
                console.log(rows);
                if (error) {
    
                // Log the error to the terminal so we know what went wrong, and send the visitor an HTTP response 400 indicating it was a bad request.
                console.log(error);
                res.sendStatus(400);
                }
                else
                {
                    // If there was no error, perform a SELECT on Locations using selectLocation query
                    db.pool.query(selectLocation, [locationID], function(error, rows, fields){
    
                        // If there was an error on the second query, send a 400
                        if (error) {
                            
                            // Log the error to the terminal so we know what went wrong, and send the visitor an HTTP response 400 indicating it was a bad request.
                            console.log(error);
                            res.sendStatus(400);
                        }
                        // If all went well, send the results of the query back.
                        else
                        {
                            res.send(rows);
                        }
                    })
                }
        })
    });

/*
    LISTENER
*/
app.listen(PORT, function(){
    console.log('Express started on http://localhost:' + PORT + '; press Ctrl-C to terminate.')
});