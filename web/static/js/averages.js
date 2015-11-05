import $ from 'jquery'

var good            = d3.random.normal(600, 50)
  , best            = d3.random.normal(100, 50)
  , bad             = d3.random.normal(3000, 500)
  , serverResponses = []
  , data            = []
  , n               = 243

for (var i = 0; i < n; i++) {
  serverResponses.push( good() )
  data.push( good() )
}

var margin   = {top: 20, right: 20, bottom: 30, left: 40}
  , width    = 900
  , height   = 200
  , duration = 750
  , now      = new Date(Date.now() - duration)
  , xScale   = d3.time.scale()
  , yScale   = d3.scale.linear()
  , X        = (d, i) => xScale(now - (n - 1 - i) * duration)
  , Y        = (d) => yScale(d)
  , xAxis    = d3.svg.axis().scale(xScale).orient('bottom')
  , yAxis    = d3.svg.axis().scale(yScale).orient('left')
  , line     = d3.svg.line().interpolate('basis').x(X).y(Y)

xScale.domain([now - (243 - 2) * duration, now - duration])
  .range([0, width])
  .ticks(d3.time.second, 5)

yScale.domain([0, d3.max(data)])
  .range([height, 0])

var svg = d3.select('#averages').append('svg')
    .attr('width', width + margin.right + margin.left)
    .attr('height', height + margin.top + margin.bottom)
  .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)

svg.append('defs').append('clipPath')
    .attr('id', 'clip')
  .append('rect')
    .attr('width', width)
    .attr('height', height)

var axis = svg.append('g')
  .attr('class', 'x axis')
  .attr('transform', `translate(0, ${height})`)
  .call(xAxis)

var yAxisG = svg.append('g')
    .attr('class', 'y axis')
    .call(yAxis)

yAxisG
  .append('text')
    .attr('transform', 'rotate(-90)')
    .attr('y', 6)
    .attr('dy', '.71em')
    .style('text-anchor', 'end')
    .text('Avg. Response time (ms)')

var path = svg.append('g')
    .attr('clip-path', 'url(#clip)')
  .append('path')
    .datum(data)
    .attr('class', 'line')

var transition = d3.select({}).transition()
  .duration(750)
  .ease('linear') ;

(function tick() {
  transition = transition.each(function() {
    now = new Date()
    xScale.domain([now - (n - 2) * duration, now - duration])
    yScale.domain([0, d3.max(data)])

    if (serverResponses.length > 100) {
      var avg = serverResponses.reduce((acc, d) => acc+d, 0) / serverResponses.length
      serverResponses = []
      data.push( avg )
    }

    svg.select('.line').attr('d', line).attr('transform', null)

    axis.call(xAxis)
    yAxisG.call(yAxis)

    path.transition()
      .attr('transform', `translate(${xScale(now - (n-1) * duration)},0)`)

    data.shift()
  }).transition().each('start', tick)
})();

setInterval(() => {
  for(var i = 0; i < 200; i++)
    serverResponses.push( best() )

  for(var i = 0; i < 50; i++)
    serverResponses.push( good() )

}, 1000)

$(document).on('keydown', (e) => {
  if (e.which == 83)
    serverResponses.push( bad() )
})

$('.js-add-slow-response').on('click', (e) => {
  serverResponses.push( bad() )
})
