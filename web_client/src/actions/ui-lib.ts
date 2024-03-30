let oldLength = '';
let oldPos = '';
let totalLength = 0;
let displayLength = '';
let current = 0;
let displayCurrent = '';

const convertToTime = (time: string): string => {
  return time.replace(/^0(?:0:0?)?/, '');
};

const convertToSeconds = (timeText: string): number => {
  const temp = timeText.split(":");
  return (+temp[0]) * 60 * 60 + (+temp[1]) * 60 + (+temp[2]);
};

export const SliderPosition = (songLength: string, currentPos: string) => {
  if (oldLength !== songLength) {
    totalLength = convertToSeconds(songLength);
    displayLength = convertToTime(songLength);
    oldLength = songLength;
  }

  if (oldPos !== currentPos) {
    current = convertToSeconds(currentPos);
    displayCurrent = convertToTime(currentPos);
    oldPos = currentPos;
  }

  return {
    length: displayLength,
    current: displayCurrent,
    percent: Math.floor(current / (totalLength / 100)),
  };
};
