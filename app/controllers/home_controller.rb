class HomeController < ApplicationController
	
	def index
		@posts = Post.all
	end

	def  art
		@category = Category.where(title: 'Art').last
		@posts = @category.posts
		render 'index'
	end

	def photography
		@category = Category.where(title: 'photography').last
		@posts = @category.posts
		render 'index'
	end
	def animals
		@category = Category.where(title: 'animals').last
		@posts = @category.posts
		render  'index'
	end

	def travel
		@category = Category.where(title: 'travels').last
		@posts = @category.posts
		render  'index'
	end

end 