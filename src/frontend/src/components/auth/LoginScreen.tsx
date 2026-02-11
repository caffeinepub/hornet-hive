import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function LoginScreen() {
  const { login, loginStatus } = useInternetIdentity();
  const isLoggingIn = loginStatus === 'logging-in';

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 text-center">
        {/* Logo */}
        <div className="space-y-4">
          <img
            src="/assets/generated/hornet-hive-logo.dim_1024x1024.png"
            alt="Hornet Hive"
            className="w-32 h-32 mx-auto"
          />
          <h1 className="text-4xl font-bold text-foreground">Hornet Hive</h1>
          <p className="text-lg text-muted-foreground">
            Connect with students in Eureka, Illinois
          </p>
        </div>

        {/* Login Button */}
        <div className="space-y-4">
          <Button
            onClick={login}
            disabled={isLoggingIn}
            size="lg"
            className="w-full text-lg h-14"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign in to continue'
            )}
          </Button>
          
          <p className="text-sm text-muted-foreground">
            A safe space for Eureka students to connect and share
          </p>
        </div>
      </div>
    </div>
  );
}
