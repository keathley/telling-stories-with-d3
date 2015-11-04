import {Socket} from "phoenix"
import $ from 'jquery'
import d3 from 'd3'
import ace from 'brace'
import 'brace/mode/javascript'
import 'brace/theme/github'

require('css/app')

window.$ = $

const Editor = (() => {
  var editor = null;

  function create() {
    editor = ace.edit('editor')
    editor.getSession().setMode('ace/mode/javascript')
    editor.setTheme('ace/theme/github')
  }

  function toggle() {
    $('body').toggleClass('editor-open')
  }

  return {
    new: create,
    toggle: toggle
  }
})();

const Router = (() => {
  function navigate(path) {
    var newPath = path ? path : ''
      , root    = window.location.href.replace(/#(.*)$/, '')
      , newRoute = `${root}#/${newPath}`

    window.location.href = newRoute

    return this
  }

  function path() {
    return (window.location.href.match(/^(.*)\/#\/(.*)$/)||['','','0'])[2]
  }

  return {
    navigate: navigate,
    path: path
  }
})();

const Deck = (() => {
  var $slides       = $('.slide')
    , currentSlide = null

  $(window).on('hashchange', _updateCurrentSlide)

  _updateCurrentSlide()

  function next() {
    if ( currentSlide < $slides.length-1 )
      Router.navigate(currentSlide + 1)
  }

  function previous() {
    if ( currentSlide && currentSlide != 0 )
      Router.navigate(currentSlide - 1)
  }

  function _updateCurrentSlide() {
    currentSlide = parseInt( Router.path() ) || 0
    _displaySlide(currentSlide)
  }

  function _displaySlide(id) {
    $slides.removeClass('current').eq(id).addClass('current')
  }

  return {
    next: next
  , previous: previous
  }
})();

const LineGraph = (function() {
  var margin = {top: 20, right: 20, bottom: 30, left: 40}
    , width  = 800
    , height = 400

  function create(el, data) {
    width  = width - margin.left - margin.right
    height = height - margin.top - margin.bottom

    var svg = d3.select(el).append('svg')
        .attr('class', 'd3')
        .attr('width', width + margin.right + margin.left)
        .attr('height', height + margin.top + margin.bottom)
      .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

    update(svg, data)

    return svg
  }

  function update(svg, data) {
    var data   = _munge(data)
      , scales = _scales(data)

    _drawAxis(svg, scales, data)
    _drawLine(svg, scales, data)

    return svg
  }

  function _munge(data) {
    data.forEach( (d) => {
      d.avg = d.responseTime
    })

    return data;
  }

  function _scales(data) {
    var x = d3.time.scale()
      .range([0, width])
      .domain(d3.extent(data, (d) => d.date ))

    var y = d3.scale.linear()
      .range([height, 0])
      .domain(d3.extent(data, (d) => d.avg ))

    return {
      x: x,
      y: y
    }
  }

  function _drawAxis(svg, scales, _data) {
    var xAxis = d3.svg.axis()
      .scale(scales.x)
      .orient('bottom')

    var yAxis = d3.svg.axis()
      .scale(scales.y)
      .orient('left')

    svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', `translate(0, ${height})`)
      .call(xAxis)

    svg.append('g')
        .attr('class', 'y axis')
        .call(yAxis)
      .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 6)
        .attr('dy', '.71em')
        .style('text-anchor', 'end')
        .text('Avg. Response time (ms)')
  }

  function _drawLine(svg, scales, data) {
    var line = d3.svg.line()
      .interpolate('basis')
      .x( (d) => scales.x(d.date) )
      .y( (d) => scales.y(d.avg) )

    svg.append('path')
      .datum(data)
      .attr('class', 'line')
      .attr('d', line)
  }

  return {
    create: create,
    update: update
  }
})();

Editor.new()

var createResponses = (good, bad, chance) => {
  var data = []
  for(var i = 0; i < 100; i++) {
    let response = (Math.random() * 10|0) % chance == 0 ? good : bad
    data.push({date: Date.now(), responseTime: response()})
  }

  return data
}
// var int = setInterval(createResponses, 2000)

var goodResponse = d3.random.normal(700, 300)
  , badResponse  = d3.random.normal(3000, 500)
  , chance       = 10
  , serverData   = createResponses(goodResponse, badResponse, chance)

var line1 = LineGraph.create('#server-response-line1', serverData)

LineGraph.update(line1, createResponses(goodResponse, badResponse, chance))



$(document).on('keydown', keyHandler)

function keyHandler(e) {
  switch (e.which) {
    case 39: //right
    Deck.next()
    break;
    case 37: //left
    Deck.previous()
    break;
    case 13: // enter
    console.log('Enter')
    break;
    case 69: // e
    Editor.toggle()
    break;
    default:
    console.log('Unhandled');
    console.log(e);
    break;
  }
}
