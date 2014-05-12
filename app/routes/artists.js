'use strict';

var multiparty = require('multiparty'); //imports the node module
var albums = global.nss.db.collection('albums');
var artists = global.nss.db.collection('artists');
var songs = global.nss.db.collection('songs');
var fs = require('fs');
var Mongo = require('mongodb');
var _ = require('lodash');

exports.index = (req, res)=>{
  artists.find().toArray((e,r)=>{
    res.render('artists/index', {artists: r, title: 'Artist List'});
  });
};

exports.create = (req, res)=>{
  var form = new multiparty.Form();
  form.parse(req, (err, fields, files)=>{
    var artist = {};
    var folderName = fields.name[0].toLowerCase().split(' ').join('-');
    var photoName = files.photo[0].originalFilename;
    artist.name = fields.name[0];
    if(!fs.existsSync(`${__dirname}/../static/img/artists`)) {
       fs.mkdirSync(`${__dirname}/../static/img/artists`);
     }
     if(!fs.existsSync(`${__dirname}/../static/img/artists/${folderName}`)) {
       fs.mkdirSync(`${__dirname}/../static/img/artists/${folderName}`);
     }
     if(!fs.existsSync(`${__dirname}/../static/img/artists/${folderName}/${photoName}`)) {
       fs.renameSync(files.photo[0].path, `${__dirname}/../static/img/artists/${folderName}/${photoName}`);
       artist.photo = folderName+'/'+photoName;
       artists.save(artist, ()=> res.redirect('/artists'));
     }
     else {
       res.redirect('/artists');
     }
  });
};

exports.show = (req, res)=>{
  var _id = Mongo.ObjectID(req.params.id);
  artists.find().toArray((e, artsts)=>{
    albums.find().toArray((e, albms)=>{
      songs.find({artistId: _id}).toArray((e, sngs)=>{
        sngs = sngs.map(s=>{
          var al = _(albms).find(a=>a._id.toString() === s.albumId.toString());
          var ar = _(artsts).find(a=>a._id.toString() === s.artistId.toString());
          s.album = al;
          s.artist = ar;
          return s;
        });
        res.render('artists/show', {songs: sngs, title: 'Show Artist List'});
      });
    });
  });
};
