import $ from 'jquery'
import d3 from 'd3'

var good            = d3.random.normal(600, 50)
  , best            = d3.random.normal(100, 50)
  , bad             = d3.random.normal(3000, 500)
  , serverResponses = []

for(var i = 0; i < 500; i++)
  serverResponses.push( best() )

for(var i = 0; i < 200; i++)
  serverResponses.push( good() )

for(var i = 0; i < 100; i++)
  serverResponses.push( bad() )

var margin      = {top: 20, right: 20, bottom: 30, left: 40}
  , width       = 960 - margin.left - margin.right
  , height      = 200 - margin.top - margin.bottom
  , x           = d3.scale.linear()
  , y           = d3.scale.linear()
  , xAxis       = d3.svg.axis().scale(x).orient('bottom')
  , yAxis       = d3.svg.axis().scale(y)
  , formatCount = d3.format(',.0f')

var _data = d3.layout.histogram()
  .bind(x.ticks(22))
  (serverResponses)

x.domain([0, d3.max(_data, (d) => d.x)]).range([0, width])
y.domain([0, d3.max(_data, (d) => d.y)]).range([height, 0])

var svg = d3.select('#averages-histogram').append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
  .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)

svg.append('g')
  .attr('class', 'x axis')
  .attr('transform', `translate(0, ${height})`)
  .call(xAxis)

function update(data) {
  x.domain([0, d3.max(data, (d) => d.x)])
  y.domain([0, d3.max(data, (d) => d.y)])

  var bar = svg.selectAll('.bar')
      .data(data)

  bar.enter().append('rect')
      .attr('class', 'bar')
      .attr('y', y(0))
      .attr('height', height - y(0))

  bar.transition()
    .duration(300)
      .attr('x', (d) => x(d.x))
      .attr('width', x(data[0].dx) - 1)
      .attr('y', (d) => y(d.y))
      .attr('height', (d) => height - y(d.y))
}

update(_data);

setInterval(() => {
  for(var i = 0; i < 500; i++)
    serverResponses.push( best() )

  for(var i = 0; i < 200; i++)
    serverResponses.push( good() )

  for(var i = 0; i < 100; i++)
    serverResponses.push( bad() )

  _data = d3.layout.histogram()
    .bind(x.ticks(22))
    (serverResponses)

  update(_data)
}, 3000)

$(document).on('keydown', (e) => {
  if (e.which == 83)
    for (var i = 0; i < 500; i++)
      serverResponses.push( bad() )
})
