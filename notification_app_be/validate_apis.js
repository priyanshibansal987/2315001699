const http = require('http');

const request = (method, path, body = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5007,
      path,
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            body: JSON.parse(data)
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            body: data
          });
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

async function run() {
  console.log('=== Starting API Endpoint Validation ===\n');

  try {
    // 1. GET /api/notifications
    const getRes = await request('GET', '/api/notifications?limit=2');
    console.log('1. GET /api/notifications (pagination limit=2):');
    console.log(`   Status: ${getRes.statusCode}`);
    console.log(`   Items returned: ${getRes.body.data.notifications.length}`);
    if (getRes.statusCode === 200 && getRes.body.success) {
      console.log('   ✅ PASS');
    } else {
      console.log('   ❌ FAIL');
    }
    console.log();

    // 2. POST /api/notifications
    const newNotif = {
      type: 'Placement',
      message: 'Uber interview prep session at 4PM'
    };
    const postRes = await request('POST', '/api/notifications', newNotif);
    console.log('2. POST /api/notifications (create notification):');
    console.log(`   Status: ${postRes.statusCode}`);
    console.log(`   Created ID: ${postRes.body.data?.ID}`);
    const createdID = postRes.body.data?.ID;
    if (postRes.statusCode === 201 && createdID) {
      console.log('   ✅ PASS');
    } else {
      console.log('   ❌ FAIL');
    }
    console.log();

    // 3. GET /api/notifications/priority
    const priRes = await request('GET', '/api/notifications/priority?limit=3');
    console.log('3. GET /api/notifications/priority (limit=3):');
    console.log(`   Status: ${priRes.statusCode}`);
    console.log(`   Items returned: ${priRes.body.data.notifications.length}`);
    console.log(`   Top item type: ${priRes.body.data.notifications[0]?.Type}`);
    if (priRes.statusCode === 200 && priRes.body.data.notifications.length > 0) {
      console.log('   ✅ PASS');
    } else {
      console.log('   ❌ FAIL');
    }
    console.log();

    // 4. PUT /api/notifications/:id/read
    if (createdID) {
      const readRes = await request('PUT', `/api/notifications/${createdID}/read`);
      console.log(`4. PUT /api/notifications/${createdID}/read (mark read):`);
      console.log(`   Status: ${readRes.statusCode}`);
      console.log(`   isRead after update: ${readRes.body.data?.isRead}`);
      if (readRes.statusCode === 200 && readRes.body.data?.isRead === true) {
        console.log('   ✅ PASS');
      } else {
        console.log('   ❌ FAIL');
      }
      console.log();
    }

    // 5. DELETE /api/notifications/:id
    if (createdID) {
      const delRes = await request('DELETE', `/api/notifications/${createdID}`);
      console.log(`5. DELETE /api/notifications/${createdID} (delete):`);
      console.log(`   Status: ${delRes.statusCode}`);
      if (delRes.statusCode === 200 && delRes.body.success) {
        console.log('   ✅ PASS');
      } else {
        console.log('   ❌ FAIL');
      }
      console.log();
    }

    console.log('=== Validation Complete ===');
  } catch (err) {
    console.error('Validation failed with error:', err.message);
  }
}

run();
