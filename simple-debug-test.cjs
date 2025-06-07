// Simple test to reproduce "Something went wrong" error
const https = require('https');
const http = require('http');

async function testClientCreation() {
    console.log('🔍 Testing Client Creation API...');
    
    // First, test authentication
    const authData = JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
    });
    
    const authOptions = {
        hostname: 'localhost',
        port: 3001,
        path: '/api/auth/login',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(authData)
        }
    };
    
    console.log('1. Testing authentication...');
    
    const authPromise = new Promise((resolve, reject) => {
        const req = http.request(authOptions, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    console.log(`   Auth response: ${res.statusCode}`, result.success ? '✅' : '❌');
                    if (result.success) {
                        resolve(result.token);
                    } else {
                        reject(new Error('Auth failed: ' + result.error));
                    }
                } catch (e) {
                    reject(new Error('Auth parse error: ' + e.message));
                }
            });
        });
        
        req.on('error', (e) => reject(e));
        req.write(authData);
        req.end();
    });
    
    try {
        const token = await authPromise;
        console.log(`   Token: ${token.substring(0, 20)}...`);
        
        // Now test client creation
        console.log('\n2. Testing client creation...');
        
        const clientData = JSON.stringify({
            name: 'Test Client Debug',
            email: 'testdebug@example.com',
            phone: '+91 9876543210',
            company: 'Debug Company',
            address: '123 Debug Street'
        });
        
        const clientOptions = {
            hostname: 'localhost',
            port: 3001,
            path: '/api/clients',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Content-Length': Buffer.byteLength(clientData)
            }
        };
        
        const clientPromise = new Promise((resolve, reject) => {
            const req = http.request(clientOptions, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    console.log(`   Client creation response: ${res.statusCode}`);
                    console.log(`   Response data: ${data}`);
                    
                    try {
                        const result = JSON.parse(data);
                        if (result.success) {
                            console.log('   ✅ Client created successfully');
                            resolve(result);
                        } else {
                            console.log('   ❌ Client creation failed:', result.error);
                            reject(new Error(result.error));
                        }
                    } catch (e) {
                        console.log('   ❌ Failed to parse response as JSON');
                        console.log('   Raw response:', data);
                        reject(new Error('Parse error: ' + e.message));
                    }
                });
            });
            
            req.on('error', (e) => {
                console.log('   ❌ Network error:', e.message);
                reject(e);
            });
            
            req.write(clientData);
            req.end();
        });
        
        await clientPromise;
        
    } catch (error) {
        console.log('❌ Test failed:', error.message);
        
        // Analyze the error
        if (error.message.includes('ECONNREFUSED')) {
            console.log('🔍 Analysis: Server not running or not accessible');
        } else if (error.message.includes('401')) {
            console.log('🔍 Analysis: Authentication issue');
        } else if (error.message.includes('500')) {
            console.log('🔍 Analysis: Server-side error (likely database or validation)');
        } else {
            console.log('🔍 Analysis: Other error type');
        }
    }
}

testClientCreation();
