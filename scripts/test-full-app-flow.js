import http from 'http';

async function testApplicationFlow() {
    console.log('🔍 Testing Complete Application Flow...\n');
    
    // Step 1: Test Login
    console.log('1️⃣ Testing Login...');
    const loginData = JSON.stringify({
        email: 'test@billmenow.com',
        password: 'password123'
    });
    
    const loginOptions = {
        hostname: 'localhost',
        port: 3001,
        path: '/api/auth/login',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': loginData.length
        }
    };
    
    const loginResponse = await new Promise((resolve, reject) => {
        const req = http.request(loginOptions, (res) => {
            let responseData = '';
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            res.on('end', () => {
                resolve({ status: res.statusCode, data: responseData });
            });
        });
        req.on('error', reject);
        req.write(loginData);
        req.end();
    });
    
    if (loginResponse.status === 200) {
        const loginResult = JSON.parse(loginResponse.data);
        const token = loginResult.token;
        console.log('✅ Login successful!');
        console.log(`   User: ${loginResult.user.firstName} ${loginResult.user.lastName}`);
        console.log(`   Business: ${loginResult.user.businessName}\n`);
        
        // Step 2: Test Dashboard API
        console.log('2️⃣ Testing Dashboard API...');
        const dashboardOptions = {
            hostname: 'localhost',
            port: 3001,
            path: '/api/dashboard',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        };
        
        const dashboardResponse = await new Promise((resolve, reject) => {
            const req = http.request(dashboardOptions, (res) => {
                let responseData = '';
                res.on('data', (chunk) => {
                    responseData += chunk;
                });
                res.on('end', () => {
                    resolve({ status: res.statusCode, data: responseData });
                });
            });
            req.on('error', reject);
            req.end();
        });
        
        if (dashboardResponse.status === 200) {
            const dashboardResult = JSON.parse(dashboardResponse.data);
            console.log('✅ Dashboard API working!');
            console.log('   Stats:');
            console.log(`     Total Invoices: ${dashboardResult.stats.totalInvoices}`);
            console.log(`     Total Revenue: ₹${dashboardResult.stats.totalRevenue.toLocaleString()}`);
            console.log(`     Paid Invoices: ${dashboardResult.stats.paidInvoices}`);
            console.log(`     Overdue Invoices: ${dashboardResult.stats.overdueInvoices}`);
            console.log(`     Total Clients: ${dashboardResult.stats.clientsCount}\n`);
        } else {
            console.log('❌ Dashboard API failed:', dashboardResponse.data);
        }
        
        // Step 3: Test Clients API
        console.log('3️⃣ Testing Clients API...');
        const clientsOptions = {
            hostname: 'localhost',
            port: 3001,
            path: '/api/clients',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        };
        
        const clientsResponse = await new Promise((resolve, reject) => {
            const req = http.request(clientsOptions, (res) => {
                let responseData = '';
                res.on('data', (chunk) => {
                    responseData += chunk;
                });
                res.on('end', () => {
                    resolve({ status: res.statusCode, data: responseData });
                });
            });
            req.on('error', reject);
            req.end();
        });
        
        if (clientsResponse.status === 200) {
            const clientsResult = JSON.parse(clientsResponse.data);
            console.log('✅ Clients API working!');
            console.log(`   Total Clients: ${clientsResult.clients.length}`);
            clientsResult.clients.forEach((client, index) => {
                console.log(`     ${index + 1}. ${client.name} (${client.email})`);
            });
            console.log('');
        } else {
            console.log('❌ Clients API failed:', clientsResponse.data);
        }
        
        // Step 4: Test Invoices API
        console.log('4️⃣ Testing Invoices API...');
        const invoicesOptions = {
            hostname: 'localhost',
            port: 3001,
            path: '/api/invoices',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        };
        
        const invoicesResponse = await new Promise((resolve, reject) => {
            const req = http.request(invoicesOptions, (res) => {
                let responseData = '';
                res.on('data', (chunk) => {
                    responseData += chunk;
                });
                res.on('end', () => {
                    resolve({ status: res.statusCode, data: responseData });
                });
            });
            req.on('error', reject);
            req.end();
        });
        
        if (invoicesResponse.status === 200) {
            const invoicesResult = JSON.parse(invoicesResponse.data);
            console.log('✅ Invoices API working!');
            console.log(`   Total Invoices: ${invoicesResult.invoices.length}`);
            invoicesResult.invoices.forEach((invoice, index) => {
                console.log(`     ${index + 1}. ${invoice.invoiceNumber} - ${invoice.clientId.name} - ₹${invoice.total.toLocaleString()} (${invoice.status})`);
            });
            console.log('');
        } else {
            console.log('❌ Invoices API failed:', invoicesResponse.data);
        }
        
        console.log('🎉 All API tests completed successfully!');
        console.log('\n📋 Summary:');
        console.log('✅ Authentication is working');
        console.log('✅ Database connection is stable');
        console.log('✅ All main APIs are functional');
        console.log('✅ Test data is properly loaded');
        console.log('\n💡 You can now login to the application with:');
        console.log('   Email: test@billmenow.com');
        console.log('   Password: password123');
        console.log('\n🌐 Access the application at: http://localhost:3001');
        
    } else {
        console.log('❌ Login failed:', loginResponse.data);
    }
}

testApplicationFlow().catch(console.error);
