require('dotenv').config();

const mqtt = require('mqtt');
const jwt = require('jsonwebtoken');
const fs = require('fs');

const privateKeyFile = './rsa_private.pem';
const mqttTopic = `/devices/${process.env.DEVICE_ID}/events`;

const publish = (payload) => {
  console.log('Publishing message: ', payload);

  client.publish(mqttTopic, payload, { qos: 1 }, (err) => {
    if (err) {
      console.log('Publish failed: ', err);
    }
  });
};

const generateJwt = () => {
  const token = {
    iat: parseInt(Date.now() / 1000),
    exp: parseInt(Date.now() / 1000) + 20 * 60, // 20 minutes
    aud: process.env.PROJECT_ID,
  };
  const privateKey = fs.readFileSync(privateKeyFile);

  return jwt.sign(token, privateKey, {
    algorithm: 'RS256'
  });
};

const connectionArgs = {
  host: 'mqtt.googleapis.com',
  port: 8883,
  clientId: `projects/${process.env.PROJECT_ID}/locations/${process.env.REGION}/registries/${process.env.REGISTRY_ID}/devices/${process.env.DEVICE_ID}`,
  username: 'unused',
  password: generateJwt(),
  protocol: 'mqtts',
  secureProtocol: 'TLSv1_2_method'
};

const client = mqtt.connect(connectionArgs);

client.subscribe(`/devices/${process.env.DEVICE_ID}/config`, { qos: 1 });

client.subscribe(`/devices/${process.env.DEVICE_ID}/commands/#`);

client.on('connect', success => {
  console.log('Connect');

  if (!success) {
    console.log('Client not connected...');
  }

  const message = 'This is my message!';
  publish(message);
});

client.on('close', () => {
  console.log('Close');
});

client.on('error', err => {
  console.log('Error: ', err);
});

client.on('message', (topic, message) => {
  console.log('Message received: ', Buffer.from(message, 'base64').toString('ascii'));
});
