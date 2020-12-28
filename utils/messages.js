const moment = require('moment');

function formatMessage(username, text, color) {
    return {
        username,
        text,
        time: moment().format('h:mm a'),
        color
    }
}

module.exports = formatMessage;