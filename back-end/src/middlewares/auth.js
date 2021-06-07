require('dotenv/config');

const jwt = require('jsonwebtoken');

const env = process.env;

module.exports = (req, res, next) => {
    const authorization = req.headers.authorization;

    if(authorization == null)
        return res.status(401).json({error : "No 'authorization' provided"});
    
    const [ schema, token ] = authorization.split(' ');

    if(!/^Bearer$/i.test(schema))
        return res.status(401).json({error : "'authorization' malformated"});

    jwt.verify(token, env.USER_TOKEN, (err, decoded) => {
        if(err)
            return res.status(401).json({error : "'authorization' invalid"});

        req.userId = decoded.id
        next();

    })

}