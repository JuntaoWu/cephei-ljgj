const workboxBuild = require('workbox-build');
const workboxConfig = require('./workbox-config.js');
workboxBuild.generateSW(workboxConfig);