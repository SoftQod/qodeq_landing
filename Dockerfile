FROM nginx:1.27-alpine

COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY landing /usr/share/nginx/landing
COPY demo /usr/share/nginx/demo
COPY demo_voice /usr/share/nginx/demo_voice
COPY redoc /usr/share/nginx/redoc
