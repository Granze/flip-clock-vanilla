const path = require('path');

module.exports = {
  entry: path.join(__dirname, 'src', 'flip-clock.js'),
  output: {
    filename: 'bundle.js'
  }
};
