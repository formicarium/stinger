cd /tmp/config-server-example

echo $APP_PATH

lein run-dev

echo "hello from script"
while [ 1 ]; do
  echo "alive";
  sleep 2;
done