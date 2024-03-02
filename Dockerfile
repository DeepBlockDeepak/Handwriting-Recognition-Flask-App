# Use the official lightweight Python image.
# https://hub.docker.com/_/python
FROM python:3.11.5-slim-bookworm

# Set environment variables to:
# - Prevent Python from writing pyc files to disc (equivalent to python -B option)
# - Prevent Python from buffering stdout and stderr (equivalent to python -u option)
# - Set Poetry environment variables for non-interactive installation and virtualenvs creation
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    POETRY_VERSION=1.7.1 \
    POETRY_NO_INTERACTION=1 \
    POETRY_VIRTUALENVS_CREATE=false \
    POETRY_HOME="/opt/poetry" \
    POETRY_CACHE_DIR='/var/cache/pypoetry' \
    PATH="$POETRY_HOME/bin:$PATH"

# Install system dependencies, including curl
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Install Poetry - respects $POETRY_VERSION & $POETRY_HOME
RUN curl -sSL https://install.python-poetry.org | python3 - \
    && ls -la /opt/poetry/bin

# Copy only requirements to cache them in docker layer
WORKDIR /code
# Copy the project files into the working directory
COPY . /code/

# Install project dependencies
RUN /opt/poetry/bin/poetry install --no-dev --no-interaction --no-ansi

# Copy the entrypoint script into the container
COPY ./docker-entrypoint.sh /docker-entrypoint.sh

# Give execution rights on the entrypoint script
RUN chmod +x /docker-entrypoint.sh

# Set the entrypoint script to be executed
ENTRYPOINT ["/docker-entrypoint.sh"]
