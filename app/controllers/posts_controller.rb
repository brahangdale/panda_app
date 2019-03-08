class PostsController < ApplicationController
	before_action :authenticate_user!
	layout 'posts'

	def index
	end
	def new
		@post = Post.new
	end
	def create
		@post = Post.new(post_params)
		@post.user_id = current_user.id
		if @post.save
			flash[:notice] = "create sucessfully"
			redirect_to  post_path(@post)
		else
			render 'new'
		end
	end
	def show
		@post = Post.find(params[:id])
		@comments =  @post.comments
		@comment = @post.comments.build
	end
	def edit
		@post = Post.find(params[:id])
	end
	def update
		@post = Post.find(params[:id])
		if  @post.update(post_params)
			flash[:notice] = "update sucessfully"
		 redirect_to  post_path
		else
			render 'edit'
	end
end


def create_comment
	@comment = Comment.new(comment_params)
	@comment.user_id = current_user.id
	@comment.save
	post = @comment.post
	user = post.user
	user2 = @comment.user
	UserMailer.comment_mail(user,user2).deliver_later
	redirect_to post_path(post)
end

def destroy
	@post = Post.find[params[:id]]
	@params.destroy
	flash[:notice] = "Delete successfully"
	redirect_to  post_path
end
	private
	def post_params
		params.require(:post).permit(:title,:description,:user_id, :image, :category_id)
	end
	def comment_params
		params.require(:comment).permit(:post_id, :comment)
	end
end