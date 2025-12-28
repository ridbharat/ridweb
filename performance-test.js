const axios = require('axios');
const { performance } = require('perf_hooks');

// Configuration
const BASE_URL = 'http://localhost:9191';
const CONCURRENT_USERS = 5; // Reduced for stability
const REQUESTS_PER_USER = 3; // Reduced for stability
const ENDPOINTS = [
    '/', // Home page - no auth required
    '/api/duration', // Duration API - should work
    '/contact', // Contact page - no auth required
    '/about' // About page - no auth required
];

// Performance test results
const results = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    totalResponseTime: 0,
    minResponseTime: Infinity,
    maxResponseTime: 0,
    responseTimes: [],
    endpointStats: {}
};

// Initialize endpoint stats
ENDPOINTS.forEach(endpoint => {
    results.endpointStats[endpoint] = {
        requests: 0,
        successful: 0,
        failed: 0,
        totalTime: 0,
        avgTime: 0,
        minTime: Infinity,
        maxTime: 0
    };
});

// Make a request to an endpoint
async function makeRequest(endpoint, userId) {
    const startTime = performance.now();

    try {
        const response = await axios.get(`${BASE_URL}${endpoint}`, {
            timeout: 10000, // 10 second timeout
            headers: {
                'User-Agent': `PerformanceTest-User${userId}`
            }
        });

        const endTime = performance.now();
        const responseTime = endTime - startTime;

        results.totalRequests++;
        results.successfulRequests++;
        results.totalResponseTime += responseTime;
        results.minResponseTime = Math.min(results.minResponseTime, responseTime);
        results.maxResponseTime = Math.max(results.maxResponseTime, responseTime);
        results.responseTimes.push(responseTime);

        // Update endpoint stats
        const stats = results.endpointStats[endpoint];
        stats.requests++;
        stats.successful++;
        stats.totalTime += responseTime;
        stats.minTime = Math.min(stats.minTime, responseTime);
        stats.maxTime = Math.max(stats.maxTime, responseTime);

        console.log(`✅ User ${userId} - ${endpoint}: ${responseTime.toFixed(2)}ms`);

    } catch (error) {
        const endTime = performance.now();
        const responseTime = endTime - startTime;

        results.totalRequests++;
        results.failedRequests++;
        results.totalResponseTime += responseTime;

        // Update endpoint stats
        const stats = results.endpointStats[endpoint];
        stats.requests++;
        stats.failed++;

        console.log(`❌ User ${userId} - ${endpoint}: ${responseTime.toFixed(2)}ms - ${error.code || error.message}`);
    }
}

// Simulate a user making multiple requests
async function simulateUser(userId) {
    console.log(`🚀 Starting user ${userId} simulation`);

    for (let i = 0; i < REQUESTS_PER_USER; i++) {
        // Randomly select an endpoint
        const endpoint = ENDPOINTS[Math.floor(Math.random() * ENDPOINTS.length)];
        await makeRequest(endpoint, userId);

        // Small delay between requests (100-500ms)
        const delay = Math.random() * 400 + 100;
        await new Promise(resolve => setTimeout(resolve, delay));
    }

    console.log(`✅ User ${userId} simulation completed`);
}

// Run performance test
async function runPerformanceTest() {
    console.log('🏁 Starting Performance Test');
    console.log(`📊 Configuration: ${CONCURRENT_USERS} users × ${REQUESTS_PER_USER} requests = ${CONCURRENT_USERS * REQUESTS_PER_USER} total requests`);
    console.log(`🎯 Target: ${BASE_URL}`);
    console.log('');

    const testStart = performance.now();

    // Start all users concurrently
    const userPromises = [];
    for (let i = 1; i <= CONCURRENT_USERS; i++) {
        userPromises.push(simulateUser(i));
    }

    // Wait for all users to complete
    await Promise.all(userPromises);

    const testEnd = performance.now();
    const totalTestTime = testEnd - testStart;

    // Calculate final statistics
    const avgResponseTime = results.totalResponseTime / results.totalRequests;
    const successRate = (results.successfulRequests / results.totalRequests) * 100;
    const requestsPerSecond = results.totalRequests / (totalTestTime / 1000);

    // Calculate percentiles
    results.responseTimes.sort((a, b) => a - b);
    const p50 = results.responseTimes[Math.floor(results.responseTimes.length * 0.5)];
    const p95 = results.responseTimes[Math.floor(results.responseTimes.length * 0.95)];
    const p99 = results.responseTimes[Math.floor(results.responseTimes.length * 0.99)];

    // Calculate endpoint averages
    Object.keys(results.endpointStats).forEach(endpoint => {
        const stats = results.endpointStats[endpoint];
        if (stats.requests > 0) {
            stats.avgTime = stats.totalTime / stats.requests;
        }
    });

    // Print results
    console.log('');
    console.log('📈 PERFORMANCE TEST RESULTS');
    console.log('===========================');
    console.log(`⏱️  Total Test Time: ${(totalTestTime / 1000).toFixed(2)} seconds`);
    console.log(`📊 Total Requests: ${results.totalRequests}`);
    console.log(`✅ Successful: ${results.successfulRequests}`);
    console.log(`❌ Failed: ${results.failedRequests}`);
    console.log(`📈 Success Rate: ${successRate.toFixed(2)}%`);
    console.log(`🚀 Requests/Second: ${requestsPerSecond.toFixed(2)}`);
    console.log('');

    console.log('⏱️  RESPONSE TIMES');
    console.log('==================');
    console.log(`Average: ${avgResponseTime.toFixed(2)}ms`);
    console.log(`Min: ${results.minResponseTime.toFixed(2)}ms`);
    console.log(`Max: ${results.maxResponseTime.toFixed(2)}ms`);
    console.log(`50th percentile: ${p50.toFixed(2)}ms`);
    console.log(`95th percentile: ${p95.toFixed(2)}ms`);
    console.log(`99th percentile: ${p99.toFixed(2)}ms`);
    console.log('');

    console.log('📊 ENDPOINT BREAKDOWN');
    console.log('=====================');
    Object.entries(results.endpointStats).forEach(([endpoint, stats]) => {
        const successRate = stats.requests > 0 ? ((stats.successful / stats.requests) * 100).toFixed(2) : '0.00';
        console.log(`${endpoint}:`);
        console.log(`  Requests: ${stats.requests}`);
        console.log(`  Success Rate: ${successRate}%`);
        if (stats.requests > 0) {
            console.log(`  Avg Response Time: ${stats.avgTime.toFixed(2)}ms`);
            console.log(`  Min/Max: ${stats.minTime.toFixed(2)}ms / ${stats.maxTime.toFixed(2)}ms`);
        }
        console.log('');
    });

    // Performance assessment
    console.log('🎯 PERFORMANCE ASSESSMENT');
    console.log('========================');
    if (avgResponseTime < 500 && successRate > 95) {
        console.log('✅ EXCELLENT: Fast response times and high reliability');
    } else if (avgResponseTime < 1000 && successRate > 90) {
        console.log('👍 GOOD: Acceptable performance');
    } else if (avgResponseTime < 2000 && successRate > 80) {
        console.log('⚠️  FAIR: Performance could be improved');
    } else {
        console.log('❌ POOR: Significant performance issues detected');
    }

    console.log('');
    console.log('🏁 Performance test completed');
}

// Check if server is running before starting test
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
            runPerformanceTest().catch(console.error);
        }
    });
}

module.exports = { runPerformanceTest, checkServer };