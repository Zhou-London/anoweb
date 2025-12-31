package util

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"net/smtp"
	"os"
)

// GenerateVerificationToken generates a random verification token
func GenerateVerificationToken() string {
	bytes := make([]byte, 32)
	rand.Read(bytes)
	return hex.EncodeToString(bytes)
}

// SendVerificationEmail sends an email verification link
func SendVerificationEmail(toEmail, token, frontendURL string) error {
	smtpHost := os.Getenv("SMTP_HOST")
	smtpPort := os.Getenv("SMTP_PORT")
	smtpUser := os.Getenv("SMTP_USER")
	smtpPass := os.Getenv("SMTP_PASS")
	fromEmail := os.Getenv("SMTP_FROM")

	// Skip sending email if SMTP not configured (development mode)
	if smtpHost == "" || smtpPort == "" {
		fmt.Printf("SMTP not configured, verification link: %s/verify-email?token=%s\n", frontendURL, token)
		return nil
	}

	verificationLink := fmt.Sprintf("%s/verify-email?token=%s", frontendURL, token)

	subject := "Verify Your Email Address"
	body := fmt.Sprintf(`
Hello,

Thank you for registering! Please verify your email address by clicking the link below:

%s

This link will expire in 24 hours.

If you did not create an account, please ignore this email.

Best regards,
The Team
`, verificationLink)

	message := []byte(fmt.Sprintf("From: %s\r\nTo: %s\r\nSubject: %s\r\n\r\n%s", fromEmail, toEmail, subject, body))

	auth := smtp.PlainAuth("", smtpUser, smtpPass, smtpHost)
	addr := fmt.Sprintf("%s:%s", smtpHost, smtpPort)

	err := smtp.SendMail(addr, auth, fromEmail, []string{toEmail}, message)
	if err != nil {
		// In development, just log and continue
		fmt.Printf("Failed to send email (continuing anyway): %v\n", err)
		return nil
	}

	return nil
}
