process.env.NODE_ENV = 'test';

let chai = require('chai');
let chaiHttp = require('chai-http');
const sqlite3 = require('sqlite3').verbose();
let server = require('./server.js');
let expect = chai.expect;

chai.use(chaiHttp);

describe('Gradovi', () => {

    before(() => {
        let db = new sqlite3.Database('./baza.db', (err) => {
            if (err) {
                return console.log("Error");
            }
            db.run('CREATE TABLE IF NOT EXISTS grad(ID INTEGER, NAZIV TEXT, BROJ_STANOVNIKA INTEGER)');
            db.run('INSERT OR REPLACE INTO grad (ID, NAZIV, BROJ_STANOVNIKA) VALUES(1, "Sarajevo", 350000);')
            db.run('INSERT OR REPLACE INTO grad (ID, NAZIV, BROJ_STANOVNIKA) VALUES(2, "Zenica", 100000);')
            db.run('INSERT OR REPLACE INTO grad (ID, NAZIV, BROJ_STANOVNIKA) VALUES(3, "Tuzla", 120000);')
            db.run('INSERT OR REPLACE INTO grad (ID, NAZIV, BROJ_STANOVNIKA) VALUES(4, "Zagreb", 800000);')
            db.run('INSERT OR REPLACE INTO grad (ID, NAZIV, BROJ_STANOVNIKA) VALUES(5, "Bihac", 50000);')
            db.run('INSERT OR REPLACE INTO grad (ID, NAZIV, BROJ_STANOVNIKA) VALUES(6, "Cazin", 65000);')
        });
    })

    after(() => {
        let db = new sqlite3.Database('./baza.db', (err) => {
            if (err) {
                return console.log("Error");
            }
            db.run('DELETE FROM grad WHERE ID IN(1, 2, 3, 4, 5,6);');
        });
    })

    describe('/GET', () => {
        it('Prikaz svih gradova(OK)', (done) => {
            chai.request(server)
                .get('/gradovi')
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    done();
                });
        });
    });

    describe('/GET by id', () => {
        it('Dobavljanje grada s id-jem 6', (done) => {
            chai.request(server)
                .get('/gradovi/6')
                .end((err, res) => {
                    expect(res.body.NAZIV).to.be.equal("Cazin");
                    done();
                });
        });
    });

    describe('/DELETE', () => {
        it('Brisanje grada sa id-jem 2', (done) => {
            chai.request(server)
                .delete('/gradovi/2')
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    done();
                });
        });
    });
    describe('/PUT', () => {
        it('Vraćanje status code-a 200 za /PUT gradovi/:id', (done) => {
            const noviGrad = {
                brojStanovnika: 10
            };

            chai.request(server)
                .put('/gradovi/1')
                .send(noviGrad)
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    done();
                });
        });
    });

    describe('/POST', () => {
        it('Kreiranje novog grada', (done) => {
            const novi = {
                name: "Ključ",
                brojStanovnika: 40000
            };

            chai.request(server)
                .post('/grad')
                .send(novi)
                .end((err, res) => {
                    expect(res.body.name).to.be.equal(novi.name);
                    done();
                });
        });
    });

});