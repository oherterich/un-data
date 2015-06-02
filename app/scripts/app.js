'use strict';

var $ = require('jquery');

//Controllers
var MapCtrl = require('./controllers/map');

$(document.body).ready(function() {
	console.log('Ready');
  this._mapCtrl = new MapCtrl();
});