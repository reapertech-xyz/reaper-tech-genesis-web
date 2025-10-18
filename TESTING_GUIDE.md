# Reaper Tech Escrow System - Testing Guide

**Date:** 2025-10-18  
**Environment:** Sandbox Testing  
**API:** Escrow.com Sandbox

---

## Table of Contents
1. [Setup](#setup)
2. [Test Scenarios](#test-scenarios)
3. [Traditional Payment Tests](#traditional-payment-tests)
4. [Crypto Payment Tests](#crypto-payment-tests)
5. [Dispute Resolution Tests](#dispute-resolution-tests)
6. [Edge Case Tests](#edge-case-tests)
7. [Performance Tests](#performance-tests)
8. [Test Data](#test-data)

---

## Setup

### Prerequisites
- ✅ Supabase account with test user credentials
- ✅ Escrow.com sandbox API credentials configured
- ✅ Thirdweb wallet for crypto testing
- ✅ Test email accounts for buyer/seller
- ✅ Network inspection tools (browser DevTools)

### Environment Configuration
```bash
# Verify sandbox mode is active
ENVIRONMENT=sandbox
ESCROW_SANDBOX_SECRET_KEY=<your-key>
ESCROW_PROD_SECRET_KEY=<not-used-in-testing>
```

### Test User Accounts

**Create 3 test accounts:**
1. **Buyer Account** (buyer@test.com)
   - Tier: Shadow Trader
   - Transaction limit: $500

2. **Seller Account** (seller@test.com)
   - Tier: Reaper's Mark
   - Transaction limit: $10,000

3. **Admin Account** (admin@reapertech.com)
   - Access to dispute dashboard
   - Access to audit logs

---

## Test Scenarios

### 1. User Registration & Profile Setup

**Test Case 1.1: New User Registration**
- [ ] Register new user with email
- [ ] Verify email confirmation
- [ ] Check profile creation in database
- [ ] Verify initial reputation (Shadow Trader, 0 rating)

**Test Case 1.2: Wallet Connection**
- [ ] Connect Thirdweb wallet
- [ ] Verify wallet address stored in profile
- [ ] Test wallet disconnection
- [ ] Test wallet address change

**Expected Results:**
- ✅ Profile created with correct initial values
- ✅ User reputation record created automatically
- ✅ Wallet address properly linked

---

## Traditional Payment Tests

### 2. Standard Escrow Flow

**Test Case 2.1: Create Transaction (Under Tier Limit)**
```
Buyer: buyer@test.com
Seller: seller@test.com
Amount: $250 USD
Description: "Test transaction - laptop purchase"
```

**Steps:**
1. [ ] Login as buyer
2. [ ] Navigate to /escrow
3. [ ] Fill out escrow form
4. [ ] Submit transaction
5. [ ] Verify transaction appears in dashboard
6. [ ] Check transaction status = 'initiated'
7. [ ] Verify audit log entry created

**Expected Results:**
- ✅ Transaction created successfully
- ✅ Both buyer and seller can view transaction
- ✅ Status shows as 'initiated'
- ✅ Audit log shows 'transaction_created' event

**Test Case 2.2: Tier Limit Validation**
```
Buyer: buyer@test.com (Shadow Trader, $500 limit)
Seller: seller@test.com
Amount: $600 USD
Description: "Test tier limit - should fail"
```

**Steps:**
1. [ ] Login as buyer
2. [ ] Attempt to create $600 transaction
3. [ ] Verify tier limit alert appears
4. [ ] Confirm transaction not created
5. [ ] Check audit log for 'tier_limit_exceeded'

**Expected Results:**
- ✅ TierLimitAlert component displays
- ✅ Shows current tier and limit
- ✅ Transaction rejected with 403 status
- ✅ Audit log records violation

**Test Case 2.3: Release Funds (Happy Path)**
```
Transaction ID: [from Test Case 2.1]
```

**Steps:**
1. [ ] Login as buyer
2. [ ] Open transaction detail
3. [ ] Click "Release Funds"
4. [ ] Confirm action
5. [ ] Verify status changes to 'completed'
6. [ ] Check seller notification (if implemented)
7. [ ] Verify reputation updates triggered

**Expected Results:**
- ✅ Funds released successfully
- ✅ Status = 'completed'
- ✅ Both parties can see updated status
- ✅ Review form appears for both users
- ✅ Audit log shows 'funds_released'

### 3. Multiple Currency Tests

**Test Case 3.1: EUR Transaction**
```
Amount: €200 EUR
Currency: EUR
```

**Test Case 3.2: GBP Transaction**
```
Amount: £150 GBP
Currency: GBP
```

**Expected Results:**
- ✅ All supported currencies work correctly
- ✅ Escrow.com API accepts currency
- ✅ Amounts display with correct symbols

---

## Crypto Payment Tests

### 4. Cryptocurrency Escrow Flow

**Test Case 4.1: ETH Transaction**
```
Payment Method: Crypto
Currency: ETH
Amount: 0.1 ETH (equivalent to ~$250 USD)
Wallet: Connected via Thirdweb
```

**Steps:**
1. [ ] Connect wallet
2. [ ] Select "Cryptocurrency" payment method
3. [ ] Select ETH currency
4. [ ] Enter amount in USD (auto-converts to ETH)
5. [ ] Check wallet balance
6. [ ] Submit transaction
7. [ ] Verify conversion rate stored
8. [ ] Confirm transaction details

**Expected Results:**
- ✅ Wallet balance displays correctly
- ✅ USD to ETH conversion accurate
- ✅ Transaction created with crypto details
- ✅ Crypto currency stored in transaction record

**Test Case 4.2: Insufficient Balance**
```
Wallet Balance: 0.01 ETH
Transaction Amount: 1 ETH
```

**Steps:**
1. [ ] Check balance (shows insufficient)
2. [ ] Attempt transaction
3. [ ] Verify error message

**Expected Results:**
- ⚠️ User warned about insufficient balance
- ❌ Transaction not created

**Test Case 4.3: Multiple Crypto Currencies**
- [ ] Test BTC transaction
- [ ] Test USDC transaction
- [ ] Test USDT transaction
- [ ] Test MATIC transaction

---

## Dispute Resolution Tests

### 5. Dispute Filing & Resolution

**Test Case 5.1: File Dispute (Buyer)**
```
Transaction: Completed transaction
Reason: "Item not as described"
Category: "Item not as described"
Evidence: Upload 2 images
```

**Steps:**
1. [ ] Login as buyer
2. [ ] Open completed transaction
3. [ ] Click "File Dispute"
4. [ ] Fill dispute form
5. [ ] Upload evidence files
6. [ ] Submit dispute
7. [ ] Verify status = 'disputed'
8. [ ] Check dispute appears in admin dashboard

**Expected Results:**
- ✅ Dispute form submission successful
- ✅ Files uploaded to storage bucket
- ✅ Status changed to 'disputed'
- ✅ Audit log shows 'dispute_initiated'
- ✅ Admin can view dispute

**Test Case 5.2: Dispute Resolution (Admin)**
```
Dispute ID: [from Test Case 5.1]
Resolution: Refund Buyer
```

**Steps:**
1. [ ] Login as admin
2. [ ] Navigate to /admin/disputes
3. [ ] Open dispute details
4. [ ] Review evidence from both parties
5. [ ] Click "Refund Buyer"
6. [ ] Confirm resolution
7. [ ] Verify transaction updated

**Expected Results:**
- ✅ Admin can view all dispute details
- ✅ Evidence files accessible
- ✅ Resolution updates transaction
- ✅ Both parties notified
- ✅ Audit log shows resolution

**Test Case 5.3: File Dispute (Seller)**
```
Transaction: Active transaction
Reason: "Buyer not responding"
```

**Steps:**
1. [ ] Login as seller
2. [ ] File dispute from seller side
3. [ ] Verify seller can initiate dispute

**Expected Results:**
- ✅ Seller can file disputes
- ✅ Process same as buyer dispute

---

## Edge Case Tests

### 6. Network & Error Scenarios

**Test Case 6.1: Database Connection Failure**
```
Simulate: Disconnect database mid-transaction
```

**Steps:**
1. [ ] Start transaction creation
2. [ ] Simulate network interruption
3. [ ] Check error handling
4. [ ] Verify retry mechanism activates
5. [ ] Check audit logs for error

**Expected Results:**
- ✅ Graceful error message to user
- ✅ Retry logic attempts 3 times
- ✅ No data corruption
- ✅ Error logged in audit trail

**Test Case 6.2: Escrow.com API Timeout**
```
Simulate: API takes >30 seconds to respond
```

**Steps:**
1. [ ] Monitor edge function logs
2. [ ] Verify timeout handling
3. [ ] Check transaction state

**Expected Results:**
- ✅ Timeout error returned to client
- ⚠️ No orphaned transactions
- ✅ Error logged

**Test Case 6.3: Concurrent Modifications**
```
Scenario: Two users modify same transaction simultaneously
```

**Steps:**
1. [ ] Open same transaction in 2 browser windows
2. [ ] Buyer releases funds in Window 1
3. [ ] Buyer cancels in Window 2 (simultaneously)
4. [ ] Verify only one action succeeds

**Expected Results:**
- ✅ First action succeeds
- ✅ Second action fails with appropriate error
- ✅ No race condition issues

**Test Case 6.4: Invalid Input Attacks**

**SQL Injection Attempts:**
```
Description: "'; DROP TABLE escrow_transactions; --"
Seller ID: "' OR '1'='1"
```

**XSS Attempts:**
```
Description: "<script>alert('XSS')</script>"
```

**Steps:**
1. [ ] Submit forms with malicious input
2. [ ] Verify sanitization works
3. [ ] Check no code execution
4. [ ] Verify data properly escaped

**Expected Results:**
- ✅ All input sanitized
- ✅ No SQL injection possible
- ✅ No XSS vulnerabilities
- ✅ Data stored safely

### 7. Rate Limiting Tests

**Test Case 7.1: Exceed Rate Limit**
```
Action: Create Transaction
Rate: 11 requests in 60 seconds
```

**Steps:**
1. [ ] Write script to send 11 requests rapidly
2. [ ] Verify 10th request succeeds
3. [ ] Verify 11th request returns 429
4. [ ] Wait 60 seconds
5. [ ] Verify can send request again

**Expected Results:**
- ✅ First 10 requests succeed
- ✅ 11th request blocked with 429 status
- ✅ Error message shows retry time
- ✅ Audit log shows 'rate_limit_exceeded'
- ✅ Limit resets after window

**Test Case 7.2: Rate Limit Per Action**
```
Test: Rate limit is per action, not global
```

**Steps:**
1. [ ] Send 10 'create' requests
2. [ ] Send 10 'get' requests
3. [ ] Verify both work (separate limits)

---

## Performance Tests

### 8. Load & Stress Testing

**Test Case 8.1: Concurrent Users**
```
Users: 50 concurrent
Actions: Create transactions
Duration: 5 minutes
```

**Metrics to Monitor:**
- [ ] Response time < 2 seconds
- [ ] No database connection errors
- [ ] Edge function execution time
- [ ] Rate limit behavior under load

**Test Case 8.2: Large Transaction Volume**
```
Scenario: 1000 transactions created in 1 hour
```

**Metrics to Monitor:**
- [ ] Database performance
- [ ] Audit log performance
- [ ] Storage usage

---

## Test Data

### Sample Transaction Data

```json
{
  "buyerId": "user-uuid-1",
  "sellerId": "user-uuid-2",
  "amount": 250.00,
  "currency": "USD",
  "description": "MacBook Pro 13-inch 2021",
  "releaseConditions": [
    "Item delivered as described",
    "Inspection period completed"
  ]
}
```

### Sample Dispute Data

```json
{
  "transactionId": "transaction-uuid",
  "reason": "Item not as described - screen has dead pixels",
  "category": "item_not_as_described",
  "evidenceFiles": ["image1.jpg", "image2.jpg"]
}
```

---

## Test Results Template

```markdown
## Test Execution Report

**Date:** YYYY-MM-DD
**Tester:** Name
**Environment:** Sandbox

### Test Summary
- Total Tests: X
- Passed: X
- Failed: X
- Blocked: X

### Failed Tests
1. Test Case ID: X.X
   - Issue: Description
   - Severity: High/Medium/Low
   - Steps to Reproduce: 
   - Expected vs Actual:

### Blocked Tests
1. Test Case ID: X.X
   - Blocking Issue:
   - Dependencies:

### Recommendations
- [List recommendations]

### Sign-off
- [ ] All critical tests passed
- [ ] All bugs documented
- [ ] Ready for production: Yes/No
```

---

## Automated Testing Scripts

### Example: Rate Limit Test Script

```javascript
// rate-limit-test.js
async function testRateLimit() {
  const requests = [];
  
  for (let i = 0; i < 12; i++) {
    requests.push(
      fetch('https://your-project.supabase.co/functions/v1/escrow-api', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer YOUR_TOKEN',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'create',
          buyerId: 'test-buyer-id',
          sellerId: 'test-seller-id',
          amount: 100,
          currency: 'USD',
          description: `Rate limit test ${i}`
        })
      })
    );
  }
  
  const responses = await Promise.all(requests);
  
  responses.forEach((res, i) => {
    console.log(`Request ${i + 1}: ${res.status}`);
  });
}

testRateLimit();
```

---

## Monitoring During Tests

### Edge Function Logs
```bash
# View real-time logs
https://supabase.com/dashboard/project/YOUR_PROJECT/functions/escrow-api/logs
```

### Database Queries
```sql
-- Check recent transactions
SELECT * FROM escrow_transactions 
ORDER BY created_at DESC 
LIMIT 10;

-- Check audit logs
SELECT * FROM escrow_audit_log 
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;

-- Check rate limits
SELECT * FROM rate_limit_tracking
WHERE window_start > NOW() - INTERVAL '1 hour';
```

---

## Next Steps After Testing

1. ✅ Document all test results
2. ✅ Fix any critical bugs found
3. ✅ Re-test failed scenarios
4. ✅ Update security audit with findings
5. ✅ Get stakeholder sign-off
6. ✅ Proceed to production deployment

---

*This testing guide should be executed completely before production deployment.*
