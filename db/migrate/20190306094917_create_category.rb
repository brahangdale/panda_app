class CreateCategory < ActiveRecord::Migration
  def change
    create_table :categories do |t|
    	t.string :title,  :string
    end
  end
end
