import { Button } from "@/components/ui";

interface HomeProps {
  onGetStarted?: () => void;
}

export const Home = (props: HomeProps) => {
  const { onGetStarted } = props;
  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8 p-6 sm:p-12 justify-start items-center">
      <h1 className="text-3xl font-bold text-foreground dark:text-foreground-dark mb-6">
        Welcome to Pulse
      </h1>
      <p className="text-lg text-foreground/70 dark:text-foreground-dark/70 mb-8">
        Interactive Testing for Anchor Programs. Get started by connecting your
        wallet and exploring instructions.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface dark:bg-surface-dark p-6 rounded-lg shadow border border-border dark:border-border-dark">
          <h2 className="text-xl font-semibold mb-4 text-foreground dark:text-foreground-dark">Quick Start</h2>
          <ul className="space-y-2 text-foreground/70 dark:text-foreground-dark/70">
            <li>• Connect your wallet</li>
            <li>• Load your Anchor program</li>
            <li>• Test instructions interactively</li>
            <li>• View logs and results</li>
          </ul>
        </div>

        <div className="bg-surface dark:bg-surface-dark p-6 rounded-lg shadow border border-border dark:border-border-dark">
          <h2 className="text-xl font-semibold mb-4 text-foreground dark:text-foreground-dark">Features</h2>
          <ul className="space-y-2 text-foreground/70 dark:text-foreground-dark/70">
            <li>• Real-time instruction testing</li>
            <li>• Comprehensive logging</li>
            <li>• Wallet integration</li>
            <li>• IDL parsing and validation</li>
          </ul>
        </div>
      </div>

      {onGetStarted && (
        <Button onClick={onGetStarted} className="max-w-[150px]">
          Get Started
        </Button>
      )}
    </div>
  );
};
