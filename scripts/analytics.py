"""Analytics service for PoliticalPulse.

This module provides aggregation and analysis functions for the dataset,
including topic frequency, sentiment distribution, engagement metrics,
peer comparisons, and engagement trends over time.
"""

from __future__ import annotations

from collections import Counter
from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Any


@dataclass
class TopicMetric:
    name: str
    value: int
    color: str = "#2f6478"


@dataclass
class LanguageMetric:
    name: str
    value: int


@dataclass
class EngagementTrend:
    date: str
    posts: int
    engagement: int


def aggregate_topics(posts: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Count topic occurrences and return sorted by frequency."""
    topics = Counter()
    for post in posts:
        topic = post.get("topic", "Other")
        if topic:
            topics[topic] += 1

    colors = [
        "#2f6478",  # ink
        "#d59d3f",  # ochre
        "#5c8e7b",  # green
        "#9a6f63",  # clay
        "#817c9f",  # lavender
    ]
    result = []
    for i, (topic, count) in enumerate(topics.most_common()):
        result.append(
            {
                "name": topic,
                "value": count,
                "color": colors[i % len(colors)],
            }
        )
    return result


def aggregate_sentiment(posts: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Count sentiment labels and return distribution."""
    sentiments = Counter()
    for post in posts:
        sentiment = post.get("sentiment", "neutral")
        if sentiment:
            sentiments[sentiment.lower()] += 1

    total = sum(sentiments.values()) or 1
    colors_map = {
        "positive": "#5c8e7b",
        "neutral": "#8c9aa3",
        "negative": "#9a6f63",
        "critical": "#9a6f63",
    }
    result = []
    for label, count in sentiments.most_common():
        result.append(
            {
                "name": label.capitalize(),
                "value": round((count / total) * 100),
                "color": colors_map.get(label, "#8c9aa3"),
            }
        )
    return result


def aggregate_languages(posts: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Count language labels and return distribution."""
    languages = Counter()
    for post in posts:
        lang = post.get("language", "Unknown")
        if lang:
            languages[lang] += 1

    total = sum(languages.values()) or 1
    result = []
    for lang, count in languages.most_common():
        result.append(
            {
                "name": lang,
                "value": round((count / total) * 100),
            }
        )
    return result


def aggregate_engagement_by_date(
    posts: list[dict[str, Any]], days: int = 12
) -> list[dict[str, Any]]:
    """Aggregate engagement by date across the observation window."""
    date_engagement: dict[str, dict[str, int]] = {}
    for post in posts:
        date_str = post.get("published_at") or post.get("date", "")
        if not date_str:
            continue

        date_key = date_str[:10]
        if date_key not in date_engagement:
            date_engagement[date_key] = {"posts": 0, "engagement": 0}

        date_engagement[date_key]["posts"] += 1
        engagement = (
            int(post.get("likes", 0) or 0)
            + int(post.get("comments", 0) or 0) * 2
            + int(post.get("shares", 0) or 0) * 3
        )
        date_engagement[date_key]["engagement"] += engagement

    result = []
    for date_str in sorted(date_engagement.keys()):
        result.append(
            {
                "date": date_str,
                "posts": date_engagement[date_str]["posts"],
                "engagement": date_engagement[date_str]["engagement"],
            }
        )
    return result


def aggregate_platforms(posts: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Count platform presence."""
    platforms = Counter()
    for post in posts:
        platform = post.get("platform", "Unknown")
        if platform:
            platforms[platform] += 1

    return [
        {
            "id": platform.lower(),
            "platform": platform,
            "handle": f"@handle_{platform.lower()}",
            "followers": 5000 + i * 1000,
            "verified": True,
        }
        for i, platform in enumerate(sorted(platforms.keys()))
    ]


def calculate_engagement_stats(posts: list[dict[str, Any]]) -> dict[str, Any]:
    """Calculate overall engagement statistics."""
    if not posts:
        return {
            "totalPosts": 0,
            "totalComments": 0,
            "totalEngagement": 0,
            "averageEngagement": 0,
            "activePlatforms": 0,
            "dataCoverage": 0,
        }

    platforms = set()
    total_engagement = 0
    total_comments = 0

    for post in posts:
        platform = post.get("platform")
        if platform:
            platforms.add(platform)

        total_comments += int(post.get("comments", 0) or 0)
        engagement = (
            int(post.get("likes", 0) or 0)
            + int(post.get("comments", 0) or 0) * 2
            + int(post.get("shares", 0) or 0) * 3
        )
        total_engagement += engagement

    average = round(total_engagement / len(posts)) if posts else 0

    return {
        "totalPosts": len(posts),
        "totalComments": total_comments,
        "totalEngagement": total_engagement,
        "averageEngagement": average,
        "activePlatforms": len(platforms),
        "dataCoverage": 92,  # Synthetic value for demo
    }
