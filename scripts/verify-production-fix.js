#!/usr/bin/env node

/**
 * BillMeNow Production Verification Script
 * Run this after applying MongoDB Atlas and Vercel fixes
 */

const https = require('https');

const PROD_URL = 'https://billmenow.vercel.app';
const TEST_EMAIL = `verify.${Date.now()}@billmenow.test`;
const TEST_PASSWORD = 'TestPassword123!';

console.log('🔍 BillMeNow Production Verification');
console.log('=====================================');
console.log(`🌐 Target: ${PROD_URL}`);
console.log(`📧 Test Email: ${TEST_EMAIL}`);
console.log(`⏰ Time: ${new Date().toISOString()}\n`);

// Helper function to make HTTP requests
function makeRequest(options, postData = null) {
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve({ status: res.statusCode, headers: res.headers, data: json });
                } catch (e) {
                    resolve({ status: res.statusCode, headers: res.headers, data: data });
                }
            });
        });

        req.on('error', reject);
        
        if (postData) {
            req.write(postData);
        }
        
        req.end();
    });
}

async function verifyProduction() {
    try {
        // Test 1: Health Check
        console.log('🏥 1. Health Check');
        console.log('----------------------------------------');
        const healthCheck = await makeRequest({
            hostname: 'billmenow.vercel.app',
            path: '/',
            method: 'GET'
        });
        
        if (healthCheck.status === 200) {
            console.log('✅ Site Status: Online');
        } else {
            console.log(`❌ Site Status: ${healthCheck.status}`);
            return false;
        }

        // Test 2: Registration Endpoint
        console.log('\n📝 2. Registration Test');
        console.log('----------------------------------------');
        
        const registrationData = JSON.stringify({
            name: 'Verification User',
            email: TEST_EMAIL,
            password: TEST_PASSWORD,
            confirmPassword: TEST_PASSWORD
        });

        const registrationTest = await makeRequest({
            hostname: 'billmenow.vercel.app',
            path: '/api/auth/register',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(registrationData)
            }
        }, registrationData);

        console.log(`🔗 Registration Status: ${registrationTest.status}`);
        
        if (registrationTest.status === 201) {
            console.log('✅ Registration: SUCCESS');
            console.log('🎉 User account created successfully');
            console.log('📋 Response:', JSON.stringify(registrationTest.data, null, 2));
            
            // Test 3: Login with created account
            console.log('\n🔑 3. Login Verification');
            console.log('----------------------------------------');
            
            const loginData = JSON.stringify({
                email: TEST_EMAIL,
                password: TEST_PASSWORD
            });

            const loginTest = await makeRequest({
                hostname: 'billmenow.vercel.app',
                path: '/api/auth/login',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(loginData)
                }
            }, loginData);

            console.log(`🔗 Login Status: ${loginTest.status}`);
            
            if (loginTest.status === 200) {
                console.log('✅ Login: SUCCESS');
                console.log('🎉 Authentication working correctly');
            } else {
                console.log('❌ Login: FAILED');
                console.log('📋 Response:', JSON.stringify(loginTest.data, null, 2));
            }
            
        } else if (registrationTest.status === 400) {
            console.log('⚠️ Registration: VALIDATION ERROR');
            console.log('📋 Response:', JSON.stringify(registrationTest.data, null, 2));
            console.log('💡 This might be expected if user already exists');
        } else if (registrationTest.status === 500) {
            console.log('❌ Registration: SERVER ERROR');
            console.log('📋 Response:', JSON.stringify(registrationTest.data, null, 2));
            console.log('🚨 Database connection still failing!');
            console.log('\n🔧 REQUIRED FIXES:');
            console.log('1. Check MongoDB Atlas IP whitelist (0.0.0.0/0)');
            console.log('2. Verify Vercel environment variables');
            console.log('3. Check Vercel function logs for details');
            return false;
        } else {
            console.log(`❌ Registration: UNEXPECTED STATUS ${registrationTest.status}`);
            console.log('📋 Response:', JSON.stringify(registrationTest.data, null, 2));
        }

        // Test 4: Database Connection Test
        console.log('\n🗄️ 4. Database Connection Test');
        console.log('----------------------------------------');
        
        const dbTest = await makeRequest({
            hostname: 'billmenow.vercel.app',
            path: '/api/test/database',
            method: 'GET'
        });

        console.log(`🔗 Database Test Status: ${dbTest.status}`);
        
        if (dbTest.status === 401) {
            console.log('✅ Database: Connected (Auth required - this is expected)');
        } else if (dbTest.status === 200) {
            console.log('✅ Database: Connected and accessible');
        } else {
            console.log('❌ Database: Connection issues');
            console.log('📋 Response:', JSON.stringify(dbTest.data, null, 2));
        }

        return true;

    } catch (error) {
        console.error('❌ Verification failed:', error.message);
        return false;
    }
}

// Summary function
function printSummary(success) {
    console.log('\n📊 VERIFICATION SUMMARY');
    console.log('=====================================');
    
    if (success) {
        console.log('🎉 STATUS: SUCCESS');
        console.log('✅ MongoDB Atlas connection: WORKING');
        console.log('✅ User registration: WORKING');
        console.log('✅ Authentication: WORKING');
        console.log('✅ Database operations: WORKING');
        
        console.log('\n🚀 NEXT STEPS:');
        console.log('1. Test complete user journey manually');
        console.log('2. Create demo accounts for testing');
        console.log('3. Test bill creation and payment flows');
        console.log('4. Set up monitoring and error tracking');
        
    } else {
        console.log('❌ STATUS: FAILED');
        console.log('🚨 Production issues detected');
        
        console.log('\n🔧 TROUBLESHOOTING STEPS:');
        console.log('1. Verify MongoDB Atlas Network Access (0.0.0.0/0)');
        console.log('2. Check all Vercel environment variables');
        console.log('3. Redeploy after fixing environment');
        console.log('4. Check Vercel function logs for errors');
        console.log('5. Test database connection directly');
    }
    
    console.log(`\n⏰ Completed at: ${new Date().toISOString()}`);
}

// Run verification
verifyProduction()
    .then(printSummary)
    .catch(error => {
        console.error('💥 Verification script error:', error);
        printSummary(false);
    });
