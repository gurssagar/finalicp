// Test script to verify storage functions work
const { getPackageById, getServiceById, getTestPackageIds } = require('./app/api/storage/index.ts');

console.log('Available package IDs:', getTestPackageIds());
console.log('Looking for PKG_TEST_001_BASIC:', getPackageById('PKG_TEST_001_BASIC'));
console.log('Looking for service SVC_TEST_001:', getServiceById('SVC_TEST_001'));