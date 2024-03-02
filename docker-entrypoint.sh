#!/bin/sh
# docker-entrypoint.sh

# Define the full path to the Poetry executable
POETRY_EXECUTABLE="/opt/poetry/bin/poetry"

# Check the environment variable 'APP_MODE'
if [ "$APP_MODE" = "plot" ]; then
  # Run the plot mode
  $POETRY_EXECUTABLE run python app.py plot
else
  # Run the Flask app
  $POETRY_EXECUTABLE run python app.py run
fi
