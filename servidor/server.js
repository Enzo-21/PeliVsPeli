//paquetes necesarios para el proyecto
var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var controller = require('./controladores/controller');


var app = express();

app.use(cors());

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(bodyParser.json());


//Routes
app.get('/competencias', controller.competencias);
app.get('/competencias/:id', controller.competenciasData);
app.get('/competencias/:id/peliculas', controller.dosPelis);
app.post('/competencias/:idCompetencia/voto', controller.voto);
app.get('/competencias/:id/resultados', controller.obtenerResultados);
app.post('/competencias', controller.nuevaCompetencia);
app.delete('/competencias/:id/votos', controller.reiniciar);
app.get('/generos', controller.nuevaCompetenciaGenero);
app.get('/directores', controller.nuevaCompetenciaDirector);
app.get('/actores', controller.nuevaCompetenciaActor);
app.delete('/competencias/:id', controller.eliminarCompetencia);
app.put('/competencias/:id', controller.modificarNombreCompetencia);


//seteamos el puerto en el cual va a escuchar los pedidos la aplicación
var puerto = '8080';

app.listen(puerto, () => {
  console.log("Escuchando en el puerto " + puerto);
});
