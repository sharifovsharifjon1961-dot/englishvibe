import AccessControl "mo:caffeineai-authorization/access-control";
import Map "mo:core/Map";
import Principal "mo:core/Principal";

module {
  public type OldActor = {};

  // ---- Inlined content types (self-contained; no project imports) ----

  type CefrLevel = { #b1; #b2; #c1 };
  type Skill = { #reading; #listening; #speaking; #writing; #grammar; #vocabulary };
  type Timestamp = Int;
  type Id = Nat;

  type ChoiceQuestion = {
    id : Id;
    prompt : Text;
    options : [Text];
    correctIndex : Nat;
    explanation : Text;
  };

  type MatchingQuestion = {
    id : Id;
    prompt : Text;
    left : [Text];
    right : [Text];
    correctRightIndex : [Nat];
  };

  type TestQuestion = {
    id : Id;
    kind : { #choice; #matching };
    skill : Skill;
    choice : ?ChoiceQuestion;
    matching : ?MatchingQuestion;
  };

  type MockTest = {
    id : Id;
    title : Text;
    description : Text;
    kind : { #fullLength; #topicWise };
    level : CefrLevel;
    skill : Skill;
    durationSeconds : Nat;
    questions : [TestQuestion];
  };

  type ReadingPassage = {
    id : Id;
    title : Text;
    level : CefrLevel;
    body : Text;
    choiceQuestions : [ChoiceQuestion];
    matchingQuestions : [MatchingQuestion];
  };

  type ListeningItem = {
    id : Id;
    title : Text;
    level : CefrLevel;
    audioUrl : Text;
    transcript : Text;
    questions : [ChoiceQuestion];
  };

  type SpeakingCard = {
    id : Id;
    level : CefrLevel;
    prompt : Text;
    prepSeconds : Nat;
    speakSeconds : Nat;
    tips : Text;
  };

  type WritingPrompt = {
    id : Id;
    level : CefrLevel;
    title : Text;
    prompt : Text;
    minWords : Nat;
    maxWords : Nat;
    modelAnswer : Text;
  };

  type ExternalLink = {
    id : Id;
    title : Text;
    url : Text;
    category : Text;
    description : Text;
    level : ?CefrLevel;
  };

  type Announcement = {
    id : Id;
    title : Text;
    body : Text;
    createdAt : Timestamp;
  };

  type SavedWord = {
    word : Text;
    definition : Text;
    level : ?CefrLevel;
    savedAt : Timestamp;
  };

  type WritingDraft = {
    promptId : Id;
    text : Text;
    updatedAt : Timestamp;
  };

  // ---- New stable state shape ----

  public type ContentState = {
    tests : Map.Map<Nat, MockTest>;
    passages : Map.Map<Nat, ReadingPassage>;
    listening : Map.Map<Nat, ListeningItem>;
    speakingCards : Map.Map<Nat, SpeakingCard>;
    writingPrompts : Map.Map<Nat, WritingPrompt>;
    links : Map.Map<Nat, ExternalLink>;
    announcements : Map.Map<Nat, Announcement>;
    var nextId : Nat;
  };

  public type StudentState = {
    savedWords : Map.Map<Principal, Map.Map<Text, SavedWord>>;
    drafts : Map.Map<Principal, Map.Map<Nat, WritingDraft>>;
  };

  public type AdminState = {
    var passcodeHash : Text;
  };

  public type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    content : ContentState;
    student : StudentState;
    admin : AdminState;
  };

  public func migration(_ : OldActor) : NewActor {
    let content = {
      tests = Map.empty<Nat, MockTest>();
      passages = Map.empty<Nat, ReadingPassage>();
      listening = Map.empty<Nat, ListeningItem>();
      speakingCards = Map.empty<Nat, SpeakingCard>();
      writingPrompts = Map.empty<Nat, WritingPrompt>();
      links = Map.empty<Nat, ExternalLink>();
      announcements = Map.empty<Nat, Announcement>();
      var nextId = 0;
    };
    seed(content);
    {
      accessControlState = AccessControl.initState();
      content;
      student = {
        savedWords = Map.empty();
        drafts = Map.empty();
      };
      admin = { var passcodeHash = "" };
    };
  };

  // ---- Seed content (init-once, runs only on a fresh install) ----

  func nextId(state : ContentState) : Nat {
    let id = state.nextId;
    state.nextId := id + 1;
    id + 1;
  };

  func seed(state : ContentState) : () {
    for (t in seedTests().values()) {
      let id = nextId(state);
      state.tests.add(id, { t with id });
    };
    for (p in seedPassages().values()) {
      let id = nextId(state);
      state.passages.add(id, { p with id });
    };
    for (l in seedListening().values()) {
      let id = nextId(state);
      state.listening.add(id, { l with id });
    };
    for (c in seedSpeakingCards().values()) {
      let id = nextId(state);
      state.speakingCards.add(id, { c with id });
    };
    for (w in seedWritingPrompts().values()) {
      let id = nextId(state);
      state.writingPrompts.add(id, { w with id });
    };
    for (k in seedLinks().values()) {
      let id = nextId(state);
      state.links.add(id, { k with id });
    };
    for (a in seedAnnouncements().values()) {
      let id = nextId(state);
      state.announcements.add(id, { a with id });
    };
  };

  func seedTests() : [MockTest] {
    [
      {
        id = 0;
        title = "B1 Full-Length Mock Test 1";
        description = "A complete B1 practice paper covering reading, grammar and vocabulary.";
        kind = #fullLength;
        level = #b1;
        skill = #reading;
        durationSeconds = 3600;
        questions = [
          {
            id = 1;
            kind = #choice;
            skill = #grammar;
            choice = ?{
              id = 1;
              prompt = "She ____ to the gym every morning before work.";
              options = ["go", "goes", "going", "gone"];
              correctIndex = 1;
              explanation = "Third person singular present simple takes -es: she goes.";
            };
            matching = null;
          },
          {
            id = 2;
            kind = #choice;
            skill = #vocabulary;
            choice = ?{
              id = 2;
              prompt = "Choose the word closest in meaning to 'enormous'.";
              options = ["tiny", "huge", "quiet", "narrow"];
              correctIndex = 1;
              explanation = "'Enormous' means very large, i.e. huge.";
            };
            matching = null;
          },
          {
            id = 3;
            kind = #choice;
            skill = #reading;
            choice = ?{
              id = 3;
              prompt = "The notice says the library closes at 6 p.m. on weekdays. When does it close on Monday?";
              options = ["6 p.m.", "8 p.m.", "It is closed", "9 a.m."];
              correctIndex = 0;
              explanation = "Monday is a weekday, so the 6 p.m. closing time applies.";
            };
            matching = null;
          },
        ];
      },
      {
        id = 0;
        title = "B2 Full-Length Mock Test 1";
        description = "A full B2 paper with reading comprehension and use of English.";
        kind = #fullLength;
        level = #b2;
        skill = #reading;
        durationSeconds = 4200;
        questions = [
          {
            id = 1;
            kind = #choice;
            skill = #grammar;
            choice = ?{
              id = 1;
              prompt = "By the time we arrived, the film ____.";
              options = ["already started", "had already started", "has already started", "was already starting"];
              correctIndex = 1;
              explanation = "Past perfect marks the earlier of two past events.";
            };
            matching = null;
          },
          {
            id = 2;
            kind = #choice;
            skill = #vocabulary;
            choice = ?{
              id = 2;
              prompt = "The manager was reluctant to ____ the decision.";
              options = ["reverse", "revert", "revise", "revive"];
              correctIndex = 0;
              explanation = "To 'reverse a decision' means to change it to the opposite.";
            };
            matching = null;
          },
          {
            id = 3;
            kind = #matching;
            skill = #reading;
            choice = null;
            matching = ?{
              id = 3;
              prompt = "Match each sentence beginning with its natural ending.";
              left = ["Despite the rain,", "Unless you hurry,", "As soon as she arrived,"];
              right = ["we decided to walk.", "you will miss the train.", "she called her mother."];
              correctRightIndex = [0, 1, 2];
            };
          },
        ];
      },
      {
        id = 0;
        title = "B1 Reading Topic Test";
        description = "A short topic-wise test focused on reading comprehension at B1.";
        kind = #topicWise;
        level = #b1;
        skill = #reading;
        durationSeconds = 900;
        questions = [
          {
            id = 1;
            kind = #choice;
            skill = #reading;
            choice = ?{
              id = 1;
              prompt = "The email says the meeting has been postponed. What happened to the meeting?";
              options = ["It was cancelled", "It was moved to a later time", "It started early", "It was moved online"];
              correctIndex = 1;
              explanation = "'Postponed' means moved to a later time.";
            };
            matching = null;
          },
        ];
      },
      {
        id = 0;
        title = "B2 Listening Topic Test";
        description = "A topic-wise listening test at B2 with a short conversation.";
        kind = #topicWise;
        level = #b2;
        skill = #listening;
        durationSeconds = 900;
        questions = [
          {
            id = 1;
            kind = #choice;
            skill = #listening;
            choice = ?{
              id = 1;
              prompt = "Why does the woman suggest taking the train?";
              options = ["It is cheaper", "It is faster in traffic", "She dislikes driving", "The bus is full"];
              correctIndex = 1;
              explanation = "She says the train avoids the rush-hour traffic.";
            };
            matching = null;
          },
        ];
      },
      {
        id = 0;
        title = "C1 Grammar Topic Test";
        description = "A topic-wise grammar test at C1 with inversion and cleft structures.";
        kind = #topicWise;
        level = #c1;
        skill = #grammar;
        durationSeconds = 900;
        questions = [
          {
            id = 1;
            kind = #choice;
            skill = #grammar;
            choice = ?{
              id = 1;
              prompt = "Not only ____ the deadline, but she also improved the design.";
              options = ["she met", "did she meet", "she did meet", "met she"];
              correctIndex = 1;
              explanation = "After 'not only' at the start, use inversion: did she meet.";
            };
            matching = null;
          },
        ];
      },
      {
        id = 0;
        title = "C1 Vocabulary Topic Test";
        description = "A topic-wise vocabulary test at C1 with advanced collocations.";
        kind = #topicWise;
        level = #c1;
        skill = #vocabulary;
        durationSeconds = 900;
        questions = [
          {
            id = 1;
            kind = #choice;
            skill = #vocabulary;
            choice = ?{
              id = 1;
              prompt = "The proposal was met with ____ opposition from the board.";
              options = ["stark", "stiff", "steep", "stern"];
              correctIndex = 1;
              explanation = "'Stiff opposition' is the standard collocation.";
            };
            matching = null;
          },
        ];
      },
    ];
  };

  func seedPassages() : [ReadingPassage] {
    [
      {
        id = 0;
        title = "The Rise of Urban Gardening";
        level = #b1;
        body = "In many cities, people are turning unused rooftops and small balconies into gardens. Urban gardening lets residents grow vegetables and herbs close to home. It also cools buildings in summer and gives neighbours a reason to talk to one another. For beginners, the easiest plants are lettuce, mint and tomatoes, which need only a few hours of sunlight each day.";
        choiceQuestions = [
          {
            id = 1;
            prompt = "What is one benefit of urban gardening mentioned in the passage?";
            options = ["It makes buildings cooler", "It reduces rent", "It replaces parks", "It needs no sunlight"];
            correctIndex = 0;
            explanation = "The passage says it cools buildings in summer.";
          },
          {
            id = 2;
            prompt = "Which plants are recommended for beginners?";
            options = ["Roses and tulips", "Lettuce, mint and tomatoes", "Oak and pine", "Cactus and bamboo"];
            correctIndex = 1;
            explanation = "The passage names lettuce, mint and tomatoes.";
          },
        ];
        matchingQuestions = [
          {
            id = 3;
            prompt = "Match each place with what people use it for.";
            left = ["Rooftop", "Balcony", "Neighbourhood"];
            right = ["Growing herbs", "Meeting neighbours", "Small container garden"];
            correctRightIndex = [2, 0, 1];
          },
        ];
      },
      {
        id = 0;
        title = "Learning a Language as an Adult";
        level = #b2;
        body = "Adults often believe they cannot learn a new language as easily as children. Research suggests this is only partly true. Adults are usually faster at grammar and vocabulary because they can study systematically. Children, however, tend to develop a more natural accent. The best results come from regular practice, speaking with others, and accepting that mistakes are part of the process.";
        choiceQuestions = [
          {
            id = 1;
            prompt = "According to the passage, what are adults usually better at?";
            options = ["Accent", "Grammar and vocabulary", "Listening only", "Nothing"];
            correctIndex = 1;
            explanation = "Adults are faster at grammar and vocabulary.";
          },
          {
            id = 2;
            prompt = "What does the passage say about mistakes?";
            options = ["They should be avoided", "They are part of learning", "They show failure", "They are rare"];
            correctIndex = 1;
            explanation = "The passage says mistakes are part of the process.";
          },
        ];
        matchingQuestions = [
          {
            id = 3;
            prompt = "Match each group with its typical strength.";
            left = ["Adults", "Children", "Everyone"];
            right = ["Natural accent", "Systematic study", "Regular practice"];
            correctRightIndex = [1, 0, 2];
          },
        ];
      },
      {
        id = 0;
        title = "The Future of Remote Work";
        level = #c1;
        body = "Remote work was once a rare privilege, but the last decade has normalised it across many industries. Advocates argue that it widens the talent pool and reduces commuting, while critics contend that it erodes team cohesion and blurs the boundary between work and rest. Most organisations now settle on a hybrid compromise, though the precise balance remains contested.";
        choiceQuestions = [
          {
            id = 1;
            prompt = "What do critics of remote work claim?";
            options = ["It widens the talent pool", "It erodes team cohesion", "It reduces commuting", "It raises salaries"];
            correctIndex = 1;
            explanation = "Critics say it erodes team cohesion.";
          },
          {
            id = 2;
            prompt = "What do most organisations now do?";
            options = ["Ban remote work", "Adopt a hybrid compromise", "Move fully remote", "Ignore the issue"];
            correctIndex = 1;
            explanation = "Most settle on a hybrid compromise.";
          },
        ];
        matchingQuestions = [
          {
            id = 3;
            prompt = "Match each term with its meaning in the passage.";
            left = ["Advocates", "Critics", "Hybrid"];
            right = ["Supporters", "Opponents", "A mix of office and remote"];
            correctRightIndex = [0, 1, 2];
          },
        ];
      },
      {
        id = 0;
        title = "A Short History of Coffee";
        level = #b1;
        body = "Coffee is said to have been discovered in Ethiopia, where a goat herder noticed his animals became lively after eating certain berries. From there it spread to the Arabian Peninsula, then to Europe, and eventually around the world. Today coffee is one of the most traded commodities on the planet, and cafes have become important social spaces.";
        choiceQuestions = [
          {
            id = 1;
            prompt = "Where is coffee said to have been discovered?";
            options = ["Ethiopia", "Italy", "Brazil", "India"];
            correctIndex = 0;
            explanation = "The passage says Ethiopia.";
          },
          {
            id = 2;
            prompt = "What happened to the goat herder's animals?";
            options = ["They slept", "They became lively", "They ran away", "They got sick"];
            correctIndex = 1;
            explanation = "They became lively after eating the berries.";
          },
        ];
        matchingQuestions = [
          {
            id = 3;
            prompt = "Match each place with its role in the passage.";
            left = ["Ethiopia", "Arabian Peninsula", "Europe"];
            right = ["Where coffee spread next", "Where it was discovered", "Where it arrived later"];
            correctRightIndex = [1, 0, 2];
          },
        ];
      },
      {
        id = 0;
        title = "Why Sleep Matters";
        level = #b2;
        body = "Sleep is not simply a period of rest. During sleep the brain consolidates memories and the body repairs tissue. People who consistently sleep fewer than six hours are more likely to struggle with concentration and to fall ill. Good sleep habits include keeping a regular schedule, avoiding screens before bed, and keeping the bedroom cool and dark.";
        choiceQuestions = [
          {
            id = 1;
            prompt = "What does the brain do during sleep?";
            options = ["Consolidates memories", "Stops working", "Burns fat only", "Grows taller"];
            correctIndex = 0;
            explanation = "The brain consolidates memories during sleep.";
          },
          {
            id = 2;
            prompt = "Which is a good sleep habit?";
            options = ["Screens before bed", "Irregular schedule", "A cool dark room", "Late coffee"];
            correctIndex = 2;
            explanation = "The passage recommends a cool, dark bedroom.";
          },
        ];
        matchingQuestions = [
          {
            id = 3;
            prompt = "Match each habit with its effect.";
            left = ["Regular schedule", "No screens", "Cool dark room"];
            right = ["Easier to fall asleep", "Better sleep quality", "Steadier body clock"];
            correctRightIndex = [2, 0, 1];
          },
        ];
      },
      {
        id = 0;
        title = "The Economics of Recycling";
        level = #c1;
        body = "Recycling is often presented as an unqualified good, yet its economics are more nuanced. Collecting and sorting materials can cost more than the value of the recovered goods, and markets for recycled plastic fluctuate wildly. Effective policy therefore combines recycling with reduction and reuse, rather than treating it as a single solution to waste.";
        choiceQuestions = [
          {
            id = 1;
            prompt = "What does the passage say about the cost of recycling?";
            options = ["It is always profitable", "It can exceed the value of recovered goods", "It is free", "It is falling"];
            correctIndex = 1;
            explanation = "Collecting and sorting can cost more than the recovered value.";
          },
          {
            id = 2;
            prompt = "What does effective policy combine?";
            options = ["Only recycling", "Recycling with reduction and reuse", "Only landfill", "Only incineration"];
            correctIndex = 1;
            explanation = "It combines recycling with reduction and reuse.";
          },
        ];
        matchingQuestions = [
          {
            id = 3;
            prompt = "Match each term with its meaning.";
            left = ["Nuanced", "Fluctuate", "Recovered"];
            right = ["Collected back", "More complex than it seems", "Rise and fall"];
            correctRightIndex = [1, 2, 0];
          },
        ];
      },
      {
        id = 0;
        title = "Volunteering Abroad";
        level = #b1;
        body = "Many young people spend a summer volunteering abroad. They might teach English, help build schools, or work on conservation projects. The experience can be rewarding, but it also requires preparation: learning about local customs, respecting the community, and understanding that short visits rarely solve long-term problems.";
        choiceQuestions = [
          {
            id = 1;
            prompt = "What might volunteers do abroad?";
            options = ["Teach English", "Run a bank", "Build cars", "Sell houses"];
            correctIndex = 0;
            explanation = "The passage mentions teaching English.";
          },
          {
            id = 2;
            prompt = "What does the passage say about short visits?";
            options = ["They solve everything", "They rarely solve long-term problems", "They are useless", "They are illegal"];
            correctIndex = 1;
            explanation = "Short visits rarely solve long-term problems.";
          },
        ];
        matchingQuestions = [
          {
            id = 3;
            prompt = "Match each action with its purpose.";
            left = ["Learn local customs", "Respect the community", "Understand limits"];
            right = ["Avoid causing offence", "Be realistic", "Show cultural awareness"];
            correctRightIndex = [2, 0, 1];
          },
        ];
      },
      {
        id = 0;
        title = "The Art of Negotiation";
        level = #b2;
        body = "Skilled negotiators rarely begin with their final offer. Instead they explore what the other side values, ask open questions, and look for options that benefit both parties. Preparation matters more than clever tactics: knowing your own priorities and your limits makes it easier to stay calm and to recognise a good deal when it appears.";
        choiceQuestions = [
          {
            id = 1;
            prompt = "What do skilled negotiators avoid doing first?";
            options = ["Asking questions", "Making their final offer", "Listening", "Preparing"];
            correctIndex = 1;
            explanation = "They rarely begin with their final offer.";
          },
          {
            id = 2;
            prompt = "What matters more than clever tactics?";
            options = ["Preparation", "Loudness", "Speed", "Luck"];
            correctIndex = 0;
            explanation = "Preparation matters more than clever tactics.";
          },
        ];
        matchingQuestions = [
          {
            id = 3;
            prompt = "Match each behaviour with its benefit.";
            left = ["Open questions", "Knowing your limits", "Looking for mutual gain"];
            right = ["Staying calm", "Better outcomes for both", "Learning what matters"];
            correctRightIndex = [2, 0, 1];
          },
        ];
      },
    ];
  };

  func seedListening() : [ListeningItem] {
    [
      {
        id = 0;
        title = "At the Train Station";
        level = #b1;
        audioUrl = "https://cdn.freesound.org/previews/000/000/000/audio-b1-station.mp3";
        transcript = "Announcement: The 9:15 service to Manchester is delayed by twenty minutes. We apologise for the inconvenience. Passengers for Manchester should wait on platform four.";
        questions = [
          {
            id = 1;
            prompt = "How long is the delay?";
            options = ["Ten minutes", "Twenty minutes", "Thirty minutes", "One hour"];
            correctIndex = 1;
            explanation = "The announcement says twenty minutes.";
          },
          {
            id = 2;
            prompt = "Which platform should passengers use?";
            options = ["Platform two", "Platform four", "Platform nine", "Platform fifteen"];
            correctIndex = 1;
            explanation = "Passengers should wait on platform four.";
          },
        ];
      },
      {
        id = 0;
        title = "A Job Interview";
        level = #b2;
        audioUrl = "https://cdn.freesound.org/previews/000/000/000/audio-b2-interview.mp3";
        transcript = "Interviewer: So, why do you want to work here? Candidate: I have followed your company for years, and I admire how you invest in training. I also want to work on larger projects than my current role allows.";
        questions = [
          {
            id = 1;
            prompt = "Why does the candidate admire the company?";
            options = ["Its location", "Its investment in training", "Its salary", "Its size"];
            correctIndex = 1;
            explanation = "The candidate admires how the company invests in training.";
          },
          {
            id = 2;
            prompt = "What does the candidate want to do?";
            options = ["Work on larger projects", "Travel less", "Earn more", "Change industry"];
            correctIndex = 0;
            explanation = "The candidate wants to work on larger projects.";
          },
        ];
      },
      {
        id = 0;
        title = "A University Lecture";
        level = #c1;
        audioUrl = "https://cdn.freesound.org/previews/000/000/000/audio-c1-lecture.mp3";
        transcript = "Lecturer: Today we examine how urbanisation reshapes local economies. As cities expand, demand for housing intensifies, yet the supply of land is finite. This tension, rather than population growth alone, explains much of the recent rise in rents.";
        questions = [
          {
            id = 1;
            prompt = "What does the lecturer say explains the rise in rents?";
            options = ["Population growth alone", "The tension between demand and finite land", "Government policy", "Tourism"];
            correctIndex = 1;
            explanation = "The tension between demand and finite land explains it.";
          },
          {
            id = 2;
            prompt = "What is finite according to the lecture?";
            options = ["Demand", "The supply of land", "Rents", "Cities"];
            correctIndex = 1;
            explanation = "The supply of land is finite.";
          },
        ];
      },
      {
        id = 0;
        title = "A Weather Report";
        level = #b1;
        audioUrl = "https://cdn.freesound.org/previews/000/000/000/audio-b1-weather.mp3";
        transcript = "Forecaster: Good morning. Today will start cloudy, but the sun should appear by midday. Temperatures will reach around eighteen degrees. There is a small chance of rain in the evening, so keep an umbrella handy.";
        questions = [
          {
            id = 1;
            prompt = "When should the sun appear?";
            options = ["At dawn", "By midday", "In the evening", "Tomorrow"];
            correctIndex = 1;
            explanation = "The sun should appear by midday.";
          },
          {
            id = 2;
            prompt = "What is the forecaster's advice?";
            options = ["Wear a coat", "Keep an umbrella handy", "Stay indoors", "Wear sunglasses"];
            correctIndex = 1;
            explanation = "There is a chance of rain, so keep an umbrella handy.";
          },
        ];
      },
    ];
  };

  func seedSpeakingCards() : [SpeakingCard] {
    [
      {
        id = 0;
        level = #b1;
        prompt = "Describe your typical day. What do you do in the morning, afternoon and evening?";
        prepSeconds = 60;
        speakSeconds = 120;
        tips = "Use time expressions such as 'first', 'then' and 'after that'. Keep sentences short and clear.";
      },
      {
        id = 0;
        level = #b1;
        prompt = "Talk about a place you like to visit. Where is it and why do you enjoy it?";
        prepSeconds = 60;
        speakSeconds = 120;
        tips = "Describe the place with adjectives and give at least two reasons you like it.";
      },
      {
        id = 0;
        level = #b1;
        prompt = "What kind of food do you enjoy? Describe a dish you can cook.";
        prepSeconds = 60;
        speakSeconds = 120;
        tips = "Name the ingredients and explain the steps in order.";
      },
      {
        id = 0;
        level = #b2;
        prompt = "Some people say technology makes us less social. Do you agree? Give reasons and examples.";
        prepSeconds = 90;
        speakSeconds = 180;
        tips = "State your opinion, give two reasons, and add a counter-argument.";
      },
      {
        id = 0;
        level = #b2;
        prompt = "Describe a difficult decision you had to make. How did you decide?";
        prepSeconds = 90;
        speakSeconds = 180;
        tips = "Use past tenses and linking words like 'however' and 'because'.";
      },
      {
        id = 0;
        level = #b2;
        prompt = "Should students learn a second language from an early age? Discuss the advantages and disadvantages.";
        prepSeconds = 90;
        speakSeconds = 180;
        tips = "Balance both sides and finish with a clear conclusion.";
      },
      {
        id = 0;
        level = #c1;
        prompt = "Evaluate the claim that remote work improves productivity. What evidence would you need to be convinced?";
        prepSeconds = 120;
        speakSeconds = 240;
        tips = "Use hedging language such as 'it could be argued' and 'the evidence suggests'.";
      },
      {
        id = 0;
        level = #c1;
        prompt = "Discuss how cities could become more sustainable. Propose two concrete measures and assess their feasibility.";
        prepSeconds = 120;
        speakSeconds = 240;
        tips = "Structure your answer: problem, proposal, feasibility, conclusion.";
      },
      {
        id = 0;
        level = #c1;
        prompt = "To what extent should governments regulate artificial intelligence? Consider both innovation and risk.";
        prepSeconds = 120;
        speakSeconds = 240;
        tips = "Define your terms, weigh competing values, and avoid absolute statements.";
      },
    ];
  };

  func seedWritingPrompts() : [WritingPrompt] {
    [
      {
        id = 0;
        level = #b1;
        title = "An Email to a Friend";
        prompt = "Write an email to a friend inviting them to visit your city. Suggest two activities and explain why they would enjoy them.";
        minWords = 80;
        maxWords = 120;
        modelAnswer = "Hi Sam,\n\nI hope you are well. I would love you to visit my city next month. We could visit the old market on Saturday morning, where you can try local food, and then walk along the river in the afternoon. I think you would enjoy the market because you love cooking. Let me know which weekend suits you.\n\nBest wishes,\nAlex";
      },
      {
        id = 0;
        level = #b1;
        title = "My Favourite Season";
        prompt = "Describe your favourite season of the year. Explain what you do during that season and why you like it.";
        minWords = 80;
        maxWords = 120;
        modelAnswer = "My favourite season is autumn. The weather is cool but not cold, and the leaves turn red and gold. I often go for long walks in the park and take photographs. I also enjoy drinking hot tea while reading. I like autumn because it feels calm after the busy summer, and the colours are beautiful.";
      },
      {
        id = 0;
        level = #b2;
        title = "Advantages of Public Transport";
        prompt = "Write an essay discussing the advantages and disadvantages of using public transport in large cities.";
        minWords = 150;
        maxWords = 220;
        modelAnswer = "Public transport offers clear advantages in large cities. It reduces traffic congestion and lowers air pollution, since a single bus can replace dozens of cars. It is also cheaper for commuters who would otherwise pay for fuel and parking. However, public transport can be crowded at peak times and unreliable in some regions, which discourages use. In conclusion, investment in frequent, affordable services is the best way to maximise the benefits while limiting the drawbacks.";
      },
      {
        id = 0;
        level = #b2;
        title = "A Memorable Journey";
        prompt = "Write a story about a journey that did not go as planned. Describe what happened and what you learned.";
        minWords = 150;
        maxWords = 220;
        modelAnswer = "We set off early, confident that the drive would take three hours. Two hours in, the engine began to rattle, and we pulled over at a small garage. The mechanic shook his head: the repair would take a day. Instead of complaining, we found a guesthouse and spent the evening talking to the owner, who told us stories about the valley. By the time the car was fixed, we had made a friend. I learned that a ruined plan can become the best part of a trip.";
      },
      {
        id = 0;
        level = #c1;
        title = "The Value of Failure";
        prompt = "Write an essay arguing for or against the idea that failure is a necessary part of success. Support your argument with reasoning and examples.";
        minWords = 220;
        maxWords = 320;
        modelAnswer = "It is tempting to treat failure as the opposite of success, yet the two are more closely related than that framing suggests. Failure supplies information that success rarely does: it reveals the limits of an approach and forces revision. Consider scientific research, where most experiments fail before a result is confirmed. That said, failure is only instructive when it is examined rather than repeated. The claim that failure is necessary therefore holds only when it is paired with reflection. Without that discipline, failure teaches nothing and success remains a matter of luck.";
      },
      {
        id = 0;
        level = #c1;
        title = "Technology and Attention";
        prompt = "Discuss the extent to which digital technology has changed the way people pay attention. Consider both benefits and costs.";
        minWords = 220;
        maxWords = 320;
        modelAnswer = "Digital technology has reshaped attention in ways that are neither wholly beneficial nor wholly harmful. On one hand, instant access to information allows people to pursue questions that would once have required a library visit, and collaboration across continents is now routine. On the other, the design of many platforms rewards frequent interruption, and sustained concentration can feel increasingly difficult. The crucial variable is not the technology itself but the habits built around it. Where users set boundaries, technology extends attention; where they do not, it fragments it.";
      },
    ];
  };

  func seedLinks() : [ExternalLink] {
    [
      { id = 0; title = "British Council LearnEnglish"; url = "https://learnenglish.britishcouncil.org/"; category = "Grammar"; description = "Free grammar, vocabulary and listening lessons graded by CEFR level."; level = ?#b1 },
      { id = 0; title = "Cambridge English Practice Papers"; url = "https://www.cambridgeenglish.org/learning-english/free-resources/"; category = "Mock Papers"; description = "Official sample papers for Cambridge exams."; level = ?#b2 },
      { id = 0; title = "BBC Learning English"; url = "https://www.bbc.co.uk/learningenglish"; category = "Listening"; description = "Audio and video lessons with transcripts."; level = ?#b1 },
      { id = 0; title = "Purdue OWL Writing Guide"; url = "https://owl.purdue.edu/owl/purdue_owl.html"; category = "Writing"; description = "Academic writing and citation guidance."; level = ?#c1 },
      { id = 0; title = "Vocabulary.com"; url = "https://www.vocabulary.com/"; category = "Vocabulary"; description = "Adaptive vocabulary practice and word lists."; level = ?#b2 },
      { id = 0; title = "TED Talks"; url = "https://www.ted.com/talks"; category = "Videos"; description = "Short talks with subtitles for advanced listening."; level = ?#c1 },
      { id = 0; title = "Project Gutenberg"; url = "https://www.gutenberg.org/"; category = "Reading"; description = "Free public-domain ebooks for extensive reading."; level = ?#b2 },
      { id = 0; title = "English Grammar in Use Resources"; url = "https://www.cambridge.org/gb/cambridgeenglish/catalog/grammar-vocabulary-and-pronunciation/english-grammar-use-5th-edition/resources"; category = "Grammar"; description = "Supplementary grammar exercises."; level = ?#b1 },
      { id = 0; title = "YouGlish"; url = "https://youglish.com/"; category = "Pronunciation"; description = "Hear words pronounced in real video contexts."; level = ?#b2 },
      { id = 0; title = "IELTS Liz"; url = "https://ieltsliz.com/"; category = "Mock Papers"; description = "Free IELTS practice materials and tips."; level = ?#c1 },
      { id = 0; title = "News in Levels"; url = "https://www.newsinlevels.com/"; category = "Reading"; description = "World news written at three difficulty levels."; level = ?#b1 },
      { id = 0; title = "Linguee Dictionary"; url = "https://www.linguee.com/"; category = "Vocabulary"; description = "Bilingual example sentences from real texts."; level = ?#b2 },
    ];
  };

  func seedAnnouncements() : [Announcement] {
    [
      { id = 0; title = "Welcome to CEFR Master"; body = "Explore mock tests, reading, listening, speaking and writing practice, all organised by CEFR level. Start with a topic-wise test to find your strengths."; createdAt = 0 },
      { id = 0; title = "New B2 Listening Set"; body = "A new B2 listening item, 'A Job Interview', is now available with a full transcript and question set."; createdAt = 0 },
      { id = 0; title = "Writing Feedback Tips"; body = "Remember to check the word counter against the target range before submitting a draft. Model answers are available for every prompt."; createdAt = 0 },
    ];
  };
};
