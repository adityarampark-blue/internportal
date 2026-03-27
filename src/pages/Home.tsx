import { Link } from 'react-router-dom';

const Home = () => (
  <div className="min-h-screen flex items-center justify-center bg-background p-4">
    <div className="w-full max-w-2xl space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Interns Portal</h1>
        <p className="mt-2 text-muted-foreground">To get started, pick one of the options below.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/login" className="rounded-lg border border-border p-6 text-center hover:shadow-lg transition">
          <h2 className="text-xl font-semibold">Already registered?</h2>
          <p className="text-sm text-muted-foreground mt-2">Sign in to your account.</p>
        </Link>

        <Link to="/signup" className="rounded-lg border border-border p-6 text-center hover:shadow-lg transition">
          <h2 className="text-xl font-semibold">New here?</h2>
          <p className="text-sm text-muted-foreground mt-2">Create an account and wait for admin approval.</p>
        </Link>
      </div>

      <div className="rounded-lg border border-border p-4 bg-muted/50">
        <p className="text-sm font-medium">Note:</p>
        <ul className="list-disc list-inside text-sm">
          <li>New users need admin approval before login.</li>
          <li>After signup, your account appears in Admin pending approvals.</li>
          <li>Once administrator approves, you can log in with your email/password.</li>
        </ul>
      </div>
    </div>
  </div>
);

export default Home;
