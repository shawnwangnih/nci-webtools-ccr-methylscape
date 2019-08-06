const path = require('path');
const { port, MethylScapeTable } = require('./config.json');
const { scanTable } = require('./utils/scanDynamoDB');

const app = require('fastify')({
    ignoreTrailingSlash: true,
});
app.register(require('fastify-cors'));
app.register(require('fastify-static'), {
    root: path.resolve('client', 'build')
});

// todo: check connectivity to database
app.get('/ping', (req, res) => res.send(true));

app.get('/scanMethylScapeTable', (req, res) => {
    try{
        scanTable(MethylScapeTable).then((data, error) => {
            if (error) {
              console.log('ERROR', error);
              res.send(error)
            }
            if (data) {
              console.log('DATA', data);
              res.send(data)
            }
          });
    }catch (e){
        res.send(e)
    }
});


app.listen(port, '0.0.0.0')
    .then(addr => console.log(`Application is running on: ${addr}`))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });