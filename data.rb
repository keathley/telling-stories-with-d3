#!/usr/bin/env ruby

require 'net/http'
require 'json'

BASE_URL = "https://api.meetup.com/"
API_KEY  = ENV.fetch('MEETUP_API_KEY')

class Meetup
  def self.events(group_name: 'chadevs', status: 'past')
    @events ||= get_json_data(
      '2/events',
      group_urlname: group_name,
      status: status,
      page: 100
    )
  end

  def self.rsvps(event_id:)
    get_json_data('2/rsvps', event_id: event_id, page: 70)
  end

  def self.members(group_name: 'chadevs')
    @members ||= get_json_data(
      '2/members',
      group_urlname: group_name,
      order: 'joined',
      page: 100
    )
  end

  def self.get_json_data(resource, params)
    uri = initial_uri(resource, params)
    json = fetch_data(uri)
    results = json[:results]
    total = json[:meta][:total_count]

    print_stats(results.length, total)

    until results.length >= total
      uri = URI(json[:meta][:next])
      json = fetch_data(uri)
      results += json[:results]
      print_stats(results.length, total)
    end

    results
  end

  def self.initial_uri(resource, params)
    uri = URI("#{BASE_URL}/#{resource}")
    uri.query = URI.encode_www_form(params.merge({ key: API_KEY }))
    uri
  end

  def self.fetch_data(uri)
    sleep 5
    res = Net::HTTP.get_response(uri)
    json = JSON.parse(res.body, symbolize_names: true)
    code    = json[:code]

    # This exit here is because if we got throttled we REALLY don't want to
    # keep trying.  Sorry for smashing your api that time meetup
    abort('¯\_(ツ)_/¯ We just got throttled!') if code == 'throttled'
    abort('(╯°□°）╯︵ ┻━┻) Request is bad') if code == 'bad_request'

    json
  end

  def self.print_stats(downloaded, total)
    puts "Downloaded #{downloaded} of the total #{total}"
  end
end

class Event
  attr_reader :id, :name, :time, :timezone, :description, :venue_id, :venue_name,
              :announced_at
  attr_accessor :rsvps

  def initialize(json)
    @event_json   = json
    @id           = @event_json.fetch(:id)
    @name         = @event_json.fetch(:name)
    @time         = @event_json.fetch(:time)
    @announced_at = @event_json.fetch(:announced_at) { 'Not Available' }
    @description  = @event_json.fetch(:description) { '' }
    @venue        = json.fetch(:venue, {})
    @venue_id     = @venue[:id]
    @venue_name   = @venue[:name]
    @rsvps        = []
  end

  def to_h
    {
      id: @id,
      name: @name,
      time: @time,
      timezone: @timezone,
      description: @description,
      venue_id: @venue_id,
      venue_name: @venue_name,
      announced_at: announced_at,
      rsvps: rsvps.map(&:to_h),
    }
  end
end

class RSVP
  attr_reader :id, :response, :name, :member_id, :highres_photo, :thumb_photo,
              :photo_link, :json, :created_at

  def initialize(json)
    @json          = json
    @member        = json.fetch(:member, { name: 'Not Available', id: -1 })
    @photo         = json.fetch(:member_photo, {
      highres_link: "Not Available",
      thumb_link: "Not Available",
      photo_link: "Not Available",
    })
    @id            = @json.fetch(:rsvp_id)
    @response      = @json.fetch(:response)
    @created_at       = @json.fetch(:created)
    @name          = @member.fetch(:name)
    @member_id     = @member.fetch(:member_id)
    @highres_photo = @photo.fetch(:highres_link, '')
    @thumb_photo   = @photo.fetch(:thumb_link, '')
    @photo_link    = @photo.fetch(:photo_link, '')
  end

  def to_h
    {
      id: id,
      response: response,
      created_at: created_at,
      name: name,
      member_id: member_id,
      highres_photo: highres_photo,
      thumb_photo: thumb_photo,
      photo_link: photo_link,
    }
  end
end

class Member
  attr_reader :json, :member_id, :joined_at, :link, :name, :visited, :topics

  def initialize(json)
    @json      = json
    @topics    = json.fetch(:topics, []).map { |topic| Topic.new(topic) }
    @member_id = json.fetch(:id)
    @joined_at = json.fetch(:joined)
    @link      = json.fetch(:link)
    @name      = json.fetch(:name)
    @visited   = json.fetch(:visited)
  end

  def to_h
    {
      member_id: member_id,
      joined_at: joined_at,
      link: link,
      name: name,
      visited: visited,
      topics: topics.map(&:to_h),
    }
  end

  def to_json
    to_h.to_json
  end
end

class Topic
  attr_reader :json, :id, :name, :urlkey

  def initialize(json)
    @json   = json
    @id     = json.fetch(:id)
    @name   = json.fetch(:name)
    @urlkey = json.fetch(:urlkey)
  end

  def to_h
    { id: id, name: name, urlkey: urlkey, }
  end

  def to_json
    to_h.to_json
  end
end

def self.write_events_file
  events = Meetup.events.map { |json| Event.new(json) }.map { |event|
    puts "Getting RSVPs for #{event.name}"
    event.rsvps = Meetup.rsvps(event_id: event.id).map { |json| RSVP.new(json) }
    event
  }
  hashes = events.map(&:to_h)
  write_file('events', hashes)
end

def self.write_members_file
  puts "Getting Members"
  members = Meetup.members.map { |json| Member.new(json) }
  hashes = members.map(&:to_h)
  write_file('members', hashes)
end

def self.write_file(filename, hashes)
  puts "Writing #{hashes.length} #{filename} to file"
  File.open("#{filename}.json", "w") do |file|
    file.write hashes.to_json
  end
end

def main
  trap("SIGINT") { exit! }

  if ARGV.length < 1
    puts "add an argument for `members` or `events`"
  end

  ARGV.each do |arg|
    write_members_file if arg == 'members'
    write_events_file if arg == 'events'
  end
end

if __FILE__ == $0
  main
end
