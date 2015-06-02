'use strict';

var $ = require('jquery');

require('../libs/d3.min.js');
require('../libs/topojson.v1.min.js');
var mapData = require('../data/world-topo-min.json');

var Map = function() {
  console.log('Map!');

  this._width = document.querySelector('.map').offsetWidth;
  this._height = this._width/2;

  this._tooltip = d3.select(".map").append("div").attr("class", "tooltip hidden");
  this._graticule = d3.geo.graticule();

  this._zoom = d3.behavior.zoom()
    .scaleExtent([1, 9])
    .on('zoom', this._move.bind(this));

  this._projection = d3.geo.mercator()
    .translate([(this._width/2), (this._height/2)])
    .scale( this._width / 2 / Math.PI);

  this._path = d3.geo.path().projection(this._projection);

  this._svg = d3.select('.map').append('svg')
      .attr('width', this._width)
      .attr('height', this._height)
      .call(this._zoom)
      .on('click', this._click)
      .append('g');

  this._g = this._svg.append('g');

  // console.log(mapData);

  this._topo = topojson.feature(mapData, mapData.objects.countries).features;
  this._draw(this._topo);
};

Map.prototype._click = function() {
  console.log('Click');
};

Map.prototype._move = function() {
  var t = d3.event.translate;
  var s = d3.event.scale; 
  var zscale = s;
  var h = this._height/4;

  t[0] = Math.min(
    (this._width/this._height)  * (s - 1), 
    Math.max( this._width * (1 - s), t[0] )
  );

  t[1] = Math.min(
    h * (s - 1) + h * s, 
    Math.max(this._height  * (1 - s) - h * s, t[1])
  );

  this._zoom.translate(t);
  this._g.attr('transform', 'translate(' + t + ')scale(' + s + ')');

  //adjust the country hover stroke width based on zoom level
  d3.selectAll('.country').style('stroke-width', 1.5 / s);  
};

Map.prototype._draw = function() {
  this._svg.append("path")
     .datum(this._graticule)
     .attr("class", "graticule")
     .attr("d", this._path);


  this._g.append("path")
   .datum({type: "LineString", coordinates: [[-180, 0], [-90, 0], [0, 0], [90, 0], [180, 0]]})
   .attr("class", "equator")
   .attr("d", this._path);


  var country = this._g.selectAll(".country").data(this._topo);

  country.enter().insert("path")
      .attr("class", "country")
      .attr("d", this._path)
      .attr("id", function(d,i) { return d.id; })
      .attr("title", function(d,i) { return d.properties.name; })
      .style("fill", function(d, i) { return d.properties.color; });

  //offsets for tooltips
  var offsetL = document.querySelector('.map').offsetLeft+20;
  var offsetT = document.querySelector('.map').offsetTop+10;

  //tooltips
  country
    .on("mousemove", function(d,i) {

      var mouse = d3.mouse(this._svg.node()).map( function(d) { return parseInt(d); } );

      this._tooltip.classed("hidden", false)
             .attr("style", "left:"+(mouse[0]+offsetL)+"px;top:"+(mouse[1]+offsetT)+"px")
             .html(d.properties.name);

    }.bind(this))
    .on("mouseout",  function(d,i) {
      this._tooltip.classed("hidden", true);
    }.bind(this)); 
};

module.exports = Map;