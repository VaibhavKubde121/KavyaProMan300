package com.team1.backend.service;

import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class SendGridEmailService {

    private final SendGrid sg;
    private final String fromEmail;

    public SendGridEmailService(@Value("${sendgrid.api.key}") String apiKey,
                                @Value("${sendgrid.from.email}") String fromEmail) {
        this.sg = new SendGrid(apiKey);
        this.fromEmail = fromEmail;
    }

    public boolean sendHtmlEmail(String toEmail, String subject, String htmlBody) {
        return sendHtmlEmail(toEmail, subject, htmlBody, null);
    }

    public boolean sendHtmlEmail(String toEmail, String subject, String htmlBody, String replyToEmail) {
        try {
            Email from = new Email(fromEmail);
            Email to = new Email(toEmail);
            Content content = new Content("text/html", htmlBody);
            Mail mail = new Mail(from, subject, to, content);
            if (replyToEmail != null && !replyToEmail.isBlank()) {
                mail.setReplyTo(new Email(replyToEmail));
            }

            Request request = new Request();
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());

            Response response = sg.api(request);
            int status = response.getStatusCode();
            return status >= 200 && status < 300;
        } catch (Exception ex) {
            ex.printStackTrace();
            return false;
        }
    }
}
