package org.example.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Autowired
    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendTicketResolvedEmail(String to, Long ticketId, String ticketTitle) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("support@supportdesk.example.com");
            message.setTo(to);
            message.setSubject("Ticket Resolved: #" + ticketId + " - " + ticketTitle);
            message.setText("Hello,\n\n" +
                    "Your ticket #" + ticketId + " (\"" + ticketTitle + "\") has been marked as RESOLVED by our support team.\n\n" +
                    "If you still need assistance, you can reply to the ticket in your portal.\n\n" +
                    "Best regards,\n" +
                    "SupportDesk Team");

            mailSender.send(message);
            System.out.println("Email sent successfully to: " + to);
        } catch (Exception e) {
            System.err.println("Failed to send email to: " + to);
            e.printStackTrace();
        }
    }
}
