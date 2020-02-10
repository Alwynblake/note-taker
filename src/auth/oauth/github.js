'use strict';

const superagent = require('superagent');
require('dotenv').config();
var GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
var GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
var GITHUB_REDIRECT_URI = process.env.GITHUB_REDIRECT_URI; //http://localhost:3000/oauth

function authorize(req, res) {

  let code = req.query.code;
  console.log('1) code received: ', code);
  const sendObj = {
    code: code,
    client_id: GITHUB_CLIENT_ID,
    client_secret: GITHUB_CLIENT_SECRET,
    redirect_uri: GITHUB_REDIRECT_URI,
    grant_type: 'authorization_code',
  };
  console.log("leg 2a body: ", sendObj);
  return superagent.post('https://github.com/login/oauth/access_token')
      .type('form')
      .send(sendObj)
      .then(response => {
        let access_token = response.body.access_token;
        console.log('before part 2 log of QUERY', response.query);
        console.log('before part 2 log of BODY', response.body);
        console.log('(2) Access token received, ', access_token);
        return access_token;
      })
      .then(token => {
        return superagent.get('https://api.github.com/user')
            .set('Authorization', `token ${token}`)
            .set('User-Agent', '401-lab-12');
      })
      .then(response => {
        let user = response.body;
        //create new user instance here Model.createFromOauth(user)
        // .then res-> response.status(200).json(res.generateToken());
        console.log(`3) here is our user:`, user);
        res.status(200).json(user);
      })
      .catch(e => res.send(e));
}

module.exports = authorize;