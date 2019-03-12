class Archive
	@queue = :post_queue
	def self.perform(user1_id, user2_id)
		# post = Post.find(user,user2)
		user1 = User.find(user1_id)
		user2 = User.find(user2_id)

		UserMailer.comment_mail(user1, user2).deliver_later
	end
end