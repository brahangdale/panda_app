class Post < ActiveRecord::Base
	 mount_uploader :image, MediaFileUploader
	 has_many :comments
	 belongs_to :user
	 belongs_to :category
end 