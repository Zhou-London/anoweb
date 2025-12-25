# Mystery Code Setup Guide

This guide explains how to add mystery codes to the database that users can use to become administrators.

## Method 1: Using MySQL Command Line

Connect to your MySQL database and run:

```sql
INSERT INTO mystery_codes (code, is_used, created_at, updated_at) 
VALUES ('YOUR_SECRET_CODE_HERE', false, NOW(), NOW());
```

Example:
```sql
INSERT INTO mystery_codes (code, is_used, created_at, updated_at) 
VALUES ('ADMIN2024', false, NOW(), NOW());
```

## Method 2: Using Admin API Endpoint (If you're already an admin)

Once you have admin privileges, you can create new mystery codes via the API:

```bash
curl -X POST http://localhost:PORT/api/mystery-code/create \
  -H "Content-Type: application/json" \
  -d '{"code": "YOUR_SECRET_CODE_HERE"}' \
  --cookie "session_token=YOUR_SESSION_TOKEN"
```

## Method 3: Using Go Script

Create a file `add_mystery_code.go` in the project root:

```go
package main

import (
    "fmt"
    "log"
    "os"

    "anonchihaya.co.uk/src/models"
    "anonchihaya.co.uk/src/repositories"
    "github.com/joho/godotenv"
)

func main() {
    if len(os.Args) < 2 {
        log.Fatal("Usage: go run add_mystery_code.go <code>")
    }

    code := os.Args[1]

    err := godotenv.Load()
    if err != nil {
        log.Fatal("Error loading .env file")
    }

    DBUSER := os.Getenv("DBUSER")
    DBPASS := os.Getenv("DBPASS")
    DBHOST := os.Getenv("DBHOST")
    DBPORT := os.Getenv("DBPORT")
    DBNAME := os.Getenv("DBNAME")

    repositories.InitDatabase(DBUSER, DBPASS, DBHOST, DBPORT, DBNAME)

    mysteryCode := &models.MysteryCode{
        Code:   code,
        IsUsed: false,
    }

    if err := repositories.DB.Create(mysteryCode).Error; err != nil {
        log.Fatal("Failed to create mystery code:", err)
    }

    fmt.Printf("Mystery code '%s' created successfully!\n", code)
}
```

Run it:
```bash
go run add_mystery_code.go "YOUR_SECRET_CODE_HERE"
```

## How Users Redeem Codes

1. Users must be logged in
2. Navigate to Account page
3. Find the "Unlock Admin Access" section
4. Enter the mystery code
5. Click "Verify"
6. If valid, they will be granted admin privileges immediately

## Viewing All Codes (Admin Only)

```bash
curl http://localhost:PORT/api/mystery-code/list \
  --cookie "session_token=YOUR_ADMIN_SESSION_TOKEN"
```

## Notes

- Each code can only be used once
- Codes are case-sensitive
- Once a code is used, it's marked with `is_used=true` and linked to the user who used it
- Only authenticated users can verify codes
- Codes never expire unless manually deleted from the database
