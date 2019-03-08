class RemoveLasttNameFromUsers < ActiveRecord::Migration
  def change
    remove_column :users, :lastt_name, :string
  end
end
