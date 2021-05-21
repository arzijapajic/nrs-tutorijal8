var http = require('http');
var fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
var express = require('express');
var path = require("path");
var bodyParser = require("body-parser");





var app = express();
app.use(bodyParser.json());
var server = http.createServer(app);

let db = new sqlite3.Database('./baza.db', (err) => {
    if (err) {
        return console.error(err.message);
    }
    db.run('CREATE TABLE IF NOT EXISTS grad(ID INTEGER, NAZIV TEXT, BROJ_STANOVNIKA INTEGER)');
    console.log('Connected.');
});


app.post('/grad', function(req, res) {
    db.serialize(() => {
        db.run('INSERT INTO grad(NAZIV, BROJ_STANOVNIKA) VALUES(?,?)', [req.body.name, req.body.brojStanovnika], function(err, row) {
            if (err) {
                return console.log(err.message);
            }
            console.log("Uspjesno dodan grad.");
            res.send({
                name: req.body.name,
                brojStanovnika: req.body.brojStanovnika
            });
        });
    });
});

app.get('/gradovi', function(req, res) {
    var data = [];
    db.serialize(() => {
        let sql = `SELECT DISTINCT id ID, naziv NAZIV, broj_stanovnika BROJ_STANOVNIKA FROM grad
           ORDER BY ID`;

        db.all(sql, [], (err, rows) => {
            if (err) {
                throw err;
            }
            res.send(rows);
        });
    });
});

app.get('/gradovi/:id', function(req, res) {
    db.serialize(() => {

        db.get('SELECT id ID, naziv NAZIV, broj_stanovnika BROJ_STANOVNIKA FROM grad WHERE id =?', [req.params.id], function(err, row) {
            if (err) {
                res.send("Error");
                return console.error(err.message);
            }
            if (row.ID !== 'undefined') res.send(row);
            else res.send({ message: 'Grad sa poslanim ID-em ne postoji u bazi.' });
            console.log("Uspjesno pronadjen grad.");
        });
    });
});

app.put('/gradovi/:id', (req, res) => {

    var data = {
        broj: req.body.brojStanovnika
    }
    db.run(
        `UPDATE grad set BROJ_STANOVNIKA=? WHERE id=?`, [data.broj, req.params.id],
        function(err) {
            if (err) {
                res.status(400).json({ "error": res.message })
                return;
            }
            res.json({
                message: "success",
                data: data
            })
        });
});

app.delete('/gradovi/:id', (req, res) => {
    db.serialize(() => {
        db.run(`DELETE FROM grad WHERE id=?`, [req.params.id], function(err) {
            if (err) {
                return console.error(err.message);
            }
            res.send("Grad je obrisan.")
        });
    });
});


server.listen(3000);
console.log('Listening on port 3000...');

module.exports = server