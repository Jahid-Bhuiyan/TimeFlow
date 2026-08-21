import confetti from 'canvas-confetti';

export const triggerTaskConfetti = () => {
  try {
    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B'],
      disableForReducedMotion: true,
      ticks: 150
    });
  } catch {
    // Ignore confetti failure
  }
};

export const triggerGoalReachedConfetti = () => {
  try {
    const end = Date.now() + 1.2 * 1000;
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  } catch {
    // Ignore
  }
};
