'use strict';
var Alexa = require('alexa-sdk');
var APP_ID = undefined;  // can be replaced with your app ID if publishing
var facts = require('./facts');
var GET_FACT_MSG_EN = [
    "Here's your fact: ",
    "Here you go: ",
    "One fact coming up: ",
    "Okay, I found this: ",
    "Here's one: ",
    "I don't have anything for that year, but here's a fact you might find interesting: "
]
// Test hooks - do not remove!
exports.GetFactMsg = GET_FACT_MSG_EN;
var APP_ID_TEST = "mochatest";  // used for mocha tests to prevent warning
// end Test hooks
/*
    TODO (Part 2) add messages needed for the additional intent
    TODO (Part 3) add reprompt messages as needed
*/
var languageStrings = {
    "en": {
        "translation": {
            "FACTS": facts.FACTS_EN,
            "SKILL_NAME": "My History Facts",  // OPTIONAL change this to a more descriptive name
            "GET_FACT_MESSAGE": GET_FACT_MSG_EN.slice(0,5), // Five intro messages to select from
            "GET_FACT_MESSAGE_YEAR_NOT_FOUND_RANDOM": GET_FACT_MSG_EN[5],  // When the year is not found
            "HELP_MESSAGE": "You can say tell me a fact, or, you can say exit... What can I help you with?",
            "HELP_REPROMPT": "What can I help you with?",
            "HELP_REPROMPT_FACTS": "To make a request, say give me a fact, or, give me a fact for 1932.",
            "STOP_MESSAGE": "Goodbye!"
        }
    }
};

exports.handler = function (event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    // set a test appId if running the mocha local tests
    if (event.session.application.applicationId == "mochatest") {
        alexa.appId = APP_ID_TEST
    }
    // To enable string internationalization (i18n) features, set a resources object.
    alexa.resources = languageStrings;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

/*
    TODO (Part 2) add an intent for specifying a fact by year named 'GetNewYearFactIntent'
    TODO (Part 2) provide a function for the new intent named 'GetYearFact' 
        that emits a randomized fact that includes the year requested by the user
        - if such a fact is not available, tell the user this and provide an alternative fact.
    TODO (Part 3) Keep the session open by providing the fact with :askWithCard instead of :tellWithCard
        - make sure the user knows that they need to respond
        - provide a reprompt that lets the user know how they can respond
    TODO (Part 3) Provide a randomized response for the GET_FACT_MESSAGE
        - add message to the array GET_FACT_MSG_EN
        - randomize this starting portion of the response for conversational variety
*/

var handlers = {
    'LaunchRequest': function () {
        this.emit('GetFact');
    },
    'GetNewFactIntent': function () {
        this.emit('GetFact');
    },
    'GetFact': function () {
        // Get a random fact from the facts list
        // Use this.t() to get corresponding language data
        var factArr = this.t('FACTS');
        var randomFact = randomPhrase(factArr);

        // Create speech output
        // Obtain list of fact prefix messages and randomly select one
        var prefixArr = this.t('GET_FACT_MESSAGE');
        var selectedPrefix = randomPhrase(prefixArr);
        var speechOutput = selectedPrefix + randomFact;
        // var reprompt = this.t('HELP_REPROMPT_FACTS');
        var reprompt = 'Reprompt 1.';
        // this.emit(':askWithCard', speechOutput, reprompt, this.t('SKILL_NAME'), randomFact)
        this.emit(':ask', speechOutput, reprompt)
    },
    'GetNewYearFactIntent': function () {
        //TODO your code here
        //
        // Load fact array:
        var factArr = this.t('FACTS');
        //
        // Get requested year from user input

        var requestedYear = this.event.request.intent.slots.FACT_YEAR.value;

        // Loop over factArr and create new array with entries from the requested year, if any.
        var yearBasedFactArr = extractYearBasedFacts(factArr, requestedYear);

        // if length of yearBasedFactArr >0, select a random fact from the array containing facts from that year only.
        if (yearBasedFactArr.length > 0) {
           // Choose a random fact from those that contain the requested year.
           var yearBasedFact = randomPhrase(yearBasedFactArr); 
           // Obtain list of fact prefix messages and randomly select one
           var prefixArr = this.t('GET_FACT_MESSAGE');
           var selectedPrefix = randomPhrase(prefixArr);
           var speechOutput = selectedPrefix + yearBasedFact;
           // var reprompt = this.t('HELP_REPROMPT_FACTS');
           var reprompt = 'Reprompt 2.';
           // this.emit(':askWithCard', speechOutput, reprompt, this.t('SKILL_NAME'), yearBasedFact);
           this.emit(':ask', speechOutput, reprompt);
        } else { 
           // otherwise load random fact
           var randomFact = randomPhrase(factArr);
           // Create speech output corresponding to this
           var speechOutput = this.t('GET_FACT_MESSAGE_YEAR_NOT_FOUND_RANDOM') + randomFact;
           // var reprompt = this.t('HELP_REPROMPT_FACTS');
           var reprompt = 'Reprompt 3.';
           // this.emit(':askWithCard', speechOutput, reprompt, this.t('SKILL_NAME'), randomFact);
           this.emit(':ask', speechOutput, reprompt);
        }
    },
    'AMAZON.HelpIntent': function () {
        var speechOutput = this.t("HELP_MESSAGE");
        var reprompt = this.t("HELP_MESSAGE");
        this.emit(':ask', speechOutput, reprompt);
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', this.t("STOP_MESSAGE"));
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', this.t("STOP_MESSAGE"));
    }
};

function randomPhrase(phraseArr) {
    // returns a random phrase
    // where phraseArr is an array of string phrases
    var i = 0;
    i = Math.floor(Math.random() * phraseArr.length);
    return (phraseArr[i]);
};

// Function to return array with facts based on a particular year, if they exist
function extractYearBasedFacts(factArr, requestedYear) {
    // Initialize return array
    var yearBasedFactArr = [];
    // scan over each fact, looking for matches with the requested year.  If one exists, add to return array
    var iFact;
    for (iFact = 0; iFact < factArr.length ; iFact++) {
        var currFact = factArr[iFact];
        if (currFact.indexOf(requestedYear) >= 0) {
            yearBasedFactArr.push(factArr[iFact]);
        }
    }
    return (yearBasedFactArr);
};
