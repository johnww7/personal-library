/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;
var project = 'books';
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
    })
    
    .post(async function(req, res){
      var title = req.body.title;
      //response will contain new book object including atleast _id and title
      try {
        MongoClient.connect(MONGODB_CONNECTION_STRING, (err, db) => {
          if(err) {
            console.log("Database error: " + err);
          }
          console.log("Successfull database connection");

          var postPromise = () => {
            return new Promise((resolve, reject) => {
              db.collection(project).insertOne({title: title}, (err, res) => {
                if(err) {
                  reject(err);
                }
                else {
                  console.log('1 book submitted');
                  console.log(res);
                  let bookId = res.ops[0]._id;
                  resolve(bookId);
                }
              });
            })
          }

          var postBookResult = await postPromise();

          db.close();
          let bookSubmittedToLibrary = {
            _id: postBookResult,
            title
          };

          res.json(bookSubmittedToLibrary);
        });
        
      }
      catch(e) {
        console.log(e);
      }
    })
    
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      var bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
    })
    
    .post(function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;
      //json res format same as .get
    })
    
    .delete(function(req, res){
      var bookid = req.params.id;
      //if successful response will be 'delete successful'
    });
  
};
