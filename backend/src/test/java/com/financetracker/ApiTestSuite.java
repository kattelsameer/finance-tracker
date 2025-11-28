package com.financetracker;

import org.junit.platform.suite.api.SelectPackages;
import org.junit.platform.suite.api.Suite;
import org.junit.platform.suite.api.SuiteDisplayName;

/**
 * Complete API Integration Test Suite
 * 
 * This suite runs all backend API integration tests covering:
 * - Authentication (register, login, logout, check)
 * - Accounts (CRUD operations, types)
 * - Transactions (CRUD, pagination)
 * - Categories (list, hierarchy, by type)
 * - Dashboard (stats, recent transactions, spending breakdown)
 * - Budgets (CRUD, current period, alerts)
 * - Tags (CRUD)
 * - Notifications (list, preferences, mark read)
 * - Recurring Transactions (CRUD, scheduling)
 * - Search (advanced search, saved searches)
 * - Import/Export (CSV export/import)
 * 
 * Run with: ./gradlew test --tests "com.financetracker.ApiTestSuite"
 */
@Suite
@SuiteDisplayName("Finance Tracker API Integration Test Suite")
@SelectPackages("com.financetracker.controller")
public class ApiTestSuite {
    // This class serves as a test suite holder
    // All tests in the controller package will be run
}
