Resque::Server.use(Rack::Auth::Basic) do |user, password|
  password == "rbghele@123" && user == 'abc'
end