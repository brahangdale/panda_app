class UserMailer < ApplicationMailer
	default from: "pandaapp@gmail.com"

	def test_mail
		mail(to: 'xyz@gmail.com', subject: 'Welcome to My Awesome Site')
	end

	def comment_mail(user,user2)

		@user2 = user2
		@user = user	
		mail(to: user.email, subject: 'email send by me')
	end

	def new_mail(abc)
	end
end