require('dotenv').config();
const express = require('express');
const { ExpressAdapter } = require('ask-sdk-express-adapter');
const Alexa = require('ask-sdk-core');
const { GoogleGenAI } = require('@google/genai');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Google Gen AI with the API key from environment variables
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speakOutput = 'Bem-vindo ao assistente do Gemini! Você pode me fazer qualquer pergunta. O que você gostaria de saber?';

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  }
};

const AskGeminiIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AskGeminiIntent';
  },
  async handle(handlerInput) {
    const questionSlot = Alexa.getSlotValue(handlerInput.requestEnvelope, 'question');

    if (!questionSlot) {
      const speakOutput = "Desculpe, não entendi a pergunta. Você poderia repeti-la, por favor?";
      return handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt(speakOutput)
        .getResponse();
    }

    try {
      console.log(`Asking Gemini: ${questionSlot}`);

      // Call the Gemini model using the new SDK
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: questionSlot,
      });

      // Clean up Markdown or special characters so Alexa can read it better if needed
      // For simple text, standard response is fine
      let speakOutput = response.text || "Não foi possível obter uma resposta do Gemini.";

      // To prevent responses from being too long for Alexa to reasonably read,
      // you might want to truncate or ask Gemini to keep it brief in the prompt.

      return handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt('Você tem outra pergunta?')
        .getResponse();

    } catch (error) {
      console.error("Error calling Gemini API:", error);
      const speakOutput = "Desculpe, tive problemas para acessar o serviço Gemini. Por favor, tente novamente mais tarde.";
      return handlerInput.responseBuilder
        .speak(speakOutput)
        .getResponse();
    }
  }
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);
    return handlerInput.responseBuilder.getResponse();
  }
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.error(`Error handled: ${error.message}`);
    const speakOutput = 'Desculpe, tive problemas para fazer o que você pediu. Por favor, tente novamente.';

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  }
};

// Ensure standard intents like Help, Cancel, Stop are handled
const HelpIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speakOutput = 'Você pode me fazer qualquer pergunta e eu consultarei o Gemini para obter a resposta. Como posso ajudar?';
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  }
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
        || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speakOutput = 'Até logo!';
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .getResponse();
  }
};

const skillBuilder = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    AskGeminiIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(
    ErrorHandler
  );

const skill = skillBuilder.create();

// Create the express adapter.
// Note: For local debugging via Postman or without the official Alexa request signature,
// you need to set verifySignature and verifyTimestamp to false.
// When deploying to production or using the developer console, keep them enabled if possible,
// but often ngrok works with them enabled if configured correctly.
const adapter = new ExpressAdapter(skill, false, false);

// Expose the POST endpoint for Alexa to interact with
app.post('/alexa', adapter.getRequestHandlers());

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Alexa skill is running locally on port ${PORT}`);
  console.log(`Endpoint URL should route to: http://localhost:${PORT}/alexa`);
});
