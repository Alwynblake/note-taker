'use strict';

const express = require('express');
const authRouter = express.Router();

const User = require('./users-model.js');
const Image = require('./image-model.js');
const auth = require('./middleware.js');
const oauth = require('./oauth/github.js');


authRouter.post('/signup', (req, res, next) => {
  let user = new User(req.body);
  user.save()
      .then( (user) => {
        req.token = user.generateToken();
        req.user = user;
        res.set('token', req.token);
        res.cookie('auth', req.token);
        res.send(req.token);
      }).catch(next);
});
// eslint-disable-next-line no-unused-vars
authRouter.post('/signin', auth, (req, res, next) => {
  res.cookie('auth', req.token);
  res.send(req.token);
});

authRouter.get('/images', auth, handleGetAll);

authRouter.get('/image/:id', auth, handleGetOne);

authRouter.get('/imageByUserId/:userId', auth, handleGetOneByUserId);

authRouter.put('/image/:id', auth, handlePut);

authRouter.delete('/image/:id', auth, handleDelete);


authRouter.get('/oauth', (req,res,next) => {
  oauth.authorize(req)
      .then( token => {
        res.status(200).send(token);
      })
      .catch(next);
});

authRouter.get('/unprotected', (req, res) => {
  res.send('you are unprotected');
});

authRouter.get('/protected', auth, (req, res) => {
  res.send('you have a valid token');
});

authRouter.post('/images', (req, res, next) => {
  console.log(req.body);
  let image = new Image(req.body);
  image.save()
      .then( async (image) => {
        res.send(image);
      })
      .then(() => {})
      .catch(next);
});

/**
 * This function fetches all of the images
 * @param {object} request - the user inputs a request
 * @returns {object} data - the data that matches the request is sent back, in this case, all images
 */
function handleGetAll(request,response,next) {
  Image.find({})
      .then( data => {
        response.status(200).json(data);
      })
      .catch( next );
}

/**
 * This function fetches one image
 * @param {object} request - an image id
 * @returns {object} output - the requested object matching the id from the request
 */
function handleGetOne(request,response,next) {
  console.log('handlegetone params', request.params);
  const imageToFind = request.params.id;
  Image.find({_id: imageToFind})
      .then( data => {
        const output = {
          results: data,
        };
        response.status(200).json(output);
        console.log('result is', output);})
      .catch( next );
}
/**
 * This function fetches one image by user id.
 * @param {object} request - the user id
 * @returns {object} output - the image object that contains the user id
 */
function handleGetOneByUserId(request,response,next) {
  console.log('handlegetone params', request.params);
  const imageToFind = request.params.userId;
  Image.find({user_id: imageToFind})
      .then( data => {
        const output = {
          results: data,
        };
        response.status(200).json(output);
        console.log('result is', output);})
      .catch( next );
}

/**
 * This function updates an existing image entry
 * @param {object} request - the entries to update, with an id to find
 * @returns {object} result - the updated entry
 */
function handlePut(request,response,next) {
  console.log('handleput params', request.params);
  console.log('handleput body', request.body);
  Image.update({_id: request.params.id}, request.body)
      .then( result => response.status(200).json(result) )
      .catch( next );
}

/**
 *
 * @param {*} request - the requested id to delete
 * @returns {object} result
 */
function handleDelete(request,response,next) {
  Image.remove({_id: request.params.id})
      .then( result => response.status(200).json(result) )
      .catch( next );
}

module.exports = authRouter;