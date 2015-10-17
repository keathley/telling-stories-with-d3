defmodule Stories.PageController do
  use Stories.Web, :controller

  def index(conn, _params) do
    render conn, "index.html"
  end
end
