# base image
FROM python:3.9.6
# set web server root as working dir
WORKDIR /home/site/wwwroot
# install required packages
COPY requirements.txt .
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install sendgrid --isolated
# copy all files
COPY . .

# expose port 8000
EXPOSE 80

# start flask app using Gunicorn
CMD gunicorn -w 4 -b :80 --access-logfile - --error-logfile - --log-level info run:app
