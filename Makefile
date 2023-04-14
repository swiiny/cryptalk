# How to create a component with the CLI : make component name=SingleQuestPage
component:
	sh scripts/create_component.sh ${name}

# run tests before build
build:
	npm run lint
	npm run build