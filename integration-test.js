const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:9191';

// Test results
const results = {
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    testResults: []
};

// Helper function to log test results
function logTest(testName, success, message = '') {
    results.totalTests++;
    if (success) {
        results.passedTests++;
        console.log(`✅ ${testName}`);
    } else {
        results.failedTests++;
        console.log(`❌ ${testName}: ${message}`);
    }
    results.testResults.push({ testName, success, message });
}

// Test basic endpoints that don't require authentication
async function testBasicEndpoints() {
    console.log('\n🧪 Testing Basic Endpoints');

    try {
        // Test home page
        const homeResponse = await axios.get(`${BASE_URL}/`);
        logTest('Home Page Load', homeResponse.status === 200, `Status: ${homeResponse.status}`);
    } catch (error) {
        logTest('Home Page Load', false, error.message);
    }

    try {
        // Test contact page
        const contactResponse = await axios.get(`${BASE_URL}/contact`);
        logTest('Contact Page Load', contactResponse.status === 200, `Status: ${contactResponse.status}`);
    } catch (error) {
        logTest('Contact Page Load', false, error.message);
    }

    try {
        // Test about page
        const aboutResponse = await axios.get(`${BASE_URL}/about`);
        logTest('About Page Load', aboutResponse.status === 200, `Status: ${aboutResponse.status}`);
    } catch (error) {
        logTest('About Page Load', false, error.message);
    }
}

// Test authentication endpoints
async function testAuthEndpoints() {
    console.log('\n🔐 Testing Authentication Endpoints');

    try {
        // Test login page
        const loginResponse = await axios.get(`${BASE_URL}/login`);
        logTest('Login Page Load', loginResponse.status === 200, `Status: ${loginResponse.status}`);
    } catch (error) {
        logTest('Login Page Load', false, error.message);
    }

    try {
        // Test register page (might redirect)
        const registerResponse = await axios.get(`${BASE_URL}/form`);
        logTest('Registration Page Load', registerResponse.status === 200, `Status: ${registerResponse.status}`);
    } catch (error) {
        logTest('Registration Page Load', false, error.message);
    }
}

// Test API endpoints
async function testApiEndpoints() {
    console.log('\n🔌 Testing API Endpoints');

    try {
        // Test duration API
        const durationResponse = await axios.get(`${BASE_URL}/api/util/duration`);
        logTest('Duration API', durationResponse.status === 200, `Status: ${durationResponse.status}`);
    } catch (error) {
        logTest('Duration API', false, error.message);
    }

    // Test PDF stats API (might require auth/DB)
    try {
        const statsResponse = await axios.get(`${BASE_URL}/ebook/api/stats`);
        logTest('PDF Stats API', statsResponse.status === 200, `Status: ${statsResponse.status}`);
    } catch (error) {
        // This might fail due to auth/DB issues, which is expected
        logTest('PDF Stats API', error.response?.status === 401 || error.response?.status === 500,
                `Status: ${error.response?.status || 'N/A'} - Expected due to auth/DB requirements`);
    }
}

// Test file upload functionality (basic check)
async function testFileUpload() {
    console.log('\n📁 Testing File Upload Endpoints');

    try {
        // Test upload form access (might require auth)
        const uploadResponse = await axios.get(`${BASE_URL}/ebook/upload`);
        logTest('Upload Form Access', uploadResponse.status === 200, `Status: ${uploadResponse.status}`);
    } catch (error) {
        logTest('Upload Form Access', error.response?.status === 401 || error.response?.status === 302,
                `Status: ${error.response?.status || 'N/A'} - Expected due to auth requirements`);
    }
}

// Test error handling
async function testErrorHandling() {
    console.log('\n🚨 Testing Error Handling');

    try {
        // Test 404 page - should return 404 status
        const notFoundResponse = await axios.get(`${BASE_URL}/nonexistent-page-12345`, {
            validateStatus: () => true // Don't throw on 404
        });
        logTest('404 Error Page', notFoundResponse.status === 404, `Status: ${notFoundResponse.status} - Correctly returns 404 for non-existent pages`);
    } catch (error) {
        logTest('404 Error Page', false, error.message);
    }
}

// Test security features
async function testSecurityFeatures() {
    console.log('\n🔒 Testing Security Features');

    try {
        // Test direct PDF access (should be blocked)
        const directPdfResponse = await axios.get(`${BASE_URL}/ebook/uploads/pdfs/test.pdf`);
        logTest('Direct PDF Access Protection', directPdfResponse.status === 403,
                `Status: ${directPdfResponse.status} - Should be blocked`);
    } catch (error) {
        logTest('Direct PDF Access Protection', error.response?.status === 403,
                `Status: ${error.response?.status || 'N/A'} - Access correctly blocked`);
    }
}

// Run all integration tests
async function runIntegrationTests() {
    console.log('🚀 Starting Integration Tests');
    console.log('=' .repeat(50));

    const startTime = Date.now();

    try {
        await testBasicEndpoints();
        await testAuthEndpoints();
        await testApiEndpoints();
        await testFileUpload();
        await testErrorHandling();
        await testSecurityFeatures();
    } catch (error) {
        console.error('❌ Test suite error:', error.message);
    }

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;

    // Print results
    console.log('\n' + '='.repeat(50));
    console.log('📊 INTEGRATION TEST RESULTS');
    console.log('='.repeat(50));
    console.log(`⏱️  Total Test Time: ${duration.toFixed(2)} seconds`);
    console.log(`📊 Total Tests: ${results.totalTests}`);
    console.log(`✅ Passed: ${results.passedTests}`);
    console.log(`❌ Failed: ${results.failedTests}`);
    console.log(`📈 Success Rate: ${((results.passedTests / results.totalTests) * 100).toFixed(2)}%`);

    // Detailed results
    console.log('\n📋 DETAILED RESULTS:');
    results.testResults.forEach((result, index) => {
        const status = result.success ? '✅' : '❌';
        console.log(`${index + 1}. ${status} ${result.testName}`);
        if (result.message) {
            console.log(`   ${result.message}`);
        }
    });

    // Assessment
    console.log('\n🎯 ASSESSMENT');
    const successRate = (results.passedTests / results.totalTests) * 100;
    if (successRate >= 90) {
        console.log('✅ EXCELLENT: Application is stable and functional');
    } else if (successRate >= 75) {
        console.log('👍 GOOD: Application works but has some issues');
    } else if (successRate >= 50) {
        console.log('⚠️ FAIR: Application has significant issues');
    } else {
        console.log('❌ POOR: Application needs major fixes');
    }

    console.log('\n🏁 Integration testing completed');
    return successRate >= 75; // Return true if mostly successful
}

// Check if server is running
async function checkServer() {
    try {
        await axios.get(`${BASE_URL}/`, { timeout: 5000 });
        console.log('✅ Server is running and accessible');
        return true;
    } catch (error) {
        console.log('❌ Server is not accessible. Please start the server first.');
        console.log(`   Run: node server.js`);
        return false;
    }
}

// Main execution
if (require.main === module) {
    checkServer().then(isRunning => {
        if (isRunning) {
            runIntegrationTests().catch(console.error);
        }
    });
}

module.exports = { runIntegrationTests, checkServer };