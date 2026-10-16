import {DestroyRef, inject, signal} from "@angular/core";

// TODO: time should be configured from application configuration
const REDIRECT_DELAY_SECONDS = 3;

// "Redirecting to the sign-in page in 3…" on the logged-out pages: counts down once a second, then calls onDone.
// Create it in a field initializer (it needs the component's injection context); it stops when the component is destroyed.
export class LoginCountdown {
    readonly secondsLeft = signal(REDIRECT_DELAY_SECONDS);
    private countdownId?: ReturnType<typeof setInterval>;

    constructor(private readonly onDone: () => void) {
        inject(DestroyRef).onDestroy(() => this.stop());
    }

    start(): void {
        if (this.countdownId === undefined) {
            this.countdownId = setInterval(() => this.tick(), 1000);
        }
    }

    stop(): void {
        clearInterval(this.countdownId);
        this.countdownId = undefined;
    }

    private tick(): void {
        const left = this.secondsLeft() - 1;
        this.secondsLeft.set(left);
        if (left <= 0) {
            this.stop();
            this.onDone();
        }
    }
}
