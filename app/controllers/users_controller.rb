class UsersController < ApplicationController

	def edit
		@user = current_user
	end

	def update
		@user = User.find(params[:id])
		@user.update(user_params)
		flash[:notice] = "user update sucessfully"
		redirect_to  root_path(@user)
	end
	private
		def  user_params
			params.require(:user).permit(:first_name, :last_name, :bio, :facebook_url,:twitter_url, :website_url, :image)
		end
end