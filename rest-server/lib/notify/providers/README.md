# About

Provide different ways of notifying the end users.

For email, the setting value for `EmailProvider` defines which implementation
to use to send the emails.  Then, that uses the `EmailProviderConnection`
setting to setup the connection for sending emails.

The available list of notification providers is specified in the
[contact](../../config/contact.js) configuration.  That also defines the
list of available email providers.

## Providers

Providers are a module that is a function that takes the setting object
(divided into public and private) and return an object that responds to
the method `send`:

```javascript
return provider.send({
  settings: settings,
  notifyData: notifyData,
  templateDir: templateDir,
  templateName: template,
  toDestination: toDestination,
  when: new Date()
});
```
This returns a `Promise`.

## Email Providers

Email providers are a module function that takes the EmailProviderConnection
as an argument, and returns an object that has a `send` method.  The
send method responds to:

```javascript
EmailProviderImpl.send({
  to: toEmail,
  subject: subject,
  text: text,
  html: html,
  from: settings.SiteFromEmail
});
```

This returns a `Promise`.
