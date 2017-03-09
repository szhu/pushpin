extension.zip: extension
	zip -r $@ $< -x "*.DS_Store"
