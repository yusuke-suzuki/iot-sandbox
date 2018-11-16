# iot-sandbox
IoT のお勉強

# Set up Edge device
```
cd iot-sandbox
openssl req -x509 -newkey rsa:2048 -keyout rsa_private.pem -nodes -out rsa_cert.pem -subj "/CN=unused"
vim .env
node index.js
```
