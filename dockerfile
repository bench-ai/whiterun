FROM nginx:stable-alpine
COPY nginx /etc/nginx/conf.d
COPY /whiterun-ui/build /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]