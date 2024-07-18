var darkBackgroundColor = "#121212";
var emailPropertyName = 'forwardEmailAddress';

// Redirects first time users to email config window
function getContextualAddOn(e) {
  var userProperties = PropertiesService.getUserProperties();
  var emailAddress = userProperties.getProperty(emailPropertyName);
  
  if (!emailAddress) {
    return createEmailConfigCard();
  }
  return createPanicButtonCard();
}

// Email config window
function createEmailConfigCard() {
  var userProperties = PropertiesService.getUserProperties();
  var emailAddress = userProperties.getProperty(emailPropertyName);
  return CardService.newCardBuilder()
      .setHeader(CardService.newCardHeader()
          .setTitle("Configure Forward Email")
          .setSubtitle("Enter the email address to which you want to forward emails"))
      .addSection(CardService.newCardSection()
          .addWidget(CardService.newTextInput()
              .setFieldName('forwardEmail')
              .setTitle('Email Address')
              .setValue(emailAddress || '')
              .setHint('Enter email address here'))
          .addWidget(CardService.newButtonSet()
              .addButton(CardService.newTextButton()
                  .setText('Save')
                  .setOnClickAction(CardService.newAction()
                      .setFunctionName('saveEmailConfig')))))
      .build();
}

// Saves user input across sessions
function saveEmailConfig(e) {
  var email = e.formInput.forwardEmail;
  PropertiesService.getUserProperties().setProperty(emailPropertyName, email);
  return createPanicButtonCard();
}

// Main window
function createPanicButtonCard() {
  return CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader()
      .setTitle("Arcshields Panic Button")
      .setSubtitle("This add-on allows you to forward suspicious emails to the SOC and delete them from your inbox."))
    .addSection(CardService.newCardSection()
      .addWidget(CardService.newTextButton()
        .setBackgroundColor("#b51919")
        .setText('Panic Button')
        .setOnClickAction(CardService.newAction()
          .setFunctionName('createCommentInputCard'))))
    .addSection(CardService.newCardSection()
      .addWidget(CardService.newTextButton()
        .setBackgroundColor("#80c8ff")
        .setText('Configure Forward Email')
        .setOnClickAction(CardService.newAction()
          .setFunctionName('createEmailConfigCard'))))
    .build();
}

// Window 2: additional comments
function createCommentInputCard(e) {
  var userProperties = PropertiesService.getUserProperties();
  var emailAddress = userProperties.getProperty(emailPropertyName);
  
  var card = CardService.newCardBuilder()
      .setHeader(CardService.newCardHeader()
        .setTitle('Additional info')
        .setSubtitle('Add any additional comments to be included at the top of the forwarded email'))
      .addSection(CardService.newCardSection()
          .addWidget(CardService.newTextInput()
              .setFieldName('userComment')
              .setTitle('Comments')))
      .addSection(CardService.newCardSection()
          .addWidget(CardService.newTextParagraph()
              .setText('This email will be forwarded to the SOC (' + emailAddress + ') and will be deleted from your inbox.'))
          .addWidget(CardService.newButtonSet()
              .addButton(CardService.newTextButton()
                  .setText('Next')
                  .setOnClickAction(CardService.newAction()
                      .setFunctionName('confirmForwardAndDelete')))))
      .build();

  return CardService.newUniversalActionResponseBuilder()
      .displayAddOnCards([card])
      .build();
}

// Confirmation window
function confirmForwardAndDelete(e) {
  var userComment = e.formInput.userComment || '';
  
  var card = CardService.newCardBuilder()
      .setHeader(CardService.newCardHeader()
        .setTitle('Confirm Action'))
      .addSection(CardService.newCardSection()
          .addWidget(CardService.newTextParagraph()
              .setText('Are you sure you want to forward this email and delete it from your inbox?'))
          .addWidget(CardService.newButtonSet()
              .addButton(CardService.newTextButton()
                  .setBackgroundColor("#1fb519")
                  .setText('Yes')
                  .setOnClickAction(CardService.newAction()
                      .setFunctionName('forwardAndDeleteEmail')
                      .setParameters({userComment: userComment})))
              .addButton(CardService.newTextButton()
                  .setBackgroundColor("#b51919")
                  .setText('No')
                  .setOnClickAction(CardService.newAction()
                      .setFunctionName('cancelAction')))))
      .build();

  return CardService.newUniversalActionResponseBuilder()
      .displayAddOnCards([card])
      .build();
}

// Forward & delete function
function forwardAndDeleteEmail(e) {
  var userProperties = PropertiesService.getUserProperties();
  var emailAddress = userProperties.getProperty(emailPropertyName);
  
  var messageId = e.messageMetadata.messageId;
  var message = GmailApp.getMessageById(messageId);
  var userComment = e.parameters.userComment || '';
  var senderDetails = extractEmailDetails(message.getFrom());
  var recipientEmail = Session.getActiveUser().getEmail();
  
  var commentPrefix = userComment ? '<b>User comment:</b> ' + userComment + '<br><br>' : '';
  var senderInfo = '<b>Sender:</b> ' + senderDetails + '<br>';
  var recipientInfo = '<b>Sent to:</b> ' + recipientEmail + '<br><br>------------------------<br><br>';
  var body = commentPrefix + senderInfo + recipientInfo + message.getBody();
  
  GmailApp.sendEmail(emailAddress, "Fwd: " + message.getSubject(), '', {
    htmlBody: body
  });
  
  GmailApp.moveMessageToTrash(message);
  
  var card = CardService.newCardBuilder()
      .setHeader(CardService.newCardHeader()
        .setTitle('Email Forwarded and Deleted'))
      .addSection(CardService.newCardSection()
          .addWidget(CardService.newTextParagraph()
              .setText('The selected email has been forwarded to ' + emailAddress + ' and deleted from your inbox.')))
      .addSection(CardService.newCardSection()
          .addWidget(CardService.newButtonSet()
            .addButton(CardService.newTextButton()
              .setText('Back')
                .setBackgroundColor("#80c8ff")
                .setOnClickAction(CardService.newAction()
                  .setFunctionName('getContextualAddOn')))))
      .build();
  
  return CardService.newUniversalActionResponseBuilder()
      .displayAddOnCards([card])
      .build();
}

// Additional function to retrieve some details from original sender
function extractEmailDetails(emailString) {
  var emailPattern = /<(.+)>/;
  var emailMatch = emailString.match(emailPattern);
  if (emailMatch) {
    var name = emailString.replace(emailPattern, '').trim();
    var email = emailMatch[1];
    return name ? name + ' (' + email + ')' : email;
  }
  return emailString;
}

function cancelAction(e) {
  return CardService.newUniversalActionResponseBuilder()
      .displayAddOnCards([createPanicButtonCard()])
      .build();
}
