package util

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"net/smtp"

	"anonchihaya.co.uk/internal/config"
)

// GenerateVerificationToken generates a random verification token
func GenerateVerificationToken() string {
	bytes := make([]byte, 32)
	rand.Read(bytes)
	return hex.EncodeToString(bytes)
}

// SendVerificationEmail sends an email verification link
func SendVerificationEmail(toEmail, token, frontendURL string) error {
	emailConfig := config.LoadEmailConfig()

	// Skip sending email if SMTP not configured (development mode)
	if emailConfig.SMTPHost == "" || emailConfig.SMTPPort == "" {
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

	message := []byte(fmt.Sprintf("From: %s\r\nTo: %s\r\nSubject: %s\r\n\r\n%s", emailConfig.FromEmail, toEmail, subject, body))

	auth := smtp.PlainAuth("", emailConfig.SMTPUser, emailConfig.SMTPPass, emailConfig.SMTPHost)
	addr := fmt.Sprintf("%s:%s", emailConfig.SMTPHost, emailConfig.SMTPPort)

	err := smtp.SendMail(addr, auth, emailConfig.FromEmail, []string{toEmail}, message)
	if err != nil {
		// In development, just log and continue
		fmt.Printf("Failed to send email (continuing anyway): %v\n", err)
		return nil
	}

	return nil
}
