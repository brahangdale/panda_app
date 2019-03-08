class ChangeDatatypeToDescriptionInPosts < ActiveRecord::Migration
  def change
  	change_column :posts, :description, :text

  end
end
