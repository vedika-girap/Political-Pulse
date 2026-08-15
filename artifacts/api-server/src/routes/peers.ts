import { Router, type IRouter } from "express";
import { logger } from "../lib/logger";

const router: IRouter = Router();

// Peer profile definitions for comparison
const peerProfiles = {
  "regional-median": {
    id: "regional-median",
    name: "Regional median",
    posts: 48,
    postingFrequency: 4,
    averageEngagement: 1320,
    medianEngagement: 980,
    engagementRate: 4.8,
    comments: 76,
    platformPresence: 4,
    videoShare: 38,
    topicMix: {
      "Local governance": 28,
      Agriculture: 21,
      Education: 19,
      Environment: 17,
      "Public events": 15,
    },
    sentimentMix: {
      Positive: 42,
      Neutral: 40,
      Critical: 18,
    },
    languageMix: {
      Kannada: 54,
      English: 30,
      Bilingual: 16,
    },
    note: "Synthetic reference median",
  },
  "constituency-set": {
    id: "constituency-set",
    name: "Karnataka constituency set",
    posts: 144,
    postingFrequency: 12,
    averageEngagement: 1180,
    medianEngagement: 910,
    engagementRate: 4.2,
    comments: 214,
    platformPresence: 3,
    videoShare: 34,
    topicMix: {
      "Local governance": 30,
      Agriculture: 24,
      Education: 18,
      Environment: 14,
      "Public events": 14,
    },
    sentimentMix: {
      Positive: 44,
      Neutral: 38,
      Critical: 18,
    },
    languageMix: {
      Kannada: 61,
      English: 23,
      Bilingual: 16,
    },
    note: "Synthetic comparison cohort",
  },
};

// Selected account metrics (from analytics)
const selectedAccount = {
  name: "Darshan Puttannaiah",
  posts: 36,
  postingFrequency: 3,
  averageEngagement: 79,
  medianEngagement: 75,
  engagementRate: 2.8,
  comments: 54,
  platformPresence: 4,
  videoShare: 22,
  topicMix: {
    "Local governance": 31,
    Agriculture: 24,
    Education: 18,
    Environment: 15,
    "Public events": 12,
  },
  sentimentMix: {
    Positive: 46,
    Neutral: 39,
    Critical: 15,
  },
  languageMix: {
    Kannada: 58,
    English: 27,
    Bilingual: 15,
  },
};

router.get("/peers", (_req, res) => {
  try {
    return res.json([
      peerProfiles["regional-median"],
      peerProfiles["constituency-set"],
    ]);
  } catch (error) {
    logger.error({ error }, "Failed to load peer profiles");
    return res.status(500).json({ error: "Unable to load peer profiles" });
  }
});

router.get("/peers/:peerId", (req, res) => {
  try {
    const { peerId } = req.params;
    const peer = peerProfiles[peerId as keyof typeof peerProfiles];

    if (!peer) {
      return res.status(404).json({ error: "Peer not found" });
    }

    return res.json(peer);
  } catch (error) {
    logger.error({ error }, "Failed to load peer profile");
    return res.status(500).json({ error: "Unable to load peer profile" });
  }
});

router.get("/peers/:peerId/comparison", (req, res) => {
  try {
    const { peerId } = req.params;
    const peer = peerProfiles[peerId as keyof typeof peerProfiles];

    if (!peer) {
      return res.status(404).json({ error: "Peer not found" });
    }

    // Generate comparison metrics
    const comparison = {
      selected: selectedAccount,
      peer,
      gaps: {
        postingFrequency: selectedAccount.postingFrequency - peer.postingFrequency,
        averageEngagement:
          selectedAccount.averageEngagement - peer.averageEngagement,
        medianEngagement:
          selectedAccount.medianEngagement - peer.medianEngagement,
        videoShare: selectedAccount.videoShare - peer.videoShare,
        platformPresence: selectedAccount.platformPresence - peer.platformPresence,
      },
      interpretations: {
        videoShare:
          selectedAccount.videoShare < peer.videoShare
            ? "Selected account posts less video content than peer median"
            : "Selected account exceeds peer video share",
        frequency:
          selectedAccount.postingFrequency < peer.postingFrequency
            ? "Selected account posts less frequently than peer median"
            : "Selected account exceeds peer posting frequency",
        engagement:
          selectedAccount.averageEngagement < peer.averageEngagement
            ? "Selected account engagement is below peer median"
            : "Selected account engagement exceeds peer median",
      },
    };

    return res.json(comparison);
  } catch (error) {
    logger.error({ error }, "Failed to generate peer comparison");
    return res.status(500).json({ error: "Unable to generate comparison" });
  }
});

export default router;
