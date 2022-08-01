const convertToSeconds = (timeText: string): number => {
  const temp = timeText.split(":");
  let sum = 0;
  for (let i = temp.length - 1; i >= 0; i--) {
    if (sum === 0) {
      sum += parseInt(temp[i]);
    } else {
      sum += parseInt(temp[i]) * 60;
    }
  }
  return sum;
};

export const SliderPosition = (songLength: string, currentPos: string) => {
  const totalLength = convertToSeconds(songLength);
  const current = convertToSeconds(currentPos);
  return Math.floor(current / (totalLength / 100));
};
