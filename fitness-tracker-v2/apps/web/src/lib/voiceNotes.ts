// Voice Notes Utility for Workout Tracking
export class VoiceNotes {
  private static instance: VoiceNotes;
  private speechSynthesis: SpeechSynthesis;
  private isEnabled: boolean = true;

  private constructor() {
    this.speechSynthesis = window.speechSynthesis;
  }

  public static getInstance(): VoiceNotes {
    if (!VoiceNotes.instance) {
      VoiceNotes.instance = new VoiceNotes();
    }
    return VoiceNotes.instance;
  }

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  public isVoiceEnabled(): boolean {
    return this.isEnabled;
  }

  private speak(text: string, priority: 'high' | 'normal' = 'normal'): void {
    if (!this.isEnabled || !this.speechSynthesis) return;

    // Cancel any ongoing speech for high priority messages
    if (priority === 'high') {
      this.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 0.8;

    // Use a more natural voice if available
    const voices = this.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.lang.includes('en') && 
      (voice.name.includes('Google') || voice.name.includes('Microsoft'))
    );
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    this.speechSynthesis.speak(utterance);
  }

  public announceWorkoutStart(workoutName: string): void {
    this.speak(`Workout started: ${workoutName}. Let's begin!`, 'high');
  }

  public announceHalfway(): void {
    this.speak("Halfway through your workout. Keep going! You're doing great!", 'high');
  }

  public announceWorkoutComplete(workoutName: string, duration: number): void {
    this.speak(`Congratulations! You've completed ${workoutName} in ${duration} minutes. Great job!`, 'high');
  }

  public announceExerciseStart(exerciseName: string, sets: number): void {
    this.speak(`Next exercise: ${exerciseName}. ${sets} sets to complete.`, 'normal');
  }

  public announceSetComplete(setNumber: number, totalSets: number): void {
    if (setNumber === totalSets) {
      this.speak(`Set ${setNumber} complete. Exercise finished!`, 'normal');
    } else {
      this.speak(`Set ${setNumber} complete. ${totalSets - setNumber} sets remaining.`, 'normal');
    }
  }

  public announceRestTime(seconds: number): void {
    if (seconds > 0) {
      this.speak(`Rest for ${seconds} seconds.`, 'normal');
    }
  }

  public announceEncouragement(): void {
    const encouragements = [
      "Keep pushing! You're stronger than you think!",
      "Great work! One more set!",
      "You're crushing it! Don't give up!",
      "Amazing progress! Keep going!",
      "You're doing fantastic! Stay focused!"
    ];
    
    const randomEncouragement = encouragements[Math.floor(Math.random() * encouragements.length)];
    this.speak(randomEncouragement, 'normal');
  }

  public announceTimeRemaining(minutes: number): void {
    if (minutes > 0) {
      this.speak(`${minutes} minutes remaining in your workout.`, 'normal');
    }
  }
}

// Export singleton instance
export const voiceNotes = VoiceNotes.getInstance();
