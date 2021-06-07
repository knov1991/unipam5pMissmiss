const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(cors());
app.use('/files', express.static(path.resolve((__dirname, '..', '..', 'uploads'))));
app.listen(3333);
console.log("server on")

require('./routes/enterpriseRoutes')(app);
require('./routes/userRoutes')(app);
require('./routes/productRoutes')(app);
require('./routes/reservationRoutes')(app);
require('./routes/scheduleRoutes')(app);
require('./routes/occupationRoutes')(app);
require('./routes/serviceRoutes')(app);
require('./routes/movementRoutes')(app);
require('./routes/accountPayableRoutes')(app);
require('./routes/accountReceivableRoutes')(app);
require('./routes/debtorRoutes')(app);