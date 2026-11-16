/**
 * Deterministic scoring for PHQ-9 (0-27) and GAD-7 (0-21).
 */
function scoreAssessment(type, answers) {
  const expectedLength = type === 'PHQ-9' ? 9 : 7;
  if (!Array.isArray(answers) || answers.length !== expectedLength) {
    throw new Error(`${type} requires exactly ${expectedLength} answers.`);
  }

  const totalScore = answers.reduce((sum, val) => sum + Number(val), 0);

  let severityBand = 'minimal';
  if (type === 'PHQ-9') {
    if (totalScore >= 20) severityBand = 'severe';
    else if (totalScore >= 15) severityBand = 'moderately_severe';
    else if (totalScore >= 10) severityBand = 'moderate';
    else if (totalScore >= 5) severityBand = 'mild';
  } else {
    if (totalScore >= 15) severityBand = 'severe';
    else if (totalScore >= 10) severityBand = 'moderate';
    else if (totalScore >= 5) severityBand = 'mild';
  }

  const item9Flag = type === 'PHQ-9' ? Number(answers[8] || 0) > 0 : false;
  return { totalScore, severityBand, item9Flag };
}

/**
 * Computes personal baseline and recent trend from longitudinal assessments and check-ins.
 */
function computeBaselineAndTrend(assessments = [], checkins = []) {
  const moodMap = { baik: 3, sedang: 2, buruk: 1 };
  const moodScores = checkins
    .map((c) => moodMap[c.mood])
    .filter((v) => typeof v === 'number');

  const avgMood =
    moodScores.length > 0
      ? Number((moodScores.reduce((a, b) => a + b, 0) / moodScores.length).toFixed(2))
      : null;

  const recentMood =
    moodScores.length >= 3
      ? Number((moodScores.slice(0, 3).reduce((a, b) => a + b, 0) / 3).toFixed(2))
      : avgMood;

  let moodTrend = 'stable';
  if (avgMood !== null && recentMood !== null) {
    if (recentMood - avgMood >= 0.3) moodTrend = 'improving';
    else if (avgMood - recentMood >= 0.3) moodTrend = 'declining';
  }

  const phqScores = assessments.filter((a) => a.type === 'PHQ-9').map((a) => a.totalScore);
  const gadScores = assessments.filter((a) => a.type === 'GAD-7').map((a) => a.totalScore);

  return {
    checkinCount: checkins.length,
    moodBaseline: avgMood,
    recentMoodAverage: recentMood,
    moodTrend,
    latestPhq9: phqScores[0] ?? null,
    phq9Baseline:
      phqScores.length > 0
        ? Number((phqScores.reduce((a, b) => a + b, 0) / phqScores.length).toFixed(1))
        : null,
    latestGad7: gadScores[0] ?? null,
    gad7Baseline:
      gadScores.length > 0
        ? Number((gadScores.reduce((a, b) => a + b, 0) / gadScores.length).toFixed(1))
        : null,
  };
}

module.exports = { scoreAssessment, computeBaselineAndTrend };
