import type {
  AnalyticsSignals,
  Author,
  CommentItem,
  DiscoveryPost,
  NotificationItem,
  PinnedPrompt,
  SavedEntry,
} from "@/types/community";

export const DEMO_USERS: Record<string, Author> = {
  maya: {
    id: "user-maya",
    name: "Maya Lin",
    handle: "@mayalin",
    roleTitle: "Product designer",
    tone: "pink",
    initials: "ML",
  },
  terry: {
    id: "user-terry",
    name: "Terry Wang",
    handle: "@terry",
    roleTitle: "Community admin",
    tone: "cobalt",
    initials: "TW",
  },
  newcomer: {
    id: "user-newcomer",
    name: "Sam Rivera",
    handle: "@samr",
    roleTitle: "Interaction designer",
    tone: "emerald",
    initials: "SR",
  },
};

export const INITIAL_PINNED_PROMPT: PinnedPrompt = {
  id: "prompt-bookmark-ai",
  title: "Redesign a browser bookmark for the AI era",
  description:
    "Try a quick 15–30 minute sketch, prototype, or wild note. Unfinished ideas are totally welcome, and there are no winners—just fun interpretations.",
  durationHint: "15–30 min play",
  tone: "sun",
};

export const INITIAL_POSTS: DiscoveryPost[] = [
  {
    id: "post-1",
    title: "Bookmarks as living moodboards instead of dusty folders",
    kind: "website",
    tone: "coral",
    artwork: "bookmark-era",
    restTilt: -2.2,
    hoverTilt: 1.6,
    authorId: "user-maya",
    authorName: "Maya Lin",
    authorHandle: "@mayalin",
    authorRole: "Product designer",
    authorTone: "pink",
    createdAt: "2026-11-25T08:10:00Z",
    lastActivityAt: "2026-11-25T09:42:00Z",
    originalCreator: "Maya Lin (original study)",
    sourceName: "stilldesigners.com/play/living-bookmarks",
    sourceUrl: "https://stilldesigners.com",
    attributionNote:
      "Original 20-minute study shared by Maya Lin for the weekly prompt.",
    excerpts: [
      {
        id: "ex-1a",
        text: "When an AI can already search any URL I forgot, a bookmark no longer needs to be a filing cabinet—it can be a warm shelf of visual sparks.",
      },
      {
        id: "ex-1b",
        text: "Each saved link pulls one dominant color swatch and a two-line personal reason why I cared, fading gently if I never revisit it.",
      },
    ],
    personalTake:
      "I sketched this in 20 minutes for the prompt! Instead of nested folders, what if saving a page asked you for a single playful sticker note so future-you remembers the feeling, not just the headline?",
    discussionPrompt:
      "If your browser only let you keep 12 bookmarks on a single corkboard, what metadata would actually matter?",
    visualPins: [
      {
        id: "pin-1a",
        x: 32,
        y: 38,
        label: "Tilted color swatch stack",
      },
      {
        id: "pin-1b",
        x: 71,
        y: 62,
        label: "Fading timestamp corner",
      },
    ],
    promptId: "prompt-bookmark-ai",
    perspectives: [
      {
        id: "persp-1a",
        authorId: "user-nora",
        authorName: "Nora Klein",
        authorTone: "sky",
        text: "Love the gentle fading idea! My bookmark bar is basically a museum of projects from 2022—decaying gracefully feels kinder than manual cleanup.",
        createdAt: "2026-11-25T08:55:00Z",
      },
    ],
    reactions: {
      thumbsUp: ["user-nora", "user-leo", "user-terry", "user-hana"],
      heart: ["user-maya", "user-nora", "user-priya", "user-leo", "user-tomas"],
    },
    reports: [],
  },
  {
    id: "post-2",
    title: "Hand-painted UI cursors that wave hello when you idle",
    kind: "website",
    tone: "cobalt",
    artwork: "cursor-garden",
    restTilt: 1.7,
    hoverTilt: -1.4,
    authorId: "user-leo",
    authorName: "Leo Okafor",
    authorHandle: "@leookafor",
    authorRole: "Creative technologist",
    authorTone: "sky",
    createdAt: "2026-11-25T07:30:00Z",
    lastActivityAt: "2026-11-25T09:15:00Z",
    originalCreator: "Studio Paperkite",
    sourceName: "paperkite.studio/cursor-garden",
    sourceUrl: "https://example.com/cursor-garden",
    attributionNote:
      "External discovery shared for inspiration and discussion—credit belongs to Studio Paperkite.",
    excerpts: [
      {
        id: "ex-2a",
        text: "Most AI interfaces feel like sterile terminals. Adding a tiny two-frame wiggle when the pointer rests reminds you a human crafted this room.",
      },
      {
        id: "ex-2b",
        text: "Delight works best when it stays out of the way during focused tasks and only peeks out in the pauses between clicks.",
      },
    ],
    personalTake:
      "Found this tiny portfolio experiment last night and couldn't stop smiling. While AI tools generate clean screens in seconds, tiny weird micro-behaviors like a sleepy cursor still feel unmistakably human.",
    discussionPrompt:
      "Where is the line between charming micro-play and distracting novelty?",
    visualPins: [
      {
        id: "pin-2a",
        x: 56,
        y: 44,
        label: "Waving pointer character",
      },
    ],
    perspectives: [],
    reactions: {
      thumbsUp: ["user-maya", "user-priya", "user-terry"],
      heart: ["user-hana", "user-tomas", "user-maya"],
    },
    reports: [],
  },
  {
    id: "post-3",
    title: "Beautiful AI typography failures and what they accidentally taught me",
    kind: "article",
    tone: "sun",
    artwork: "ai-bloopers",
    restTilt: -1.4,
    hoverTilt: 2.1,
    authorId: "user-priya",
    authorName: "Priya Nair",
    authorHandle: "@priyanair",
    authorRole: "Brand & type designer",
    authorTone: "coral",
    createdAt: "2026-11-25T06:20:00Z",
    lastActivityAt: "2026-11-25T09:30:00Z",
    originalCreator: "Priya Nair (personal field notes)",
    sourceName: "priyanair.design/happy-accidents",
    sourceUrl: "https://example.com/happy-accidents",
    attributionNote:
      "Short excerpts shared with credit—visit the original essay for the full notes.",
    excerpts: [
      {
        id: "ex-3a",
        text: "When I asked an image model for 'warm grocery store signage', it invented a ligature between R and O that no real font has—and it actually solved a logo lockup I was stuck on.",
      },
      {
        id: "ex-3b",
        text: "Treating model glitches like risograph misprints turns frustration into a sketchbook.",
      },
    ],
    personalTake:
      "We always post polished AI outputs, never the funny broken ones. Half my best recent lettering ideas started from a model hallucinating impossible curves and me redrawing them cleanly in vector.",
    discussionPrompt:
      "Have you ever kept an accidental AI glitch and turned it into a real design detail?",
    visualPins: [
      {
        id: "pin-3a",
        x: 42,
        y: 52,
        label: "Accidental R-O ligature loop",
      },
    ],
    perspectives: [
      {
        id: "persp-3a",
        authorId: "user-tomas",
        authorName: "Tomas Vega",
        authorTone: "emerald",
        text: "Comparing AI glitches to risograph misprints completely reframes how I use image models during early moodboarding.",
        createdAt: "2026-11-25T08:12:00Z",
      },
    ],
    reactions: {
      thumbsUp: ["user-maya", "user-leo", "user-nora", "user-tomas", "user-terry"],
      heart: ["user-maya", "user-hana", "user-nora"],
    },
    reports: [],
  },
  {
    id: "post-4",
    title: "Tactile synthesizer knobs translated into web sliders",
    kind: "video",
    tone: "emerald",
    artwork: "tactile-knobs",
    restTilt: 2.3,
    hoverTilt: -1.5,
    authorId: "user-tomas",
    authorName: "Tomas Vega",
    authorHandle: "@tomasv",
    authorRole: "Design engineer",
    authorTone: "emerald",
    createdAt: "2026-11-24T22:15:00Z",
    lastActivityAt: "2026-11-25T07:50:00Z",
    originalCreator: "Teenage Engineering & community breakdown by K. Sato",
    sourceName: "vimeo.com/tactile-web-knobs",
    sourceUrl: "https://example.com/tactile-knobs",
    attributionNote:
      "External video reference shared for inspiration and discussion—credit belongs to the original creator.",
    excerpts: [
      {
        id: "ex-4a",
        text: "A physical detent tells your fingers where the default value lives without making your eyes read a single number.",
      },
      {
        id: "ex-4b",
        text: "Pairing a subtle spring snap with a 40ms click sound makes temperature and creativity sliders feel playful instead of technical.",
      },
    ],
    personalTake:
      "Every AI app gives users a dry 'temperature: 0.7' text box. Imagine tuning an AI assistant's playfulness with chunky plastic knobs that click softly into place.",
    discussionPrompt:
      "What boring AI parameter deserves a toy-like physical control?",
    visualPins: [
      {
        id: "pin-4a",
        x: 28,
        y: 48,
        label: "Chunky coral dial detent",
      },
      {
        id: "pin-4b",
        x: 74,
        y: 46,
        label: "Notched magnetic scale",
      },
    ],
    perspectives: [],
    reactions: {
      thumbsUp: ["user-maya", "user-priya", "user-hana"],
      heart: ["user-leo", "user-terry", "user-nora", "user-maya"],
    },
    reports: [],
  },
  {
    id: "post-5",
    title: "How I turn napkin doodles into clickable prototypes in 15 minutes",
    kind: "article",
    tone: "pink",
    artwork: "sketch-to-ui",
    restTilt: -1.9,
    hoverTilt: 1.8,
    authorId: "user-hana",
    authorName: "Hana Sato",
    authorHandle: "@hanasato",
    authorRole: "UX designer",
    authorTone: "pink",
    createdAt: "2026-11-24T19:40:00Z",
    lastActivityAt: "2026-11-25T08:40:00Z",
    originalCreator: "Hana Sato",
    sourceName: "hanasato.notes/napkin-to-browser",
    sourceUrl: "https://example.com/napkin-to-browser",
    attributionNote:
      "Workflow notes excerpted with credit to Hana Sato.",
    excerpts: [
      {
        id: "ex-5a",
        text: "I stopped opening Figma first for rough flows. Three sharpie boxes on index cards keep me focused on rhythm before pixels hijack my brain.",
      },
      {
        id: "ex-5b",
        text: "Once the card flow feels alive in a quick coded prototype, I bring the winning layout back to refine spacing and craft.",
      },
    ],
    personalTake:
      "Coding prototypes directly from paper sketches made design fun again for me—especially testing motion like hover tilts and dialog springs that static frames never capture.",
    discussionPrompt:
      "Are you still starting in canvas tools, or jumping straight from paper to code?",
    visualPins: [],
    perspectives: [],
    reactions: {
      thumbsUp: ["user-maya", "user-terry", "user-leo"],
      heart: ["user-priya", "user-tomas", "user-nora"],
    },
    reports: [],
  },
  {
    id: "post-6",
    title: "Spatial typography posters that lean toward your cursor",
    kind: "designer",
    tone: "sky",
    artwork: "spatial-type",
    restTilt: 1.5,
    hoverTilt: -2.0,
    authorId: "user-nora",
    authorName: "Nora Klein",
    authorHandle: "@noraklein",
    authorRole: "Visual designer",
    authorTone: "sky",
    createdAt: "2026-11-24T16:10:00Z",
    lastActivityAt: "2026-11-24T23:05:00Z",
    originalCreator: "Jules Mercier",
    sourceName: "julesmercier.ch",
    sourceUrl: "https://example.com/jules-mercier",
    attributionNote:
      "Designer portfolio shared for inspiration—credit belongs to Jules Mercier.",
    excerpts: [
      {
        id: "ex-6a",
        text: "Variable font axes like roundness and weight become living choreography when tied gently to pointer distance.",
      },
    ],
    personalTake:
      "Jules makes variable fonts feel like squishy balloons! It reminded me how much warmth pure typography can carry before you even add illustrations.",
    visualPins: [
      {
        id: "pin-6a",
        x: 50,
        y: 45,
        label: "Variable roundness shift",
      },
    ],
    perspectives: [],
    reactions: {
      thumbsUp: ["user-priya", "user-maya"],
      heart: ["user-leo", "user-hana"],
    },
    reports: [],
  },
  {
    id: "post-7",
    title: "Friendly googly eyes as emotional state indicators",
    kind: "image",
    tone: "sun",
    artwork: "micro-doodles",
    restTilt: -2.1,
    hoverTilt: 1.4,
    authorId: "user-terry",
    authorName: "Terry Wang",
    authorHandle: "@terry",
    authorRole: "Community admin",
    authorTone: "cobalt",
    createdAt: "2026-11-24T14:00:00Z",
    lastActivityAt: "2026-11-25T06:15:00Z",
    originalCreator: "Honeysticks brand illustration team",
    sourceName: "honeysticks.com",
    sourceUrl: "https://example.com/honeysticks-eyes",
    attributionNote:
      "External brand reference shared for inspiration—credit belongs to the original illustrators.",
    excerpts: [
      {
        id: "ex-7a",
        text: "Two simple dots in white ovals instantly turn any abstract blob into a character you root for—happy, sleepy, surprised, or curious.",
      },
      {
        id: "ex-7b",
        text: "Instead of writing 'Loading…' in grey text, two curious eyes glancing left and right make waiting feel gentle.",
      },
    ],
    personalTake:
      "I keep coming back to picture-book illustration for inspiration when designing AI companions. You don't need photorealistic avatars—two expressive eyes carry way more soul.",
    discussionPrompt:
      "What non-digital object or kids' book taught you something about UI design?",
    visualPins: [
      {
        id: "pin-7a",
        x: 38,
        y: 40,
        label: "Curious side-glance pupils",
      },
    ],
    perspectives: [],
    reactions: {
      thumbsUp: ["user-maya", "user-nora", "user-priya", "user-hana"],
      heart: ["user-maya", "user-leo", "user-tomas", "user-priya"],
    },
    reports: [],
  },
  {
    id: "post-8",
    title: "Tiny clay-like icons built from 3 basic CSS shadows",
    kind: "website",
    tone: "pink",
    artwork: "clay-icons",
    restTilt: 2.0,
    hoverTilt: -1.6,
    authorId: "user-maya",
    authorName: "Maya Lin",
    authorHandle: "@mayalin",
    authorRole: "Product designer",
    authorTone: "pink",
    createdAt: "2026-11-24T11:30:00Z",
    lastActivityAt: "2026-11-24T20:10:00Z",
    originalCreator: "Devon Park",
    sourceName: "devonpark.dev/clay-css",
    sourceUrl: "https://example.com/clay-css",
    attributionNote:
      "CSS experiment linked with credit to Devon Park.",
    excerpts: [
      {
        id: "ex-8a",
        text: "A chunky solid bottom lip plus one soft inner highlight gives flat vector shapes a playful toy-block feel without heavy 3D assets.",
      },
    ],
    personalTake:
      "Everything in enterprise SaaS has been 1px hairline grey for five years. Seeing chunky toy buttons come back with pure CSS makes me want to poke every button on the screen.",
    visualPins: [],
    perspectives: [],
    reactions: {
      thumbsUp: ["user-tomas", "user-terry"],
      heart: ["user-hana", "user-nora", "user-leo"],
    },
    reports: [],
  },
  {
    id: "post-9",
    title: "Sound effects that make form submission feel like dropping a marble",
    kind: "video",
    tone: "cobalt",
    artwork: "sound-buttons",
    restTilt: -1.6,
    hoverTilt: 2.0,
    authorId: "user-leo",
    authorName: "Leo Okafor",
    authorHandle: "@leookafor",
    authorRole: "Creative technologist",
    authorTone: "sky",
    createdAt: "2026-11-23T21:00:00Z",
    lastActivityAt: "2026-11-24T15:30:00Z",
    originalCreator: "Mina Cho",
    sourceName: "minacho.sound/marble-ui",
    sourceUrl: "https://example.com/marble-ui",
    attributionNote:
      "External sound design study shared for discussion—credit belongs to Mina Cho.",
    excerpts: [
      {
        id: "ex-9a",
        text: "Wooden marimba taps and muted ceramic clicks work better than synthetic beeps because our ears never tire of acoustic textures.",
      },
    ],
    personalTake:
      "I used to mute every web app automatically, until I tried Mina's demo with soft wood-block clicks on card flips. Subtle opt-in sound could make creative tools feel magical.",
    visualPins: [],
    perspectives: [],
    reactions: {
      thumbsUp: ["user-priya", "user-tomas", "user-maya"],
      heart: ["user-maya", "user-terry"],
    },
    reports: [],
  },
  {
    id: "post-10",
    title: "Bento grids that breathe instead of locking into rigid boxes",
    kind: "article",
    tone: "emerald",
    artwork: "living-grid",
    restTilt: 1.9,
    hoverTilt: -1.7,
    authorId: "user-nora",
    authorName: "Nora Klein",
    authorHandle: "@noraklein",
    authorRole: "Visual designer",
    authorTone: "sky",
    createdAt: "2026-11-23T17:45:00Z",
    lastActivityAt: "2026-11-24T12:20:00Z",
    originalCreator: "Linnea Berg",
    sourceName: "linneaberg.se/loose-grids",
    sourceUrl: "https://example.com/loose-grids",
    attributionNote:
      "External essay excerpted with credit—read the full piece on Linnea Berg's blog.",
    excerpts: [
      {
        id: "ex-10a",
        text: "A 2-degree tilt breaks the spreadsheet trance immediately. Suddenly a grid feels like postcards spread across a studio table.",
      },
      {
        id: "ex-10b",
        text: "Keep the underlying rhythm predictable so scanning stays effortless, and let small human imperfections carry the personality.",
      },
    ],
    personalTake:
      "This essay explained why I've been bored of symmetrical bento dashboards lately. Even a tiny angle offset makes every item feel placed by hand.",
    visualPins: [],
    perspectives: [],
    reactions: {
      thumbsUp: ["user-maya", "user-terry", "user-hana"],
      heart: ["user-priya", "user-maya"],
    },
    reports: [],
  },
  {
    id: "post-11",
    title: "Warm paper grain shaders that take the glare off screens",
    kind: "website",
    tone: "coral",
    artwork: "paper-shader",
    restTilt: -2.0,
    hoverTilt: 1.5,
    authorId: "user-priya",
    authorName: "Priya Nair",
    authorHandle: "@priyanair",
    authorRole: "Brand & type designer",
    authorTone: "coral",
    createdAt: "2026-11-23T13:20:00Z",
    lastActivityAt: "2026-11-23T19:00:00Z",
    originalCreator: "Rohan Das",
    sourceName: "rohandas.art/paper-grain",
    sourceUrl: "https://example.com/paper-grain",
    attributionNote:
      "SVG grain recipe shared with credit to Rohan Das.",
    excerpts: [
      {
        id: "ex-11a",
        text: "Swapping stark white for warm cream with a 2% paper noise cuts visual fatigue and makes saturated colors look printed instead of neon.",
      },
    ],
    personalTake:
      "Tried this warm cream tint on a side project yesterday and immediately noticed how much calmer bright cobalt and coral look on paper-toned backgrounds.",
    visualPins: [],
    perspectives: [],
    reactions: {
      thumbsUp: ["user-nora", "user-tomas"],
      heart: ["user-maya", "user-hana"],
    },
    reports: [],
  },
  {
    id: "post-12",
    title: "Mood-tray bookmarks that shake to shuffle your sparks",
    kind: "website",
    tone: "sky",
    artwork: "mood-trays",
    restTilt: 1.6,
    hoverTilt: -1.9,
    authorId: "user-tomas",
    authorName: "Tomas Vega",
    authorHandle: "@tomasv",
    authorRole: "Design engineer",
    authorTone: "emerald",
    createdAt: "2026-11-25T09:05:00Z",
    lastActivityAt: "2026-11-25T09:48:00Z",
    originalCreator: "Tomas Vega (weekly prompt sketch)",
    sourceName: "stilldesigners.com/play/mood-shelf",
    sourceUrl: "https://stilldesigners.com",
    attributionNote:
      "Original 25-minute sketch shared by Tomas Vega for the weekly prompt.",
    excerpts: [
      {
        id: "ex-12a",
        text: "Instead of folders or search bars, an on-device classifier sorts saved links into three studio trays—'playful', 'calm', and 'weird'—that you can shake to rediscover old sparks.",
      },
    ],
    personalTake:
      "My take on this week's bookmark prompt! I realized I only revisit saved links when I'm looking for a specific mood, so I sketched three chunky trays you can rattle like a toy box.",
    discussionPrompt:
      "Would you trust a tiny local classifier to sort your sparks, or is sorting half the joy?",
    visualPins: [
      {
        id: "pin-12a",
        x: 62,
        y: 35,
        label: "Shake-to-shuffle mood tray",
      },
    ],
    promptId: "prompt-bookmark-ai",
    perspectives: [],
    reactions: {
      thumbsUp: ["user-maya", "user-terry", "user-priya"],
      heart: ["user-maya", "user-nora", "user-hana"],
    },
    reports: [],
  },
];

export const INITIAL_COMMENTS: CommentItem[] = [
  {
    id: "cmt-1",
    postId: "post-1",
    authorId: "user-tomas",
    authorName: "Tomas Vega",
    authorTone: "emerald",
    text: "Pulling just one dominant color swatch per link is genius—my eyes recognize colors way faster than favicons!",
    createdAt: "2026-11-25T08:30:00Z",
    anchorType: "visual",
    anchorId: "pin-1a",
    anchorLabel: "Visual pin #1 · Tilted color swatch stack",
    reactions: {
      thumbsUp: ["user-maya", "user-nora"],
      heart: ["user-maya"],
    },
  },
  {
    id: "cmt-2",
    postId: "post-1",
    parentId: "cmt-1",
    authorId: "user-maya",
    authorName: "Maya Lin",
    authorTone: "pink",
    text: "Right?! Favicons all blur into tiny grey squares after tab 10. Color + one personal sentence sticks in memory.",
    createdAt: "2026-11-25T08:42:00Z",
    reactions: {
      thumbsUp: ["user-tomas"],
      heart: ["user-tomas", "user-priya"],
    },
  },
  {
    id: "cmt-3",
    postId: "post-1",
    authorId: "user-priya",
    authorName: "Priya Nair",
    authorTone: "coral",
    text: "This line hit home. AI made retrieval free, so the human value of bookmarking shifts from 'finding' to 'remembering why it moved me'.",
    createdAt: "2026-11-25T09:10:00Z",
    anchorType: "excerpt",
    anchorId: "ex-1a",
    anchorLabel: "Excerpt #1 · 'a bookmark no longer needs to be a filing cabinet'",
    reactions: {
      thumbsUp: ["user-maya", "user-terry"],
      heart: ["user-maya", "user-nora"],
    },
  },
  {
    id: "cmt-4",
    postId: "post-2",
    authorId: "user-hana",
    authorName: "Hana Sato",
    authorTone: "pink",
    text: "Only waking up during idle moments is the secret sauce. Never fight the user when they're trying to click a button!",
    createdAt: "2026-11-25T08:15:00Z",
    anchorType: "excerpt",
    anchorId: "ex-2b",
    anchorLabel: "Excerpt #2 · 'only peeks out in the pauses between clicks'",
    reactions: {
      thumbsUp: ["user-leo", "user-maya"],
      heart: ["user-leo"],
    },
  },
  {
    id: "cmt-5",
    postId: "post-3",
    authorId: "user-leo",
    authorName: "Leo Okafor",
    authorTone: "sky",
    text: "Yes! An image model once rendered a weird rounded 'g' with a smiley ear for a coffee poster and I ended up drawing a whole display wordmark from it.",
    createdAt: "2026-11-25T07:55:00Z",
    anchorType: "visual",
    anchorId: "pin-3a",
    anchorLabel: "Visual pin #1 · Accidental R-O ligature loop",
    reactions: {
      thumbsUp: ["user-priya", "user-maya"],
      heart: ["user-priya"],
    },
  },
  {
    id: "cmt-6",
    postId: "post-12",
    authorId: "user-maya",
    authorName: "Maya Lin",
    authorTone: "pink",
    text: "Aha, a shake-to-shuffle button on mood trays! Love how playful this take on the bookmark prompt feels.",
    createdAt: "2026-11-25T09:48:00Z",
    anchorType: "visual",
    anchorId: "pin-12a",
    anchorLabel: "Visual pin #1 · Shake-to-shuffle mood tray",
    reactions: {
      thumbsUp: ["user-tomas"],
      heart: ["user-tomas", "user-terry"],
    },
  },
];

export const INITIAL_SAVES: SavedEntry[] = [
  {
    postId: "post-3",
    savedAt: "2026-11-25T08:05:00Z",
    discoveredViaName: "Priya Nair",
    discoveredViaHandle: "@priyanair",
  },
  {
    postId: "post-7",
    savedAt: "2026-11-24T20:40:00Z",
    discoveredViaName: "Terry Wang",
    discoveredViaHandle: "@terry",
  },
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    type: "perspective",
    actorName: "Nora Klein",
    postId: "post-1",
    postTitle: "Bookmarks as living moodboards instead of dusty folders",
    snippet: "Added a perspective on your living moodboards sketch",
    createdAt: "2026-11-25T08:55:00Z",
    read: false,
  },
  {
    id: "notif-2",
    type: "reply",
    actorName: "Priya Nair",
    postId: "post-1",
    postTitle: "Bookmarks as living moodboards instead of dusty folders",
    snippet: "Anchored a note on your excerpt about bookmarking as memory",
    createdAt: "2026-11-25T09:10:00Z",
    read: false,
  },
];

export const INITIAL_ANALYTICS: AnalyticsSignals = {
  onboardingCompleted: 42,
  firstParticipations: 35,
  returnVisits: 28,
};
