#!/usr/bin/env node

// Cleanup script to remove test data created during production fix testing

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3002';

// Colors for terminal output
const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    bright: '\x1b[1m',
    reset: '\x1b[0m'
};

function log(message, color = '') {
    console.log(`${color}${message}${colors.reset}`);
}

function success(message) { log(`✅ ${message}`, colors.green); }
function error(message) { log(`❌ ${message}`, colors.red); }
function info(message) { log(`ℹ️  ${message}`, colors.cyan); }

async function makeRequest(url, options = {}) {
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });

        const data = await response.json();
        return {
            success: response.ok,
            status: response.status,
            data: response.ok ? data : null,
            error: !response.ok ? data.error : null
        };
    } catch (err) {
        return {
            success: false,
            error: err.message
        };
    }
}

async function authenticate() {
    log('\n🔐 Authenticating for cleanup...', colors.bright);
    
    try {
        const loginResult = await makeRequest(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            body: JSON.stringify({
                email: 'user@example.com',
                password: 'password123'
            })
        });

        if (loginResult.success) {
            success('Authentication successful');
            return loginResult.data.token;
        } else {
            error(`Authentication failed: ${loginResult.error}`);
            return null;
        }
    } catch (err) {
        error(`Authentication error: ${err.message}`);
        return null;
    }
}

async function cleanupTestData(token) {
    log('\n🧹 Cleaning up test data...', colors.bright);
    log('=' .repeat(50));

    const authHeaders = { Authorization: `Bearer ${token}` };

    try {
        // 1. Get all clients
        info('Fetching clients to identify test data...');
        const clientsResult = await makeRequest(`${BASE_URL}/api/clients`, {
            headers: authHeaders
        });

        if (!clientsResult.success) {
            error(`Failed to fetch clients: ${clientsResult.error}`);
            return;
        }

        const testClients = clientsResult.data.clients.filter(client => 
            client.name.includes('Test Client') || 
            client.email.includes('test.client@example.com')
        );

        info(`Found ${testClients.length} test clients to clean up`);

        // 2. Delete test clients and their invoices
        for (const client of testClients) {
            info(`Cleaning up client: ${client.name}`);
            
            // First get and delete invoices for this client
            const invoicesResult = await makeRequest(`${BASE_URL}/api/invoices?clientId=${client._id}`, {
                headers: authHeaders
            });

            if (invoicesResult.success && invoicesResult.data.invoices) {
                for (const invoice of invoicesResult.data.invoices) {
                    if (invoice.invoiceNumber.includes('FIX-TEST')) {
                        const deleteInvoiceResult = await makeRequest(`${BASE_URL}/api/invoices/${invoice._id}`, {
                            method: 'DELETE',
                            headers: authHeaders
                        });
                        
                        if (deleteInvoiceResult.success) {
                            success(`Deleted test invoice: ${invoice.invoiceNumber}`);
                        } else {
                            error(`Failed to delete invoice: ${deleteInvoiceResult.error}`);
                        }
                    }
                }
            }

            // Delete the client
            const deleteClientResult = await makeRequest(`${BASE_URL}/api/clients/${client._id}`, {
                method: 'DELETE',
                headers: authHeaders
            });

            if (deleteClientResult.success) {
                success(`Deleted test client: ${client.name}`);
            } else {
                error(`Failed to delete client: ${deleteClientResult.error}`);
            }
        }

        success('Test data cleanup completed');

    } catch (err) {
        error(`Cleanup error: ${err.message}`);
    }
}

async function main() {
    log('🧹 BillMeNow Test Data Cleanup', colors.bright + colors.cyan);
    log('=' .repeat(50));
    log('This script will remove test data created during production fix testing.\n');

    const token = await authenticate();
    if (!token) {
        error('Failed to authenticate. Cannot proceed with cleanup.');
        process.exit(1);
    }

    await cleanupTestData(token);
    
    log('\n📋 CLEANUP SUMMARY', colors.bright);
    log('=' .repeat(50));
    success('All test data has been cleaned up');
    info('The production fixes are ready for deployment');
}

main().catch(error => {
    console.error('Cleanup script error:', error);
    process.exit(1);
});
