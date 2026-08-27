const baseURL = 'http://localhost:5000/api';

async function api(path, { method = 'GET', body = null, headers = {} } = {}) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...headers
        }
    };
    if (body) {
        options.body = JSON.stringify(body);
    }
    const res = await fetch(`${baseURL}${path}`, options);
    let data = null;
    try {
        data = await res.json();
    } catch (e) {
        // response might not be JSON
    }
    return {
        status: res.status,
        data
    };
}

async function runTests() {
    console.log('--- STARTING AUTHENTICATION & SESSION ISOLATION TESTS ---');

    // 1. Initial cleanup: Login admin, find user Shruti if exists, delete her so we start fresh
    console.log('Logging in as Admin...');
    const adminLoginRes = await api('/auth/login', {
        method: 'POST',
        body: {
            email: 'admin@gmail.com',
            password: 'admin@123'
        }
    });

    if (adminLoginRes.status !== 200 || !adminLoginRes.data.success) {
        console.error('Failed to login as Admin:', adminLoginRes.data);
        process.exit(1);
    }

    const adminToken = adminLoginRes.data.token;
    const adminHeaders = { Authorization: `Bearer ${adminToken}` };
    const adminId = adminLoginRes.data.user._id;
    console.log(`Admin login successful. ID: ${adminId}`);

    // Fetch users list to see if 'shruti@gmail.com' exists
    console.log('Fetching users directory...');
    const usersRes = await api('/admin/users', { headers: adminHeaders });
    if (usersRes.status === 200 && usersRes.data.success) {
        const shruti = usersRes.data.users.find(u => u.email === 'shruti@gmail.com');
        if (shruti) {
            console.log(`Found existing user Shruti. Deleting before fresh test...`);
            const delRes = await api(`/admin/users/${shruti._id}`, { method: 'DELETE', headers: adminHeaders });
            console.log(`Deletion response status: ${delRes.status}`);
        }
    }

    // 2. Register Shruti
    console.log('\nRegistering Shruti...');
    const regRes = await api('/auth/register', {
        method: 'POST',
        body: {
            name: 'Shruti',
            email: 'shruti@gmail.com',
            password: 'password@123',
            role: 'user'
        }
    });

    if (regRes.status !== 201) {
        console.error('Failed to register Shruti:', regRes.data);
        process.exit(1);
    }
    const shrutiId = regRes.data.user._id;
    console.log(`Registration successful. ID: ${shrutiId}`);

    // 3. Login Shruti
    console.log('\nLogging in as Shruti...');
    const shrutiLoginRes = await api('/auth/login', {
        method: 'POST',
        body: {
            email: 'shruti@gmail.com',
            password: 'password@123'
        }
    });

    if (shrutiLoginRes.status !== 200) {
        console.error('Failed to login Shruti:', shrutiLoginRes.data);
        process.exit(1);
    }
    const shrutiToken = shrutiLoginRes.data.token;
    const shrutiHeaders = { Authorization: `Bearer ${shrutiToken}` };
    console.log('Shruti login successful.');

    // 4. Test Route Guard & API Protection
    console.log('\nTesting Route Access: Shruti accessing /api/auth/me...');
    const meRes = await api('/auth/me', { headers: shrutiHeaders });
    console.log(`Status: ${meRes.status}. Success: ${meRes.data?.success}. User: ${meRes.data?.user?.name}`);
    if (meRes.status !== 200 || meRes.data?.user?.role !== 'user') {
        console.error('FAILED /api/auth/me validation for user');
        process.exit(1);
    }

    console.log('\nTesting Route Access: Shruti accessing Admin-only endpoint...');
    const adminAccessRes = await api('/admin/stats', { headers: shrutiHeaders });
    console.log(`Status: ${adminAccessRes.status}. Message: ${adminAccessRes.data?.message}`);
    if (adminAccessRes.status !== 403) {
        console.error('FAILED: User should have been blocked from admin route with 403.');
        process.exit(1);
    }

    // 5. Admin blocks Shruti
    console.log('\nAdmin blocking Shruti...');
    const blockRes = await api(`/admin/users/${shrutiId}/toggle-block`, { method: 'PATCH', headers: adminHeaders });
    console.log(`Status: ${blockRes.status}. Message: ${blockRes.data?.message}`);
    if (blockRes.status !== 200 || !blockRes.data?.user?.isBlocked) {
        console.error('FAILED: User blocking toggling failed');
        process.exit(1);
    }

    // 6. Blocked user accesses me / refreshes / makes requests
    console.log('\nTesting Blocked User: Shruti refreshing/accessing /api/auth/me...');
    const meBlockedRes = await api('/auth/me', { headers: shrutiHeaders });
    console.log(`Status: ${meBlockedRes.status}. Message: ${meBlockedRes.data?.message}`);
    if (meBlockedRes.status !== 403) {
        console.error('FAILED: Blocked user was not rejected with 403 during getMe / session refresh');
        process.exit(1);
    }

    // 7. Blocked user attempts login
    console.log('\nTesting Blocked User Login...');
    const shrutiBlockedLoginRes = await api('/auth/login', {
        method: 'POST',
        body: {
            email: 'shruti@gmail.com',
            password: 'password@123'
        }
    });
    console.log(`Status: ${shrutiBlockedLoginRes.status}. Message: ${shrutiBlockedLoginRes.data?.message}`);
    if (shrutiBlockedLoginRes.status !== 403) {
        console.error('FAILED: Blocked user login was not rejected with 403');
        process.exit(1);
    }

    // 8. Admin attempts to block themselves
    console.log('\nTesting Admin blocking self...');
    const selfBlockRes = await api(`/admin/users/${adminId}/toggle-block`, { method: 'PATCH', headers: adminHeaders });
    console.log(`Status: ${selfBlockRes.status}. Message: ${selfBlockRes.data?.message}`);
    if (selfBlockRes.status !== 403) {
        console.error('FAILED: Admin was allowed to block their own account');
        process.exit(1);
    }

    // 9. Inspect Activity Log for BLOCK USER log
    console.log('\nFetching System Activity Logs to verify audit...');
    const logsRes = await api('/admin/logs', { headers: adminHeaders });
    if (logsRes.status === 200) {
        const blockLog = logsRes.data.logs.find(log => log.action === 'BLOCK USER');
        if (blockLog) {
            console.log('SUCCESS: BLOCK USER Activity Log recorded successfully.');
            console.log('Log details:', blockLog.details);
            console.log('Log meta:', blockLog.meta);
        } else {
            console.error('FAILED: No BLOCK USER log was output in activity logs');
            process.exit(1);
        }
    }

    // 10. Admin unblocks Shruti
    console.log('\nAdmin unblocking Shruti...');
    const unblockRes = await api(`/admin/users/${shrutiId}/toggle-block`, { method: 'PATCH', headers: adminHeaders });
    console.log(`Status: ${unblockRes.status}. Message: ${unblockRes.data?.message}`);
    if (unblockRes.status !== 200 || unblockRes.data?.user?.isBlocked) {
        console.error('FAILED: User unblocking failed');
        process.exit(1);
    }

    // 11. Shruti login and profile checks after unblock
    console.log('\nTesting Shruti Login after Unblock...');
    const shrutiUnblockedLoginRes = await api('/auth/login', {
        method: 'POST',
        body: {
            email: 'shruti@gmail.com',
            password: 'password@123'
        }
    });
    if (shrutiUnblockedLoginRes.status !== 200) {
        console.error('FAILED: Shruti could not login after being unblocked.');
        process.exit(1);
    }
    console.log('SUCCESS: Shruti logged in successfully after unblock.');

    console.log('\n--- ALL AUTHENTICATION AND ROLE SEPARATION TESTS PASSED SUCCESSFULLY! ---');
}

runTests();
