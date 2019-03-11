class AddBioTo < ActiveRecord::Migration
  def change
  	add_column :users, :bio, :text
  	add_column :users, :facebook_url, :string
  	add_column :users, :twitter_url, :string
  	add_column :users, :website_url, :string
  	add_column :users, :image, :string
  end
end
