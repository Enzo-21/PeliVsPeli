const database = require('../lib/conexionbd');

competencias = (req, res) => {
    const query = "SELECT * FROM competencia";

    database.connection.query(query, (err, results) => {
        if (err) {
            console.log('Hubo un error' + err);
        } else {
            res.send(results)
        }
    });

};

dosPelis = (req, res) => {

    const id = req.params.id;

    const queryCompetencia = `SELECT * FROM competencia WHERE id = ${id}`


    database.connection.query(queryCompetencia, (err, results) => {

        if (results.length === 0) { //Si no existe la competencia, envía un error

            return res.status(404)        // HTTP status 404: NotFound
                .send(`Esta competencia no existe`);

        } else { // Si está todo bien, ejecuta la query que busca 2 peliculas para enfrentarse

            const additionalConditions = [];

            if (results[0].genero_id !== null) {
                additionalConditions.push("genero_id = " + results[0].genero_id);
            };

            if (results[0].director_id !== null) {
                additionalConditions.push("director_id = " + results[0].director_id);
            };

            if (results[0].actor_id !== null) {
                additionalConditions.push("actor_id = " + results[0].actor_id);
            };

            query = `SELECT * FROM pelicula left join director_pelicula AS dirpeli ON dirpeli.pelicula_id = pelicula.id left join actor_pelicula AS ac ON ac.pelicula_id = pelicula.id`

            if (additionalConditions.length > 0) { // Si existen condiciones adicionales, se agrega WHERE
                query = query + " WHERE ";
            };

            // Si hay más de una condición adicional, se agrega AND
            for (var i = 0; i < additionalConditions.length; i++) {
                query = query + additionalConditions[i];
                if (i + 1 !== additionalConditions.length) {
                    query = query + ' AND ';
                };
            };

            // Para que no traiga siempre las mismas peículas se utiliza RAND()
            query = query + " ORDER BY RAND() LIMIT 2";

            database.connection.query(query, (errs, results) => {
                if (errs) {

                    return res.status(404)        // HTTP status 404: NotFound
                        .send(`Hubo un error al intentar realizar la consulta`);

                } else {

                    const response = {
                        peliculas: results
                    }
                    res.send(response);

                };
            });
        };
    });
};

voto = (req, res) => {

    const id = req.params.idCompetencia;
    const idPeli = req.body.idPelicula;

    const queryCompetencia = `SELECT * FROM competencia WHERE id = ${id}`


    database.connection.query(queryCompetencia, (err, results) => {

        if (results.length === 0) { //Si no existe la competencia, envía un error

            return res.status(404)        // HTTP status 404: NotFound
                .send(`Esta competencia no existe`);

        } else { // Si está todo bien

            const query = `INSERT INTO voto (competencia_id, pelicula_id) VALUES (${id}, ${idPeli})`;

            database.connection.query(query, (errs, result) => {

                if (err) {
                    console.log('Hubo un error' + errs);

                    res.status(404)        // HTTP status 404: NotFound
                        .send('Hubo un error al intentar realizar la consulta');

                } else {
                    res.send(result)
                };
            });
        };
    });
};

obtenerResultados = (req, res) => {
    const id = req.params.id;
    const queryCompetencia = `SELECT * FROM competencia WHERE id = ${id}`

    database.connection.query(queryCompetencia, (err, results) => {

        if (results.length === 0) { //Si no existe la competencia, envía un error

            return res.status(404)        // HTTP status 404: NotFound
                .send(`Esta competencia no existe`);

        } else {
            const query = `SELECT pelicula_id, pelicula.poster, pelicula.titulo, count(voto.id) as votos FROM voto LEFT JOIN pelicula on pelicula.id = voto.pelicula_id WHERE competencia_id = ${id} GROUP BY competencia_id, pelicula_id, poster, titulo ORDER BY votos DESC`

            database.connection.query(query, (err, result) => {

                if (err) {
                    console.log('Hubo un error' + err);

                    res.status(404)        // HTTP status 404: NotFound
                        .send('Not found');

                } else {

                    const response = {
                        competencia: results[0].nombre,
                        resultados: result
                    }
                    //console.log(response)
                    res.send(response)
                };
            });
        };
    });
};


nuevaCompetencia = (req, res) => {

    const nombre = req.body.nombre,
        genero = req.body.genero,
        director = req.body.director,
        actor = req.body.actor;

    const fields = [];
    const values = [];

    if (req.body.nombre !== undefined) {
        fields.push("nombre");
        values.push(`"${req.body.nombre}"`);
    }

    if (req.body.genero > 0) {
        fields.push("genero_id");
        values.push(req.body.genero);
    }

    if (req.body.director > 0) {
        fields.push("director_id");
        values.push(req.body.director);
    }

    if (req.body.actor > 0) {
        fields.push("actor_id");
        values.push(req.body.actor);
    }


    // Por si la competencia que se quiere agregar tiene 1 o más filtros (campos) específicos
    let insertInto = "INSERT INTO competencia (";
    for (var i = 0; i < fields.length; i++) {
        insertInto = insertInto + fields[i];
        if (i + 1 !== fields.length) {
            insertInto = insertInto + ', ';
        }
    }
    // Para insertar los valores en los campos
    insertInto += ") VALUES (";
    for (var i = 0; i < values.length; i++) {
        insertInto += values[i];
        if (i + 1 !== values.length) {
            insertInto += ', ';
        }
    }
    insertInto += ");";


    const query = `SELECT * FROM competencia WHERE nombre = '${nombre}'`;
    database.connection.query(query, (err, result) => {

        if (result.length > 0) {
            return res.status(422).send("Esta competencia ya existe");

        } else {

            database.connection.query(insertInto, (errs, results) => {
                if (errs) {
                    return res.status(404).send("Ha ocurrido un error en la consulta");
                };
            });
        };
    });
};

reiniciar = (req, res) => {
    const id = req.params.id;

    const queryCompetencia = `SELECT nombre FROM competencia WHERE id = ${id}`


    database.connection.query(queryCompetencia, (err, results) => {

        if (results.length === 0) { //Si no existe la competencia, envía un error

            return res.status(404)        // HTTP status 404: NotFound
                .send(`Esta competencia no existe`);

        } else { // Si está todo bien
            const query = `DELETE FROM voto WHERE competencia_id = ${id}`
            database.connection.query(query, (errs, result) => {
                if (errs) {
                    return res.status(404)        // HTTP status 404: NotFound
                        .send("Ha ocurrido un error en la consulta")
                };

                res.send(result);
            });
        };
    });
};


nuevaCompetenciaGenero = (req, res) => {

    const query = "SELECT * FROM genero";
    database.connection.query(query, (err, results) => {

        if (err) {
            console.log('Hubo un error' + err);

            res.status(404)        // HTTP status 404: NotFound
                .send('Not found');

        } else {

            res.send(results)
        }

    });
};

nuevaCompetenciaDirector = (req, res) => {

    const query = "SELECT * FROM director";
    database.connection.query(query, (err, results) => {

        if (err) {
            console.log('Hubo un error' + err);

            res.status(404)        // HTTP status 404: NotFound
                .send('Not found');

        } else {

            res.send(results)
        }

    });
};

nuevaCompetenciaActor = (req, res) => {

    const query = "SELECT * FROM actor";
    database.connection.query(query, (err, results) => {

        if (err) {
            console.log('Hubo un error' + err);

            res.status(404)        // HTTP status 404: NotFound
                .send('Not found');

        } else {

            res.send(results)
        }

    });
};


eliminarCompetencia = (req, res) => {
    const id = req.params.id;

    const queryCompetencia = `SELECT nombre FROM competencia WHERE id = ${id}`


    database.connection.query(queryCompetencia, (err, results) => {

        if (results.length === 0) { //Si no existe la competencia, envía un error

            return res.status(404)        // HTTP status 404: NotFound
                .send(`Esta competencia no existe`);

        } else { // Si está todo bien
            const queryVoto = `DELETE FROM voto WHERE competencia_id = ${id}`
            database.connection.query(queryVoto, (errs, result) => {
                if (errs) {
                    return res.status(404)        // HTTP status 404: NotFound
                        .send("Ha ocurrido un error en la consulta")
                } else {

                    const query = `DELETE FROM competencia WHERE id = ${id}`
                    database.connection.query(query, (errs, result) => {
                        if (errs) {
                            return res.status(404)        // HTTP status 404: NotFound
                                .send("Ha ocurrido un error en la consulta")
                        } else {
                            res.status(200)
                                .send('La competencia ha sido eliminada')
                        }
                    });

                }
            });
        };
    });
};

modificarNombreCompetencia = (req, res) => {
    const id = req.params.id;
    let nombre = req.body.nombre;

    const queryCompetencia = `SELECT nombre FROM competencia WHERE id = ${id}`

    database.connection.query(queryCompetencia, (err, results) => {

        if (results.length === 0) { //Si no existe la competencia, envía un error

            return res.status(404)        // HTTP status 404: NotFound
                .send(`Esta competencia no existe`);

        } else { // Si está todo bien
            const query = `UPDATE competencia SET nombre = '${nombre}' WHERE id = ${id}`
            database.connection.query(query, (errs, result) => {
                if (errs) {
                    return res.status(404)        // HTTP status 404: NotFound
                        .send("Ha ocurrido un error en la consulta")
                } else {
                    return res.status(200)
                        .send('La competencia ha sido modificada correctamente')
                }
            });
        };
    });
};

competenciasData = (req, res) => {
    const id = req.params.id;
    const query = `SELECT competencia.nombre, actor.nombre AS actor_nombre, director.nombre AS director_nombre, genero.nombre AS genero_nombre FROM competencia LEFT JOIN actor ON actor.id = competencia.actor_id LEFT JOIN genero ON genero.id = competencia.genero_id LEFT JOIN director ON director.id = competencia.director_id WHERE competencia.id = ${id}`;

    database.connection.query(query, (err, results) => {
        if (err) {
            console.log('Hubo un error' + err);
        } else {
            res.send(results[0]);
        }
    });

};





module.exports = {
    competencias: competencias,
    dosPelis: dosPelis,
    voto: voto,
    obtenerResultados: obtenerResultados,
    nuevaCompetencia: nuevaCompetencia,
    reiniciar: reiniciar,
    nuevaCompetenciaGenero: nuevaCompetenciaGenero,
    nuevaCompetenciaDirector: nuevaCompetenciaDirector,
    nuevaCompetenciaActor: nuevaCompetenciaActor,
    eliminarCompetencia: eliminarCompetencia,
    modificarNombreCompetencia: modificarNombreCompetencia,
    competenciasData: competenciasData
}