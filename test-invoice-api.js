// Test script to verify invoice creation API
async function testInvoiceAPI() {
    try {
        console.log('🔄 Testing Invoice Creation API...\n');
        
        // Step 1: Login
        console.log('1. Logging in...');
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

        // Step 2: Get clients
        console.log('\n2. Getting clients...');
        const clientsResponse = await fetch('http://localhost:3000/api/clients', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const clientsData = await clientsResponse.json();
        if (!clientsData.success || clientsData.clients.length === 0) {
            throw new Error('No clients found');
        }
        
        const clientId = clientsData.clients[0]._id;
        const clientName = clientsData.clients[0].companyName || clientsData.clients[0].firstName + ' ' + clientsData.clients[0].lastName;
        console.log(`✅ Found ${clientsData.clients.length} clients`);
        console.log(`   Using: ${clientName} (${clientId})`);

        // Step 3: Create invoice
        console.log('\n3. Creating invoice...');
        const invoiceNumber = 'INV-TEST-' + Date.now();
        const invoiceData = {
            client: clientId,
            invoiceNumber: invoiceNumber,
            issueDate: new Date().toISOString().split('T')[0],
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            items: [
                {
                    description: 'Test Service A',
                    quantity: 2,
                    rate: 100,
                    amount: 200
                },
                {
                    description: 'Test Service B',
                    quantity: 1,
                    rate: 50,
                    amount: 50
                }
            ],
            subtotal: 250,
            taxTotal: 25,
            total: 275,
            notes: 'Test invoice creation after API fixes'
        };

        console.log(`   Invoice Number: ${invoiceNumber}`);
        console.log(`   Subtotal: $${invoiceData.subtotal}`);
        console.log(`   Tax: $${invoiceData.taxTotal}`);
        console.log(`   Total: $${invoiceData.total}`);

        const invoiceResponse = await fetch('http://localhost:3000/api/invoices', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(invoiceData)
        });

        const invoiceResult = await invoiceResponse.json();
        
        if (!invoiceResponse.ok) {
            console.error('\n❌ Invoice creation failed!');
            console.error(`   Status: ${invoiceResponse.status}`);
            console.error(`   Response:`, invoiceResult);
            return;
        }

        if (invoiceResult.success) {
            console.log('\n✅ Invoice created successfully!');
            console.log(`   Invoice ID: ${invoiceResult.invoice._id}`);
            console.log(`   Invoice Number: ${invoiceResult.invoice.invoiceNumber}`);
            console.log(`   Client: ${invoiceResult.invoice.client}`);
            console.log(`   Total: $${invoiceResult.invoice.total}`);
            console.log(`   Status: ${invoiceResult.invoice.status}`);
            
            // Step 4: Verify invoice was saved by retrieving it
            console.log('\n4. Verifying invoice was saved...');
            const getInvoiceResponse = await fetch(`http://localhost:3000/api/invoices`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            const invoicesData = await getInvoiceResponse.json();
            if (invoicesData.success) {
                const createdInvoice = invoicesData.invoices.find(inv => inv.invoiceNumber === invoiceNumber);
                if (createdInvoice) {
                    console.log('✅ Invoice verified in database');
                    console.log(`   Found ${invoicesData.invoices.length} total invoices`);
                } else {
                    console.log('❌ Invoice not found in database');
                }
            }
            
        } else {
            console.error('\n❌ Invoice creation failed:', invoiceResult.error);
        }

        console.log('\n🎉 Test completed!');

    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.error('Stack:', error.stack);
    }
}

// Run the test
testInvoiceAPI();
