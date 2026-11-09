/* Gitfiddle song data.
   lessonStats = raw counts of song-specific YouTube lessons (checked 2026-11-09 via YouTube search + yt-dlp metadata).
   The S/A/B/C lesson tier is COMPUTED from these in app.js (lessonTier), so update the numbers, not the tier.
   techTags must use TECHNIQUES vocabulary below; tags = free-form detail chips. To add a song: add an entry to SONGS (and any new videos to VIDEOS),
   then copy songs/_template.html to songs/<slug>.html and set data-song="<id>". */
(function(){
"use strict";

/* Tunings: open-string MIDI notes, low (6th string) -> high (1st). */
var TUNINGS = {
  standard: { name:"Standard", notes:"E A D G B E", midi:[40,45,50,55,59,64] },
  ddd:      { name:"Double Drop D", notes:"D A D G B D", midi:[38,45,50,55,59,62] },
  dadgad:   { name:"DADGAD", notes:"D A D G A D", midi:[38,45,50,55,57,62] }
};

/* Chord shapes, frets low->high (-1 = muted), fingers 0 = open/none. */
var CHORDS = {
  D:  { name:"D",  frets:[-1,-1,0,2,3,2], fingers:[0,0,0,1,3,2] },
  A:  { name:"A",  frets:[-1,0,2,2,2,0], fingers:[0,0,1,2,3,0] },
  G:  { name:"G",  frets:[3,2,0,0,0,3], fingers:[2,1,0,0,0,3] },
  Dm: { name:"Dm", frets:[-1,-1,0,2,3,1], fingers:[0,0,0,2,3,1] },
  C:  { name:"C",  frets:[-1,3,2,0,1,0], fingers:[0,3,2,0,1,0] },
  F:  { name:"F",  frets:[-1,-1,3,2,1,1], fingers:[0,0,3,2,1,1], tip:"mini-F (xx3211)" },
  Am: { name:"Am", frets:[-1,0,2,2,1,0], fingers:[0,0,2,3,1,0] },
  Em: { name:"Em", frets:[0,2,2,0,0,0], fingers:[0,2,3,0,0,0] },
  Em7:{ name:"Em7",frets:[0,2,2,0,3,3], fingers:[0,1,2,0,3,4] },
  G4: { name:"G",  frets:[3,2,0,0,3,3], fingers:[2,1,0,0,3,4], tip:"320033" },
  "G-oth":   { name:"G",     frets:[3,2,0,0,0,3], fingers:[2,1,0,0,0,3], tip:"B string open" },
  "Cadd9":   { name:"Cadd9", frets:[-1,3,2,0,3,3], fingers:[0,2,1,0,3,4] },
  "G/B":     { name:"G/B",   frets:[-1,2,0,0,3,3], fingers:[0,1,0,0,3,4] },
  "Bb-oth":  { name:"B♭*",   frets:[-1,1,3,0,3,0], fingers:[0,1,3,0,4,0], tip:"x13030" },
  "C-oth":   { name:"C*",    frets:[-1,3,5,0,5,0], fingers:[0,1,3,0,4,0], tip:"x35050" },
  /* Treetop Flyer, Double Drop D (D A D G B D) */
  "D5-ddd":  { name:"D5",  frets:[0,-1,0,2,3,0], fingers:[0,0,0,2,3,0], tip:"DADGBD" },
  "G-ddd":   { name:"G",   frets:[5,-1,5,4,3,0], fingers:[3,0,4,2,1,0], tip:"DADGBD" },
  "F6-ddd":  { name:"F6",  frets:[3,-1,3,2,1,0], fingers:[3,0,4,2,1,0], tip:"DADGBD" }
};

/* Video registry: teacher label + zoom presets (x,y = focus point 0..1 of the frame, s = scale). */
var TECHNIQUES = ["Strumming","Fingerpicking","Hybrid (chords + picking)","Hammer-ons/Pull-offs","Riffs/Licks","Barre/partial barre","Alternate tuning","Capo"];

var Z = function(fs,fx,fy,ps,px,py){ return { fret:{s:fs,x:fx,y:fy}, pick:{s:ps,x:px,y:py} }; };
var VIDEOS = {
  /* Over the Hills */
  VnU_bh0dgNU:{ teacher:"Marty Music", title:"Led Zeppelin Over The Hills And Far Away Guitar Lesson + Tutorial PART 1", zoom:Z(2.2,.82,.28, 2.2,.13,.45) },
  I13VEEkqeLI:{ teacher:"GuitarJamz", title:"Led Zeppelin - Over the Hills and Far Away - Acoustic Guitar lesson - How to Play", zoom:Z(2.2,.84,.42, 2.2,.15,.50) },
  WbkcYKKIh90:{ teacher:"GuitarLessons365 (Carl Brown)", title:"Over The Hills And Far Away Guitar Lesson - Led Zeppelin - Famous Riffs", zoom:Z(1.9,.78,.76, 2.0,.20,.22) },
  /* Son of a Gun */
  GlN76a1_Hig:{ teacher:"Marty Music", title:"Beginner Acoustic Guitar Lesson 8 - The D minor Chord", zoom:Z(2.0,.80,.30, 2.0,.12,.60) },
  "8mFF8NYVdtI":{ teacher:"JustinGuitar", title:"The Dm Chord on Guitar is EASY! | Guitar for Beginners", zoom:Z(1.7,.68,.55, 1.8,.90,.70) },
  Md667ZuDMd0:{ teacher:"Jonathan Richter", title:"Learn D Minor Chord Guitar [Guided Practice + Alternative Shape]", zoom:Z(2.0,.72,.55, 2.0,.25,.60) },
  pBacbX9yefA:{ teacher:"JustinGuitar", title:"A, D and E Chords - Easy Chord Changes Using Anchor Fingers [BC-114]", zoom:Z(1.6,.55,.50, 1.6,.20,.60) },
  "8BLehN1sQaU":{ teacher:"Good Guitarist", title:"Chord Switching Practice - A to D", zoom:Z(2.0,.72,.65, 2.0,.12,.70) },
  BnaYyexhmao:{ teacher:"Good Guitarist", title:"Chord Switching Practice - G to D", zoom:Z(2.0,.72,.65, 2.0,.12,.70) },
  "94bp9XLN5kw":{ teacher:"Marty Music", title:"The Beginner Mistake That's Killing Your Chord Changes", zoom:Z(2.4,.62,.62, 2.4,.38,.65) },
  "Se__aa_k-ms":{ teacher:"JustinGuitar", title:"The Secret for FAST Chord Changes", zoom:Z(2.2,.72,.65, 2.2,.30,.65) },
  "7VzPzBsm4sU":{ teacher:"JustinGuitar", title:"Get Strumming & Chord Changes Right! | Guitar for Beginners", zoom:Z(2.2,.78,.72, 2.2,.35,.72) },
  qXK_If0QzDM:{ teacher:"JustinGuitar", title:"One Minute Changes (Guitar Lesson BC-115)", zoom:Z(2.2,.70,.75, 2.2,.35,.75) },
  /* Green Berets */
  aqH9HNrAveg:{ teacher:"GuitarZero2Hero", title:"How To Play The F Chord - 4 Easy Ways", zoom:Z(2.0,.45,.82, 2.0,.20,.85) },
  ecPzu9sTKbo:{ teacher:"JustinGuitar", title:"3 Ways of Playing F Chord [BC-161]", zoom:Z(1.6,.60,.60, 1.6,.20,.60) },
  "4cR1sa1_d_8":{ teacher:"JustinGuitar", title:"The Easiest F Chord Guitar Lesson You'll Find :)", zoom:Z(1.6,.65,.50, 1.6,.20,.60) },
  ryTg1nZ8_PQ:{ teacher:"JustinGuitar", title:"Changes With The F Chord For Beginners", zoom:Z(1.6,.55,.40, 1.6,.20,.60) },
  mRKy7O5yuks:{ teacher:"Good Guitarist", title:"Chord Switching Practice - C to F", zoom:Z(2.0,.72,.65, 2.0,.12,.70) },
  "-HO8pNUlaiM":{ teacher:"Andy Guitar", title:"Chord Changing MISTAKE! [C major & G major trick]", zoom:Z(1.6,.60,.45, 1.6,.20,.60) },
  QCBmVesk8X8:{ teacher:"Lauren Bateman", title:"HATE That C to G Chord Change? Try THESE Tips!", zoom:Z(2.2,.68,.55, 2.2,.30,.62) },
  DKqbdVSeAEg:{ teacher:"Good Guitarist", title:"Chord Switching Practice - C to G", zoom:Z(2.0,.72,.65, 2.0,.12,.70) },
  ieoGWp_gvR4:{ teacher:"Eric DeLuca", title:"How to play \"The Ballad Of The Green Berets\" on acoustic guitar", zoom:Z(2.0,.60,.75, 2.0,.25,.80) },
  qx00SHLkt2w:{ teacher:"John Morgan Guitar", title:"How to Play \"The Ballad of the Green Berets\" by Sgt. Barry Sadler (Guitar)", zoom:Z(2.2,.60,.62, 2.2,.20,.75) },
  "-8N1-lqGTWY":{ teacher:"Danny McEvoy", title:"Ballad Of The Green Berets - Cover & Tutorial", zoom:Z(2.5,.35,.60, 2.5,.20,.62) },
  /* Ooh La La */
  "3qwNMLb6GzA":{ teacher:"JustinGuitar", title:"Ooh La La Easy Guitar Tutorial | The Faces", zoom:Z(2.2,.60,.80, 2.2,.20,.75) },
  "5zmrW5kqows":{ teacher:"GuitarJamz", title:"Faces - Ooh La La - How to Play on Acoustic Guitar", zoom:Z(1.8,.80,.60, 1.8,.20,.55) },
  VCIsdvZheC8:{ teacher:"Andy Guitar", title:"Guitar Lesson 5 - 'Ooh La la' Rod Stewart & NEW Melody! [10 Day Guitar Course]", zoom:Z(1.6,.55,.55, 1.6,.20,.70) },
  /* Treetop Flyer */
  TDzoCn0R4XQ:{ teacher:"Jon Michael Swift", title:"Treetop Flyer Guitar Lesson - Verse Parts - The Thumb Picking Guitar Series", zoom:Z(2.0,.78,.35, 2.0,.20,.60) },
  "-yUaveQmSNg":{ teacher:"Jon Michael Swift (intro)", title:"Treetop Flyer Guitar Lesson Intro - The Travis Picking Guitar Series", zoom:Z(2.2,.65,.75, 2.2,.35,.80) },
  QHiTnL5WDOM:{ teacher:"stevertr", title:"Treetop Flyer - Stephen Stills - Guitar Lesson", zoom:Z(1.8,.60,.60, 1.8,.20,.55) },
  QGALg4teWxE:{ teacher:"Austin Guitar School", title:"Treetop Flyer by Stephen Stills (How to play)", zoom:Z(2.2,.80,.60, 2.2,.40,.70) },
  "O9L-7qum1uk":{ teacher:"Cortez Cortez", title:"How To Play \"TREETOP FLYER\" by Stephen Stills | Acoustic Guitar Tutorial", zoom:Z(1.8,.70,.50, 1.8,.30,.60) },
  /* Foggy Dew */
  iVBiF4_7JGU:{ teacher:"getcrackingguitar", title:"How to play The Foggy Dew - guitar lesson", zoom:Z(2.0,.70,.50, 2.0,.20,.60) },
  "V_-IH712ldQ":{ teacher:"Jesse Ferguson", title:"How to Play \"The Foggy Dew\" | Simple guitar lesson", zoom:Z(2.0,.65,.50, 2.0,.20,.65) },
  o87TeuYzmDc:{ teacher:"Jason's Guitar School", title:"The Foggy Dew Guitar Tutorial", zoom:Z(2.4,.62,.78, 2.4,.40,.80) }
};

var SONGS = [
/* ------------------------------------------------------------------ 1 */
{
  id:"son-of-a-gun", slug:"son-of-a-gun", status:"ready",
  stage:1,
  stageLabel:"Stage 1 · First steps",
  diffReason:"Four open chords, downstrokes only. The one hard move is the single Dm switch.",
  techTags:["Strumming"],
  lessonStats:{"songLessons": 0, "topViews": 0, "topLesson": "none found (searched YouTube for song-specific guitar lessons)", "bigTeacherLessons": 0, "withChapters": 0, "withCaptions": 0, "slowBreakdown": false, "note": "No song-specific guitar lesson exists. The hard parts use general D/Dm/A/G lessons instead."},
  title:"One Son-Of-A-Gun Of A Gun", artist:"SSgt Barry Sadler", year:1966,
  difficulty:1,
  tags:["Open chords","Downstrokes","D ↔ Dm switch","Chord changes"],
  key:"D major (verses 1–2)", capo:"None", tuning:"standard",
  note:"This is just the beginner loop from verses 1–2. Skip the key-change verses for now.",
  defaultBpm:60, songTempo:120,
  chords:["D","A","G","Dm"],
  patterns:["downs","folk"],
  progression:[
    { chords:["D","A","D"], beats:[2,2,2], hook:"… one son-of-a-gun, of a gun" },
    { chords:["G","D","G"], beats:[2,2,2], hook:"… this AR-15" },
    { chords:["D"], beats:[4], hook:"… hard and she's mean" },
    { chords:["Dm","G"], beats:[2,2], hook:"… love or fun" },
    { chords:["D","G"], beats:[2,2], hook:"… AR-15" },
    { chords:["A"], beats:[4], hook:"… part of my team" },
    { chords:["D","A","D","G","D"], beats:[2,2,2,2,2], hook:"… one son-of-a-gun, of a gun" }
  ],
  timingNote:"Best guess: Cifra Club only shows the chord letters, not how long each one lasts. Each chord gets 2 beats, and a chord alone on a line gets 4 beats. Not checked against a scored chart.",
  drillPairs:[["D","A"],["D","G"],["A","G"],["D","Dm"],["Dm","G"]],
  original:{ id:"PX6RNlU-qu4", title:"7 One Son-of-a-Gun of a Gun.wmv", label:"Original recording (1966, fan upload)" },
  tutorials:[
    { id:"tR4qDJwuTio", title:"EASY guitar chords EVERYONE should know - beginner guitar chord lesson", tag:"General: D / G / A shapes" },
    { id:"Md667ZuDMd0", title:"Learn D Minor Chord Guitar [Guided Practice + Alternative Shape]", tag:"General: the Dm shape" },
    { id:"qXK_If0QzDM", title:"One Minute Changes (Guitar Lesson BC-115)", tag:"General: chord-change drill method" },
    { id:"26MKHpM3BfY", title:"Acoustic Guitar Lesson 3 - Rhythm and Strumming Basics for Absolute Beginners", tag:"General: beginner strumming" }
  ],
  techniques:[
    { name:"Basic downstroke strumming", where:"The whole beginner loop: steady quarter-note downstrokes that follow the vocal pulse.",
      videos:[{ id:"26MKHpM3BfY", title:"Acoustic Guitar Lesson 3 - Rhythm and Strumming Basics for Absolute Beginners" }] },
    { name:"Open-chord switching (D ↔ A ↔ G ↔ Dm)", where:"Every line of verses 1–2. D↔A and D↔G are the changes you'll make most.",
      videos:[{ id:"qXK_If0QzDM", title:"One Minute Changes (Guitar Lesson BC-115)" },{ id:"94bp9XLN5kw", title:"The Beginner Mistake That's Killing Your Chord Changes" }] }
  ],
  hardParts:{
    storagePrefix:"gitfiddle.hp.son-of-a-gun.v1.",
    intro:"There's no guitar lesson online for this exact song, so each hard part is clipped from the best general lesson for that move.",
    tabSource:"Chord shapes are the standard open voicings, the same as the chord diagrams above.",
    parts:[
      { id:"d-dm", name:"D → Dm (the one-line minor switch)", diff:2,
        why:"Dm only comes up once per verse (\"…love or fun\"), so you never get enough reps. The fingers have to rearrange, and most beginners lift the whole hand and lose the beat.",
        tip:"Use Marty's fingering: the ring finger stays on the B string at fret 3 in both chords, and only the middle and index fingers move. Loop his explanation at 0.75x and copy him in the pauses.",
        clips:[
          { v:"GlN76a1_Hig", a:49, b:148, t:"captions", note:"Marty: the ring finger stays on fret 3 of the B string, the same spot as in D (0:49–2:28)" },
          { v:"8mFF8NYVdtI", a:110, b:154, t:"captions", note:"Justin's fingering: index on fret 1 of the high E, little finger on the B string (1:50–2:34)" },
          { v:"Md667ZuDMd0", a:50, b:125, t:"captions", note:"Where to put your fingers for Dm (chapter 0:50–2:05)" }
        ],
        tabTitle:"D → Dm",
        tab:"     D    Dm\ne|---2----1---|\nB|---3----3---|  ← ring finger stays\nG|---2----2---|\nD|---0----0---|\nA|---x----x---|\nE|---x----x---|",
        notes:["Only strum the top 4 strings. The open D string is the bass note."] },
      { id:"d-a", name:"D ↔ A (your most frequent change)", diff:2,
        why:"D–A–D opens and closes the verse. If this change is slow, the whole song drags.",
        tip:"Justin's anchor trick: lift the fingers you don't need and slide the one that stays, instead of rebuilding the chord from scratch.",
        clips:[
          { v:"pBacbX9yefA", a:176, b:214, t:"captions", note:"Justin: D → A with an anchor finger (2:56–3:34)" },
          { v:"pBacbX9yefA", a:73, b:135, t:"captions", note:"Justin: the anchor-finger idea, shown on D → E (1:13–2:15)", label:"Anchor idea" },
          { v:"8BLehN1sQaU", a:120, b:329, t:"captions", note:"Good Guitarist: A ↔ D switching game, play along (chapter 2:00–5:29)" }
        ],
        tabTitle:"D ↔ A",
        tab:"     D    A\ne|---2----0---|\nB|---3----2---|\nG|---2----2---|\nD|---0----2---|\nA|---x----0---|\nE|---x----x---|",
        notes:["Good Guitarist's game shows the next chord name before you need it, so you get time to prepare."] },
      { id:"dm-g", name:"Dm → G and D ↔ G (the big jump)", diff:3,
        why:"G sits on completely different strings (320003), so all your fingers travel across the neck. Dm → G comes straight after the hardest chord in the song.",
        tip:"Lead with the finger that goes to the low E string. Practice the move in the air above the strings (Marty's tip-tip-tip) before you put the fingers down.",
        clips:[
          { v:"BnaYyexhmao", a:104, b:313, t:"captions", note:"Good Guitarist: G ↔ D switching game (chapter 1:44–5:13)" },
          { v:"94bp9XLN5kw", a:207, b:239, t:"captions", note:"Marty: the \"Tip-Tip-Tip\" technique (chapter 3:27–3:59)" },
          { v:"Se__aa_k-ms", a:60, b:150, t:"captions", note:"Justin: how to practice chord changes (chapter 1:00–2:30)" }
        ],
        tabTitle:"Dm → G → D",
        tab:"     Dm   G    D\ne|---1----3----2---|\nB|---3----0----3---|\nG|---2----0----2---|\nD|---0----0----0---|\nA|---x----2----x---|\nE|---x----3----x---|",
        notes:["Drill Dm ↔ G in the 1-minute changes tool further down this page. It logs your daily score."] },
      { id:"on-time", name:"Changing on time at song speed", diff:2,
        why:"The record is around 120 BPM, and most chords last only 2 beats. That's very little time to switch, so beginners stop strumming while they change.",
        tip:"Let the last strum before a change be an open-string \"lift\", and use that moment to move. Land the new chord on beat 1 even if it's messy. Justin explains this exactly.",
        clips:[
          { v:"7VzPzBsm4sU", a:55, b:119, t:"captions", note:"Justin: how to change chords while strumming so you land on beat one (chapter 0:55–1:59)" },
          { v:"7VzPzBsm4sU", a:119, b:219, t:"captions", note:"Justin: chord changes while playing a song (chapter 1:59–3:39)", label:"In a song" },
          { v:"qXK_If0QzDM", a:72, b:193, t:"captions", note:"Justin: getting your chord changes faster with one-minute changes (chapter 1:12–3:13)" }
        ],
        tabTitle:"Counting the change",
        tab:"Beat:   1   2 | 1   2 | 1   2\nChord:  D   . | A   . | D   .\nStrum:  ↓   ↓ | ↓   ↓ | ↓   ↓\n            ↑ move here (on the last strum)",
        notes:["Use the play-along above at 60 BPM with \"All downs\", then raise it 4 BPM at a time."] }
    ]
  }
},
/* ------------------------------------------------------------------ 2 */
{
  id:"green-berets", slug:"green-berets", status:"ready",
  stage:1,
  stageLabel:"Stage 1 · First steps",
  diffReason:"Three open chords at a march tempo. The mini-F (partial barre) is the only stretch.",
  techTags:["Strumming", "Barre/partial barre"],
  lessonStats:{"songLessons": 4, "topViews": 5870, "topLesson": "Eric DeLuca · How to play \"The Ballad Of The Green Berets\"", "bigTeacherLessons": 0, "withChapters": 0, "withCaptions": 2, "slowBreakdown": false, "note": "Song lessons: John Morgan (4.7K views, no captions), Eric DeLuca (5.9K), Danny McEvoy (271), Chordacopia chord video (1.7K). The hard parts mostly use general F / C↔G lessons."},
  title:"Ballad of the Green Berets", artist:"SSgt Barry Sadler", year:1966,
  difficulty:2,
  tags:["Open chords","Mini-F chord","March strum","C ↔ G"],
  key:"C major", capo:"None", tuning:"standard",
  note:"The verse and the refrain use the same four lines. The mini-F is fine.",
  defaultBpm:60, songTempo:170,
  chords:["C","G","F"],
  patterns:["downs","folk"],
  progression:[
    { chords:["C","G","C"], beats:[4,2,2], hook:"… soldiers … sky" },
    { chords:["G","C"], beats:[4,4], hook:"… men … die" },
    { chords:["F","C"], beats:[4,4], hook:"… mean … say" },
    { chords:["G","C"], beats:[4,4], hook:"… men … Green Beret" }
  ],
  timingNote:"Based on Bell&CoMusic's 4/4 march feel (the original is about ♩=170). Each lyric line is treated as 2 bars. Chord durations are reasoned guesses, not from an official score.",
  drillPairs:[["C","G"],["C","F"],["F","G"],["G","C"]],
  original:{ id:"BugBwt2ESpo", title:"The Ballad Of The Green Berets", label:"Original recording (RCA/Legacy Topic)" },
  tutorials:[
    { id:"qx00SHLkt2w", title:"How to Play \"The Ballad of the Green Berets\" by Sgt. Barry Sadler (Guitar)", tag:"Song tutorial: John Morgan" },
    { id:"ieoGWp_gvR4", title:"How to play \"The Ballad Of The Green Berets\" on acoustic guitar", tag:"Song tutorial: Eric DeLuca" },
    { id:"-8N1-lqGTWY", title:"Ballad Of The Green Berets - Cover & Tutorial - Danny McEvoy", tag:"Song tutorial: cover + walkthrough" },
    { id:"PvSYgDNxaS0", title:"Guitar for Beginners | Chord Progression Practice in C Major", tag:"General: C-major progression" },
    { id:"ij-DX2NJCEU", title:"How to Play the F Chord on Guitar | Easiest Beginner", tag:"General: easy F" }
  ],
  techniques:[
    { name:"March-style downstroke strum", where:"The whole song: straight downstrokes on the beat for the military feel.",
      videos:[{ id:"26MKHpM3BfY", title:"Acoustic Guitar Lesson 3 - Rhythm and Strumming Basics for Absolute Beginners" }] },
    { name:"Folk pattern D-D-U-U-D-U (optional)", where:"Swap to this once your downstrokes are steady.",
      videos:[{ id:"vpsP3u3KnyQ", title:"Beginners Guitar Strumming Pattern 2 - 8th Strumming" }] },
    { name:"Mini-F / easy F chord", where:"The F in each verse (\"…mean…say\"). Use xx3211 until you're ready for the full barre.",
      videos:[{ id:"ij-DX2NJCEU", title:"How to Play the F Chord on Guitar | Easiest Beginner" },{ id:"DWre8gNwXQ8", title:"How To Play the Easiest F Chord On Guitar - Guvna Guitars" }] }
  ],
  hardParts:{
    storagePrefix:"gitfiddle.hp.green-berets.v1.",
    intro:"The song itself is only 3 chords. The hard bits are the F chord and switching in time at a march tempo.",
    tabSource:"These are the standard open voicings. The mini-F (xx3211) is the shape GuitarZero2Hero teaches as the \"common\" F.",
    parts:[
      { id:"f-chord", name:"The F chord (start with the mini-F)", diff:3,
        why:"F is the first chord where one finger has to press two strings (B and high E at fret 1). It buzzes and hurts at first.",
        tip:"Start with the 3-string F (xx321x), then add the high E (xx3211). Roll the index finger slightly onto its bony edge. Don't try the full barre yet.",
        clips:[
          { v:"aqH9HNrAveg", a:21, b:84, t:"captions", note:"GuitarZero2Hero: the easiest F, then the common mini-F (chapters 0:21–1:24)" },
          { v:"ecPzu9sTKbo", a:37, b:136, t:"captions", note:"Justin: different ways to play F (chapters 0:37–2:16)" },
          { v:"4cR1sa1_d_8", a:270, b:435, t:"captions", note:"Justin: F chord step 1 and step 2 (chapters 4:30–7:15)" }
        ],
        tabTitle:"F, easiest → mini",
        tab:"     F(3)  F(mini)\ne|---x-----1---|\nB|---1-----1---|  ← index lays flat\nG|---2-----2---|\nD|---3-----3---|\nA|---x-----x---|\nE|---x-----x---|",
        notes:["Strum only the top 3 or 4 strings on F."] },
      { id:"c-f", name:"C ↔ F change", diff:3,
        why:"Your fingers keep the same pattern but shift over one string, and the index has to flatten for F, all inside one beat.",
        tip:"Justin's tip: try placing the fingers first and then the flat index, or the other way round. Pick whichever order lands cleaner for you.",
        clips:[
          { v:"ryTg1nZ8_PQ", a:126, b:158, t:"captions", note:"Justin: practicing C → F (2:06–2:38)" },
          { v:"ryTg1nZ8_PQ", a:19, b:110, t:"captions", note:"Justin: fingers first or barre first? (0:19–1:50)", label:"Finger order" },
          { v:"mRKy7O5yuks", a:104, b:313, t:"captions", note:"Good Guitarist: C ↔ F switching game, play along (chapter 1:44–5:13)" }
        ],
        tabTitle:"C ↔ F",
        tab:"     C    F(mini)\ne|---0----1---|\nB|---1----1---|\nG|---0----2---|\nD|---2----3---|\nA|---3----x---|\nE|---x----x---|",
        notes:["The ring and middle fingers keep their shape and move across one string."] },
      { id:"c-g", name:"C ↔ G change", diff:2,
        why:"This is in every line of the song, and it's a full-hand jump.",
        tip:"Andy's hovering exercise: make the G shape in the air about 5mm above the strings, then drop it. Speed comes from moving as one shape.",
        clips:[
          { v:"-HO8pNUlaiM", a:23, b:121, t:"captions", note:"Andy Guitar: chord-shape technique and the hovering exercise (chapters 0:23–2:01)" },
          { v:"QCBmVesk8X8", a:23, b:93, t:"captions", note:"Lauren Bateman: how to play C and G for an easy change (chapter 0:23–1:33)" },
          { v:"DKqbdVSeAEg", a:120, b:329, t:"captions", note:"Good Guitarist: C ↔ G switching game (chapter 2:00–5:29)" }
        ],
        tabTitle:"C ↔ G",
        tab:"     C    G\ne|---0----3---|\nB|---1----0---|\nG|---0----0---|\nD|---2----0---|\nA|---3----2---|\nE|---x----3---|",
        notes:["Lauren's chapter on using a metronome (7:32–9:03) is a good next step. Set the loop to it with the A/B buttons."] },
      { id:"march", name:"The march strum at song speed", diff:2,
        why:"The record moves fast in a march feel. If you rush or drag, the song loses its stride.",
        tip:"All downstrokes first, then try Eric's pattern. Keep your strumming hand moving even when you skip a strum.",
        clips:[
          { v:"ieoGWp_gvR4", a:30, b:60, t:"captions", note:"Eric DeLuca: the strum pattern for the song (0:30–1:00)" },
          { v:"qx00SHLkt2w", a:20, b:120, t:"approx", note:"John Morgan: song walkthrough (no captions, so the loop is a guess. Adjust it)" },
          { v:"-8N1-lqGTWY", a:170, b:260, t:"approx", note:"Danny McEvoy: tutorial part after the cover (about 2:50 onward, a guess)" }
        ],
        tabTitle:"Strum options",
        tab:"Count: 1   2   3   4\nMarch: ↓   ↓   ↓   ↓\nEric:  ↓   ↓ ↑ ↓ ↑ ↓ …\n(start with March, add Eric's ups later)",
        notes:["Eric's spoken pattern is \"down down up down up\". I transcribed it from his captions, so check it against his hand."] }
    ]
  }
},
/* ------------------------------------------------------------------ 3 */
{
  id:"over-the-hills", slug:"over-the-hills", status:"ready",
  stage:3,
  stageLabel:"Stage 3 · Technique",
  diffReason:"Fast hammer-on/pull-off licks with open strings ringing, plus Cadd9/B♭ stretch shapes and loose timing.",
  techTags:["Hybrid (chords + picking)", "Hammer-ons/Pull-offs", "Riffs/Licks"],
  lessonStats:{"songLessons": 9, "topViews": 2008089, "topLesson": "GuitarJamz · Over the Hills and Far Away Acoustic Guitar lesson", "bigTeacherLessons": 2, "withChapters": 3, "withCaptions": 3, "slowBreakdown": true, "note": "Includes Marty Music (1.6M), GuitarJamz (2.0M), Shutup & Play (1.5M), Bobby Crispy (386K), GuitarLessons365 (348K) and privettricker (347K). Marty and GuitarJamz both play it in slow motion."},
  title:"Over the Hills and Far Away", artist:"Led Zeppelin", year:1973,
  difficulty:4,
  tags:["Hammer-ons","Pull-offs","Open strings ringing","Cadd9 / B♭ shapes"],
  key:"G (acoustic intro)", capo:"None", tuning:"standard",
  note:"This page covers the acoustic intro from Houses of the Holy. Everything is built around G and D, with hammer-ons and pull-offs.",
  defaultBpm:60, songTempo:100,
  chords:["G-oth","D","Cadd9","G/B","Bb-oth","C-oth"],
  patterns:["downs","folk"],
  progression:[
    { chords:["G-oth","D"], beats:[4,4], hook:"lick 1 → G · lick 2 → D" },
    { chords:["G-oth","D"], beats:[4,4], hook:"lick 1 → G · lick 2 → D + fill" },
    { chords:["G-oth","D"], beats:[4,4], hook:"lick 1 → G · lick 2 → D" },
    { chords:["Cadd9","G/B","Bb-oth","C-oth"], beats:[2,2,2,2], hook:"lick 1 → turnaround" }
  ],
  timingNote:"Best guess: the play-along strums the chords under the licks to help you feel the form. It doesn't play the licks. Page plays the intro loosely, so treat the tempo as approximate.",
  drillPairs:[["G-oth","D"],["D","Cadd9"],["Cadd9","G/B"],["G/B","Bb-oth"],["Bb-oth","C-oth"]],
  original:{ id:"x5jJIZ8vYqQ", title:"Over the Hills and Far Away (Remaster)", label:"Original recording (Led Zeppelin, official)" },
  tutorials:[
    { id:"VnU_bh0dgNU", title:"Led Zeppelin Over The Hills And Far Away Guitar Lesson + Tutorial PART 1", tag:"Song tutorial: Marty Music" },
    { id:"I13VEEkqeLI", title:"Led Zeppelin - Over the Hills and Far Away - Acoustic Guitar lesson", tag:"Song tutorial: GuitarJamz" },
    { id:"WbkcYKKIh90", title:"Over The Hills And Far Away Guitar Lesson - Famous Riffs", tag:"Song tutorial: GuitarLessons365" },
    { id:"-JvESMqWX0s", title:"how to play \"Over the Hills and Far Away\" - acoustic guitar lesson", tag:"Song tutorial: Shutup & Play (long)" }
  ],
  techniques:[
    { name:"Hammer-ons & pull-offs", where:"Both intro licks (0h2p0 on the G string, 4p0 on the D string, the double pull-off 4p2p0).",
      videos:[{ id:"To7vDfgzSJE", title:"Hammer-Ons and Pull-Offs Guitar Lesson" },{ id:"7hDdZAjKBjY", title:"Hammer-Ons Explained + Exercise For Beginners" }] }
  ],
  hardParts:{
    storagePrefix:"gitfiddle.oth.v1.",
    intro:"YouTube teachers play these bits too fast, so each one loops, slows down and zooms in.",
    tabSource:'Transcribed from the note-by-note spoken instructions in the lessons above and Claude Johnson\'s lesson transcript at <a href="https://guitarcontrol.com/led-zeppelin-acoustic-guitar-lesson/" target="_blank" rel="noopener">guitarcontrol.com</a>. This is a short excerpt for practice. Check it against the recording.',
    parts:[
      { id:"lick1", name:"The opening hammer-on / pull-off lick (into G)", diff:3,
        why:"Three fast notes from a single pick on the open G string (0-2-0), then a pull-off on the D string, and the open strings have to keep ringing. Most teachers play it at full speed right after explaining it.",
        tip:"Fret with the very tip of your index finger so you don't mute the B string. Pick once, hammer on, then flick the finger off sideways instead of lifting it. Start on Ladder at 0.5x.",
        clips:[
          { v:"VnU_bh0dgNU", a:129, b:192, t:"captions", note:"Marty explains it note by note (2:09–3:12)" },
          { v:"I13VEEkqeLI", a:119, b:206, t:"captions", note:"Breaks it into hammer-on + pull-off + open G (1:59–3:26)" },
          { v:"WbkcYKKIh90", a:65,  b:123, t:"captions", note:"Carl's version: 'first legato lick' then the G voicing (1:05–2:03)" },
          { v:"I13VEEkqeLI", a:60,  b:119, t:"captions", note:"Primer: what hammer-ons and pull-offs are (1:00–1:59)", label:"Primer: H/P basics" }
        ],
        tabTitle:"Lick 1 → G",
        tab:"      lick 1                 G\ne|-------------------|---3---|\nB|-------------------|---0---|\nG|-0h2p0---------0---|---0---|\nD|-------4p0---------|---0---|\nA|-------------------|---2---|\nE|-------------------|---3---|",
        notes:["0h2p0 = pick the open G once, hammer onto fret 2, pull off back to open.","Use the G chord with the B string <b>open</b> (320003) and let it ring."] },
      { id:"lick2", name:"The double pull-off (4-2-0 on the G string) into D", diff:4,
        why:"Two fingers sit on the G string, ring on fret 4 and index on fret 2, and you pull off twice from one pick. If the second pull-off is weak, the open G gets swallowed.",
        tip:"Plant both fingers before you pick. Pull the ring finger off downward so it plucks the string, and the index does the same. Loop just this with a 2s count-in until all three notes sound even.",
        clips:[
          { v:"VnU_bh0dgNU", a:192, b:270, t:"approx", note:"Marty, 3:12 to about 4:30 (end is a guess)" },
          { v:"I13VEEkqeLI", a:206, b:292, t:"captions", note:"Explained, then played really slow (3:26–4:52)" },
          { v:"WbkcYKKIh90", a:123, b:185, t:"captions", note:"Carl: 'second legato pattern' into D (2:03–3:05)" }
        ],
        tabTitle:"Lick 2 → D",
        tab:"      lick 2                         D\ne|---------------------------|---2---|\nB|---------------------------|---3---|\nG|-0h2p0-----0-4p2p0---------|---2---|\nD|-------4-----------0-------|---0---|\nA|---------------------------|---x---|\nE|---------------------------|---x---|",
        notes:["Starts like lick 1, but you pick the open G (don't pull off) after the D-string 4.","4p2p0 = one pick, then two pull-offs."] },
      { id:"fill", name:"The D-chord fill (rolling one finger across fret 2)", diff:3,
        why:"It starts on an upbeat, and one finger has to roll between fret 2 on the A string and fret 2 on the D string without the notes running into each other.",
        tip:"Use one finger flat across the A and D strings at fret 2 and rock it instead of jumping. Count \"1-and\" out loud. The fill starts on the \"and\".",
        clips:[
          { v:"VnU_bh0dgNU", a:326, b:366, t:"captions", note:"Marty: 'second fret of the A, open D, second fret of the D…' (5:26–6:06)" },
          { v:"I13VEEkqeLI", a:329, b:377, t:"captions", note:"'Roll your finger over to the 2nd fret of the A' + real slow (5:29–6:17)" },
          { v:"WbkcYKKIh90", a:197, b:245, t:"captions", note:"Carl: the fill and the upbeat timing (3:17–4:05)" }
        ],
        tabTitle:"D fill → G",
        tab:"   D     fill                        G\ne|-2-------------------------|---3---|\nB|-3-------------------------|---0---|\nG|-2-------------------------|---0---|\nD|-0---0-------0-2---0-2-0---|---0---|\nA|-------0h2-------2---------|---2---|\nE|---------------------------|---3---|",
        notes:["The teachers each play it a little differently. Carl starts with the open D and open A, and Marty starts from the A string at fret 2. Both end D 0-2-0, then go to G."] },
      { id:"turn", name:"The Cadd9 → G/B → B♭ turnaround (the stretch)", diff:4,
        why:"These are chord shapes you won't know yet, there's a reach down to the first fret, and the open strings have to keep ringing through the changes.",
        tip:"Keep your ring and pinky on fret 3 of the B and high E strings as an anchor through Cadd9 and G/B. Only the bass note moves. Practice the move to B♭ by itself at 0.5x.",
        clips:[
          { v:"I13VEEkqeLI", a:420, b:480, t:"captions", note:"Cadd9 → G/B → stretch to fret 1 (7:00–8:00)" },
          { v:"WbkcYKKIh90", a:280, b:345, t:"captions", note:"Carl: C, then fret 2, then the B♭ shape with open strings (4:40–5:45)" },
          { v:"VnU_bh0dgNU", a:442, b:545, t:"approx", note:"Marty's 'funky B-flat' live voicing (7:22 to about 9:05)" }
        ],
        tabTitle:"Turnaround",
        tab:"     Cadd9 G/B   B♭*     C* (slide up 2)\ne|---3-----3-----0-----|---0---|\nB|---3-----3-----3-----|---5---|\nG|---0-----0-----0-----|---0---|\nD|---2-----0-----3-----|---5---|\nA|---3-----2-----1-----|---3---|\nE|---x-----x-----x-----|---x---|",
        notes:["B♭* = Carl's open-string shape x13030. Marty's live version is x1x33x (the D and high E strings muted).","C* = the same shape slid up 2 frets, with the open strings still ringing. Mute the low E with the tip of your index finger."] },
      { id:"together", name:"Putting it together: slow-motion full run", diff:3,
        why:"Every piece works on its own, but the gaps between pieces (lick → strum → lick) are where the timing falls apart.",
        tip:"Turn on Ladder here: start at 0.5x with the target at 1.0x. Play along with the teacher's slow run every time it loops.",
        clips:[
          { v:"VnU_bh0dgNU", a:372, b:442, t:"captions", note:"Marty: from the top at full speed, then really slow (6:12–7:22, chapter)" },
          { v:"I13VEEkqeLI", a:273, b:329, t:"captions", note:"Slow, even slower, then regular speed (4:33–5:29)" },
          { v:"WbkcYKKIh90", a:379, b:429, t:"captions", note:"Carl plays the whole intro very slowly (6:19–7:09)" }
        ],
        tabTitle:"Intro roadmap",
        tab:"lick 1 → G      lick 2 → D\nlick 1 → G      lick 2 → D (shorter) + fill → G\nlick 1 → G      lick 2 → D\nlick 1 → Cadd9 → G/B → B♭* → C* (slide)\n…then the whole riff starts over",
        notes:["This order is pieced together from the lessons. Check it against the record, because Page plays it loosely and each pass is a little different."] },
      { id:"rhythm", name:"The free-form rhythm (when it rushes back to the lick)", diff:2,
        why:"The intro doesn't sit on a strict grid. After the D chord it goes back to the G lick sooner than you'd expect, so counting along doesn't work.",
        tip:"Turn off the count-in (set gap to 0) and loop this at 0.75x. Hum the timing first, then play it. Your ear will learn it faster than counting.",
        clips:[
          { v:"VnU_bh0dgNU", a:617, b:691, t:"approx", note:"Marty explains the loose timing (about 10:17–11:31)" }
        ],
        tabTitle:"What to listen for",
        tab:"D chord ─┐\n         └─(short!)─→ lick 1 → G\nFirst half of the phrase: relaxed\nSecond half: comes back to the G lick quicker",
        notes:["When the vocals come in, the fill isn't played. It goes straight back to the lick (Marty, around 11:45)."] }
    ]
  }
},
/* ------------------------------------------------------------------ 4 */
{
  id:"ooh-la-la", slug:"ooh-la-la", status:"ready",
  stage:2,
  stageLabel:"Stage 2 · Groove & riffs",
  diffReason:"Three easy chords with a capo. The work is the accent groove and a short single-note riff.",
  techTags:["Strumming", "Hybrid (chords + picking)", "Riffs/Licks", "Hammer-ons/Pull-offs", "Capo"],
  lessonStats:{"songLessons": 10, "topViews": 2164643, "topLesson": "Andy Guitar · Guitar Lesson 5 - 'Ooh La la' (10 Day Guitar Course)", "bigTeacherLessons": 4, "withChapters": 3, "withCaptions": 3, "slowBreakdown": true, "note": "Includes Andy Guitar (2.2M), GuitarJamz (618K), privettricker (416K), Marty Music (156K), JustinGuitar (140K) and Relax and Learn Guitar (33K)."},
  title:"Ooh La La", artist:"Faces", year:1973,
  difficulty:2,
  tags:["Capo 1","Open chords","Accent strum","Melody riff","Hammer-on"],
  key:"A♭ (G/D shapes with capo 1)", capo:"1st fret", tuning:"standard",
  note:"There are only three chords (D, Em7, G). The fun is in the strum feel and Ronnie Wood's melody riff.",
  defaultBpm:70, songTempo:125,
  chords:["D","Em7","G4"],
  patterns:["downs","folk"],
  progression:[
    { chords:["D","Em7"], beats:[4,4], hook:"Poor old Granddad …" },
    { chords:["D","Em7"], beats:[4,4], hook:"… a bitter man …" },
    { chords:["D","Em7"], beats:[4,4], hook:"They'll trap you …" },
    { chords:["D","Em7"], beats:[4,4], hook:"… love is blind …" },
    { chords:["D","Em7","G4"], beats:[4,4,8], hook:"Chorus: I wish that I knew … younger" }
  ],
  timingNote:"Chords follow the Danny Laycock chart on Cifra Club (capo 1: D, Em7, G). One chord per bar is my reading of it, and the tempo is a guess.",
  drillPairs:[["D","Em7"],["Em7","G4"],["G4","D"]],
  original:{ id:"bRukNU3jkIM", title:"Ooh La La (2004 Remaster)", label:"Original recording (Faces, official Topic)" },
  tutorials:[
    { id:"3qwNMLb6GzA", title:"Ooh La La Easy Guitar Tutorial | The Faces", tag:"Song tutorial: JustinGuitar" },
    { id:"39qKemubs7s", title:"The Faces Ooh La La Guitar Lesson + Tutorial", tag:"Song tutorial: Marty Music" },
    { id:"5zmrW5kqows", title:"Faces - Ooh La La - How to Play on Acoustic Guitar", tag:"Song tutorial: GuitarJamz" },
    { id:"VCIsdvZheC8", title:"Guitar Lesson 5 - 'Ooh La la' [10 Day Guitar Course]", tag:"Beginner course: Andy Guitar" },
    { id:"G1X5PzfLKc0", title:"Ooh La La Lesson - The Faces", tag:"Song tutorial: privettricker" }
  ],
  techniques:[
    { name:"Strumming with accents", where:"The verse groove: a soft beat 1, then punchier strums on 2 and 4.",
      videos:[{ id:"9DQhQmE1Qxw", title:"Using Accents - Guitar Strumming Lesson" }] },
    { name:"Hammer-ons", where:"The 0h2 moves inside the melody riff.",
      videos:[{ id:"7hDdZAjKBjY", title:"Hammer-Ons Explained + Exercise For Beginners" }] }
  ],
  hardParts:{
    storagePrefix:"gitfiddle.hp.ooh-la-la.v1.",
    intro:"These clips come from the JustinGuitar, Andy Guitar and GuitarJamz lessons. Marty's lesson has no captions to time clips from, so it's in Tutorials only.",
    tabSource:'The riff tab is a short excerpt from Danny Laycock\'s chart on <a href="https://www.cifraclub.com/faces/ooh-la-la/" target="_blank" rel="noopener">Cifra Club</a> (written relative to capo 1). Check it against the record.',
    parts:[
      { id:"groove", name:"The accented strum (soft 1, punch on 2 & 4)", diff:2,
        why:"Even strumming sounds flat on this song. The groove comes from a light strum on 1 and accents on 2 and 4, like a snare drum.",
        tip:"Keep your hand moving down-up all the time and only change how hard you hit. Justin demonstrates it at about 4:35.",
        clips:[
          { v:"3qwNMLb6GzA", a:240, b:320, t:"captions", note:"Justin: from plain 1-2-3-4 to the accent groove (4:00–5:20)" },
          { v:"VCIsdvZheC8", a:158, b:351, t:"captions", note:"Andy Guitar: practice the rhythm part (chapter 2:38–5:51)" },
          { v:"5zmrW5kqows", a:69, b:169, t:"captions", note:"GuitarJamz: basic chords and strumming (chapter 1:09–2:49)" }
        ],
        tabTitle:"Accent map",
        tab:"Count:  1     2     3     4\nStrum:  ↓     ↓     ↓     ↓\nWeight: soft  LOUD  soft  LOUD",
        notes:["Then add the up-strums between the beats, keeping the accents on 2 and 4."] },
      { id:"ronnie", name:"Ronnie Wood's down-up-mute pattern", diff:3,
        why:"The record's strum has muted \"chk\" hits mixed in. It's easy to hear but hard to copy at speed.",
        tip:"Loop Justin's breakdown at 0.5x. For the mute, relax your fretting fingers so they touch the strings without pressing them down.",
        clips:[
          { v:"3qwNMLb6GzA", a:320, b:386, t:"captions", note:"Justin: Ronnie's strumming pattern from the record (5:20–6:26)" }
        ],
        tabTitle:"Pattern (copy Justin)",
        tab:"1   &   2   &   3   &   4   &\n↓       ↓   ↑   X       ↓   ↓\n(X = muted strum, approximate. Follow the video)",
        notes:["I pieced this pattern together from Justin's spoken count, so treat the video as the authority."] },
      { id:"riff", name:"The melody riff (lead line)", diff:3,
        why:"It's a single-note line with stretches (frets 2-4-5) and a hammer-on, played between strums.",
        tip:"Use one finger per fret around frets 2–5 and keep your index finger down where Andy does. Ladder from 0.5x to 1.0x.",
        clips:[
          { v:"3qwNMLb6GzA", a:386, b:518, t:"captions", note:"Justin: the riff (chapter 6:26–8:38)" },
          { v:"VCIsdvZheC8", a:443, b:600, t:"approx", note:"Andy Guitar: learning the lead riff (chapter starts at 7:23, loop end is a guess)" },
          { v:"5zmrW5kqows", a:225, b:334, t:"captions", note:"GuitarJamz: adding the melody lines (chapter 3:45–5:34)" }
        ],
        tabTitle:"Intro riff (capo 1)",
        tab:"   D           Em7          G\ne|-----------------------------|\nB|-----------------------------|\nG|--2--------------------------|\nD|----5-4-2-0h2-4--5-4-2-------|\nA|----------------------5-0h2-5|\nE|-----------------------------|",
        notes:["Fret numbers are relative to the capo (capo = 0)."] },
      { id:"changes", name:"D → Em7 → G (chorus changes)", diff:1,
        why:"These are easy shapes, but the chorus adds G and the timing shifts.",
        tip:"Em7 (022033) and G (320033) share the ring and pinky on fret 3, so keep them planted.",
        clips:[
          { v:"5zmrW5kqows", a:169, b:225, t:"captions", note:"GuitarJamz: the bridge/chorus section (chapter 2:49–3:45)" },
          { v:"VCIsdvZheC8", a:79, b:158, t:"captions", note:"Andy Guitar: chord and rhythm overview (chapter 1:19–2:38)" }
        ],
        tabTitle:"Shapes",
        tab:"     D    Em7  G\ne|---2----3----3---|\nB|---3----3----3---|\nG|---2----0----0---|\nD|---0----0----0---|\nA|---x----2----2---|\nE|---x----0----3---|",
        notes:["Ring and pinky stay on fret 3 for both Em7 and G."] }
    ]
  }
},
/* ------------------------------------------------------------------ 5 */
{
  id:"treetop-flyer", slug:"treetop-flyer", status:"ready",
  stage:4,
  stageLabel:"Stage 4 · Fingerstyle & tunings",
  diffReason:"Independent thumb-picked bass in an alternate tuning, with off-beat plucks, hammer-ons and improvised lines on top.",
  techTags:["Fingerpicking", "Alternate tuning", "Hammer-ons/Pull-offs", "Riffs/Licks"],
  lessonStats:{"songLessons": 7, "topViews": 170282, "topLesson": "stevertr · Treetop Flyer - Stephen Stills - Guitar Lesson", "bigTeacherLessons": 0, "withChapters": 3, "withCaptions": 4, "slowBreakdown": true, "note": "stevertr (170K), Jon Michael Swift (117K verse lesson + intro 24K + solo 14K), Cortez Cortez (17K), Austin Guitar School (16K) and a Totally Guitars preview (7K). Jon breaks down each variation in its own chapter."},
  title:"Treetop Flyer", artist:"Stephen Stills", year:1991,
  difficulty:4,
  tags:["Travis picking","Alternate tuning","Double Drop D","Hammer-ons","Improvising"],
  key:"D (D minor-pentatonic feel)", capo:"None", tuning:"ddd",
  tuningNote:"Most lessons teach it in Double Drop D (DADGBD: drop both E strings to D), including Jon Michael Swift, stevertr and Totally Guitars. That also matches Stills' live versions. The 1991 album version (Stills Alone) is often said to be in DADGAD: American Songwriter says so, and Cortez Cortez plays the intro in DADGAD. This page uses Double Drop D.",
  note:"It's really a four-bar loop (D5 → G → F6) carried by a thumb-picked alternating bass, and Stills improvises over it.",
  defaultBpm:60, songTempo:100,
  chords:["D5-ddd","G-ddd","F6-ddd"],
  patterns:["travis","downs"],
  progression:[
    { chords:["D5-ddd","G-ddd","F6-ddd"], beats:[4,2,2], hook:"I could be a rambler …" },
    { chords:["D5-ddd","G-ddd","F6-ddd"], beats:[4,2,2], hook:"I don't pay taxes …" },
    { chords:["D5-ddd","G-ddd","F6-ddd"], beats:[4,2,2], hook:"I don't do business …" },
    { chords:["D5-ddd","G-ddd","F6-ddd"], beats:[4,2,2], hook:"I love my aeroplane … treetop flyer" }
  ],
  timingNote:"Shapes come from Jon Michael Swift's and stevertr's lessons (Double Drop D). Chord placement follows the guitarx.com chart, and the tempo is a guess. Stills never plays it the same way twice.",
  drillPairs:[["D5-ddd","G-ddd"],["G-ddd","F6-ddd"],["F6-ddd","D5-ddd"]],
  original:{ id:"opBe5z0qwRE", title:"Stephen Stills - Treetop Flyer", label:"Album version (Stills Alone, 1991, fan upload)" },
  tutorials:[
    { id:"TDzoCn0R4XQ", title:"Treetop Flyer Guitar Lesson - Verse Parts - The Thumb Picking Guitar Series", tag:"Song tutorial: Jon Michael Swift (Double Drop D)" },
    { id:"-yUaveQmSNg", title:"Treetop Flyer Guitar Lesson Intro - The Travis Picking Guitar Series", tag:"Song tutorial: intro" },
    { id:"QHiTnL5WDOM", title:"Treetop Flyer - Stephen Stills - Guitar Lesson", tag:"Song tutorial: stevertr (Double Drop D)" },
    { id:"QGALg4teWxE", title:"Treetop Flyer by Stephen Stills (How to play)", tag:"Song tutorial: Austin Guitar School" },
    { id:"O9L-7qum1uk", title:"How To Play \"TREETOP FLYER\" by Stephen Stills", tag:"Song tutorial: Cortez Cortez (DADGAD intro)" },
    { id:"NUmIO_MG5IU", title:"Treetop Flyer - Stephen Stills (Live)", tag:"Live performance", tagClass:"orig" }
  ],
  techniques:[
    { name:"Travis picking (thumb alternating bass)", where:"The whole song: the thumb alternates between the 6th and 4th strings while your fingers pick the G and B strings.",
      videos:[{ id:"m6b371mNkCw", title:"The LEGENDARY picking pattern - 'Travis Picking'" },{ id:"K2Z3RZc5t-A", title:"Basic Fingerstyle - Travis Finger Picking [FO-108]" }] },
    { name:"Double Drop D tuning", where:"Retune before you start: drop both E strings down a whole step to D.",
      videos:[{ id:"rmGjI5Smx4w", title:"How to Play Double Drop D Tuning | Guitar Tricks" },{ id:"ixeFsasPjcI", title:"All About Drop D, Double Drop D, Open G, and Open D" }] },
    { name:"Hammer-ons inside chord shapes", where:"The G-string hammer on and off inside the F6 shape.",
      videos:[{ id:"7hDdZAjKBjY", title:"Hammer-Ons Explained + Exercise For Beginners" }] }
  ],
  hardParts:{
    storagePrefix:"gitfiddle.hp.treetop-flyer.v1.",
    intro:"Tune to Double Drop D first (D A D G B D). All the clips except Cortez use it.",
    tabSource:"The shapes and Travis pattern are transcribed from Jon Michael Swift's and stevertr's spoken instructions (Double Drop D). They're a simplified version of what Stills plays.",
    parts:[
      { id:"travis", name:"Double Drop D + the thumb-picked alternating bass", diff:3,
        why:"Your thumb has to keep a steady 6th–4th string bass going on its own while your fingers pluck between the beats. That independence is the whole song.",
        tip:"Play the thumb part alone for a few minutes until it's automatic, then add one finger. Jon palm-mutes the bass strings lightly.",
        clips:[
          { v:"TDzoCn0R4XQ", a:27, b:62, t:"captions", note:"Jon: tuning to Double Drop D + the basic Travis pattern (chapters 0:27–0:58)" },
          { v:"QGALg4teWxE", a:80, b:183, t:"captions", note:"Austin Guitar School: the fingerpicking pattern (chapter 1:20–3:03)" },
          { v:"QHiTnL5WDOM", a:42, b:66, t:"captions", note:"stevertr: dropping both E strings to D (0:42–1:06)" }
        ],
        tabTitle:"Travis pattern on D5 (DADGBD)",
        tab:"    1   &   2   &   3   &   4   &\nD|----------------------------------|\nB|--------------3---------------3---|\nG|------2---------------2-----------|\nD|----------0---------------0-------|\nA|----------------------------------|\nD|--0---------------0---------------|",
        notes:["Thumb: 6th string on 1 and 3, 4th string on 2 and 4. Fingers fill the \"&\"s."] },
      { id:"shapes", name:"The D5 → G → F6 shapes (diagonal grip + slide)", diff:3,
        why:"In this tuning the shapes are unfamiliar. The G is a diagonal four-finger grip at fret 5 that slides down 2 frets to make F6.",
        tip:"Make the G shape once, then slide the whole hand down 2 frets without lifting. That's the F6. Skip the A string.",
        clips:[
          { v:"TDzoCn0R4XQ", a:58, b:162, t:"captions", note:"Jon: the chords in the song (chapter 0:58–2:42)" },
          { v:"QHiTnL5WDOM", a:63, b:160, t:"captions", note:"stevertr: the main chord shapes and the slide to F (1:03–2:40)" },
          { v:"QGALg4teWxE", a:0, b:80, t:"captions", note:"Austin Guitar School: chords and tuning (chapter 0:00–1:20)" }
        ],
        tabTitle:"Shapes (DADGBD)",
        tab:"      D5     G      F6\nD|----0------0------0----|\nB|----3------3------1----|\nG|----2------4------2----|\nD|----0------5------3----|\nA|----x------x------x----|\nD|----0------5------3----|",
        notes:["Jon often lifts the middle finger on F6 so the open G rings, and that hammer on/off is part of the sound."] },
      { id:"variations", name:"Off-beat plucks, hammer-ons & variations", diff:4,
        why:"Stills never plays the plain pattern for long. He drops in off-beat plucks and hammer-ons, and adding them breaks your thumb's rhythm.",
        tip:"Add one variation at a time, and only once the thumb keeps going without you thinking about it. Ladder from 0.5x.",
        clips:[
          { v:"TDzoCn0R4XQ", a:302, b:430, t:"captions", note:"Jon: the off-beat variation (chapter 5:02–7:10)" },
          { v:"TDzoCn0R4XQ", a:200, b:302, t:"captions", note:"Jon: 'the desert pattern' (chapter 3:20–5:02)", label:"Desert pattern" },
          { v:"O9L-7qum1uk", a:403, b:453, t:"captions", note:"Cortez: hammer-on from fret 2 of the A string (chapter 6:43–7:33, in DADGAD)" }
        ],
        tabTitle:"Idea",
        tab:"Keep the thumb:  D . D . D . D .\nAdd plucks on G/B between beats,\nhammer the G string 0h2 inside F6.",
        notes:["Cortez plays in DADGAD (the album tuning), so his fret numbers differ from the other clips."] },
      { id:"intro", name:"The studio intro lick", diff:4,
        why:"The record opens with a busy single-note line over the drone, quicker than the verse picking.",
        tip:"Learn it in short chunks of two or three notes. Loop each chunk until it's clean, then join them.",
        clips:[
          { v:"-yUaveQmSNg", a:10, b:118, t:"approx", note:"Jon Michael Swift: intro lesson (short video, loop set to the whole thing)" },
          { v:"O9L-7qum1uk", a:195, b:403, t:"approx", note:"Cortez: the intro in DADGAD (3:15 onward, end is the chapter boundary)" }
        ],
        tabTitle:"Tuning check",
        tab:"Jon: Double Drop D  (D A D G B D)\nCortez: DADGAD      (D A D G A D)\nRetune the B string to A for Cortez's clip.",
        notes:["I didn't write out tab for the intro. Use the clip as your guide."] }
    ]
  }
},
/* ------------------------------------------------------------------ 6 */
{
  id:"foggy-dew", slug:"foggy-dew", status:"ready",
  stage:2,
  stageLabel:"Stage 2 · Fingerpicking intro",
  diffReason:"Four open chords and a simple picking pattern. The challenge is the free-time verse and the thumb changing strings.",
  techTags:["Fingerpicking", "Strumming", "Capo"],
  lessonStats:{"songLessons": 8, "topViews": 42482, "topLesson": "Jesse Ferguson · How to Play \"The Foggy Dew\"", "bigTeacherLessons": 0, "withChapters": 3, "withCaptions": 2, "slowBreakdown": true, "note": "Jesse Ferguson (42K), Matthew Lennon (38K), getcrackingguitar (34K), Philip Jackson (16K), Jason's Guitar School (13K), plus three short tab/walkthrough videos. No big-name teacher."},
  title:"The Foggy Dew", artist:"Traditional (Irish), words by Canon Charles O'Neill", year:1919,
  difficulty:2,
  tags:["Fingerpicking","Minor chords","Free-time verse","Strumming"],
  key:"A minor", capo:"Optional (Jesse Ferguson uses capo 1)", tuning:"standard",
  versionNote:"This is the most-taught guitar arrangement: Am–G–Em–C in A minor, as taught by Jesse Ferguson (capo 1) and getcrackingguitar, using Canon O'Neill's 1919 Easter Rising lyrics (Roud 973). The first verse is played slowly in free time, then it moves to a steady strum. The reference recording is The Dubliners. I haven't checked its key, so move the capo until it matches. Sinéad O'Connor & The Chieftains' 1995 version is a different, slower arrangement.",
  note:"Four chords, a simple picking pattern and a free-time opening verse. It's a good first fingerpicking song.",
  defaultBpm:60, songTempo:90,
  chords:["Am","G","Em","C"],
  patterns:["arpeggio","downs"],
  progression:[
    { chords:["Am","G","Em","C","G","Am"], beats:[4,2,2,2,2,4], hook:"'Twas down the glen one Easter morn …" },
    { chords:["Am","G","Em","C","G","Am"], beats:[4,2,2,2,2,4], hook:"When Ireland's lines of marching men …" },
    { chords:["C","G","Em","C","G","Am"], beats:[4,2,2,2,2,4], hook:"No pipe did hum, no battle drum …" },
    { chords:["Am","G","Em","C","G","Am"], beats:[4,2,2,2,2,4], hook:"But the Angelus bell … the foggy dew" }
  ],
  timingNote:"Chord placement follows Jesse Ferguson's chord sheet. The beats per chord and the tempo are my guesses. The first verse is meant to be sung freely.",
  drillPairs:[["Am","G"],["G","Em"],["Em","C"],["C","G"]],
  original:{ id:"r8Gq1XAdHJM", title:"The Foggy Dew", label:"Reference recording: The Dubliners (official Topic)" },
  tutorials:[
    { id:"iVBiF4_7JGU", title:"How to play The Foggy Dew - guitar lesson", tag:"Song tutorial: getcrackingguitar" },
    { id:"V_-IH712ldQ", title:"How to Play \"The Foggy Dew\" | Simple guitar lesson", tag:"Song tutorial: Jesse Ferguson" },
    { id:"ZKlhbvbh8xs", title:"The Foggy Dew: Guitar Lesson", tag:"Song tutorial: Matthew Lennon" },
    { id:"o87TeuYzmDc", title:"The Foggy Dew Guitar Tutorial", tag:"Song tutorial: Jason's Guitar School" },
    { id:"Idf2aPmwCKs", title:"The Foggy Dew — Chords and Melody with Tab", tag:"Chords + melody: Philip Jackson" },
    { id:"keWnPZOd2cw", title:"The Foggy Dew - Sinéad O'Connor & The Chieftains, 1995", tag:"Another version", tagClass:"orig" }
  ],
  techniques:[
    { name:"Fingerpicking basics", where:"The verse pattern: thumb on the bass note, fingers on the G and high E strings.",
      videos:[{ id:"2WB8otOcz78", title:"Finger Style For Beginners. Start Here." },{ id:"UWY1OnCXPB0", title:"2 MUST KNOW Beginner Fingerpicking Patterns" }] }
  ],
  hardParts:{
    storagePrefix:"gitfiddle.hp.foggy-dew.v1.",
    intro:"These are clips from the two most-taught lessons (getcrackingguitar and Jesse Ferguson), both in A minor.",
    tabSource:"The picking pattern is transcribed from getcrackingguitar's spoken instructions: thumb on the root, then the 3rd, 1st and 3rd strings.",
    parts:[
      { id:"picking", name:"The picking pattern (thumb jumps between strings)", diff:2,
        why:"The finger pattern stays the same, but the thumb's bass string changes with every chord: 5th string for Am and C, 6th string for G and Em.",
        tip:"Say the bass string out loud as you change (\"five… six… six… five\"). Loop at 0.5x and pick along.",
        clips:[
          { v:"iVBiF4_7JGU", a:44, b:138, t:"captions", note:"getcrackingguitar: the fingerpicking pattern (0:44–2:18)" }
        ],
        tabTitle:"Pattern",
        tab:"     Am              G\n    1   2   3   4     1   2   3   4\ne|----------0-----------------3-------|\nB|------------------------------------|\nG|------2-------2---------0-------0---|\nD|------------------------------------|\nA|--0---------------------------------|\nE|--------------------3---------------|",
        notes:["Thumb on the root, index on the G string, ring finger on the high E (getcrackingguitar's fingering)."] },
      { id:"free-verse", name:"The free-time first verse", diff:2,
        why:"The opening verse doesn't have a steady beat. You follow the singing and let each chord ring, so a metronome won't help here.",
        tip:"Hum the melody and change chords on the word where the chord sheet puts them. Listen to the reference recording first.",
        clips:[
          { v:"V_-IH712ldQ", a:102, b:164, t:"captions", note:"Jesse Ferguson: the first verse, slow and ringing (chapter 1:42–2:44)" }
        ],
        tabTitle:"Verse 1 chords",
        tab:"Am           G     Em     C   G    Am\n'Twas down the glen one Easter morn…\n(let each chord ring, no steady beat)",
        notes:["Chord sheet from Jesse Ferguson's video description."] },
      { id:"strum", name:"Switching to the quick strum", diff:2,
        why:"From verse 2 on it moves to a steady, quicker strum, and the switch from free time to strict time is where people stumble.",
        tip:"Count \"1 2 3 4\" out loud as you start verse 2. Jesse marks where to start strumming quickly (the C* on the last line of verse 1).",
        clips:[
          { v:"V_-IH712ldQ", a:164, b:260, t:"approx", note:"Jesse: strum pattern for the rest of the song (chapter starts at 2:44, loop end is a guess)" },
          { v:"iVBiF4_7JGU", a:187, b:273, t:"captions", note:"getcrackingguitar: the strumming pattern (chapter 3:07–4:33)" }
        ],
        tabTitle:"Strum",
        tab:"Count: 1   2   3   4\nStrum: ↓   ↓   ↓ ↑ ↓\n(listen to the clip, this is approximate)",
        notes:["getcrackingguitar keeps the same chords and only changes the right hand."] },
      { id:"changes", name:"Am → G → Em → C changes", diff:2,
        why:"Four chords come quickly in the middle of every line (2 beats each).",
        tip:"Am → C is easy because only the ring finger moves. G → Em is the big move, so practice it in the 1-minute drill.",
        clips:[
          { v:"iVBiF4_7JGU", a:138, b:187, t:"captions", note:"getcrackingguitar: focus on the chord progression (chapter 2:18–3:07)" },
          { v:"o87TeuYzmDc", a:192, b:264, t:"captions", note:"Jason's Guitar School: chords breakdown (chapter 3:12–4:24)" }
        ],
        tabTitle:"Shapes",
        tab:"     Am   G    Em   C\ne|---0----3----0----0---|\nB|---1----0----0----1---|\nG|---2----0----0----0---|\nD|---2----0----2----2---|\nA|---0----2----2----3---|\nE|---x----3----0----x---|",
        notes:["Am and C share the index on the B string at fret 1 and the middle on the D string at fret 2."] }
    ]
  }
}
];

window.GF_DATA = { TECHNIQUES:TECHNIQUES, TUNINGS:TUNINGS, CHORDS:CHORDS, VIDEOS:VIDEOS, SONGS:SONGS };
})();
