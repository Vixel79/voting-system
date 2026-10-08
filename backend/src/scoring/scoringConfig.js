module.exports = {
  FIRST_PLACE_POINTS: 5,
  SECOND_PLACE_POINTS: 3,
  THIRD_PLACE_POINTS: 1,

  AUDIENCE_WEIGHT: 0.4,
  JUDGES_WEIGHT: 0.6,

  TIE_BREAK_ORDER: [
    'judgePoints',
    'firstPlaceCount',
  ],
};