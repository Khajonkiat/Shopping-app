package service

import (
	"fmt"
	"log"
	"net/smtp"
	"wiki-shopping-app/backend/config"
)

// SendResetEmail delivers a password-reset link to toEmail.
// If SMTP_HOST is not configured, the link is logged to stdout instead —
// the admin can retrieve it from server/Docker logs and forward it manually.
func SendResetEmail(cfg *config.Config, toEmail, resetURL string) error {
	if cfg.SMTPHost == "" {
		log.Printf("[password-reset] reset link for %s → %s", toEmail, resetURL)
		return nil
	}

	subject := "Shopping App — Password Reset"
	body := fmt.Sprintf(
		"Click the link below to reset your password:\n\n%s\n\nThis link expires in 1 hour.\nIf you did not request a reset, you can safely ignore this email.",
		resetURL,
	)
	msg := []byte(fmt.Sprintf(
		"To: %s\r\nFrom: %s\r\nSubject: %s\r\n\r\n%s",
		toEmail, cfg.SMTPUser, subject, body,
	))

	addr := cfg.SMTPHost + ":" + cfg.SMTPPort
	auth := smtp.PlainAuth("", cfg.SMTPUser, cfg.SMTPPass, cfg.SMTPHost)
	return smtp.SendMail(addr, auth, cfg.SMTPUser, []string{toEmail}, msg)
}
