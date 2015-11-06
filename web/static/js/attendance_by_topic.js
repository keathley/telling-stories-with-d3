import d3 from 'd3'
import d3Tip from 'd3-tip'

var margin = {top: 200, right: 20, bottom: 30, left: 40}
  , width  = 1240 - margin.left - margin.right
  , height = 600 - margin.top - margin.bottom
  , x      = d3.scale.ordinal()
  , y      = d3.scale.linear()
  , color  = d3.scale.category10()
  // , color  = d3.scale.category20()
  // , color  = d3.scale.category20c()
  , xAxis  = d3.svg.axis().scale(x).orient('bottom').ticks(0)
  , yAxis  = d3.svg.axis().scale(y).orient('left')

var tip = d3Tip()
  .attr('class', 'd3-tip')
  .offset([-10, 0])
  .html((d) => {
    return `
    <strong>${d.name}</strong><br />
    <span style='color: red;'>${d.topic}</span><br>
    <span>${d.attended}</span>
    `
  })

d3.json('/json/events.json', (error, json) => {
  var data = munge(json)

  x.domain(data.map((d) => d.name)).rangeRoundBands([0, width], 0.1)
  y.domain([0, d3.max(data, (d) => d.attended)]).range([height, 0])

  var svg = d3.select('#attendance-by-topic').append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
  .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)

  svg.call(tip)

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
      .attr('fill', (d) => color(d.topic))
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide)
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

const TOPIC_COLORS = {
  niche: '#585858'
, backend: '#ab4642'
, frontend: '#a1b56c'
, devops: '#a16946'
, discussion: '#dc9656'
, technology: '#ba8baf'
, theory: '#7cafc2'
, lightning: '#fbec26'
, technique: '#c028f5'
, datascience: 'rgb(45, 46, 191)'
}

function color(t) {
  console.log(t);
  return TOPIC_COLORS[t]
}
