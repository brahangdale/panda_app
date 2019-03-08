class AddFirstNameToUsers < ActiveRecord::Migration
  def change
  	add_column :users, :first_name,  :string
  	add_column :users,  :lastt_name, :string
  end
end
