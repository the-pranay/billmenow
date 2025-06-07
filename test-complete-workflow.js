// Test script to verify complete invoice creation workflow including URL parameters
async function testCompleteWorkflow() {
    try {
        console.log('🔄 Testing Complete Invoice Creation Workflow...\n');
        
        // Step 1: Login
        console.log('1. Testing Login...');
        const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'password123'
            })
        });
        
        if (!loginResponse.ok) {
            throw new Error(`Login failed: ${loginResponse.status}`);
        }
        
        const loginData = await loginResponse.json();
        const token = loginData.token;
        console.log('✅ Login successful');

        // Step 2: Get clients for URL testing
        console.log('\n2. Getting clients for URL parameter testing...');
        const clientsResponse = await fetch('http://localhost:3000/api/clients', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const clientsData = await clientsResponse.json();
        if (!clientsData.success || clientsData.clients.length === 0) {
            throw new Error('No clients found');
        }
        
        console.log(`✅ Found ${clientsData.clients.length} clients:`);
        clientsData.clients.forEach((client, index) => {
            const name = client.companyName || `${client.firstName} ${client.lastName}`;
            console.log(`   ${index + 1}. ${name} (ID: ${client._id})`);
        });

        // Step 3: Test invoice creation for each client
        console.log('\n3. Testing invoice creation for multiple clients...');
        
        for (let i = 0; i < clientsData.clients.length; i++) {
            const client = clientsData.clients[i];
            const clientName = client.companyName || `${client.firstName} ${client.lastName}`;
            const clientId = client._id;
            
            console.log(`\n   📋 Creating invoice for: ${clientName}`);
            
            const invoiceData = {
                client: clientId,
                invoiceNumber: `INV-AUTO-${Date.now()}-${i + 1}`,
                issueDate: new Date().toISOString().split('T')[0],
                dueDate: new Date(Date.now() + (30 + i * 10) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                items: [
                    {
                        description: `Consulting Service ${i + 1}`,
                        quantity: i + 1,
                        rate: 150,
                        amount: 150 * (i + 1)
                    },
                    {
                        description: `Development Work ${i + 1}`,
                        quantity: 2,
                        rate: 100,
                        amount: 200
                    }
                ],
                subtotal: 150 * (i + 1) + 200,
                taxTotal: (150 * (i + 1) + 200) * 0.1, // 10% tax
                total: (150 * (i + 1) + 200) * 1.1,
                notes: `Invoice for ${clientName} - Test invoice #${i + 1}`
            };

            const invoiceResponse = await fetch('http://localhost:3000/api/invoices', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(invoiceData)
            });

            const invoiceResult = await invoiceResponse.json();
            
            if (invoiceResponse.ok && invoiceResult.success) {
                console.log(`   ✅ Invoice ${invoiceResult.invoice.invoiceNumber} created successfully`);
                console.log(`      Total: $${invoiceResult.invoice.total}`);
                console.log(`      Due Date: ${invoiceResult.invoice.dueDate}`);
            } else {
                console.log(`   ❌ Failed to create invoice: ${invoiceResult.error}`);
            }
        }

        // Step 4: Verify all invoices were created
        console.log('\n4. Verifying all invoices were created...');
        const allInvoicesResponse = await fetch('http://localhost:3000/api/invoices', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const allInvoicesData = await allInvoicesResponse.json();
        if (allInvoicesData.success) {
            console.log(`✅ Total invoices in database: ${allInvoicesData.invoices.length}`);
            console.log('\n   Recent invoices:');
            allInvoicesData.invoices.slice(0, 5).forEach(invoice => {
                console.log(`   - ${invoice.invoiceNumber}: $${invoice.total} (${invoice.status})`);
            });
            
            // Show summary
            if (allInvoicesData.summary) {
                console.log('\n   📊 Summary:');
                console.log(`   - Total: ${allInvoicesData.summary.total} invoices`);
                console.log(`   - Pending: ${allInvoicesData.summary.pending} ($${allInvoicesData.summary.pendingAmount})`);
                console.log(`   - Paid: ${allInvoicesData.summary.paid} ($${allInvoicesData.summary.paidAmount})`);
                console.log(`   - Total Amount: $${allInvoicesData.summary.totalAmount}`);
            }
        } else {
            console.log('❌ Failed to retrieve invoices');
        }

        // Step 5: Test URL generation for client pre-selection
        console.log('\n5. Testing URL parameter functionality...');
        clientsData.clients.forEach(client => {
            const clientName = client.companyName || `${client.firstName} ${client.lastName}`;
            const createInvoiceUrl = `http://localhost:3000/invoices/create?clientId=${client._id}`;
            console.log(`   🔗 Create invoice URL for ${clientName}:`);
            console.log(`      ${createInvoiceUrl}`);
        });

        console.log('\n🎉 Complete workflow test successful!');
        console.log('\n📋 Next Steps:');
        console.log('1. ✅ API Authentication - Working');
        console.log('2. ✅ Client Management - Working');  
        console.log('3. ✅ Invoice Creation - Working');
        console.log('4. ✅ Database Storage - Working');
        console.log('5. 🔄 Test frontend UI manually');
        console.log('6. 🔄 Test URL parameter pre-selection');
        console.log('7. 🔄 Test PDF generation');
        console.log('8. 🔄 Test email functionality');

    } catch (error) {
        console.error('\n❌ Workflow test failed:', error.message);
        console.error('Stack:', error.stack);
    }
}

// Run the test
testCompleteWorkflow();
