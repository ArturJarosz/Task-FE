echo "Setting port and backend url."
echo BASE_URL=$BASE_URL
echo AUTH0_DOMAIN=$AUTH0_DOMAIN
echo AUTH0_CLIENT_ID=$AUTH0_FE_CLIENT_ID
echo AUTH0_AUDIENCE=$AUTH0_AUDIENCE

# The environment file can end up in a shared chunk instead of main-*.js, so every script is searched
sed -i "s~BASE_URL~$BASE_URL~g" /usr/share/nginx/html/*.js
sed -i "s~AUTH0_AUDIENCE~$AUTH0_AUDIENCE~g" /usr/share/nginx/html/*.js
sed -i "s~AUTH0_DOMAIN~$AUTH0_DOMAIN~g" /usr/share/nginx/html/*.js
sed -i "s~AUTH0_CLIENT_ID~$AUTH0_FE_CLIENT_ID~g" /usr/share/nginx/html/*.js

nginx -g 'daemon off;'

