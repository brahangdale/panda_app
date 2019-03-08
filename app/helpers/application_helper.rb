module ApplicationHelper
	def resource_name
		:user
	end
	def resource
		@resource ||= current_user
	end
	def device_mapping
		@devise_mapping ||= Devise.mapping[:user]
	end
end
