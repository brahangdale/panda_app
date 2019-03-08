class RemoveStringFromCategory < ActiveRecord::Migration
  def change
    remove_column :categories, :string, :string
  end
end
