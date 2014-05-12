/* jshint unused:false */

'use strict';

var multiparty = require('multiparty'); //imports the node module
var albums = global.nss.db.collection('albums');
var artists = global.nss.db.collection('artists');
var songs = global.nss.db.collection('songs');
var fs = require('fs');
var Mongo = require('mongodb');
var _ = require('lodash');

exports.index = (req, res)=>{
  albums.find().toArray((e,r)=>{
    res.render('albums/index', {albums: r, title: '| Album List'});
  });
};

exports.create = (req, res)=>{
  var form = new multiparty.Form();
  form.parse(req, (err, fields, files)=>{
    var album = {};
    var folderName = fields.name[0].toLowerCase().split(' ').join('-');
    var photoName = files.cover[0].originalFilename;
    album.name = fields.name[0];
    if(!fs.existsSync(`${__dirname}/../static/img/albums`)) {
       fs.mkdirSync(`${__dirname}/../static/img/albums`);
     }
     if(!fs.existsSync(`${__dirname}/../static/img/albums/${folderName}`)) {
       fs.mkdirSync(`${__dirname}/../static/img/albums/${folderName}`);
     }
     if(!fs.existsSync(`${__dirname}/../static/img/albums/${folderName}/${photoName}`)) {
       fs.renameSync(files.cover[0].path, `${__dirname}/../static/img/albums/${folderName}/${photoName}`);
       album.cover = folderName+'/'+photoName;
       albums.save(album, ()=> res.redirect('/albums'));
     }
     else {
       res.redirect('/albums');
     }
  });
};

exports.show = (req, res)=>{
  var _id = Mongo.ObjectID(req.params.id);
  artists.find().toArray((e, artsts)=>{
    albums.find().toArray((e, albms)=>{
      songs.find({albumId: _id}).toArray((e, sngs)=>{
        sngs = sngs.map(s=>{
          var al = _(albms).find(a=>a._id.toString() === s.albumId.toString());
          var ar = _(artsts).find(a=>a._id.toString() === s.artistId.toString());
          s.album = al;
          s.artist = ar;
          return s;
        });
        res.render('albums/show', {songs: sngs, title: '| Show Album List'});
      });
    });
  });
};
