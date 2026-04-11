FROM python:3.12-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

COPY requirements.txt ./

RUN pip install --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

COPY . .

ENV FLASK_APP=run:app


FROM base AS dev

ENV DEBUG=TRUE \
    HOST=0.0.0.0 \
    PORT=5000

EXPOSE 5000

CMD ["sh", "-c", "flask create-tables && python run.py"]


FROM base AS prod

ENV DEBUG=FALSE \
    HOST=0.0.0.0 \
    PORT=5000

EXPOSE 5000

CMD ["sh", "-c", "flask create-tables && gunicorn -w 4 -b 0.0.0.0:5000 --access-logfile - --error-logfile - --log-level info run:app"]
