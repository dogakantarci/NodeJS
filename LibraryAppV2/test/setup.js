const { config } = require('dotenv');
config();

async function setup() {
    const chai = await import('chai');
    global.expect = chai.expect;
}

setup();
