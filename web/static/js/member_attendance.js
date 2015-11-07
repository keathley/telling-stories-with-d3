import d3 from 'd3'

var margin = {top: 20, right: 20, left: 40, bottom: 30}
  , width  = 800 - margin.right - margin.left
  , height = 400 - margin.top - margin.bottom
  , x      = d3.scale.ordinal()
  , y      = d3.scale.linear()
  , topic  = d3.scale.linear()
  , color  = d3.scale.category10()
  , xAxis  = d3.svg.axis().scale(x).orient('bottom').ticks(0)
  , yAxis  = d3.svg.axis().scale(y).orient('left')

d3.json('/json/members.json', (error, json) => {
  var data = _munge(json)

  window.members = json

  d3.json('/json/topics.json', (error, _json) => {
    window.topics = _json
  })

  x.domain(data.map((d) => d.name)).rangeRoundBands([0, width], 0.1)
  y.domain([0, d3.max(data, (d) => d.total)]).range([height, 0])
  topic.domain([0, d3.max(TOPICS, (d) => d.total)]).range([20, 50])

  var svg = d3.select('#members-attendance').append('svg')
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
      .text('Attendance by topic')

  var member = svg.selectAll('.member')
      .data(data)
    .enter().append('g')
      .attr('class', 'g')
      .attr('transform', (d) => `translate(${x(d.name)}, 0)`)

  member.selectAll('rect')
      .data((d) => d.topics)
    .enter().append('rect')
      .attr('width', x.rangeBand())
      .attr('y', (d) => y(d.y1))
      .attr('height', (d) => y(d.y0) - y(d.y1))
      .style('fill', (d) => color(d.name))

  var legend = svg.selectAll('.leged')
      .data(TOPICS)
    .enter().append('g')
      .attr('class', 'legend')
      .attr('transform', (d, i) => `translate(0, ${i*10})`)

  legend.append('rect')
    .attr('x', 20)
    .attr('width', (d) => topic(d.total))
    .attr('height', 9)
    .style('fill', (d) => color(d.name))

  legend.append('text')
    .attr('x', (d) => topic(d.total) + 24)
    .attr('text-anchor', 'start')
    .attr('dy', 8)
    .text((d) => d.name)
})

function _munge(json) {
  var members = json.filter((d) => d.total >= 4).sort((a, b) => a.total - b.total)

  return members
}

const TOPICS = [
  {
    "name": "frontend",
    "total": 17
  },
  {
    "name": "technique",
    "total": 16
  },
  {
    "name": "technology",
    "total": 14
  },
  {
    "name": "discussion",
    "total": 14
  },
  {
    "name": "backend",
    "total": 11
  },
  {
    "name": "devops",
    "total": 7
  },
  {
    "name": "theory",
    "total": 6
  },
  {
    "name": "lightning",
    "total": 3
  },
  {
    "name": "datascience",
    "total": 2
  },
  {
    "name": "security",
    "total": 1
  }
]
