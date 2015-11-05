var good = d3.random.normal(600, 50)
  , data = []
  , n = 243

for (var i = 0; i < n; i++) {
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

yScale.domain(d3.extent(data, Y))
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

svg.append('g')
    .attr('class', 'y axis')
    .call(yAxis)
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
    // .attr('d', line)

var transition = d3.select({}).transition()
  .duration(750)
  .ease('linear') ;

(function tick() {
  transition = transition.each(function() {
    now = new Date()
    xScale.domain([now - (n - 2) * duration, now - duration])
    yScale.domain([0, d3.max(data)])

    data.push( good() )

    svg.select('.line').attr('d', line).attr('transform', null)

    axis.call(xAxis)

    path.transition()
      .attr('transform', `translate(${xScale(now - (n-1) * duration)},0)`)

    data.shift()
  }).transition().each('start', tick)
})();
