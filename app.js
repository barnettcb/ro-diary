(() => {
'use strict';

const APP_VERSION = '0.5.3-beta';
const DB_NAME = 'ro-diary-db-v2';
const LEGACY_DB_NAMES = ['ro-diary-db'];
const DB_VERSION = 1;
const PIN_ITERATIONS = 220000;
const BACKUP_ITERATIONS = 600000;
const AUTO_LOCK_MS = 5 * 60 * 1000;
const WEEK_START_DAY = 4; // Thursday

const DEFAULT_PRIVATE_TARGETS = [
  ['avoid-escape','Avoid / Escape Urge','Urge to get away from, end, postpone, or avoid an uncomfortable task, interaction, feeling, or situation.'],
  ['irritation','Irritation','Feeling annoyed, aggravated, frustrated, impatient, or angry. Rate the private experience, not whether it was expressed outwardly.'],
  ['activation','Physical Activation','Noticeable bodily activation such as tension, tightness, heat, faster speech, restlessness, or other signs of arousal.'],
  ['defend-explain','Defend / Explain Urge','Urge to defend yourself, explain your reasoning, correct the record, rebut, or prove a point.'],
  ['shame','Shame / Embarrassment','Feeling exposed, ashamed, embarrassed, inadequate, or socially diminished.'],
  ['criticism','Criticism / Judgment','Experience of interpreting an interaction as criticism, negative judgment, disapproval, or being viewed unfavorably.'],
  ['appease','Appease / Agree Urge','Urge to agree, placate, smooth over, or give in mainly to reduce tension or avoid conflict.']
].map(([id,label,definition], order) => ({id,label,definition,type:'scale',order}));

const DEFAULT_SOCIAL_TARGETS = [
  ['defensive-explaining','Defensive Explaining','Explaining, correcting, rebutting, or giving more detail in a way that functions as outward defensiveness.'],
  ['withdrawal','Withdrawal / Shutdown','Withdrawing, shutting down, ending engagement, becoming unavailable, or signaling that you want the interaction to stop.'],
  ['forceful-tone','Forceful Tone','Irritated, sharp, louder, faster, clipped, forceful, or otherwise tense delivery that may signal hostility or dominance.'],
  ['conflict-appeasing','Conflict Appeasing','Outwardly agreeing, yielding, placating, or signaling agreement mainly to reduce conflict rather than from genuine agreement.']
].map(([id,label,definition], order) => ({id,label,definition,type:'scale',order}));

const SCALE_ANCHORS = [
  '0 — Not present',
  '1 — Slight / low',
  '2 — Definitely present, but low level',
  '3 — Moderate',
  '4 — Severe / intense',
  '5 — Most extreme level for you'
];

const CLINICAL_DAILY_FIELDS = [
  {id:'suicideUrge', label:'Urge to Commit Suicide', type:'scale'},
  {id:'tookPrescribedMeds', label:'Take Prescribed Meds', type:'yn'},
  {id:'otherDrugsAlcohol', label:'Other Drugs & Alcohol', type:'yn'}
];

const THERAPY_PROCESS_FIELDS = [
  {id:'understood', label:'Feeling Understood by Therapist'},
  {id:'relevant', label:'Therapy Relevant to My Unique Problems'},
  {id:'rupture', label:'Alliance Rupture'},
  {id:'quitTherapy', label:'Urge to Quit Therapy'},
  {id:'giveUp', label:'Urge to Give Up'}
];

function blankClinicalDaily(){return {suicideUrge:null,tookPrescribedMeds:null,otherDrugsAlcohol:null};}
function blankTherapyProcess(){return {understood:null,relevant:null,rupture:null,quitTherapy:null,giveUp:null};}

const SKILLS = [
  {id:'definitely', name:'DEFinitely', lesson:1, reference:'Lesson 1 • Handout 1.2–1.3 • Worksheet 1.B', purpose:'A three-part radical-openness practice for moments when you notice distress, tension, resistance, or closedness.', useWhen:'Useful when you feel criticized, invalidated, irritated, judgmental, shut down, defensive, uncertain, or strongly pulled to avoid or fix the experience.', steps:[
    'D — Acknowledge the distress or unwanted private experience instead of immediately trying to get rid of it.',
    'E — Turn toward the discomfort with self-enquiry. Look for a useful question near your personal unknown rather than rushing to a reassuring answer.',
    'F — Respond flexibly and with humility based on what the situation and your values call for. Openness does not require automatic agreement or surrender.'
  ]},
  {id:'big3', name:'Big 3 + 1', lesson:3, reference:'Lesson 3 • Handout 3.1 • Worksheet 3.A', purpose:'Uses posture, breathing, facial expression, and eyebrow movement to help activate social safety and communicate openness.', useWhen:'Useful when your body feels guarded, tense, threat-focused, or socially closed.', steps:['Lean back rather than leaning forward into threat or control.','Take a slow, deep breath.','Use a small closed-mouth cooperative smile.','Add a brief eyebrow wag when appropriate to signal friendliness and openness.']},
  {id:'lkm', name:'Loving Kindness Meditation', lesson:4, reference:'Lesson 4 • Handout 4.1 • Worksheet 4.A', purpose:'Cultivates a warmer social-safety state by intentionally practicing goodwill toward yourself or another person.', useWhen:'Useful when resentment, threat, distance, or a cold/guarded stance is making openness difficult.', steps:['Settle attention and bring a person to mind.','Practice sincere wishes for ease, contentment, joy, and safety.','Notice resistance without forcing a feeling; repeatedly return to the practice.']},
  {id:'varies', name:'Flexible Mind VARIEs', lesson:5, reference:'Lesson 5 • Handout 5.1 • Worksheet 5.A', purpose:'Helps you try novel behavior instead of relying automatically on familiar routines, rehearsal, or avoidance.', useWhen:'Useful when excessive preparation, certainty-seeking, perfectionism, or habit is blocking new learning.', steps:['Visualize the new behavior and likely outcomes.','Check the accuracy of predictions and assumptions.','Relinquish unnecessary rehearsal or preparation.','Initiate the new behavior while supporting social safety.','Evaluate what actually happened and what you learned.']},
  {id:'sage', name:'Flexible Mind SAGE', lesson:8, reference:'Lesson 8 • Handout 8.4–8.5 • Worksheet 8.A', purpose:'Helps evaluate and respond to shame, embarrassment, rejection, and exclusion without automatically hiding, appeasing, attacking, or dismissing the emotion.', useWhen:'Useful after a social event that leaves you ashamed, embarrassed, rejected, or strongly self-conscious.', steps:['Use self-enquiry to examine what the emotion may be telling you.','Assess whether shame is warranted, partly warranted, or unwarranted.','When warranted, take responsibility and repair without collapsing or over-justifying.','When unwarranted, go opposite to hiding or unnecessary appeasement and signal openness appropriately.']},
  {id:'deep', name:'Flexible Mind Is DEEP', lesson:10, reference:'Lesson 10 • Handout 10.3 • Worksheet 10.A–10.B', purpose:'Uses valued goals to guide how openly and effectively you express emotion through social signals.', useWhen:'Useful when you know what you feel but are unsure how much to express, conceal, or communicate.', steps:['Determine the valued goal for the interaction.','Express emotion effectively rather than automatically inhibiting or exaggerating it.','Examine the interpersonal outcome and what your signals communicated.','Practice open expression repeatedly so it becomes more natural.']},
  {id:'fixed-kind', name:'Being Kind to Fixed Mind', lesson:11, reference:'Lesson 11 • Handout 11.2 • Worksheet 11.A', purpose:'Recognizes rigid, certain, or rule-bound states without attacking yourself for having them.', useWhen:'Useful when you feel absolutely certain, rigid, judgmental, or compelled to make the situation conform to a rule.', steps:['Notice the thoughts, emotions, sensations, and urges associated with Fixed Mind.','Name the state without trying to immediately fix it.','Respond to yourself with kindness while allowing space for new information.']},
  {id:'fatalistic-learn', name:'Learning from Fatalistic Mind', lesson:11, reference:'Lesson 11 • Handout 11.3', purpose:'Treats resignation, defeat, and giving-up responses as information to listen to rather than commands to obey.', useWhen:'Useful when you feel hopeless, numb, shut down, resigned, or convinced that effort is pointless.', steps:['Observe what Fatalistic Mind is saying and what you feel or want to do.','Acknowledge the state without fusing with it.','Listen for what may need attention or learning before choosing the next action.']},
  {id:'fatalistic-opposite', name:'Going Opposite to Fatalistic Mind', lesson:11, reference:'Lesson 11 • Worksheet 11.B', purpose:'Builds flexible action when resignation or giving up is driving behavior.', useWhen:'Useful when Fatalistic Mind is pulling you toward withdrawal, quitting, or passive surrender.', steps:['Describe the situation and the fatalistic response.','Acknowledge that Fatalistic Mind is present.','Choose a constructive action that goes opposite to the urge to give up when doing so fits the facts and your goals.']},
  {id:'awareness', name:'Awareness Continuum', lesson:12, reference:'Lesson 12 • Handout 12.1', purpose:'Practices describing immediate experience directly, without automatically explaining, justifying, or analyzing it.', useWhen:'Useful when analysis is outrunning awareness or you are having trouble identifying what is happening inside and around you.', steps:['Begin with “I am aware of…” and name what is actually present.','Move among sensations, thoughts, emotions, urges, and environmental details.','Keep descriptions close to experience rather than turning them into explanations or arguments.']},
  {id:'observe', name:'Observe Openly', lesson:12, reference:'Lesson 12 • Worksheet 12.A / 12.C', purpose:'Practices noticing inner and outer experience with openness to what is actually there.', useWhen:'Useful when attention has narrowed around a conclusion, threat, judgment, or plan.', steps:['Notice present-moment information inside and outside you.','Allow information to register before deciding what it means.','Return attention when the mind moves into automatic interpretation or control.']},
  {id:'describe', name:'Describe with Integrity', lesson:12, reference:'Lesson 12 • Handout 12.1 / Worksheet 12.C', purpose:'Puts observed experience into accurate words without using description as disguised justification.', useWhen:'Useful when you want to communicate or understand an experience without building a case for why you are right.', steps:['Describe observable facts and present internal experience.','Separate what you notice from the story you are telling about it.','Avoid adding explanations merely to defend, prove, or control.']},
  {id:'participate', name:'Participate Without Planning', lesson:12, reference:'Lesson 12 • Worksheet 12.B–12.C', purpose:'Practices entering ordinary experience more fully without excessive rehearsal, scripting, or control.', useWhen:'Useful when planning and preparation are keeping you from spontaneous participation.', steps:['Notice the urge to plan or rehearse.','Allow some uncertainty about what happens next.','Participate in the activity while responding to what actually unfolds.']},
  {id:'self-enquiry', name:'Self-Enquiry', lesson:13, reference:'Lesson 13 • Handout 13.1–13.3 • Worksheet 13.A', purpose:'Cultivates healthy self-doubt by looking for what you may be missing, avoiding, or unwilling to acknowledge.', useWhen:'Useful whenever certainty, defensiveness, tension, shame, resistance, or avoidance suggests there may be something to learn.', steps:['Notice the cue that you may be closing or resisting.','Ask a question that moves toward your edge or personal unknown.','Be suspicious of quick, self-protective answers; let learning emerge over time.','When appropriate, share what you discover rather than hiding fallibility.']},
  {id:'harsh-judgments', name:'Awareness of Harsh Judgments', lesson:14, reference:'Lesson 14 • Handout 14.2 • Worksheet 14.A', purpose:'Notices harsh judgments as mental events and uses them as possible openings for self-enquiry.', useWhen:'Useful when the mind is labeling yourself, another person, or a situation in rigid or contemptuous terms.', steps:['Notice the judgment without pretending it is not there.','Separate the judgment from direct observation.','Use self-enquiry to examine what the judgment may be protecting or what information you may be missing.']},
  {id:'one-mindful', name:'One-Mindful Awareness', lesson:14, reference:'Lesson 14 • Handout 14.1 • Worksheet 14.A', purpose:'Purposefully returns attention to the present activity rather than splitting attention across rehearsal, rumination, or distraction.', useWhen:'Useful when your attention is pulled into past arguments, future planning, or several competing tasks.', steps:['Choose what you are doing now.','Bring attention back to that activity when it wanders.','Participate without demanding perfect concentration.']},
  {id:'effective-humility', name:'Effectively and with Humility', lesson:14, reference:'Lesson 14 • Handout 14.1 • Worksheet 14.A', purpose:'Balances effective action with openness to being fallible and influenced by new information.', useWhen:'Useful when being correct, proving a point, or protecting status may be competing with what actually works.', steps:['Clarify what would be effective in the situation.','Remember that your perspective can be incomplete.','Choose behavior that serves the goal while signaling appropriate humility.']},
  {id:'pushbacks', name:'Identify Pushbacks & Don’t-Hurt-Me Responses', lesson:16, reference:'Lesson 16 • Handout 16.1–16.2', purpose:'Helps recognize indirect signals used to resist, control, protect, or discourage another person from continuing.', useWhen:'Useful when words sound cooperative but tone, withdrawal, sarcasm, silence, or other signals may communicate resistance.', steps:['Notice the outward signal and the private urge behind it.','Consider what you may be trying to prevent, control, or communicate indirectly.','Use self-enquiry before deciding how to respond.']},
  {id:'reveal', name:'Flexible Mind REVEALs', lesson:16, reference:'Lesson 16 • Worksheet 16.A', purpose:'Supports interpersonal integrity by examining hidden wishes for control and making communication more direct and open.', useWhen:'Useful when you notice pushback, indirect communication, concealed resentment, or a wish to control another person’s response.', steps:['Recognize the desire for control.','Examine the signals you are sending.','Reconnect with your values for the interaction.','Reveal relevant private experience more directly when appropriate.','Stay open to feedback and learning from the response.']},
  {id:'rocks-on', name:'Flexible Mind ROCKs ON', lesson:17, reference:'Lesson 17 • Handout 17.1 • Worksheet 17.C', purpose:'Organizes interpersonal choices around kindness, effectiveness, openness, and the needs of both people.', useWhen:'Useful when you are deciding how to respond in a relationship while also feeling an urge to control the outcome.', steps:['Resist automatic efforts to control.','Assess how open you want and need to be.','Clarify the priority goal.','Start from kindness toward self and other.','Consider the other person’s needs as well as your own.']},
  {id:'kindness', name:'Kindness First and Foremost', lesson:17, reference:'Lesson 17 • Worksheet 17.B', purpose:'Uses kindness as the default interpersonal stance when you are unsure how to respond.', useWhen:'Useful when irritation, mistrust, perfectionism, or resentment makes it easy to assume the worst or demand conformity.', steps:['Consider how you would want to be treated in the same situation.','Allow for the possibility that your perception is incomplete.','Choose a response that protects dignity and connection without requiring false agreement.']},
  {id:'proves', name:'Flexible Mind PROVEs', lesson:18, reference:'Lesson 18 • Worksheet 18.A', purpose:'Supports assertiveness that is clear about your needs while remaining open to the other person and to new information.', useWhen:'Useful when you need to ask, say no, set a limit, or address a problem without becoming rigid or overly appeasing.', steps:['Provide a clear description of the situation.','Reveal relevant emotions or private experience.','Consider the other person’s needs.','Use valued goals to guide what you ask for or say.','Return to self-enquiry if rigidity or defensiveness takes over.']},
  {id:'validates', name:'Flexible Mind Validates', lesson:19, reference:'Lesson 19 • Handout 19.1 • Worksheet 19.A', purpose:'Uses validation to communicate social inclusion and show that another person’s experience has been noticed and taken seriously.', useWhen:'Useful when understanding and connection matter, especially before moving into disagreement or problem solving.', steps:['Pay attention to what is actually being communicated.','Reflect accurately rather than mechanically agreeing.','Consider context and what makes the response understandable.','Signal trust, respect, and reciprocity at a level that fits the relationship.']},
  {id:'allows', name:'Flexible Mind ALLOWs', lesson:21, reference:'Lesson 21 • Handout 21.1 • Worksheet 21.A', purpose:'Helps approach intimacy and closeness with openness while respecting the actual relationship and your limits.', useWhen:'Useful when fear, mistrust, or overprotection is restricting appropriate closeness.', steps:['Assess your commitment to the relationship.','Look for evidence rather than relying only on fear.','Loosen the grip on protective predictions.','Share relevant personal information at an appropriate level.','Welcome feedback about the interaction.']},
  {id:'match1', name:'MATCH + 1', lesson:21, reference:'Lesson 21 • Handout 21.2–21.3', purpose:'Builds intimacy gradually by matching the other person’s level of disclosure and moving only slightly deeper when appropriate.', useWhen:'Useful when you want to build or improve a relationship without either over-disclosing or staying excessively distant.', steps:['Estimate the current intimacy level of the interaction.','Match the other person’s level of personal disclosure.','When the relationship supports it, move one small level deeper rather than making a large leap.']},
  {id:'adopts', name:'Flexible Mind ADOPTS', lesson:22, reference:'Lesson 22 • Handout 22.1–22.2 • Worksheet 22.A', purpose:'Provides a structured way to receive, examine, and respond to corrective feedback without automatically accepting or rejecting it.', useWhen:'Useful when feedback triggers defensiveness, shame, anger, dismissal, or an urge to prove the other person wrong.', steps:['Acknowledge that feedback was given.','Describe your internal response honestly.','Open to the possibility that some information may be useful.','Pinpoint a behavior to try when change appears warranted.','Try the behavior and evaluate what happens; soothe yourself as needed.']},
  {id:'dares', name:'Flexible Mind DARES', lesson:27, reference:'Lesson 27 • Worksheet 27.A', purpose:'Works with envy and resentment when they are pulling behavior away from valued goals or relationships.', useWhen:'Useful when another person’s success, status, or possessions trigger unhelpful comparison, anger, shame, or resentment.', steps:['Determine whether the envy is helping or harming you.','Admit the emotion rather than disguising it.','Recognize accompanying thoughts and urges.','When appropriate, go opposite to envy-driven anger or shame.']},
  {id:'light', name:'Flexible Mind Is LIGHT', lesson:28, reference:'Lesson 28 • Worksheet 28.A', purpose:'Addresses bitterness, cynicism, and resignation by moving toward engagement, contribution, and gratitude.', useWhen:'Useful when repeated hurt or disappointment has hardened into isolation, contempt, or giving up on people.', steps:['Label bitterness or cynicism when it is present.','Notice the intentions and urges that accompany it.','Go opposite to isolating when safe and appropriate.','Practice helping or contributing to others.','Notice what remains worthy of gratitude without denying genuine harm.']},
  {id:'heart', name:'Flexible Mind Has HEART', lesson:29, reference:'Lesson 29 • Handout 29.1–29.3 • Worksheet 29.A', purpose:'Supports forgiveness as a chosen process that can release ongoing control by past hurt without erasing boundaries or denying harm.', useWhen:'Useful when an old injury continues to dominate attention, identity, or present relationships.', steps:['Identify the hurt clearly.','Use self-enquiry to locate the edge around the injury.','Remember that forgiveness is a choice, not a requirement to trust or reconcile.','Reclaim parts of life that have been organized around the injury.','Make room for gratitude or meaning where it genuinely exists.']},
  {id:'urge-surfing', name:'Urge Surfing', lesson:5, reference:'Described in Lesson 5 • Handout 5.1', purpose:'Practices noticing an urge as a temporary experience without treating it as an instruction that requires immediate action.', useWhen:'Useful with urges to avoid, escape, rehearse, explain, correct, appease, plan compulsively, or otherwise act automatically.', steps:['Notice the urge and the sensations, thoughts, or images that come with it.','Allow the urge to rise and fall without trying to force it away.','Keep returning attention to present experience, such as breathing.','Choose whether to act after creating space rather than responding automatically.']},
  {id:'fixed-fatalistic', name:'Fixed / Fatalistic Mind Skills', lesson:11, reference:'Legacy combined entry • Lesson 11', purpose:'Legacy combined label retained so older diary entries continue to display correctly.', useWhen:'Use the more specific Fixed Mind or Fatalistic Mind skills above for new entries.', steps:['This combined item is retained for historical compatibility.']}
];

const DEFAULT_FOCUS_SKILLS = ['definitely','big3','lkm','sage','urge-surfing'];
const DEFAULT_SE_FOCUS = 'When I notice the urge to avoid doing my diary card, what do I notice as I sit with and surf the urge instead of immediately acting on it?';
const DEFAULT_HOMEWORK = 'Lesson 9 — Worksheet 9.A: Practicing Enhancing Facial Expressions';

const SE_CATEGORIES = [
  ['all','All Topics'],
  ['openness','Openness & Learning'],
  ['uncertainty','Uncertainty & Not Knowing'],
  ['defensiveness','Defensiveness & Self-Protection'],
  ['avoidance','Avoidance & Willingness'],
  ['control','Control, Rules & Flexibility'],
  ['vulnerability','Vulnerability & Exposure'],
  ['social','Social Signaling'],
  ['shame','Shame & Self-Consciousness'],
  ['connection','Connection & Relationships'],
  ['feedback','Feedback & Perspective'],
  ['appeasing','Appeasing & Conflict'],
  ['body','Body & Activation']
].map(([id,label])=>({id,label}));

const SE_PROMPTS = [
  ['openness','What might I be missing because I am certain I already understand this situation?'],
  ['openness','What information would be hardest for me to discover about my own part in this?'],
  ['openness','If my interpretation is incomplete, what else might be true?'],
  ['openness','What would I notice if I approached this as something to learn from rather than solve?'],
  ['openness','What part of another perspective am I most resistant to considering?'],
  ['uncertainty','What uncertainty am I trying to eliminate right now?'],
  ['uncertainty','What would happen if I allowed this question to remain unanswered for a while?'],
  ['uncertainty','What feels threatening about not knowing how this will turn out?'],
  ['uncertainty','What conclusion am I treating as fact because uncertainty feels uncomfortable?'],
  ['uncertainty','What could I learn if I did not rush to settle what this means?'],
  ['defensiveness','What am I trying to protect when I feel the urge to explain or correct?'],
  ['defensiveness','If I did not defend myself immediately, what would I fear might happen?'],
  ['defensiveness','What feels at stake when someone sees me differently than I see myself?'],
  ['defensiveness','What part of the feedback could contain useful information even if I disagree with the rest?'],
  ['defensiveness','What do I want the other person to understand about me, and what happens if they do not?'],
  ['avoidance','What experience am I trying not to have right now?'],
  ['avoidance','If I stay present for one minute longer, what do I notice?'],
  ['avoidance','What am I hoping will disappear if I postpone or leave this situation?'],
  ['avoidance','What is the smallest part of this discomfort I am willing to remain with?'],
  ['avoidance','Am I protecting myself from harm, or mainly from discomfort and uncertainty? What tells me that?'],
  ['control','What am I trying to control that may not actually be controllable?'],
  ['control','What feels risky about letting someone else handle this differently than I would?'],
  ['control','What would I lose if I loosened my preferred way of doing this?'],
  ['control','Where might efficiency or correctness be crowding out something else that matters?'],
  ['control','What rule am I following here, and is it useful in this situation?'],
  ['vulnerability','What feeling or admission would be hardest to say plainly right now?'],
  ['vulnerability','What would feel exposing if another person knew it?'],
  ['vulnerability','What softer feeling may be underneath the reaction I notice first?'],
  ['vulnerability','What do I fear another person might conclude about me?'],
  ['vulnerability','What would it be like to allow this feeling without fixing or explaining it?'],
  ['social','What might my face, voice, posture, or timing be communicating that my words are not?'],
  ['social','If someone only saw my behavior and could not hear my intentions, what might they reasonably conclude?'],
  ['social','What signal am I sending about whether I am open to influence?'],
  ['social','Did my behavior invite connection, distance, submission, or conflict? What makes me think that?'],
  ['social','What would a slightly warmer or more open signal look like without pretending to feel something I do not?'],
  ['shame','What judgment about myself am I tempted to treat as a fact?'],
  ['shame','What am I afraid this mistake or interaction says about who I am?'],
  ['shame','What would change if I could acknowledge embarrassment without hiding, attacking, or overexplaining?'],
  ['shame','What part of this experience makes me want to disappear, prove myself, or regain status?'],
  ['shame','Can I distinguish what I did from the global judgment I am making about myself?'],
  ['connection','What matters more to me in this moment: being understood, being right, protecting myself, or staying connected?'],
  ['connection','What would help another person experience me as available rather than defended?'],
  ['connection','What am I unwilling to risk in order to be more connected?'],
  ['connection','What kind of response would make room for both my perspective and someone else’s?'],
  ['connection','Where might I be waiting for the other person to change before I allow myself to act according to my own values?'],
  ['feedback','What part of this feedback do I most want to reject, and why?'],
  ['feedback','If I assumed there is something useful here without assuming it is all correct, what would I examine?'],
  ['feedback','What would make it easier for me to listen without deciding immediately whether the other person is right?'],
  ['feedback','Am I evaluating the feedback itself, or reacting to how it makes me feel about myself?'],
  ['feedback','What evidence supports my current view, and what evidence does not fit it?'],
  ['appeasing','What am I hoping to prevent by agreeing or smoothing this over?'],
  ['appeasing','If I expressed my actual view calmly, what outcome am I afraid of?'],
  ['appeasing','Am I signaling agreement because I agree, or because conflict feels costly?'],
  ['appeasing','What would honest engagement look like without either fighting or giving in?'],
  ['appeasing','What do I risk losing when I hide disagreement to keep the peace?'],
  ['body','What is my body doing before I have words for what I feel?'],
  ['body','Where do I notice the first small sign that I am becoming activated?'],
  ['body','What changes in my voice, face, breathing, or posture when I feel threatened?'],
  ['body','If I stop analyzing for a moment, what physical sensation is most noticeable?'],
  ['body','What urge appears alongside this sensation, and do I have to act on it?'],
  ["openness","Where am I treating familiarity with this situation as proof that there is nothing new to learn?"],
  ["openness","What would curiosity ask here that certainty does not ask?"],
  ["openness","If I temporarily set aside my preferred explanation, what becomes easier to notice?"],
  ["openness","What reaction in me suggests that this topic may be close to something I do not want to examine?"],
  ["openness","What could openness look like here without requiring me to agree with anyone?"],
  ["uncertainty","Which part of this situation am I trying to make predictable before I am willing to act?"],
  ["uncertainty","What would I do differently if I accepted that I may not get certainty before making a reasonable choice?"],
  ["uncertainty","What am I rehearsing because I hope preparation will remove discomfort?"],
  ["uncertainty","If two different explanations could both be partly true, what would they be?"],
  ["uncertainty","What am I afraid uncertainty will expose about me?"],
  ["defensiveness","What happens in my body in the few seconds before I begin defending my position?"],
  ["defensiveness","Am I trying to clarify something useful, or trying to make an uncomfortable judgment disappear?"],
  ["defensiveness","What would be left for me to feel if I stopped explaining for a moment?"],
  ["defensiveness","What part of my self-image feels most threatened in this interaction?"],
  ["defensiveness","If I could be misunderstood without immediately correcting it, what might I notice next?"],
  ["avoidance","What am I telling myself I need before I can face this, and is that actually necessary?"],
  ["avoidance","What is the cost of getting immediate relief from this discomfort?"],
  ["avoidance","If I approach instead of avoid, what is the smallest useful action I could take?"],
  ["avoidance","What part of this experience feels merely unpleasant, and what part may actually be unsafe?"],
  ["avoidance","What might I learn if I remain present without requiring the discomfort to improve first?"],
  ["control","What outcome am I trying to guarantee, and what part of it belongs to someone else?"],
  ["control","Which rule feels nonnegotiable here, and where did that rule come from?"],
  ["control","What would \u201cgood enough\u201d look like if perfect control were unavailable?"],
  ["control","Is my preferred method serving the goal, or has following the method become the goal?"],
  ["control","What could someone do differently from me and still do adequately or well?"],
  ["vulnerability","What would I say if I did not need to sound certain, strong, or fully composed?"],
  ["vulnerability","What need is present that I would rather translate into logic or criticism?"],
  ["vulnerability","What do I want another person to know that I am reluctant to reveal directly?"],
  ["vulnerability","What would feel most embarrassing to admit about why this matters to me?"],
  ["vulnerability","If I allowed myself to be affected by this without judging that reaction, what would I notice?"],
  ["social","What did I communicate with timing, silence, facial expression, or posture before I said anything?"],
  ["social","Did my signal match the level of warmth, seriousness, or vulnerability I actually intended?"],
  ["social","What might another person reasonably read into my expression even if that was not my intention?"],
  ["social","Where did I signal distance while hoping the other person would move closer?"],
  ["social","What small change in my nonverbal behavior could make my words easier to receive?"],
  ["shame","Am I trying to repair an actual mistake, or trying to erase the feeling of being imperfect?"],
  ["shame","What evidence would help me decide whether this shame is warranted, partly warranted, or not warranted?"],
  ["shame","If I made room for being fallible, what action would still matter?"],
  ["shame","What do I want to hide because I fear it will lower another person\u2019s opinion of me?"],
  ["shame","How might I take responsibility without turning one behavior into a judgment about my whole identity?"],
  ["connection","Where am I asking for closeness while also signaling that I do not want to be influenced?"],
  ["connection","What degree of openness fits this relationship rather than the degree that fear or urgency is pushing me toward?"],
  ["connection","What would genuine interest in the other person look like for the next few minutes?"],
  ["connection","What am I protecting that may also be keeping me distant?"],
  ["connection","If connection mattered slightly more than winning this exchange, what might change in my behavior?"],
  ["feedback","Can I separate the usefulness of the feedback from whether I like the way it was delivered?"],
  ["feedback","What specific behavior is being described, apart from any global judgment I hear in it?"],
  ["feedback","What part of the feedback can I test rather than immediately accept or reject?"],
  ["feedback","If I asked one question only to learn rather than rebut, what would I ask?"],
  ["feedback","What might the other person be seeing repeatedly that is difficult for me to see from inside myself?"],
  ["appeasing","What am I communicating by agreeing when my actual view is different?"],
  ["appeasing","What would respectful disagreement sound like if I did not need to eliminate tension?"],
  ["appeasing","Am I choosing peace, or avoiding the experience of another person being displeased with me?"],
  ["appeasing","What consequence am I predicting if I stay honest and engaged instead of giving in?"],
  ["appeasing","How could I remain kind without signaling agreement I do not actually feel?"],
  ["body","What is the earliest physical cue I can identify before my behavior becomes automatic?"],
  ["body","What sensation changes when I slow my breathing and stop preparing my response?"],
  ["body","If this tension could provide information rather than just a problem to remove, what might it be pointing toward?"],
  ["body","What does my body do when I move from curiosity into certainty or defense?"],
  ["body","Can I notice this activation for a few moments without deciding what it means yet?"]
].map((p, i) => ({id:`p${String(i+1).padStart(3,'0')}`, category:p[0], text:p[1]}));

let db = null;
let vaultKey = null;
let appState = {
  locked: true,
  setupNeeded: false,
  pinBuffer: '',
  pinStage: 'unlock',
  setupPinFirst: '',
  pinError: '',
  nav: 'today',
  page: null,
  profile: null,
  currentWeek: null,
  selectedDate: null,
  modal: null,
  currentPromptId: null,
  seCategory: 'all',
  hiddenAt: null,
  saveChain: Promise.resolve(),
  saveError: null,
  busy: false,
};

const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];
const enc = new TextEncoder();
const dec = new TextDecoder();

function uid() {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
function toDateOnly(d) {
  const y = d.getFullYear(); const m = String(d.getMonth()+1).padStart(2,'0'); const day=String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
}
function parseDateOnly(s) {
  const [y,m,d] = s.split('-').map(Number); return new Date(y,m-1,d,12,0,0,0);
}
function addDays(date, n) { const d=new Date(date); d.setDate(d.getDate()+n); return d; }
function getWeekStart(date, startDay=WEEK_START_DAY) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12);
  const diff = (d.getDay() - startDay + 7) % 7;
  d.setDate(d.getDate() - diff); return d;
}
function fmtDate(s, opts={month:'short',day:'numeric'}) { return parseDateOnly(s).toLocaleDateString(undefined,opts); }
function fmtDay(s) { return parseDateOnly(s).toLocaleDateString(undefined,{weekday:'short'}); }
function fmtLong(s) { return parseDateOnly(s).toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'}); }
function todayStr(){ return toDateOnly(new Date()); }
function arrToB64(arr) {
  const bytes = arr instanceof Uint8Array ? arr : new Uint8Array(arr);
  let s=''; const chunk=0x8000; for(let i=0;i<bytes.length;i+=chunk) s += String.fromCharCode(...bytes.subarray(i,i+chunk));
  return btoa(s);
}
function b64ToArr(s) { const bin=atob(s); const a=new Uint8Array(bin.length); for(let i=0;i<bin.length;i++) a[i]=bin.charCodeAt(i); return a; }
function randomBytes(n) { return crypto.getRandomValues(new Uint8Array(n)); }
function escapeHtml(s='') { return String(s).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }

function openDB() {
  return new Promise((resolve,reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const d=req.result;
      if(!d.objectStoreNames.contains('meta')) d.createObjectStore('meta');
      if(!d.objectStoreNames.contains('secure')) d.createObjectStore('secure');
      if(!d.objectStoreNames.contains('records')) d.createObjectStore('records');
    };
    req.onsuccess=()=>resolve(req.result); req.onerror=()=>reject(req.error);
  });
}
function idbGet(store,key){ return new Promise((resolve,reject)=>{const tx=db.transaction(store,'readonly'); const r=tx.objectStore(store).get(key); r.onsuccess=()=>resolve(r.result); r.onerror=()=>reject(r.error);}); }
function idbPut(store,key,val){ return new Promise((resolve,reject)=>{const tx=db.transaction(store,'readwrite'); tx.objectStore(store).put(val,key); tx.oncomplete=()=>resolve(); tx.onerror=()=>reject(tx.error);}); }
function idbDelete(store,key){ return new Promise((resolve,reject)=>{const tx=db.transaction(store,'readwrite'); tx.objectStore(store).delete(key); tx.oncomplete=()=>resolve(); tx.onerror=()=>reject(tx.error);}); }
function idbClear(store){ return new Promise((resolve,reject)=>{const tx=db.transaction(store,'readwrite'); tx.objectStore(store).clear(); tx.oncomplete=()=>resolve(); tx.onerror=()=>reject(tx.error);}); }

async function derivePinKey(pin, salt) {
  const base = await crypto.subtle.importKey('raw', enc.encode(pin), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:PIN_ITERATIONS,hash:'SHA-256'}, base, {name:'AES-GCM',length:256}, false, ['encrypt','decrypt']);
}
async function deriveBackupKey(password, salt) {
  const base = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:BACKUP_ITERATIONS,hash:'SHA-256'}, base, {name:'AES-GCM',length:256}, false, ['encrypt','decrypt']);
}
async function aesEncrypt(key, bytes, iv=randomBytes(12)) {
  const data = await crypto.subtle.encrypt({name:'AES-GCM',iv}, key, bytes);
  return {iv:new Uint8Array(iv), data:new Uint8Array(data)};
}
async function aesDecrypt(key, payload) {
  return new Uint8Array(await crypto.subtle.decrypt({name:'AES-GCM',iv:payload.iv}, key, payload.data));
}
async function encryptJson(obj) {
  if(!vaultKey) throw new Error('Vault is locked');
  const e=await aesEncrypt(vaultKey, enc.encode(JSON.stringify(obj)));
  return {v:1,iv:arrToB64(e.iv),data:arrToB64(e.data)};
}
async function decryptJson(payload) {
  if(!vaultKey) throw new Error('Vault is locked');
  const bytes=await aesDecrypt(vaultKey,{iv:b64ToArr(payload.iv),data:b64ToArr(payload.data)});
  return JSON.parse(dec.decode(bytes));
}
async function saveRecord(key,obj) { const payload=await encryptJson(obj); await idbPut('records',key,payload); }
async function loadRecord(key) { const p=await idbGet('records',key); return p ? decryptJson(p) : null; }

async function setupVault(pin) {
  const deviceKey = await crypto.subtle.generateKey({name:'AES-GCM',length:256}, false, ['encrypt','decrypt']);
  const rawVault = randomBytes(32);
  const deviceWrap = await aesEncrypt(deviceKey, rawVault);
  const pinSalt=randomBytes(16); const pinKey=await derivePinKey(pin,pinSalt);
  const inner = enc.encode(JSON.stringify({iv:arrToB64(deviceWrap.iv),data:arrToB64(deviceWrap.data)}));
  const pinWrap=await aesEncrypt(pinKey,inner);
  await idbPut('secure','deviceKey',deviceKey);
  await idbPut('secure','vaultWrap',{
    pinSalt:arrToB64(pinSalt), pinIv:arrToB64(pinWrap.iv), pinData:arrToB64(pinWrap.data)
  });
  await idbPut('meta','failedAttempts',{count:0,nextAllowedAt:0});
  vaultKey=await crypto.subtle.importKey('raw',rawVault,{name:'AES-GCM'},false,['encrypt','decrypt']);
  rawVault.fill(0);
  await initializeFreshData();
}

async function unlockVault(pin) {
  const attempts = await idbGet('meta','failedAttempts') || {count:0,nextAllowedAt:0};
  if(Date.now() < attempts.nextAllowedAt) throw new Error(`Try again in ${Math.ceil((attempts.nextAllowedAt-Date.now())/1000)} seconds.`);
  try {
    const deviceKey=await idbGet('secure','deviceKey'); const wrap=await idbGet('secure','vaultWrap');
    if(!deviceKey || !wrap) throw new Error('Vault setup is incomplete.');
    const pinKey=await derivePinKey(pin,b64ToArr(wrap.pinSalt));
    const innerBytes=await aesDecrypt(pinKey,{iv:b64ToArr(wrap.pinIv),data:b64ToArr(wrap.pinData)});
    const inner=JSON.parse(dec.decode(innerBytes));
    const rawVault=await aesDecrypt(deviceKey,{iv:b64ToArr(inner.iv),data:b64ToArr(inner.data)});
    vaultKey=await crypto.subtle.importKey('raw',rawVault,{name:'AES-GCM'},false,['encrypt','decrypt']);
    rawVault.fill(0);
    await idbPut('meta','failedAttempts',{count:0,nextAllowedAt:0});
    await loadAppData();
    return true;
  } catch (e) {
    vaultKey=null;
    const count=(attempts.count||0)+1;
    let delay=0; if(count>=5) delay=Math.min(300000, 5000 * Math.pow(2, Math.min(count-5,6)));
    await idbPut('meta','failedAttempts',{count,nextAllowedAt:Date.now()+delay});
    throw new Error(delay ? `Incorrect passcode. Try again in ${Math.ceil(delay/1000)} seconds.` : 'Incorrect passcode.');
  }
}

function buildNewWeek(startDate, previous=null) {
  const start=typeof startDate==='string'?parseDateOnly(startDate):startDate; const end=addDays(start,6);
  const id=uid(); const days={}; const now=new Date().toISOString();
  for(let i=0;i<7;i++){ const ds=toDateOnly(addDays(start,i)); days[ds]={date:ds,ratings:{},clinical:blankClinicalDaily(),skills:[],events:[],completed:false,completedAt:null,modifiedAt:now}; }
  return {
    id,startDate:toDateOnly(start),endDate:toDateOnly(end),
    privateTargets:structuredClone(previous?.privateTargets || DEFAULT_PRIVATE_TARGETS),
    socialTargets:structuredClone(previous?.socialTargets || DEFAULT_SOCIAL_TARGETS),
    focusSkills:[...(previous?.focusSkills || DEFAULT_FOCUS_SKILLS)],
    weeklySEFocus:previous?.weeklySEFocus || DEFAULT_SE_FOCUS,
    homework:previous?.homework || DEFAULT_HOMEWORK,
    valuedGoal:previous?.valuedGoal || '',
    majorOCTheme:'', majorOCThemeEnabled:!!previous?.majorOCThemeEnabled,
    therapyProcessEnabled:!!previous?.therapyProcessEnabled, therapyProcess:blankTherapyProcess(),
    riskTrackingEnabled:!!previous?.riskTrackingEnabled,
    savedSEPrompts:[], newSEQuestions:[], days, archived:false,
    setupStatus:previous?'pending':'confirmed', setupConfirmedAt:previous?null:now,
    createdAt:now,modifiedAt:now
  };
}

async function initializeFreshData() {
  const start=getWeekStart(new Date(),WEEK_START_DAY); const week=buildNewWeek(start);
  const profile={
    version:3,therapyWeekStart:WEEK_START_DAY,currentWeekId:week.id,weekIds:[week.id],
    pdfName:'Brooke',lastBackupAt:null,createdAt:new Date().toISOString(),modifiedAt:new Date().toISOString(),
    favoritePromptIds:[],notUsefulPromptIds:[],recentPromptIds:[],myQuestions:[]
  };
  await saveRecord('profile',profile); await saveRecord(`week:${week.id}`,week);
  appState.profile=profile; appState.currentWeek=week; appState.selectedDate=todayStr();
}

async function loadAppData() {
  const profile=await loadRecord('profile'); if(!profile) throw new Error('Profile could not be loaded.');
  appState.profile=profile;
  profile.favoritePromptIds=Array.isArray(profile.favoritePromptIds)?profile.favoritePromptIds:[];
  profile.notUsefulPromptIds=Array.isArray(profile.notUsefulPromptIds)?profile.notUsefulPromptIds:[];
  profile.recentPromptIds=Array.isArray(profile.recentPromptIds)?profile.recentPromptIds:[];
  profile.myQuestions=Array.isArray(profile.myQuestions)?profile.myQuestions:[];
  let week=await loadRecord(`week:${profile.currentWeekId}`);
  const today=new Date(); const todayKey=todayStr(); const expectedStart=getWeekStart(today,profile.therapyWeekStart ?? WEEK_START_DAY);
  let saveProfileNeeded=false; let saveWeekNeeded=false;
  if(!week || parseDateOnly(week.endDate) < parseDateOnly(todayKey)) {
    const prev=week || (profile.weekIds.length ? await loadRecord(`week:${profile.weekIds[profile.weekIds.length-1]}`) : null);
    if(prev) { prev.archived=true; prev.modifiedAt=new Date().toISOString(); await saveRecord(`week:${prev.id}`,prev); }
    week=buildNewWeek(expectedStart,prev);
    profile.currentWeekId=week.id; profile.weekIds.push(week.id); profile.modifiedAt=new Date().toISOString();
    await saveRecord(`week:${week.id}`,week); saveProfileNeeded=true;
  }
  week.savedSEPrompts=Array.isArray(week.savedSEPrompts)?week.savedSEPrompts:[];
  week.newSEQuestions=Array.isArray(week.newSEQuestions)?week.newSEQuestions:[];
  if(typeof week.majorOCThemeEnabled!=='boolean'){week.majorOCThemeEnabled=false;saveWeekNeeded=true;}
  if(typeof week.therapyProcessEnabled!=='boolean'){week.therapyProcessEnabled=false;saveWeekNeeded=true;}
  if(!week.therapyProcess || typeof week.therapyProcess!=='object'){week.therapyProcess=blankTherapyProcess();saveWeekNeeded=true;}
  else {for(const f of THERAPY_PROCESS_FIELDS){if(!Object.prototype.hasOwnProperty.call(week.therapyProcess,f.id)){week.therapyProcess[f.id]=null;saveWeekNeeded=true;}}}
  if(typeof week.riskTrackingEnabled!=='boolean'){week.riskTrackingEnabled=false;saveWeekNeeded=true;}
  for(const d of Object.values(week.days)){if(!d.clinical || typeof d.clinical!=='object'){d.clinical=blankClinicalDaily();saveWeekNeeded=true;}else{for(const f of CLINICAL_DAILY_FIELDS){if(!Object.prototype.hasOwnProperty.call(d.clinical,f.id)){d.clinical[f.id]=null;saveWeekNeeded=true;}}}}
  // One-time upgrade: prompt to review the current week's copied setup without changing any diary data.
  if((profile.version||1)<2){
    profile.version=3; saveProfileNeeded=true;
    if(!week.setupStatus){week.setupStatus='pending';week.setupConfirmedAt=null;saveWeekNeeded=true;}
  } else {
    if((profile.version||1)<3){profile.version=3;saveProfileNeeded=true;}
    if(!week.setupStatus){
      week.setupStatus='confirmed';week.setupConfirmedAt=week.createdAt||new Date().toISOString();saveWeekNeeded=true;
    }
  }
  if(saveWeekNeeded) await saveRecord(`week:${week.id}`,week);
  if(saveProfileNeeded) await saveRecord('profile',profile);
  appState.currentWeek=week;
  const eligible=Object.keys(week.days).sort().filter(d=>parseDateOnly(d)<=parseDateOnly(todayKey));
  appState.selectedDate=week.days[todayKey]?todayKey:(eligible.at(-1)||Object.keys(week.days).sort()[0]);
  if(week.setupStatus==='pending') appState.modal={type:'week-start'};
}

function queueSaveWeek() {
  const snapshot=structuredClone(appState.currentWeek); snapshot.modifiedAt=new Date().toISOString(); appState.currentWeek.modifiedAt=snapshot.modifiedAt;
  appState.saveChain=appState.saveChain.then(()=>saveRecord(`week:${snapshot.id}`,snapshot)).catch(e=>{appState.saveError=e.message; render();});
}
function queueSaveProfile() {
  const snapshot=structuredClone(appState.profile); snapshot.modifiedAt=new Date().toISOString(); appState.profile.modifiedAt=snapshot.modifiedAt;
  appState.saveChain=appState.saveChain.then(()=>saveRecord('profile',snapshot)).catch(e=>{appState.saveError=e.message; render();});
}

function lockApp() {
  vaultKey=null; appState.locked=true; appState.pinBuffer=''; appState.pinError=''; appState.profile=null; appState.currentWeek=null; appState.selectedDate=null; appState.modal=null; render();
}

function selectableDates(w=appState.currentWeek){
  if(!w) return [];
  const today=parseDateOnly(todayStr());
  return Object.keys(w.days).sort().filter(d=>parseDateOnly(d)<=today);
}
function selectedDateStr(){
  const w=appState.currentWeek; if(!w) return todayStr();
  const dates=selectableDates(w); const fallback=w.days[todayStr()]?todayStr():(dates.at(-1)||Object.keys(w.days).sort()[0]);
  if(!appState.selectedDate || !w.days[appState.selectedDate] || parseDateOnly(appState.selectedDate)>parseDateOnly(todayStr())) appState.selectedDate=fallback;
  return appState.selectedDate;
}
function getSelectedEntry() {
  const w=appState.currentWeek; if(!w) return null;
  return w.days[selectedDateStr()] || null;
}
function moveSelectedDay(delta){
  const dates=selectableDates(); if(!dates.length) return;
  const current=selectedDateStr(); const i=Math.max(0,dates.indexOf(current)); const next=Math.min(dates.length-1,Math.max(0,i+delta));
  appState.selectedDate=dates[next]; render();
}
function targetValue(day,id){ return Object.prototype.hasOwnProperty.call(day.ratings,id) ? day.ratings[id] : null; }
function updateCompletionUi(day){
  const state=$('#completion-state');
  if(state) state.innerHTML=day.completed?`<div class="notice success-notice">Completed ${new Date(day.completedAt).toLocaleString()}</div>`:'';
  const btn=$('#complete-day-btn');
  if(btn) btn.textContent=day.completed?'Review Completion':(day.date===todayStr()?'Complete Today':`Complete ${fmtDay(day.date)}`);
  const pill=$('.topbar .status-pill');
  if(pill && appState.nav==='today' && !appState.page) pill.textContent=day.completed?`${day.date===todayStr()?'Today':fmtDay(day.date)} complete`:'Private • Local';
}
function setTargetValue(day,id,val){
  day.ratings[id]=val;
  day.modifiedAt=new Date().toISOString();
  if(day.completed){day.completed=false;day.completedAt=null;}
  queueSaveWeek();
  // Keep the Today screen completely still while rating. Update only the tapped target.
  $$(`[data-target="${CSS.escape(id)}"]`).forEach(btn=>{
    let btnVal=btn.dataset.value;
    if(btnVal==='true') btnVal=true; else if(btnVal==='false') btnVal=false; else btnVal=Number(btnVal);
    btn.classList.toggle('selected', btnVal===val);
  });
  updateCompletionUi(day);
}
function clinicalValue(day,id){return day.clinical && Object.prototype.hasOwnProperty.call(day.clinical,id)?day.clinical[id]:null;}
function setClinicalValue(day,id,val){
  day.clinical=day.clinical||blankClinicalDaily();day.clinical[id]=val;day.modifiedAt=new Date().toISOString();
  if(day.completed){day.completed=false;day.completedAt=null;}queueSaveWeek();
  $$(`[data-clinical-target="${CSS.escape(id)}"]`).forEach(btn=>{let v=btn.dataset.value;if(v==='true')v=true;else if(v==='false')v=false;else v=Number(v);btn.classList.toggle('selected',v===val);});
  updateCompletionUi(day);
}
function setTherapyProcessValue(id,val){
  const w=appState.currentWeek;w.therapyProcess=w.therapyProcess||blankTherapyProcess();w.therapyProcess[id]=val;queueSaveWeek();
  $$(`[data-process-target="${CSS.escape(id)}"]`).forEach(btn=>{const v=Number(btn.dataset.value);btn.classList.toggle('selected',v===val);});
}
function skillById(id){ return SKILLS.find(s=>s.id===id); }
function skillName(id){ return skillById(id)?.name || id; }
function promptById(id){ return SE_PROMPTS.find(p=>p.id===id); }
function categoryLabel(id){ return SE_CATEGORIES.find(c=>c.id===id)?.label || id; }

function render(options={}) {
  const root=document.getElementById('app'); if(!root) return;
  const previousContent=root.querySelector('.content');
  const previousScrollTop=options.preserveScroll && previousContent ? previousContent.scrollTop : null;
  if(appState.setupNeeded || appState.locked){ root.innerHTML=renderLock(); bindLock(); return; }
  root.innerHTML=`${renderAppShell()}${renderModal()}${renderPrintReport()}`; bindApp();
  if(previousScrollTop!==null){
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      const content=root.querySelector('.content');
      if(content) content.scrollTop=previousScrollTop;
    }));
  }
}

function renderLock() {
  const setup=appState.setupNeeded;
  const title=setup ? (appState.pinStage==='confirm'?'Confirm Passcode':'Create Passcode') : 'RO Diary';
  const subtitle=setup ? (appState.pinStage==='confirm'?'Enter the same 4 digits again.':'Choose a 4-digit passcode for everyday access.') : 'Enter your 4-digit passcode';
  const dots=[0,1,2,3].map(i=>`<span class="pin-dot ${i<appState.pinBuffer.length?'filled':''}"></span>`).join('');
  return `<div class="lock-screen"><div class="lock-card">
    <div class="lock-title">${escapeHtml(title)}</div><div class="subtle">${escapeHtml(subtitle)}</div>
    <div class="pin-dots">${dots}</div>
    <div class="pin-grid">
      ${[1,2,3,4,5,6,7,8,9].map(n=>`<button class="pin-key" data-pin="${n}">${n}</button>`).join('')}
      <button class="pin-key" data-action="clear">Clear</button><button class="pin-key" data-pin="0">0</button><button class="pin-key" data-action="back">⌫</button>
    </div>
    ${appState.pinError?`<div class="error">${escapeHtml(appState.pinError)}</div>`:''}
    ${setup?`<div class="notice">If you forget this passcode, the local diary cannot be opened. Encrypted backups use a separate password.</div>`:''}
  </div></div>`;
}

function renderAppShell() {
  const w=appState.currentWeek; const day=getSelectedEntry();
  const nav=appState.nav;
  let body='';
  if(appState.page==='week-setup') body=renderWeekSetup();
  else if(appState.page==='setup-guide') body=renderSetupGuide();
  else if(appState.page==='archive') body=renderArchive();
  else if(appState.page==='skills') body=renderSkillsReference();
  else if(appState.page==='settings') body=renderSettings();
  else if(nav==='today') body=renderToday(day);
  else if(nav==='se') body=renderSE();
  else if(nav==='review') body=renderReview();
  else body=renderMore();
  const title=appState.page ? ({'week-setup':'Week Setup','setup-guide':'Setup Guide','archive':'Archive','skills':'RO Skills','settings':'Settings'}[appState.page]) : 'RO Diary';
  return `<div class="app-shell">
    <header class="topbar"><div class="topbar-row"><div class="brand">${title}</div><div class="status-pill">${day?.completed?`${day.date===todayStr()?'Today':fmtDay(day.date)} complete`:'Private • Local'}</div></div></header>
    <main class="content">${body}${appState.saveError?`<div class="notice">Save problem: ${escapeHtml(appState.saveError)}</div>`:''}</main>
    ${appState.page?'':renderNav(nav)}
  </div>`;
}
function renderNav(nav){ return `<nav class="bottom-nav"><div class="bottom-nav-inner">
  <button class="nav-btn ${nav==='today'?'active':''}" data-nav="today">Today</button>
  <button class="nav-btn ${nav==='se'?'active':''}" data-nav="se">Self-Enquiry</button>
  <button class="nav-btn ${nav==='review'?'active':''}" data-nav="review">Review</button>
  <button class="nav-btn ${nav==='more'?'active':''}" data-nav="more">More</button>
</div></nav>`; }

function renderTargetSection(kicker,title,targets,day) {
  return `<section class="card"><div class="card-header"><div class="section-kicker">${escapeHtml(kicker)}</div><div class="section-title">${escapeHtml(title)}</div></div><div class="card-body">
    ${targets.map(t=>renderTarget(t,day)).join('')}
  </div></section>`;
}
function renderTarget(t,day){ const val=targetValue(day,t.id);
  if(t.type==='yn') return `<div class="target-row"><div class="target-head"><button class="target-name" data-info="${t.id}">${escapeHtml(t.label)}</button><button class="info-btn" data-info="${t.id}">i</button></div><div class="scale yesno">
    <button class="score-btn ${val===false?'selected':''}" data-target="${t.id}" data-value="false">No</button><button class="score-btn ${val===true?'selected':''}" data-target="${t.id}" data-value="true">Yes</button></div></div>`;
  return `<div class="target-row"><div class="target-head"><button class="target-name" data-info="${t.id}">${escapeHtml(t.label)}</button><button class="info-btn" data-info="${t.id}">i</button></div><div class="scale">
    ${[0,1,2,3,4,5].map(n=>`<button class="score-btn ${val===n?'selected':''}" data-target="${t.id}" data-value="${n}">${n}</button>`).join('')}
  </div></div>`;
}

function renderDayNavigator(w,day){
  const dates=selectableDates(w); const idx=dates.indexOf(day.date); const todayAvailable=!!w.days[todayStr()];
  return `<div class="day-nav"><button class="btn day-nav-btn" data-action="day-prev" ${idx<=0?'disabled':''}>‹ Previous</button><button class="btn day-nav-btn" data-action="day-today" ${!todayAvailable?'disabled':''}>Today</button><button class="btn day-nav-btn" data-action="day-next" ${idx<0||idx>=dates.length-1?'disabled':''}>Next ›</button></div>`;
}

function renderClinicalDailyField(field,day){const val=clinicalValue(day,field.id);if(field.type==='yn')return `<div class="target-row"><div class="target-head"><div class="target-name">${escapeHtml(field.label)}</div></div><div class="scale yesno"><button class="score-btn ${val===false?'selected':''}" data-clinical-target="${field.id}" data-value="false">No</button><button class="score-btn ${val===true?'selected':''}" data-clinical-target="${field.id}" data-value="true">Yes</button></div></div>`;return `<div class="target-row"><div class="target-head"><div class="target-name">${escapeHtml(field.label)}</div></div><div class="scale">${[0,1,2,3,4,5].map(n=>`<button class="score-btn ${val===n?'selected':''}" data-clinical-target="${field.id}" data-value="${n}">${n}</button>`).join('')}</div></div>`;}
function renderClinicalDailySection(w,day){if(!w.riskTrackingEnabled)return '';return `<section class="card"><div class="card-header"><div class="section-kicker">Optional clinical tracking</div><div class="section-title">Risk, Medication & Substance</div></div><div class="card-body"><div class="subtle small">These fields mirror the optional Houston/Lynch-style diary-card items. Unanswered remains blank. RO Diary is not monitored and does not alert your therapist or emergency services.</div>${CLINICAL_DAILY_FIELDS.map(f=>renderClinicalDailyField(f,day)).join('')}</div></section>`;}
function renderProcessRatings(w){if(!w.therapyProcessEnabled)return '';const vals=w.therapyProcess||blankTherapyProcess();return `<section class="card"><div class="card-header"><div class="section-kicker">Before therapy</div><div class="section-title">Therapy Alliance & Process</div></div><div class="card-body"><div class="subtle small">Rate 0–5 just prior to the session, matching the Houston diary-card structure.</div>${THERAPY_PROCESS_FIELDS.map(f=>`<div class="target-row"><div class="target-head"><div class="target-name">${escapeHtml(f.label)}</div></div><div class="scale">${[0,1,2,3,4,5].map(n=>`<button class="score-btn ${vals[f.id]===n?'selected':''}" data-process-target="${f.id}" data-value="${n}">${n}</button>`).join('')}</div></div>`).join('')}</div></section>`;}

function renderToday(day) {
  const w=appState.currentWeek; if(!day) return '<div class="notice">No daily entry is available.</div>';
  const focusSkills=w.focusSkills.map(id=>SKILLS.find(s=>s.id===id)).filter(Boolean);
  return `${renderDayNavigator(w,day)}<h1 class="page-title">${escapeHtml(fmtLong(day.date))}</h1><div class="subtle">Therapy week ${fmtDate(w.startDate)} – ${fmtDate(w.endDate)}</div>
    ${day.date!==todayStr()?'<div class="notice history-notice">Viewing an earlier day. If you change a completed entry, it will become incomplete until you complete it again.</div>':''}
    ${renderClinicalDailySection(w,day)}
    ${renderTargetSection('What I noticed internally','Private Behaviors, Emotions & Urges',w.privateTargets,day)}
    ${renderTargetSection('What I signaled or did','Social Signals & Overt Behaviors',w.socialTargets,day)}
    <section class="card"><div class="card-header"><div class="section-kicker">Skills used</div></div><div class="card-body"><div class="checkbox-list">
      ${focusSkills.map(s=>`<div class="skill-select-row"><label class="check-row skill-check"><input type="checkbox" data-skill="${s.id}" ${day.skills.includes(s.id)?'checked':''}><span>${escapeHtml(s.name)}</span></label><button class="info-btn" aria-label="About ${escapeHtml(s.name)}" data-skill-info="${s.id}">i</button></div>`).join('')}
    </div><button class="btn soft wide" style="margin-top:10px" data-action="other-skill">+ Other RO Skill</button></div></section>
    <section class="card"><div class="card-header"><div class="section-kicker">Self-Enquiry focus</div></div><div class="card-body"><div>${escapeHtml(w.weeklySEFocus||'No weekly focus question entered.')}</div><div class="btn-row" style="margin-top:12px"><button class="btn soft" data-action="go-se">Give Me an SE Prompt</button><button class="btn" data-action="saved-questions">Saved Questions</button></div></div></section>
    <section class="card"><div class="card-header"><div class="section-kicker">Notes / Events</div></div><div class="card-body">
      ${day.events.length?day.events.map(e=>renderEvent(e)).join(''):'<div class="subtle">No events recorded today.</div>'}
      <button class="btn soft wide" style="margin-top:10px" data-action="add-event">+ Add Note / Event</button></div></section>
    <section class="card"><div class="card-body"><div id="completion-state">${day.completed?`<div class="notice success-notice">Completed ${new Date(day.completedAt).toLocaleString()}</div>`:''}</div><button id="complete-day-btn" class="btn primary wide" data-action="complete-day">${day.completed?'Review Completion':(day.date===todayStr()?'Complete Today':`Complete ${fmtDay(day.date)}`)}</button></div></section>`;
}
function renderEvent(e){return `<div class="event-card"><div class="event-context">${escapeHtml(e.context||'Event')}</div><div class="event-note">${escapeHtml(e.note||'')}</div>${e.discuss?'<div class="flag">★ Discuss in Therapy</div>':''}<div class="event-actions"><button class="btn" data-action="edit-event" data-event-id="${e.id}">Edit</button><button class="btn danger" data-action="delete-event" data-event-id="${e.id}">Delete</button></div></div>`;}

function choosePrompt(category=appState.seCategory) {
  const blocked=new Set(appState.profile.notUsefulPromptIds||[]);
  const recent=new Set(appState.profile.recentPromptIds||[]);
  let pool=SE_PROMPTS.filter(p=>!blocked.has(p.id) && (category==='all' || p.category===category));
  if(!pool.length) pool=SE_PROMPTS.filter(p=>!blocked.has(p.id));
  let fresh=pool.filter(p=>!recent.has(p.id) && p.id!==appState.currentPromptId);
  if(!fresh.length) fresh=pool.filter(p=>p.id!==appState.currentPromptId);
  const p=fresh[Math.floor(Math.random()*fresh.length)] || pool[0] || SE_PROMPTS[0];
  appState.currentPromptId=p.id;
  const next=[...(appState.profile.recentPromptIds||[]).filter(id=>id!==p.id),p.id].slice(-12);
  appState.profile.recentPromptIds=next; queueSaveProfile();
  return p;
}
function renderSE(){ const p=promptById(appState.currentPromptId)||choosePrompt(); const w=appState.currentWeek; const fav=appState.profile.favoritePromptIds.includes(p.id); const saved=w.savedSEPrompts.includes(p.id);
  return `<h1 class="page-title">Self-Enquiry</h1><section class="card"><div class="card-header"><div class="section-kicker">Weekly focus</div></div><div class="card-body">${escapeHtml(w.weeklySEFocus||'No weekly focus question.')}</div></section>
  <section class="card"><div class="card-header"><div class="section-kicker">Prompt generator</div><div class="section-title">One question at a time</div></div><div class="card-body"><div class="field"><label>Topic</label><select id="se-category">${SE_CATEGORIES.map(c=>`<option value="${c.id}" ${appState.seCategory===c.id?'selected':''}>${escapeHtml(c.label)}</option>`).join('')}</select></div><div class="prompt-category">${escapeHtml(categoryLabel(p.category))}</div><div class="prompt-box">${escapeHtml(p.text)}</div><div class="subtle" style="margin-top:8px">The aim is to find a useful question near something you do not fully know yet—not to force a quick answer.</div><div class="btn-row" style="margin-top:12px">
    <button class="btn primary" data-action="another-prompt">Another Prompt</button>
    <button class="btn ${saved?'soft':''}" data-action="save-prompt">${saved?'Saved This Week':'Save for This Week'}</button>
    <button class="btn ${fav?'soft':''}" data-action="favorite-prompt">${fav?'★ Favorite':'☆ Favorite'}</button>
    <button class="btn" data-action="reject-prompt">Not Useful</button></div></div></section>
  <section class="card"><div class="card-header"><div class="section-kicker">My questions</div></div><div class="card-body"><div class="list-row"><strong>Saved This Week</strong><span>${w.savedSEPrompts.length}</span></div><div class="list-row"><strong>Questions I Discovered This Week</strong><span>${w.newSEQuestions.length}</span></div><div class="list-row"><strong>Favorites</strong><span>${appState.profile.favoritePromptIds.length}</span></div><div class="list-row"><strong>My Question Library</strong><span>${appState.profile.myQuestions.length}</span></div><div class="btn-row" style="margin-top:10px"><button class="btn soft" data-action="saved-questions">View Questions</button><button class="btn" data-action="add-week-question">+ Question I Discovered</button><button class="btn" data-action="add-my-question">+ My Question</button></div></div></section>`;
}

function weekDates(w){ return Object.keys(w.days).sort(); }
function renderRatingsTable(targets,w){ const dates=weekDates(w); return `<div class="table-wrap"><table><thead><tr><th>Target</th>${dates.map(d=>`<th>${fmtDay(d)}</th>`).join('')}</tr></thead><tbody>${targets.map(t=>`<tr><td title="${escapeHtml(t.label)}">${escapeHtml(t.label)}</td>${dates.map(d=>{const v=targetValue(w.days[d],t.id); return `<td>${v===null?'—':typeof v==='boolean'?(v?'Y':'N'):v}</td>`;}).join('')}</tr>`).join('')}</tbody></table></div>`;}
function renderReview(){const w=appState.currentWeek; const dates=weekDates(w); const flagged=dates.flatMap(d=>w.days[d].events.filter(e=>e.discuss).map(e=>({...e,date:d}))); const skillMap={}; dates.forEach(d=>w.days[d].skills.forEach(s=>(skillMap[s]??=[]).push(fmtDay(d))));
 const needsBackup=!appState.profile.lastBackupAt || (Date.now()-new Date(appState.profile.lastBackupAt).getTime()>7*86400000);
 return `<h1 class="page-title">Weekly Review</h1><div class="subtle">${fmtDate(w.startDate)} – ${fmtDate(w.endDate)}</div>${needsBackup?'<div class="notice">A current encrypted backup is recommended this week.</div>':''}
 <section class="card"><div class="card-header"><div class="section-kicker">Completion</div></div><div class="card-body"><div class="btn-row">${dates.map(d=>`<span class="status-pill">${fmtDay(d)} ${w.days[d].completed?'✓':'○'}</span>`).join('')}</div></div></section>
 ${w.riskTrackingEnabled?`<section class="card"><div class="card-header"><div class="section-kicker">Risk, medication & substance</div></div><div class="card-body"><div class="table-wrap"><table><thead><tr><th>Field</th>${dates.map(d=>`<th>${fmtDay(d)}</th>`).join('')}</tr></thead><tbody>${CLINICAL_DAILY_FIELDS.map(f=>`<tr><td>${escapeHtml(f.label)}</td>${dates.map(d=>{const v=clinicalValue(w.days[d],f.id);return `<td>${v===null?'—':typeof v==='boolean'?(v?'Y':'N'):v}</td>`;}).join('')}</tr>`).join('')}</tbody></table></div></div></section>`:''}
 <section class="card"><div class="card-header"><div class="section-kicker">Private behaviors, emotions & urges</div></div><div class="card-body">${renderRatingsTable(w.privateTargets,w)}</div></section>
 <section class="card"><div class="card-header"><div class="section-kicker">Social signals & overt behaviors</div></div><div class="card-body">${renderRatingsTable(w.socialTargets,w)}</div></section>
 ${renderProcessRatings(w)}
 <section class="card"><div class="card-header"><div class="section-kicker">Discuss in Therapy</div></div><div class="card-body">${flagged.length?flagged.map(e=>`<div class="event-card"><div class="event-context">${fmtDay(e.date)} — ${escapeHtml(e.context||'Event')}</div><div class="event-note">${escapeHtml(e.note||'')}</div></div>`).join(''):'<div class="subtle">No events flagged.</div>'}</div></section>
 <section class="card"><div class="card-header"><div class="section-kicker">Skills used</div></div><div class="card-body">${Object.keys(skillMap).length?Object.entries(skillMap).map(([s,ds])=>`<div class="list-row"><strong>${escapeHtml(skillName(s))}</strong><span class="small">${ds.join(', ')}</span></div>`).join(''):'<div class="subtle">No skills recorded.</div>'}</div></section>
 <section class="card"><div class="card-header"><div class="section-kicker">Self-Enquiry</div></div><div class="card-body"><div><strong>Weekly focus:</strong><br>${escapeHtml(w.weeklySEFocus||'—')}</div><div style="margin-top:10px"><strong>Saved prompts:</strong> ${w.savedSEPrompts.length}</div><div style="margin-top:6px"><strong>Questions discovered:</strong> ${(w.newSEQuestions||[]).length}</div></div></section>
 <section class="card"><div class="card-header"><div class="section-kicker">Week context</div></div><div class="card-body"><div><strong>Homework:</strong> ${escapeHtml(w.homework||'—')}</div><div style="margin-top:8px"><strong>Valued goal:</strong> ${escapeHtml(w.valuedGoal||'—')}</div>${w.majorOCThemeEnabled?`<div style="margin-top:8px"><strong>Major OC Theme:</strong> ${escapeHtml(w.majorOCTheme||'—')}</div>`:''}</div></section>
 <section class="card"><div class="card-body"><button class="btn primary wide" data-action="print-report">Export Therapist PDF</button><button class="btn wide" style="margin-top:8px" data-action="backup">Create Encrypted Backup</button></div></section>`;}

function renderMore(){ const p=appState.profile; return `<h1 class="page-title">More</h1><section class="card"><div class="card-body menu-list">
  <button class="btn" data-page="week-setup">Week Setup</button><button class="btn" data-page="setup-guide">How to Set Up Your Diary Card</button><button class="btn" data-page="archive">Archive</button><button class="btn" data-page="skills">RO Skills Reference</button><button class="btn" data-page="settings">Settings</button>
 </div></section><section class="card"><div class="card-body"><div class="list-row"><strong>Last encrypted backup</strong><span class="small">${p.lastBackupAt?new Date(p.lastBackupAt).toLocaleString():'None yet'}</span></div><button class="btn primary wide" style="margin-top:10px" data-action="backup">Create Encrypted Backup</button><button class="btn wide" style="margin-top:8px" data-action="restore">Restore Backup</button></div></section><div class="subtle">RO Diary ${APP_VERSION}. Data stays on this device unless you deliberately export it.</div>`;}

function renderWeekSetup(){const w=appState.currentWeek; return `<div class="btn-row"><button class="btn" data-action="back-page">← Back</button><button class="btn soft" data-page="setup-guide">Setup Guide</button></div><h1 class="page-title">Week Setup</h1><div class="subtle">${fmtDate(w.startDate)} – ${fmtDate(w.endDate)}</div>
 ${w.setupStatus==='pending'?'<div class="notice">This new week copied the prior week&apos;s setup. Review anything that changed in therapy, then finish setup.</div>':''}
 <section class="card"><div class="card-header"><div class="section-kicker">Private targets</div></div><div class="card-body">${renderTargetEditors(w.privateTargets,'private')}<button class="btn soft wide" data-action="add-target" data-kind="private">+ Add Private Target</button></div></section>
 <section class="card"><div class="card-header"><div class="section-kicker">Social signals</div></div><div class="card-body">${renderTargetEditors(w.socialTargets,'social')}<button class="btn soft wide" data-action="add-target" data-kind="social">+ Add Social Target</button></div></section>
 <section class="card"><div class="card-header"><div class="section-kicker">Weekly focus skills</div></div><div class="card-body"><div class="checkbox-list">${SKILLS.filter(s=>s.id!=='fixed-fatalistic').map(s=>`<label class="check-row"><input type="checkbox" data-focus-skill="${s.id}" ${w.focusSkills.includes(s.id)?'checked':''}><span>${escapeHtml(s.name)}</span></label>`).join('')}</div><div class="subtle" style="margin-top:8px">Choose up to five focus skills. Other skills remain available on the daily card.</div></div></section>
 <section class="card"><div class="card-body"><div class="field"><label>Weekly self-enquiry focus</label><textarea data-week-field="weeklySEFocus">${escapeHtml(w.weeklySEFocus)}</textarea></div><div class="field"><label>Skills-class homework</label><input data-week-field="homework" value="${escapeHtml(w.homework)}"></div><div class="field"><label>Valued goal (optional)</label><input data-week-field="valuedGoal" value="${escapeHtml(w.valuedGoal)}"></div></div></section>
 <section class="card"><div class="card-header"><div class="section-kicker">Optional RO-DBT fields</div></div><div class="card-body"><div class="checkbox-list">
   <label class="check-row"><input type="checkbox" data-week-toggle="majorOCThemeEnabled" ${w.majorOCThemeEnabled?'checked':''}><span>Major OC Theme</span></label>
   <label class="check-row"><input type="checkbox" data-week-toggle="therapyProcessEnabled" ${w.therapyProcessEnabled?'checked':''}><span>Therapy Alliance / Process Ratings</span></label>
   <label class="check-row"><input type="checkbox" data-week-toggle="riskTrackingEnabled" ${w.riskTrackingEnabled?'checked':''}><span>Risk / Medication / Substance Fields</span></label>
 </div>${w.majorOCThemeEnabled?`<div class="field"><label>Major OC Theme this week</label><input data-week-field="majorOCTheme" value="${escapeHtml(w.majorOCTheme||'')}"></div>`:''}${w.therapyProcessEnabled?'<div class="subtle small" style="margin-top:10px">Therapy-process ratings are entered from Weekly Review just prior to the session.</div>':''}${w.riskTrackingEnabled?'<div class="subtle small" style="margin-top:6px">Risk/medication/substance fields appear on each daily entry.</div>':''}</div></section>
 ${w.setupStatus==='pending'?'<section class="card"><div class="card-body"><button class="btn primary wide" data-action="finish-week-setup">Finish Week Setup</button></div></section>':''}`;}
function renderSetupGuide(){return `<button class="btn" data-action="back-guide">← Back</button><h1 class="page-title">How to Set Up Your Diary Card</h1>
 <div class="subtle">A practical guide for choosing a small, useful card that can change as therapy changes.</div>
 <section class="card"><div class="card-header"><div class="section-kicker">Purpose</div><div class="section-title">What the diary card is for</div></div><div class="card-body guide-copy">
   <p>Use the card to capture the week clearly enough that you and your therapist can quickly identify important patterns and events. Targets are selected to match the behaviors and experiences that are most useful to track in the current treatment focus, and they can change as therapy changes.</p>
   <p>Keep the card manageable. A smaller set of specific targets that you actually complete is more useful than a large checklist that becomes burdensome.</p>
 </div></section>
 <section class="card"><div class="card-header"><div class="section-kicker">1</div><div class="section-title">Choose your therapy week</div></div><div class="card-body guide-copy"><p>Select the day your therapy week begins. RO Diary tracks seven days from that point. Changing the start day affects future weeks only; archived weeks keep their original dates.</p></div></section>
 <section class="card"><div class="card-header"><div class="section-kicker">2</div><div class="section-title">Choose Social Signals / Overt Behaviors</div></div><div class="card-body guide-copy">
   <p>These are concrete things another person could observe in your words, tone, face, posture, timing, or behavior. Choose signals that are relevant to your current treatment goals.</p>
   <div class="guide-example"><strong>Examples from RO-DBT treatment materials:</strong> walking away from conflict, going quiet when annoyed, telling other people what to do, smiling while angry, a flat or stony expression, or a sharp/strident voice tone.</div>
   <div class="guide-example"><strong>Aim for something concrete:</strong> “walking away from conflict” or “going quiet when annoyed” is easier to observe and rate than a broad label.</div>
 </div></section>
 <section class="card"><div class="card-header"><div class="section-kicker">3</div><div class="section-title">Choose Private Behaviors, Emotions & Urges</div></div><div class="card-body guide-copy">
   <p>These are internal experiences that may occur before or alongside a social signal: thoughts, emotions, body sensations, or urges. They can help you examine whether internal activation and outward behavior actually occurred together.</p>
   <div class="guide-example"><strong>Examples from RO-DBT treatment materials:</strong> anger or annoyance, thoughts about not being appreciated, resentment, envy or bitterness, urges for revenge, feeling tense/agitated/hot, or feeling numb/detached.</div>
   <p><strong>Important distinction:</strong> “I felt irritated” is not the same as “I acted irritated.” Rate the internal experience and the outward social signal separately.</p>
 </div></section>
 <section class="card"><div class="card-header"><div class="section-kicker">4</div><div class="section-title">Choose how each target is rated</div></div><div class="card-body guide-copy">
   <p><strong>0–5</strong> works well when degree, intensity, or frequency matters. <strong>Y/N</strong> works well when simple presence or absence is enough.</p>
   <ul class="guide-list"><li>0 — not present</li><li>1 — slight / low</li><li>2 — definitely present, but low level</li><li>3 — moderate</li><li>4 — severe / intense</li><li>5 — most extreme level for you</li></ul>
   <p><strong>Blank means unanswered.</strong> A 0 or No means you intentionally rated the target as absent.</p>
 </div></section>
 <section class="card"><div class="card-header"><div class="section-kicker">5</div><div class="section-title">Add the weekly Self-Enquiry focus</div></div><div class="card-body guide-copy"><p>Enter the therapist-assigned or current self-enquiry question for the week. The built-in prompt generator can help you find additional questions, but it does not replace the weekly treatment focus.</p></div></section>
 <section class="card"><div class="card-header"><div class="section-kicker">6</div><div class="section-title">Choose weekly focus skills</div></div><div class="card-body guide-copy"><p>Select up to five skills you are actively practicing or want easy access to. You can still record any other RO skill you actually use during the week. Tap the information button beside a skill on Today for a quick reference.</p></div></section>
 <section class="card"><div class="card-header"><div class="section-kicker">7</div><div class="section-title">Add homework and an optional valued goal</div></div><div class="card-body guide-copy"><p>Use the homework field as a reminder of the current skills-class assignment. Add a valued goal only when it is useful for the current week; it does not need to be filled in simply because the field exists.</p></div></section>
 <section class="card"><div class="card-header"><div class="section-kicker">8</div><div class="section-title">Turn on optional RO-DBT fields only when useful</div></div><div class="card-body guide-copy">
   <p><strong>Major OC Theme:</strong> use when you and your therapist are organizing the week around a major overcontrol/social-signaling theme.</p>
   <p><strong>Therapy Alliance / Process Ratings:</strong> weekly 0–5 ratings completed just before therapy when these process questions are useful to your treatment.</p>
   <p><strong>Risk / Medication / Substance Fields:</strong> daily tracking that can be enabled when clinically relevant or requested by your therapist. RO Diary is not monitored and does not notify a therapist or emergency service.</p>
 </div></section>
 <section class="card"><div class="card-header"><div class="section-kicker">9</div><div class="section-title">Review and finish setup</div></div><div class="card-body guide-copy"><p>At the start of a new week, RO Diary can copy the prior setup. Review what changed in therapy, adjust only what needs changing, and then finish setup. Targets should evolve when the treatment focus changes.</p></div></section>
 <section class="card"><div class="card-header"><div class="section-kicker">Target quality</div><div class="section-title">What makes a useful target?</div></div><div class="card-body guide-copy"><ul class="guide-list">
   <li><strong>Specific:</strong> you can tell what counts and what does not.</li>
   <li><strong>Relevant:</strong> it connects to a current treatment problem, valued goal, or OC theme.</li>
   <li><strong>Rateable:</strong> you can reasonably judge it at the end of the day.</li>
   <li><strong>Manageable:</strong> the total card remains simple enough to complete consistently.</li>
   <li><strong>Individualized:</strong> use language that matches how you and your therapist actually describe the behavior or experience.</li>
 </ul></div></section>
 <section class="card"><div class="card-header"><div class="section-kicker">Keep it usable</div></div><div class="card-body guide-copy"><p>More fields are not automatically better. If the card becomes burdensome, confusing, or hard to complete, review the targets and optional fields with your therapist rather than simply adding more detail.</p><button class="btn primary wide" data-page="week-setup">Open Week Setup</button></div></section>`;}

function renderTargetEditors(targets,kind){return targets.map(t=>`<div class="inline-edit"><div class="inline-edit-row"><input data-target-label="${t.id}" data-kind="${kind}" value="${escapeHtml(t.label)}"><select data-target-type="${t.id}" data-kind="${kind}"><option value="scale" ${t.type==='scale'?'selected':''}>0–5</option><option value="yn" ${t.type==='yn'?'selected':''}>Y/N</option></select><button class="btn danger" data-delete-target="${t.id}" data-kind="${kind}">×</button></div><textarea data-target-def="${t.id}" data-kind="${kind}" class="small">${escapeHtml(t.definition||'')}</textarea></div>`).join('');}

function renderArchive(){const ids=[...appState.profile.weekIds].reverse(); return `<button class="btn" data-action="back-page">← Back</button><h1 class="page-title">Archive</h1><section class="card"><div class="card-body" id="archive-list">${ids.map(id=>`<div class="list-row" data-week-id="${id}"><span>Week ${escapeHtml(id.slice(0,8))}</span><button class="btn" data-action="open-archive" data-week-id="${id}">Open</button></div>`).join('')}</div></section>`;}

function renderSkillsReference(){return `<button class="btn" data-action="back-page">← Back</button><h1 class="page-title">RO Skills Reference</h1><div class="subtle">Quick reference only. Use your RO-DBT manual and class materials for the full skill.</div><section class="card"><div class="card-body">${SKILLS.filter(s=>s.id!=='fixed-fatalistic').map(s=>`<div class="skill-reference-row"><div><strong>${escapeHtml(s.name)}</strong><div class="small subtle">${escapeHtml(s.reference||'')}</div><div class="small" style="margin-top:4px">${escapeHtml(s.purpose)}</div></div><button class="info-btn" aria-label="About ${escapeHtml(s.name)}" data-skill-info="${s.id}">i</button></div>`).join('')}</div></section>`;}

function renderSettings(){return `<button class="btn" data-action="back-page">← Back</button><h1 class="page-title">Settings</h1><section class="card"><div class="card-body"><div class="field"><label>Therapy week starts</label><select id="week-start">${[[0,'Sunday'],[1,'Monday'],[2,'Tuesday'],[3,'Wednesday'],[4,'Thursday'],[5,'Friday'],[6,'Saturday']].map(([v,n])=>`<option value="${v}" ${appState.profile.therapyWeekStart===v?'selected':''}>${n}</option>`).join('')}</select><div class="subtle small">Changing this affects future weeks only.</div></div><div class="field"><label>PDF name</label><input id="pdf-name" value="${escapeHtml(appState.profile.pdfName||'')}"></div><button class="btn" data-action="change-pin">Change 4-Digit Passcode</button><button class="btn wide" style="margin-top:8px" data-action="lock-now">Lock Now</button></div></section>`;}

function renderModal(){
  const m=appState.modal; if(!m) return '';
  if(m.type==='week-start'){
    const w=appState.currentWeek;
    return `<div class="modal-backdrop"><div class="modal"><h2>Set Up New Week</h2><div class="subtle">Therapy week ${fmtDate(w.startDate)} – ${fmtDate(w.endDate)}</div><p>Last week's targets, focus skills, self-enquiry question, and homework were copied forward.</p><div class="btn-row"><button class="btn primary" data-action="review-week-setup">Review & Update</button><button class="btn" data-action="keep-week-setup">Use Previous Setup</button></div></div></div>`;
  }
  if(m.type==='info'){
    const t=[...appState.currentWeek.privateTargets,...appState.currentWeek.socialTargets].find(x=>x.id===m.targetId);
    if(!t) return '';
    return `<div class="modal-backdrop"><div class="modal"><h2>${escapeHtml(t.label)}</h2><p>${escapeHtml(t.definition||'No definition entered.')}</p>${t.type==='scale'?`<div>${SCALE_ANCHORS.map(a=>`<div class="list-row"><span>${escapeHtml(a)}</span></div>`).join('')}</div>`:'<div class="subtle">Answer Yes or No. Unanswered remains blank.</div>'}<button class="btn primary wide" data-action="close-modal">Close</button></div></div>`;
  }
  if(m.type==='event'){
    const existing=m.eventId?getSelectedEntry().events.find(e=>e.id===m.eventId):null;
    return `<div class="modal-backdrop"><div class="modal"><h2>${existing?'Edit Event':'Add Event'}</h2><div class="field"><label>Context</label><input id="event-context" placeholder="Conversation after work" value="${escapeHtml(existing?.context||'')}"></div><div class="field"><label>Brief Note</label><textarea id="event-note" placeholder="Enough context to remember what happened later.">${escapeHtml(existing?.note||'')}</textarea></div><label class="check-row"><input type="checkbox" id="event-discuss" ${existing?.discuss?'checked':''}><span>Discuss in Therapy</span></label><div class="btn-row" style="margin-top:12px"><button class="btn primary" data-action="save-event" data-event-id="${existing?.id||''}">${existing?'Save Changes':'Save Event'}</button><button class="btn" data-action="close-modal">Cancel</button></div></div></div>`;
  }
  if(m.type==='other-skill'){
    const rows=SKILLS.filter(s=>!appState.currentWeek.focusSkills.includes(s.id) && s.id!=='fixed-fatalistic').map(s=>`<div class="skill-select-row"><label class="check-row skill-check"><input type="checkbox" data-other-skill="${s.id}" ${getSelectedEntry().skills.includes(s.id)?'checked':''}><span>${escapeHtml(s.name)}</span></label><button class="info-btn" data-skill-info="${s.id}">i</button></div>`).join('');
    return `<div class="modal-backdrop"><div class="modal"><h2>Other RO Skill</h2><div class="checkbox-list">${rows}</div><button class="btn primary wide" style="margin-top:12px" data-action="close-modal">Done</button></div></div>`;
  }
  if(m.type==='skill-info'){
    const s=skillById(m.skillId); if(!s) return '';
    const steps=s.steps?.length?`<div class="field"><label>Quick guide</label><ol class="skill-steps">${s.steps.map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ol></div>`:'';
    return `<div class="modal-backdrop"><div class="modal"><h2>${escapeHtml(s.name)}</h2><div class="skill-ref">${escapeHtml(s.reference||'')}</div><div class="field"><label>What it is for</label><div>${escapeHtml(s.purpose||'')}</div></div><div class="field"><label>When it may be useful</label><div>${escapeHtml(s.useWhen||'')}</div></div>${steps}<div class="subtle">This is a brief reference, not a replacement for the RO-DBT handout/worksheet.</div><button class="btn primary wide" style="margin-top:12px" data-action="close-modal">Close</button></div></div>`;
  }
  if(m.type==='saved-questions'){
    const w=appState.currentWeek;
    const saved=w.savedSEPrompts.map(promptById).filter(Boolean);
    const fav=appState.profile.favoritePromptIds.map(promptById).filter(Boolean);
    const savedHtml=saved.length?saved.map(p=>`<div class="event-card"><div class="prompt-category">${escapeHtml(categoryLabel(p.category))}</div>${escapeHtml(p.text)}</div>`).join(''):'<div class="subtle">None saved this week.</div>';
    const discoveredHtml=w.newSEQuestions.length?w.newSEQuestions.map(q=>`<div class="event-card"><div>${escapeHtml(q.text)}</div><div class="event-actions"><button class="btn danger" data-action="delete-week-question" data-question-id="${q.id}">Delete</button></div></div>`).join(''):'<div class="subtle">None added this week.</div>';
    const favHtml=fav.length?fav.map(p=>`<div class="event-card"><div class="prompt-category">${escapeHtml(categoryLabel(p.category))}</div>${escapeHtml(p.text)}</div>`).join(''):'<div class="subtle">No favorites yet.</div>';
    const myHtml=appState.profile.myQuestions.length?appState.profile.myQuestions.map(q=>`<div class="event-card"><div>${escapeHtml(q.text)}</div><div class="event-actions"><button class="btn danger" data-action="delete-my-question" data-question-id="${q.id}">Delete</button></div></div>`).join(''):'<div class="subtle">No personal questions yet.</div>';
    return `<div class="modal-backdrop"><div class="modal"><h2>Saved Questions</h2><div class="section-kicker">Saved This Week</div>${savedHtml}<div class="section-kicker" style="margin-top:16px">Questions I Discovered This Week</div>${discoveredHtml}<div class="section-kicker" style="margin-top:16px">Favorites</div>${favHtml}<div class="section-kicker" style="margin-top:16px">My Question Library</div>${myHtml}<button class="btn primary wide" style="margin-top:12px" data-action="close-modal">Close</button></div></div>`;
  }
  if(m.type==='week-question'){
    return `<div class="modal-backdrop"><div class="modal"><h2>Question I Discovered</h2><div class="subtle">Optional: save a self-enquiry question that emerged for you during this therapy week.</div><div class="field"><label>Question</label><textarea id="week-question-text"></textarea></div><div class="btn-row"><button class="btn primary" data-action="save-week-question">Save for This Week</button><button class="btn" data-action="close-modal">Cancel</button></div></div></div>`;
  }
  if(m.type==='my-question'){
    return `<div class="modal-backdrop"><div class="modal"><h2>Add My Question</h2><div class="field"><label>Question</label><textarea id="my-question-text"></textarea></div><div class="btn-row"><button class="btn primary" data-action="save-my-question">Save</button><button class="btn" data-action="close-modal">Cancel</button></div></div></div>`;
  }
  if(m.type==='complete'){
    const missing=m.missing.length?`<div class="notice">${m.missing.length} target${m.missing.length===1?' is':'s are'} unanswered.</div>${m.missing.map(x=>`<div class="list-row"><span>${escapeHtml(x.label)}</span></div>`).join('')}<div class="btn-row" style="margin-top:12px"><button class="btn" data-action="close-modal">Go Back</button><button class="btn primary" data-action="fill-zero-complete">Set to 0 / No and Complete</button></div>`:`<div class="subtle">All targets are answered.</div><button class="btn primary wide" style="margin-top:12px" data-action="confirm-complete">Mark Today Complete</button>`;
    return `<div class="modal-backdrop"><div class="modal"><h2>${m.date===todayStr()?'Complete Today':`Complete ${fmtLong(m.date)}`}</h2>${missing}</div></div>`;
  }
  if(m.type==='backup-password'){
    return `<div class="modal-backdrop"><div class="modal"><h2>Create Encrypted Backup</h2><div class="field"><label>Backup password</label><input type="password" id="backup-pass1" autocomplete="new-password"></div><div class="field"><label>Confirm password</label><input type="password" id="backup-pass2" autocomplete="new-password"></div><div class="subtle">Use a strong password you can recover later. The app does not store it.</div>${m.error?`<div class="error">${escapeHtml(m.error)}</div>`:''}<div class="btn-row" style="margin-top:12px"><button class="btn primary" data-action="do-backup">Create Backup</button><button class="btn" data-action="close-modal">Cancel</button></div></div></div>`;
  }
  if(m.type==='restore-password'){
    return `<div class="modal-backdrop"><div class="modal"><h2>Restore Backup</h2><div class="field"><label>Backup password</label><input type="password" id="restore-pass"></div><div class="notice">Restore replaces the current vault after the backup is decrypted and validated.</div>${m.error?`<div class="error">${escapeHtml(m.error)}</div>`:''}<div class="btn-row"><button class="btn primary" data-action="do-restore">Validate & Restore</button><button class="btn" data-action="close-modal">Cancel</button></div></div></div>`;
  }
  if(m.type==='change-pin'){
    return `<div class="modal-backdrop"><div class="modal"><h2>Change Passcode</h2><div class="field"><label>Current 4-digit passcode</label><input type="password" inputmode="numeric" maxlength="4" id="old-pin"></div><div class="field"><label>New 4-digit passcode</label><input type="password" inputmode="numeric" maxlength="4" id="new-pin1"></div><div class="field"><label>Confirm new passcode</label><input type="password" inputmode="numeric" maxlength="4" id="new-pin2"></div>${m.error?`<div class="error">${escapeHtml(m.error)}</div>`:''}<div class="btn-row"><button class="btn primary" data-action="do-change-pin">Change</button><button class="btn" data-action="close-modal">Cancel</button></div></div></div>`;
  }
  if(m.type==='archive-view') return renderArchiveModal(m.week);
  if(m.type==='delete-week'){
    return `<div class="modal-backdrop"><div class="modal"><h2>Delete Therapy Week?</h2><div class="notice">This permanently removes ${escapeHtml(fmtDate(m.week.startDate))} – ${escapeHtml(fmtDate(m.week.endDate))} from this device. Create an encrypted backup first if you may want it later.</div><div class="btn-row"><button class="btn danger" data-action="confirm-delete-week" data-week-id="${m.week.id}">Delete Week Permanently</button><button class="btn" data-action="close-modal">Cancel</button></div></div></div>`;
  }
  return '';
}

function renderArchiveModal(w){const dates=weekDates(w); const canDelete=w.id!==appState.currentWeek.id; const optional=`${w.riskTrackingEnabled?`<div class="section-kicker" style="margin-top:14px">Risk / Medication / Substance</div><div class="table-wrap"><table><thead><tr><th>Field</th>${dates.map(d=>`<th>${fmtDay(d)}</th>`).join('')}</tr></thead><tbody>${CLINICAL_DAILY_FIELDS.map(f=>`<tr><td>${escapeHtml(f.label)}</td>${dates.map(d=>{const v=clinicalValue(w.days[d],f.id);return `<td>${v===null?'—':typeof v==='boolean'?(v?'Y':'N'):v}</td>`;}).join('')}</tr>`).join('')}</tbody></table></div>`:''}${w.majorOCThemeEnabled?`<div class="section-kicker" style="margin-top:14px">Major OC Theme</div><div>${escapeHtml(w.majorOCTheme||'—')}</div>`:''}${w.therapyProcessEnabled?`<div class="section-kicker" style="margin-top:14px">Therapy Alliance / Process</div>${THERAPY_PROCESS_FIELDS.map(f=>`<div class="list-row"><span>${escapeHtml(f.label)}</span><strong>${w.therapyProcess?.[f.id]??'—'}</strong></div>`).join('')}`:''}`;return `<div class="modal-backdrop"><div class="modal"><h2>${fmtDate(w.startDate)} – ${fmtDate(w.endDate)}</h2><div class="section-kicker">Private</div>${renderRatingsTable(w.privateTargets,w)}<div class="section-kicker" style="margin-top:14px">Social</div>${renderRatingsTable(w.socialTargets,w)}${optional}<div class="section-kicker" style="margin-top:14px">Discuss in Therapy</div>${dates.flatMap(d=>w.days[d].events.filter(e=>e.discuss).map(e=>`<div class="event-card"><strong>${fmtDay(d)} — ${escapeHtml(e.context)}</strong><div>${escapeHtml(e.note)}</div></div>`)).join('')||'<div class="subtle">None flagged.</div>'}<button class="btn primary wide" style="margin-top:12px" data-action="close-modal">Close</button>${canDelete?`<button class="btn danger wide" style="margin-top:8px" data-action="request-delete-week" data-week-id="${w.id}">Delete This Week…</button>`:''}</div></div>`;}

function renderPrintRatingsTable(targets,w){const dates=weekDates(w);return `<table class="report-table"><thead><tr><th>Target</th>${dates.map(d=>`<th>${fmtDay(d)}<br><span>${fmtDate(d,{month:'numeric',day:'numeric'})}</span></th>`).join('')}</tr></thead><tbody>${targets.map(t=>`<tr><td>${escapeHtml(t.label)}</td>${dates.map(d=>{const v=targetValue(w.days[d],t.id);return `<td>${v===null?'—':typeof v==='boolean'?(v?'Y':'N'):v}</td>`;}).join('')}</tr>`).join('')}</tbody></table>`;}
function renderPrintCompletion(w){const dates=weekDates(w);return `<table class="report-table completion-table"><thead><tr>${dates.map(d=>`<th>${fmtDay(d)}<br><span>${fmtDate(d,{month:'numeric',day:'numeric'})}</span></th>`).join('')}</tr></thead><tbody><tr>${dates.map(d=>`<td>${w.days[d].completed?'Complete':'Incomplete'}</td>`).join('')}</tr></tbody></table>`;}
function renderPrintSkills(w){const dates=weekDates(w);const used=SKILLS.filter(s=>dates.some(d=>w.days[d].skills.includes(s.id)));if(!used.length)return '<div class="report-empty">No skills recorded.</div>';return `<table class="report-table"><thead><tr><th>Skill</th>${dates.map(d=>`<th>${fmtDay(d)}</th>`).join('')}</tr></thead><tbody>${used.map(s=>`<tr><td>${escapeHtml(s.name)}</td>${dates.map(d=>`<td>${w.days[d].skills.includes(s.id)?'✓':''}</td>`).join('')}</tr>`).join('')}</tbody></table>`;}
function renderPrintReport(){
  if(appState.locked || !appState.currentWeek) return '';
  const w=appState.currentWeek; const dates=weekDates(w);
  const events=dates.flatMap(d=>w.days[d].events.map(e=>({...e,date:d})));
  const saved=w.savedSEPrompts.map(promptById).filter(Boolean);
  const oc=(w.majorOCThemeEnabled && w.majorOCTheme)?`<div class="report-context-row"><strong>Major OC Theme:</strong> ${escapeHtml(w.majorOCTheme)}</div>`:'';
  return `<div class="print-report">
    <div class="report-heading"><div><h1>RO Diary — ${escapeHtml(appState.profile.pdfName||'')}</h1><div class="report-meta">Therapy week ${fmtDate(w.startDate,{month:'short',day:'numeric',year:'numeric'})} – ${fmtDate(w.endDate,{month:'short',day:'numeric',year:'numeric'})}</div></div></div>
    <h2>Completion</h2>${renderPrintCompletion(w)}
    <h2>Private Behaviors, Emotions & Urges</h2>${renderPrintRatingsTable(w.privateTargets,w)}
    <h2>Social Signals & Overt Behaviors</h2>${renderPrintRatingsTable(w.socialTargets,w)}
    <h2>Skills Used</h2>${renderPrintSkills(w)}
    <h2>Notes / Events</h2>${events.length?events.map(e=>`<div class="report-event ${e.discuss?'report-event-flagged':''}"><div><strong>${fmtDay(e.date)} ${fmtDate(e.date,{month:'numeric',day:'numeric'})}${e.context?` — ${escapeHtml(e.context)}`:''}</strong>${e.discuss?' <span class="report-flag">Discuss in Therapy</span>':''}</div>${e.note?`<div class="report-event-note">${escapeHtml(e.note)}</div>`:''}</div>`).join(''):'<div class="report-empty">No notes or events recorded.</div>'}
    <h2>Self-Enquiry</h2><div class="report-context-row"><strong>Weekly focus:</strong> ${escapeHtml(w.weeklySEFocus||'—')}</div>${saved.length?`<div class="report-context-row"><strong>Saved prompts this week:</strong><ul>${saved.map(p=>`<li>${escapeHtml(p.text)}</li>`).join('')}</ul></div>`:''}${(w.newSEQuestions||[]).length?`<div class="report-context-row"><strong>Questions discovered this week:</strong><ul>${w.newSEQuestions.map(q=>`<li>${escapeHtml(q.text)}</li>`).join('')}</ul></div>`:''}
    <h2>Week Context</h2><div class="report-context-row"><strong>Homework:</strong> ${escapeHtml(w.homework||'—')}</div><div class="report-context-row"><strong>Valued Goal:</strong> ${escapeHtml(w.valuedGoal||'—')}</div>${oc}
    <div class="report-footer">Generated locally by RO Diary ${APP_VERSION} • ${escapeHtml(new Date().toLocaleString())}</div>
  </div>`;
}

function bindLock(){
  $$('[data-pin]').forEach(b=>b.addEventListener('click',()=>handlePinDigit(b.dataset.pin)));
  $('[data-action="clear"]')?.addEventListener('click',()=>{appState.pinBuffer='';appState.pinError='';render();});
  $('[data-action="back"]')?.addEventListener('click',()=>{appState.pinBuffer=appState.pinBuffer.slice(0,-1);appState.pinError='';render();});
}
async function handlePinDigit(d){ if(appState.busy || appState.pinBuffer.length>=4) return; appState.pinBuffer+=d; render(); if(appState.pinBuffer.length<4) return; appState.busy=true;
  try {
    if(appState.setupNeeded){
      if(appState.pinStage==='setup'){appState.setupPinFirst=appState.pinBuffer;appState.pinBuffer='';appState.pinStage='confirm';render();}
      else if(appState.pinBuffer!==appState.setupPinFirst){appState.pinBuffer='';appState.pinStage='setup';appState.setupPinFirst='';appState.pinError='Passcodes did not match. Try again.';render();}
      else {await setupVault(appState.pinBuffer);appState.setupNeeded=false;appState.locked=false;appState.pinBuffer='';appState.pinStage='unlock';appState.pinError='';render();}
    } else {await unlockVault(appState.pinBuffer);appState.locked=false;appState.pinBuffer='';appState.pinError='';render();}
  } catch(e){appState.pinBuffer='';appState.pinError=e.message;render();}
  finally{appState.busy=false;}
}

function bindApp(){
  $$('[data-nav]').forEach(b=>b.addEventListener('click',()=>{appState.nav=b.dataset.nav;appState.page=null;render();}));
  $$('[data-page]').forEach(b=>b.addEventListener('click',()=>{const next=b.dataset.page;if(next==='setup-guide')appState.guideReturn=appState.page||null;appState.page=next;render(); if(appState.page==='archive') hydrateArchiveLabels();}));
  $('[data-action="back-page"]')?.addEventListener('click',()=>{appState.page=null;appState.nav='more';render();});
  $$('[data-target]').forEach(b=>b.addEventListener('click',()=>{const day=getSelectedEntry();let v=b.dataset.value; if(v==='true')v=true; else if(v==='false')v=false; else v=Number(v); setTargetValue(day,b.dataset.target,v);}));
  $$('[data-clinical-target]').forEach(b=>b.addEventListener('click',()=>{const day=getSelectedEntry();let v=b.dataset.value;if(v==='true')v=true;else if(v==='false')v=false;else v=Number(v);setClinicalValue(day,b.dataset.clinicalTarget,v);}));
  $$('[data-process-target]').forEach(b=>b.addEventListener('click',()=>setTherapyProcessValue(b.dataset.processTarget,Number(b.dataset.value))));
  $$('[data-info]').forEach(b=>b.addEventListener('click',()=>{appState.modal={type:'info',targetId:b.dataset.info};render({preserveScroll:true});}));
  $$('[data-skill-info]').forEach(b=>b.addEventListener('click',()=>{appState.modal={type:'skill-info',skillId:b.dataset.skillInfo};render({preserveScroll:true});}));
  $$('[data-skill]').forEach(c=>c.addEventListener('change',()=>toggleSkill(c.dataset.skill,c.checked)));
  $$('[data-other-skill]').forEach(c=>c.addEventListener('change',()=>toggleSkill(c.dataset.otherSkill,c.checked,false)));
  $$('[data-focus-skill]').forEach(c=>c.addEventListener('change',()=>toggleFocusSkill(c.dataset.focusSkill,c.checked)));
  $$('[data-action]').forEach(b=>{ const a=b.dataset.action; if(b.__boundAction) return; b.__boundAction=true; b.addEventListener('click',()=>handleAction(a,b)); });
  $$('[data-week-field]').forEach(el=>el.addEventListener('change',()=>{appState.currentWeek[el.dataset.weekField]=el.value;queueSaveWeek();}));
  $$('[data-week-toggle]').forEach(el=>el.addEventListener('change',()=>{appState.currentWeek[el.dataset.weekToggle]=el.checked;queueSaveWeek();render({preserveScroll:true});}));
  $$('[data-target-label]').forEach(el=>el.addEventListener('change',()=>updateTargetField(el.dataset.kind,el.dataset.targetLabel,'label',el.value)));
  $$('[data-target-def]').forEach(el=>el.addEventListener('change',()=>updateTargetField(el.dataset.kind,el.dataset.targetDef,'definition',el.value)));
  $$('[data-target-type]').forEach(el=>el.addEventListener('change',()=>updateTargetField(el.dataset.kind,el.dataset.targetType,'type',el.value)));
  $$('[data-delete-target]').forEach(b=>b.addEventListener('click',()=>deleteTarget(b.dataset.kind,b.dataset.deleteTarget)));
  $('#pdf-name')?.addEventListener('change',e=>{appState.profile.pdfName=e.target.value;queueSaveProfile();});
  $('#week-start')?.addEventListener('change',e=>{appState.profile.therapyWeekStart=Number(e.target.value);queueSaveProfile();});
  $('#se-category')?.addEventListener('change',e=>{appState.seCategory=e.target.value;appState.currentPromptId=null;choosePrompt();render();});
}
function toggleSkill(id,checked,doRender=true){const d=getSelectedEntry(); if(checked&&!d.skills.includes(id))d.skills.push(id); if(!checked)d.skills=d.skills.filter(x=>x!==id); d.modifiedAt=new Date().toISOString(); if(d.completed){d.completed=false;d.completedAt=null;} queueSaveWeek(); if(doRender)updateCompletionUi(d);}
function toggleFocusSkill(id,checked){const w=appState.currentWeek;if(checked){if(w.focusSkills.length>=5){alert('Choose up to five focus skills.');render();return;} if(!w.focusSkills.includes(id))w.focusSkills.push(id);}else w.focusSkills=w.focusSkills.filter(x=>x!==id);queueSaveWeek();render();}
function updateTargetField(kind,id,field,val){const arr=kind==='private'?appState.currentWeek.privateTargets:appState.currentWeek.socialTargets;const t=arr.find(x=>x.id===id);if(t){t[field]=val;queueSaveWeek();}}
function deleteTarget(kind,id){const arr=kind==='private'?appState.currentWeek.privateTargets:appState.currentWeek.socialTargets;if(!confirm('Remove this target from the current week?'))return;const next=arr.filter(x=>x.id!==id);if(kind==='private')appState.currentWeek.privateTargets=next;else appState.currentWeek.socialTargets=next;queueSaveWeek();render();}

function filenameSafePart(value){
  return String(value||'').trim().replace(/[^A-Za-z0-9_-]+/g,'-').replace(/^-+|-+$/g,'') || 'Diary';
}
function pdfFilenameBase(date=new Date()){
  const pad=n=>String(n).padStart(2,'0');
  const stamp=`${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}_${pad(date.getHours())}-${pad(date.getMinutes())}-${pad(date.getSeconds())}`;
  return `RO-Diary-${filenameSafePart(appState.profile?.pdfName||'')}-${stamp}`;
}
function buildPdfReportData(){
  const w=appState.currentWeek; const dates=weekDates(w);
  const ratingRows=targets=>targets.map(t=>[t.label,...dates.map(d=>{const v=targetValue(w.days[d],t.id);return v===null?'—':typeof v==='boolean'?(v?'Y':'N'):String(v);})]);
  const completion=dates.map(d=>({day:fmtDay(d),date:fmtDate(d,{month:'numeric',day:'numeric'}),status:w.days[d].completed?'Complete':'Incomplete'}));
  const usedSkills=SKILLS.filter(s=>dates.some(d=>w.days[d].skills.includes(s.id))).map(s=>({name:s.name,days:dates.filter(d=>w.days[d].skills.includes(s.id)).map(fmtDay)}));
  const events=dates.flatMap(d=>w.days[d].events.map(e=>({day:fmtDay(d),date:fmtDate(d,{month:'numeric',day:'numeric'}),context:e.context||'',note:e.note||'',discuss:!!e.discuss})));
  const saved=w.savedSEPrompts.map(promptById).filter(Boolean).map(p=>p.text);
  return {
    title:`RO Diary — ${appState.profile.pdfName||''}`,
    week:`Therapy week ${fmtDate(w.startDate,{month:'short',day:'numeric',year:'numeric'})} – ${fmtDate(w.endDate,{month:'short',day:'numeric',year:'numeric'})}`,
    completion,
    dayHeaders:completion.map(x=>`${x.day} ${x.date}`),
    privateRows:ratingRows(w.privateTargets),
    socialRows:ratingRows(w.socialTargets),
    clinicalEnabled:!!w.riskTrackingEnabled,
    clinicalRows:w.riskTrackingEnabled?CLINICAL_DAILY_FIELDS.map(f=>[f.label,...dates.map(d=>{const v=clinicalValue(w.days[d],f.id);return v===null?'—':typeof v==='boolean'?(v?'Y':'N'):String(v);})]):[],
    therapyProcessEnabled:!!w.therapyProcessEnabled,
    therapyProcess:w.therapyProcessEnabled?THERAPY_PROCESS_FIELDS.map(f=>({label:f.label,value:w.therapyProcess?.[f.id]??null})):[],
    skills:usedSkills,
    events,
    weeklySEFocus:w.weeklySEFocus||'—',
    savedQuestions:saved,
    discoveredQuestions:(w.newSEQuestions||[]).map(q=>q.text),
    homework:w.homework||'—',
    valuedGoal:w.valuedGoal||'—',
    majorOCThemeEnabled:!!w.majorOCThemeEnabled,
    majorOCTheme:w.majorOCThemeEnabled?(w.majorOCTheme||'—'):'',
    generated:`Generated locally by RO Diary ${APP_VERSION} • ${new Date().toLocaleString()}`
  };
}
async function printTherapistReport(){
  try{
    if(!window.RODiaryPDF?.buildPdfBytes) throw new Error('PDF export component is unavailable.');
    const filename=`${pdfFilenameBase()}.pdf`;
    const bytes=window.RODiaryPDF.buildPdfBytes(buildPdfReportData());
    const blob=new Blob([bytes],{type:'application/pdf'});
    const file=new File([blob],filename,{type:'application/pdf'});
    if(navigator.share && navigator.canShare && navigator.canShare({files:[file]})){
      try{
        await navigator.share({files:[file]});
        return;
      }catch(shareError){
        if(shareError?.name==='AbortError') return;
        // If file sharing is unavailable in this browser state, fall back to a named download.
      }
    }
    const url=URL.createObjectURL(blob); const a=document.createElement('a');
    a.href=url; a.download=filename; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),2000);
  }catch(e){
    alert(`PDF export failed: ${e.message||e}`);
  }
}

async function handleAction(a,b){
  if(a==='back-guide'){appState.page=appState.guideReturn||null;if(!appState.page)appState.nav='more';appState.guideReturn=null;render();return;}
  if(a==='day-prev'){moveSelectedDay(-1);return;}
  if(a==='day-next'){moveSelectedDay(1);return;}
  if(a==='day-today'){if(appState.currentWeek.days[todayStr()]){appState.selectedDate=todayStr();render();}return;}
  if(a==='review-week-setup'){appState.modal=null;appState.page='week-setup';appState.nav='more';render();return;}
  if(a==='keep-week-setup'||a==='finish-week-setup'){const w=appState.currentWeek;w.setupStatus='confirmed';w.setupConfirmedAt=new Date().toISOString();queueSaveWeek();appState.modal=null;if(a==='finish-week-setup'){appState.page=null;appState.nav='today';}render();return;}
  if(a==='close-modal'){appState.modal=null;render({preserveScroll:true});return;}
  if(a==='other-skill'){appState.modal={type:'other-skill'};render({preserveScroll:true});return;}
  if(a==='go-se'){appState.nav='se';appState.page=null;render();return;}
  if(a==='add-event'){appState.modal={type:'event'};render({preserveScroll:true});return;}
  if(a==='edit-event'){appState.modal={type:'event',eventId:b.dataset.eventId};render({preserveScroll:true});return;}
  if(a==='delete-event'){const day=getSelectedEntry();const eventId=b.dataset.eventId;if(!confirm('Delete this note/event?'))return;day.events=day.events.filter(e=>e.id!==eventId);day.modifiedAt=new Date().toISOString();queueSaveWeek();render({preserveScroll:true});return;}
  if(a==='save-event'){const ctx=$('#event-context')?.value.trim()||'';const note=$('#event-note')?.value.trim()||'';const discuss=$('#event-discuss')?.checked||false;if(!ctx&&!note){return;}const day=getSelectedEntry();const eventId=b.dataset.eventId||'';const existing=eventId?day.events.find(e=>e.id===eventId):null;if(existing){existing.context=ctx;existing.note=note;existing.discuss=discuss;existing.modifiedAt=new Date().toISOString();}else{day.events.push({id:uid(),context:ctx,note,discuss,createdAt:new Date().toISOString(),modifiedAt:new Date().toISOString()});}day.modifiedAt=new Date().toISOString();queueSaveWeek();appState.modal=null;render({preserveScroll:true});return;}
  if(a==='complete-day'){const d=getSelectedEntry();const all=[...appState.currentWeek.privateTargets,...appState.currentWeek.socialTargets];const missing=all.filter(t=>targetValue(d,t.id)===null).map(t=>({id:t.id,label:t.label,type:t.type,kind:'target'}));if(appState.currentWeek.riskTrackingEnabled){for(const f of CLINICAL_DAILY_FIELDS)if(clinicalValue(d,f.id)===null)missing.push({id:f.id,label:f.label,type:f.type,kind:'clinical'});}appState.modal={type:'complete',missing,date:d.date};render({preserveScroll:true});return;}
  if(a==='fill-zero-complete'){const d=getSelectedEntry();for(const x of appState.modal.missing){if(x.kind==='clinical'){d.clinical=d.clinical||blankClinicalDaily();d.clinical[x.id]=x.type==='yn'?false:0;}else d.ratings[x.id]=x.type==='yn'?false:0;}completeDay(d);return;}
  if(a==='confirm-complete'){completeDay(getSelectedEntry());return;}
  if(a==='another-prompt'){choosePrompt();render();return;}
  if(a==='save-prompt'){const id=appState.currentPromptId;const arr=appState.currentWeek.savedSEPrompts;appState.currentWeek.savedSEPrompts=arr.includes(id)?arr.filter(x=>x!==id):[...arr,id];queueSaveWeek();render();return;}
  if(a==='favorite-prompt'){const id=appState.currentPromptId;const arr=appState.profile.favoritePromptIds;appState.profile.favoritePromptIds=arr.includes(id)?arr.filter(x=>x!==id):[...arr,id];queueSaveProfile();render();return;}
  if(a==='reject-prompt'){const id=appState.currentPromptId;if(!appState.profile.notUsefulPromptIds.includes(id))appState.profile.notUsefulPromptIds.push(id);queueSaveProfile();choosePrompt();render();return;}
  if(a==='saved-questions'){appState.modal={type:'saved-questions'};render({preserveScroll:true});return;}
  if(a==='add-week-question'){appState.modal={type:'week-question'};render({preserveScroll:true});return;}
  if(a==='save-week-question'){const text=$('#week-question-text')?.value.trim();if(text){appState.currentWeek.newSEQuestions.push({id:uid(),text,createdAt:new Date().toISOString()});queueSaveWeek();}appState.modal=null;render();return;}
  if(a==='delete-week-question'){const id=b.dataset.questionId;if(confirm('Delete this self-enquiry question from the current week?')){appState.currentWeek.newSEQuestions=appState.currentWeek.newSEQuestions.filter(q=>q.id!==id);queueSaveWeek();appState.modal={type:'saved-questions'};render();}return;}
  if(a==='delete-my-question'){const id=b.dataset.questionId;if(confirm('Delete this question from My Question Library?')){appState.profile.myQuestions=appState.profile.myQuestions.filter(q=>q.id!==id);queueSaveProfile();appState.modal={type:'saved-questions'};render();}return;}
  if(a==='add-my-question'){appState.modal={type:'my-question'};render();return;}
  if(a==='save-my-question'){const text=$('#my-question-text')?.value.trim();if(text){appState.profile.myQuestions.push({id:uid(),text,createdAt:new Date().toISOString()});queueSaveProfile();}appState.modal=null;render();return;}
  if(a==='print-report'){printTherapistReport();return;}
  if(a==='backup'){appState.modal={type:'backup-password',error:''};render({preserveScroll:true});return;}
  if(a==='do-backup'){await createBackupFromModal();return;}
  if(a==='restore'){pickRestoreFile();return;}
  if(a==='do-restore'){await restoreFromModal();return;}
  if(a==='lock-now'){lockApp();return;}
  if(a==='change-pin'){appState.modal={type:'change-pin',error:''};render({preserveScroll:true});return;}
  if(a==='do-change-pin'){await changePinFromModal();return;}
  if(a==='add-target'){const kind=b.dataset.kind;const arr=kind==='private'?appState.currentWeek.privateTargets:appState.currentWeek.socialTargets;arr.push({id:uid(),label:'New Target',definition:'',type:'scale',order:arr.length});queueSaveWeek();render();return;}
  if(a==='open-archive'){const w=await loadRecord(`week:${b.dataset.weekId}`);appState.modal={type:'archive-view',week:w};render();return;}
  if(a==='request-delete-week'){const w=await loadRecord(`week:${b.dataset.weekId}`);if(!w||w.id===appState.currentWeek.id)return;appState.modal={type:'delete-week',week:w};render();return;}
  if(a==='confirm-delete-week'){await deleteArchivedWeek(b.dataset.weekId);return;}
}
function completeDay(d){d.completed=true;d.completedAt=new Date().toISOString();d.modifiedAt=d.completedAt;queueSaveWeek();appState.modal=null;render({preserveScroll:true});}

async function deleteArchivedWeek(id){
  if(!id || id===appState.currentWeek.id){alert('The current therapy week cannot be deleted.');return;}
  await appState.saveChain;
  const week=await loadRecord(`week:${id}`); if(!week){appState.modal=null;render();return;}
  await idbDelete('records',`week:${id}`);
  appState.profile.weekIds=appState.profile.weekIds.filter(x=>x!==id);
  appState.profile.modifiedAt=new Date().toISOString();
  await saveRecord('profile',appState.profile);
  appState.modal=null; appState.page='archive'; appState.nav='more'; render(); hydrateArchiveLabels();
}

async function hydrateArchiveLabels(){const rows=$$('[data-week-id]');for(const row of rows){const id=row.dataset.weekId;const w=await loadRecord(`week:${id}`);if(w){const span=row.querySelector('span');span.textContent=`${fmtDate(w.startDate)} – ${fmtDate(w.endDate)} ${w.id===appState.currentWeek.id?'(Current)':w.archived?'':'(Past)'}`;}}}

async function collectPortableData(){ const profile=structuredClone(appState.profile); const weeks=[]; for(const id of profile.weekIds){const w= id===appState.currentWeek.id ? structuredClone(appState.currentWeek) : await loadRecord(`week:${id}`); if(w) weeks.push(w);} return {format:'ro-diary-data',version:1,appVersion:APP_VERSION,exportedAt:new Date().toISOString(),profile,weeks}; }
function validatePortableData(data){if(!data||data.format!=='ro-diary-data'||data.version!==1||!data.profile||!Array.isArray(data.weeks))throw new Error('This is not a supported RO Diary backup.');if(!data.profile.currentWeekId||!Array.isArray(data.profile.weekIds))throw new Error('Backup profile is incomplete.');for(const w of data.weeks){if(!w.id||!w.startDate||!w.endDate||!w.days||!Array.isArray(w.privateTargets)||!Array.isArray(w.socialTargets))throw new Error('A therapy week in the backup is invalid.');for(const d of Object.values(w.days)){if(!d.date||!d.ratings||!Array.isArray(d.skills)||!Array.isArray(d.events))throw new Error('A daily entry in the backup is invalid.');for(const v of Object.values(d.ratings)){if(v!==null && typeof v!=='boolean' && !(Number.isInteger(v)&&v>=0&&v<=5))throw new Error('A rating in the backup is invalid.');}if(d.clinical){for(const v of Object.values(d.clinical)){if(v!==null && typeof v!=='boolean' && !(Number.isInteger(v)&&v>=0&&v<=5))throw new Error('A clinical tracking value in the backup is invalid.');}}}if(w.therapyProcess){for(const v of Object.values(w.therapyProcess)){if(v!==null && !(Number.isInteger(v)&&v>=0&&v<=5))throw new Error('A therapy-process rating in the backup is invalid.');}}}return true;}
async function createBackupFromModal(){const p1=$('#backup-pass1')?.value||'';const p2=$('#backup-pass2')?.value||'';if(p1.length<10){appState.modal.error='Use at least 10 characters for the backup password.';render();return;}if(p1!==p2){appState.modal.error='Passwords do not match.';render();return;}try{appState.busy=true;const portable=await collectPortableData();const salt=randomBytes(16);const key=await deriveBackupKey(p1,salt);const e=await aesEncrypt(key,enc.encode(JSON.stringify(portable)));const envelope={format:'ro-diary-backup',version:1,kdf:{name:'PBKDF2-SHA256',iterations:BACKUP_ITERATIONS,salt:arrToB64(salt)},cipher:{name:'AES-256-GCM',iv:arrToB64(e.iv)},data:arrToB64(e.data)};const blob=new Blob([JSON.stringify(envelope)],{type:'application/octet-stream'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`RO-Diary-Backup-${todayStr()}.rodbt`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);appState.profile.lastBackupAt=new Date().toISOString();queueSaveProfile();appState.modal=null;render();}catch(e){appState.modal.error=e.message;render();}finally{appState.busy=false;}}
let pendingRestoreEnvelope=null;
function pickRestoreFile(){const input=document.createElement('input');input.type='file';input.accept='.rodbt,application/octet-stream,application/json';input.onchange=async()=>{const file=input.files?.[0];if(!file)return;try{pendingRestoreEnvelope=JSON.parse(await file.text());if(pendingRestoreEnvelope.format!=='ro-diary-backup')throw new Error('Not an RO Diary backup.');appState.modal={type:'restore-password',error:''};render();}catch(e){alert(`Backup could not be opened: ${e.message}`);}};input.click();}
async function restoreFromModal(){const pass=$('#restore-pass')?.value||'';try{appState.busy=true;const env=pendingRestoreEnvelope;if(!env)throw new Error('No backup selected.');const key=await deriveBackupKey(pass,b64ToArr(env.kdf.salt));const plain=await aesDecrypt(key,{iv:b64ToArr(env.cipher.iv),data:b64ToArr(env.data)});const data=JSON.parse(dec.decode(plain));validatePortableData(data);if(!confirm(`Restore ${data.weeks.length} therapy week(s) and replace the current vault?`))return;
 const oldProfile=await idbGet('records','profile'); const oldWeekPayloads={}; for(const id of appState.profile.weekIds) oldWeekPayloads[id]=await idbGet('records',`week:${id}`);
 try{const encryptedProfile=await encryptJson(data.profile);const encryptedWeeks={};for(const w of data.weeks)encryptedWeeks[w.id]=await encryptJson(w);await idbPut('records','profile',encryptedProfile);for(const id of appState.profile.weekIds)await idbDelete('records',`week:${id}`);for(const [id,p] of Object.entries(encryptedWeeks))await idbPut('records',`week:${id}`,p);appState.profile=data.profile;appState.currentWeek=data.weeks.find(w=>w.id===data.profile.currentWeekId)||data.weeks.at(-1);pendingRestoreEnvelope=null;appState.modal=null;render();}catch(e){if(oldProfile)await idbPut('records','profile',oldProfile);for(const [id,p] of Object.entries(oldWeekPayloads))if(p)await idbPut('records',`week:${id}`,p);throw e;}
 }catch(e){appState.modal={type:'restore-password',error:'Backup password is wrong or the backup is damaged.'};render();}finally{appState.busy=false;}}

async function changePinFromModal(){const oldPin=$('#old-pin')?.value||'';const n1=$('#new-pin1')?.value||'';const n2=$('#new-pin2')?.value||'';if(!/^\d{4}$/.test(oldPin)||!/^\d{4}$/.test(n1)){appState.modal.error='Passcodes must be exactly 4 digits.';render();return;}if(n1!==n2){appState.modal.error='New passcodes do not match.';render();return;}try{const deviceKey=await idbGet('secure','deviceKey');const wrap=await idbGet('secure','vaultWrap');const oldKey=await derivePinKey(oldPin,b64ToArr(wrap.pinSalt));const innerBytes=await aesDecrypt(oldKey,{iv:b64ToArr(wrap.pinIv),data:b64ToArr(wrap.pinData)});const newSalt=randomBytes(16);const newKey=await derivePinKey(n1,newSalt);const newWrap=await aesEncrypt(newKey,innerBytes);await idbPut('secure','vaultWrap',{pinSalt:arrToB64(newSalt),pinIv:arrToB64(newWrap.iv),pinData:arrToB64(newWrap.data)});appState.modal=null;render();}catch(e){appState.modal.error='Current passcode is incorrect.';render();}}

function deleteLegacyDatabase(name){return new Promise(resolve=>{try{const req=indexedDB.deleteDatabase(name);req.onsuccess=req.onerror=req.onblocked=()=>resolve();}catch(_){resolve();}});}

async function init(){
  if(!window.crypto?.subtle || !window.indexedDB){document.getElementById('app').innerHTML='<div class="lock-screen"><div class="lock-card"><div class="lock-title">RO Diary</div><div class="error">This browser does not support the required local security features.</div></div></div>';return;}
  for(const name of LEGACY_DB_NAMES) await deleteLegacyDatabase(name);
  db=await openDB(); const wrap=await idbGet('secure','vaultWrap'); appState.setupNeeded=!wrap; appState.pinStage=appState.setupNeeded?'setup':'unlock'; appState.locked=true; render();
  if('serviceWorker' in navigator){navigator.serviceWorker.register('./sw.js?v=0.5.2').catch(()=>{});}
  document.addEventListener('visibilitychange',()=>{if(document.hidden){appState.hiddenAt=Date.now();}else if(appState.hiddenAt && Date.now()-appState.hiddenAt>=AUTO_LOCK_MS && !appState.locked){lockApp();}else appState.hiddenAt=null;});
}

init().catch(e=>{document.getElementById('app').innerHTML=`<div class="lock-screen"><div class="lock-card"><div class="lock-title">RO Diary</div><div class="error">${escapeHtml(e.message)}</div></div></div>`;});

})();
