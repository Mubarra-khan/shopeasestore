# Seller Application API - Quick Testing Guide

## Server Setup

```bash
# Start server (from ecommerce-backend directory)
npm start
# Server runs on http://localhost:5000
```

---

## 1. SIGNUP & LOGIN

### Create a customer account
```bash
curl -X POST http://localhost:5000/api/users/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'

# Expected Response:
# {
#   "success": true,
#   "message": "User registered successfully",
#   "data": {
#     "_id": "...",
#     "name": "John Doe",
#     "email": "john@example.com",
#     "role": "customer"
#   }
# }
```

### Login to get JWT token
```bash
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'

# Expected Response:
# {
#   "success": true,
#   "message": "Login successful",
#   "data": {
#     "_id": "...",
#     "name": "John Doe",
#     "email": "john@example.com",
#     "role": "customer"
#   },
#   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
# }

# Save the token for later use:
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 2. CUSTOMER: SUBMIT SELLER APPLICATION

### Submit application (must be customer)
```bash
curl -X POST http://localhost:5000/api/users/seller-applications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1-555-0123",
    "businessName": "Tech Gadgets Store",
    "category": "Electronics",
    "businessDescription": "We sell high-quality electronic gadgets and accessories. Our store has 5+ years of experience in retail.",
    "businessAddress": "123 Main St, New York, NY 10001",
    "website": "https://techgadgets-example.com"
  }'

# Expected Response:
# {
#   "success": true,
#   "message": "Seller application submitted successfully",
#   "data": {
#     "_id": "application_id_123",
#     "applicantUserId": "user_id_123",
#     "name": "John Doe",
#     "email": "john@example.com",
#     "phone": "+1-555-0123",
#     "businessName": "Tech Gadgets Store",
#     "category": "Electronics",
#     "businessDescription": "...",
#     "businessAddress": "123 Main St, New York, NY 10001",
#     "website": "https://techgadgets-example.com",
#     "status": "pending",
#     "rejectionReason": null,
#     "reviewedBy": null,
#     "reviewedAt": null,
#     "createdAt": "2026-08-24T10:30:00Z",
#     "updatedAt": "2026-08-24T10:30:00Z"
#   }
# }
```

### Test: Duplicate pending application (should fail)
```bash
curl -X POST http://localhost:5000/api/users/seller-applications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1-555-0123",
    "businessName": "Tech Gadgets Store",
    "category": "Electronics",
    "businessDescription": "...",
    "businessAddress": "123 Main St, New York, NY 10001"
  }'

# Expected Response (409 Conflict):
# {
#   "success": false,
#   "message": "You already have a pending application. Please wait for admin review.",
#   "data": { ...application... }
# }
```

### Test: Missing required field (should fail)
```bash
curl -X POST http://localhost:5000/api/users/seller-applications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com"
    # Missing phone, businessName, category, businessDescription, businessAddress
  }'

# Expected Response (400 Bad Request):
# {
#   "success": false,
#   "message": "All required fields must be provided"
# }
```

---

## 3. CUSTOMER: CHECK OWN APPLICATION STATUS

### Get application status
```bash
curl -X GET http://localhost:5000/api/users/seller-applications/me \
  -H "Authorization: Bearer $TOKEN"

# Expected Response:
# {
#   "success": true,
#   "data": {
#     "_id": "application_id_123",
#     "applicantUserId": "user_id_123",
#     "name": "John Doe",
#     "email": "john@example.com",
#     "phone": "+1-555-0123",
#     "businessName": "Tech Gadgets Store",
#     "category": "Electronics",
#     "businessDescription": "...",
#     "businessAddress": "123 Main St, New York, NY 10001",
#     "website": "https://techgadgets-example.com",
#     "status": "pending",  # or "approved" or "rejected"
#     "rejectionReason": null,  # if rejected, reason shown here
#     "reviewedBy": { _id, name, email },  # if reviewed
#     "reviewedAt": "2026-08-24T11:00:00Z",  # if reviewed
#     "createdAt": "2026-08-24T10:30:00Z",
#     "updatedAt": "2026-08-24T11:00:00Z"
#   }
# }
```

---

## 4. ADMIN: LIST APPLICATIONS

### First, create or login as admin
```bash
# You need admin credentials. Either:
# 1. Use existing admin from database
# 2. Create admin via script:
#    node scripts/create_admin.js "Admin Name" "admin@example.com" "admin_password"

# Login as admin:
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin_password"
  }'

# Save admin token:
ADMIN_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### List all applications
```bash
curl -X GET http://localhost:5000/api/users/admin/seller-applications \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Expected Response:
# {
#   "success": true,
#   "count": 1,
#   "data": [
#     {
#       "_id": "application_id_123",
#       "applicantUserId": {
#         "_id": "user_id_123",
#         "name": "John Doe",
#         "email": "john@example.com",
#         "role": "customer",
#         "createdAt": "2026-08-24T09:00:00Z"
#       },
#       "name": "John Doe",
#       "email": "john@example.com",
#       "phone": "+1-555-0123",
#       "businessName": "Tech Gadgets Store",
#       "category": "Electronics",
#       "businessDescription": "...",
#       "businessAddress": "123 Main St, New York, NY 10001",
#       "website": "https://techgadgets-example.com",
#       "status": "pending",
#       "rejectionReason": null,
#       "reviewedBy": null,
#       "reviewedAt": null,
#       "createdAt": "2026-08-24T10:30:00Z",
#       "updatedAt": "2026-08-24T10:30:00Z"
#     }
#   ]
# }
```

### List only pending applications
```bash
curl -X GET "http://localhost:5000/api/users/admin/seller-applications?status=pending" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Also works with: ?status=approved or ?status=rejected
```

---

## 5. ADMIN: APPROVE APPLICATION

### Approve application
```bash
curl -X PATCH http://localhost:5000/api/users/admin/seller-applications/application_id_123/approve \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{}'

# Expected Response:
# {
#   "success": true,
#   "message": "Application approved successfully",
#   "data": {
#     "application": {
#       "_id": "application_id_123",
#       "applicantUserId": "user_id_123",
#       "name": "John Doe",
#       "email": "john@example.com",
#       "phone": "+1-555-0123",
#       "businessName": "Tech Gadgets Store",
#       "category": "Electronics",
#       "businessDescription": "...",
#       "businessAddress": "123 Main St, New York, NY 10001",
#       "website": "https://techgadgets-example.com",
#       "status": "approved",  # CHANGED!
#       "rejectionReason": null,
#       "reviewedBy": "admin_user_id",  # FILLED!
#       "reviewedAt": "2026-08-24T11:00:00Z",  # FILLED!
#       "createdAt": "2026-08-24T10:30:00Z",
#       "updatedAt": "2026-08-24T11:00:00Z"
#     },
#     "user": {
#       "_id": "user_id_123",
#       "name": "John Doe",
#       "email": "john@example.com",
#       "role": "seller"  # CHANGED from "customer"!
#     }
#   }
# }
```

### Verify user role changed
```bash
# Login again with the approved user:
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'

# User role should now be "seller"!
# {
#   "success": true,
#   "message": "Login successful",
#   "data": {
#     "_id": "user_id_123",
#     "name": "John Doe",
#     "email": "john@example.com",
#     "role": "seller"  # <-- APPROVED!
#   },
#   "token": "..."
# }
```

---

## 6. ADMIN: REJECT APPLICATION

### Reject application with reason
```bash
curl -X PATCH http://localhost:5000/api/users/admin/seller-applications/application_id_123/reject \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "rejectionReason": "Business license verification failed. Please reapply with updated documents."
  }'

# Expected Response:
# {
#   "success": true,
#   "message": "Application rejected successfully",
#   "data": {
#     "_id": "application_id_123",
#     "applicantUserId": "user_id_123",
#     "name": "John Doe",
#     "email": "john@example.com",
#     "phone": "+1-555-0123",
#     "businessName": "Tech Gadgets Store",
#     "category": "Electronics",
#     "businessDescription": "...",
#     "businessAddress": "123 Main St, New York, NY 10001",
#     "website": "https://techgadgets-example.com",
#     "status": "rejected",  # CHANGED!
#     "rejectionReason": "Business license verification failed. Please reapply with updated documents.",  # FILLED!
#     "reviewedBy": "admin_user_id",  # FILLED!
#     "reviewedAt": "2026-08-24T11:05:00Z",  # FILLED!
#     "createdAt": "2026-08-24T10:30:00Z",
#     "updatedAt": "2026-08-24T11:05:00Z"
#   }
# }
```

### Verify user role did NOT change
```bash
# Login with the rejected user:
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'

# User role should STILL be "customer"!
# {
#   "success": true,
#   "message": "Login successful",
#   "data": {
#     "_id": "user_id_123",
#     "name": "John Doe",
#     "email": "john@example.com",
#     "role": "customer"  # <-- STILL CUSTOMER!
#   },
#   "token": "..."
# }
```

### Reject application without reason
```bash
curl -X PATCH http://localhost:5000/api/users/admin/seller-applications/application_id_123/reject \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{}' # or { "rejectionReason": null }

# Works fine, rejectionReason will be null
```

---

## ERROR SCENARIOS & RESPONSES

### No authentication token
```bash
curl -X GET http://localhost:5000/api/users/seller-applications/me

# Response (401):
# {
#   "success": false,
#   "message": "Authorization token missing or malformed"
# }
```

### Invalid/expired token
```bash
curl -X GET http://localhost:5000/api/users/seller-applications/me \
  -H "Authorization: Bearer invalid_token"

# Response (401):
# {
#   "success": false,
#   "message": "Invalid or expired token"
# }
```

### Seller trying to apply
```bash
# (as a user with role="seller")
curl -X POST http://localhost:5000/api/users/seller-applications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -d '{ ... }'

# Response (400):
# {
#   "success": false,
#   "message": "Only customers can apply to become sellers"
# }
```

### Non-admin trying to list applications
```bash
# (as a customer)
curl -X GET http://localhost:5000/api/users/admin/seller-applications \
  -H "Authorization: Bearer $CUSTOMER_TOKEN"

# Response (403):
# {
#   "success": false,
#   "message": "Forbidden: insufficient role"
# }
```

### Approving already-approved application
```bash
curl -X PATCH http://localhost:5000/api/users/admin/seller-applications/application_id_123/approve \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{}'

# Response (400):
# {
#   "success": false,
#   "message": "Application is already approved"
# }
```

### Approving non-existent application
```bash
curl -X PATCH http://localhost:5000/api/users/admin/seller-applications/invalid_id/approve \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{}'

# Response (404):
# {
#   "success": false,
#   "message": "Application not found"
# }
```

---

## POSTMAN COLLECTION SETUP

### Import Instructions
1. Open Postman
2. Create new Collection: "Seller Applications"
3. Create folders:
   - Auth
   - Customer
   - Admin

### Postman Environment Variables
```json
{
  "base_url": "http://localhost:5000",
  "customer_token": "",
  "admin_token": "",
  "application_id": ""
}
```

### Sample Requests
Set up requests in Postman with:
- Pre-request Scripts: Save tokens from login responses
- Tests: Verify status codes and save application IDs
- Authorization: Set header `Authorization: Bearer {{customer_token}}`

---

## QUICK TEST SEQUENCE

1. ✅ Signup as customer
2. ✅ Login as customer (save token)
3. ✅ Submit seller application
4. ✅ Check application status (GET /me)
5. ✅ Try duplicate application (should fail)
6. ✅ Login as admin (save token)
7. ✅ List all applications (should see 1)
8. ✅ Approve application
9. ✅ Login again as customer (should be seller now)
10. ✅ Create new customer, submit app, reject it
11. ✅ Check rejected user still customer

---

**All endpoints ready for testing!**
