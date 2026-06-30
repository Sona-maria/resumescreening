const { parseResume, matchResume } = require('./services/nlpClient');
const path = require('path');

async function test() {
    try {
        const res = await parseResume('../nlp/test.pdf');
        console.log("PARSE SUCCESS:", res);
        
        const match = await matchResume("Looking for a python dev", ["python"], res.text, res.skills);
        console.log("MATCH SUCCESS:", match);
    } catch(e) {
        console.error("FULL ERROR:", e);
    }
}
test();
