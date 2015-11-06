defmodule Mix.Tasks.Stories.Meetup.Fetch do
  use Mix.Task

  @shortdoc "Fetches data from meetup"

  @base_url "https://api.meetup.com/"
  @api_key System.get_env("MEETUP_API_KEY")

  def run(_) do
  end
end
