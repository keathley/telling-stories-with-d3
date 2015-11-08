import d3 from 'd3'

var margin      = {top: 20, right: 20, bottom: 30, left: 40}
  , width       = 820 - margin.left - margin.right
  , height      = 600 - margin.top - margin.bottom
  , x           = d3.scale.ordinal()
  , y           = d3.scale.linear()
  , xAxis       = d3.svg.axis().scale(x).orient('bottom').ticks(0)
  , yAxis       = d3.svg.axis().scale(y).orient('left')

d3.json('/json/events.json', (error, json) => {
  var data = munge(json)

  x.domain(data.map((d) => d.name)).rangeRoundBands([0, width], 0.1)
  y.domain([0, d3.max(data, (d) => d.attended)]).range([height, 0])

  var svg = d3.select('#basic-attendance').append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
  .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)

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
      .text('Attendance')

  var bar = svg.selectAll('.bar')
      .data(data)

  bar.enter().append('rect')
      .attr('class', 'bar')
      .attr('x', (d) => x(d.name))
      .attr('width', x.rangeBand())
      .attr('y', height)
      .attr('height', 0)
      .attr('fill', '#4682b4')
    .transition()
      .duration(300)
      .attr('y', (d) => y(d.attended))
      .attr('height', (d) => height - y(d.attended))
});

function munge(json) {
  json.forEach((d) => { d.attended = d.rsvps.length })
  json.forEach((d, i) => { d.x = i })

  return json
}
